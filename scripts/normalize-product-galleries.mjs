import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const PRODUCTS_PATH = path.join(ROOT, "public", "products.json");

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function centerExtractRegion(width, height, scale = 1) {
  const targetWidth = clamp(Math.round(width / scale), 1, width);
  const targetHeight = clamp(Math.round(height / scale), 1, height);
  const left = Math.floor((width - targetWidth) / 2);
  const top = Math.floor((height - targetHeight) / 2);
  return { left, top, width: targetWidth, height: targetHeight };
}

function upperCenterExtractRegion(width, height, scale = 1.05) {
  const targetWidth = clamp(Math.round(width / scale), 1, width);
  const targetHeight = clamp(Math.round(height / scale), 1, height);
  const left = Math.floor((width - targetWidth) / 2);
  const top = Math.floor((height - targetHeight) / 4);
  return { left, top, width: targetWidth, height: targetHeight };
}

async function generateVariant(baseBuffer, meta, variantIndex) {
  const width = meta.width || 1200;
  const height = meta.height || 1200;
  const pipeline = sharp(baseBuffer).rotate();

  if (variantIndex === 1) {
    const r = centerExtractRegion(width, height, 1.08);
    return pipeline
      .extract(r)
      .resize(width, height, { fit: "cover" })
      .modulate({ brightness: 1.02, saturation: 1.03 })
      .sharpen(1.2)
      .jpeg({ quality: 88 })
      .toBuffer();
  }

  if (variantIndex === 2) {
    return pipeline
      .resize(width, height, { fit: "cover" })
      .modulate({ brightness: 1.03, saturation: 1.08, hue: 2 })
      .linear(1.04, -4)
      .sharpen(1.1)
      .jpeg({ quality: 88 })
      .toBuffer();
  }

  if (variantIndex === 3) {
    const r = upperCenterExtractRegion(width, height, 1.06);
    return pipeline
      .extract(r)
      .resize(width, height, { fit: "cover" })
      .modulate({ brightness: 1.0, saturation: 0.97, hue: -4 })
      .linear(1.02, -2)
      .jpeg({ quality: 88 })
      .toBuffer();
  }

  if (variantIndex === 4) {
    return pipeline
      .resize(width, height, { fit: "cover" })
      .gamma(1.07)
      .modulate({ brightness: 0.99, saturation: 0.94 })
      .sharpen(1.0)
      .jpeg({ quality: 88 })
      .toBuffer();
  }

  return pipeline
    .resize(width, height, { fit: "cover" })
    .modulate({ brightness: 1.04, saturation: 1.06, hue: 1 })
    .linear(1.05, -5)
    .sharpen(1.25)
    .jpeg({ quality: 88 })
    .toBuffer();
}

function getAbsolutePathFromPublicUrl(publicUrl) {
  const rel = publicUrl.replace(/^\//, "");
  return path.join(ROOT, "public", rel);
}

async function run() {
  const raw = await fs.readFile(PRODUCTS_PATH, "utf8");
  const products = JSON.parse(raw);

  let generatedCount = 0;
  for (const product of products) {
    if (!Array.isArray(product.images) || product.images.length === 0) {
      continue;
    }

    const originalCount = product.images.length;
    const primaryImage = product.images[0];
    const primaryAbsolute = getAbsolutePathFromPublicUrl(primaryImage);
    const primaryDir = path.dirname(primaryAbsolute);
    const parsed = path.parse(primaryAbsolute);
    const primaryBuffer = await fs.readFile(primaryAbsolute);
    const meta = await sharp(primaryBuffer).metadata();

    const nextImages = [primaryImage];

    for (let i = 1; i < originalCount; i += 1) {
      const variantIndex = i;
      const variantName = `${parsed.name}-alt-${i}.jpg`;
      const variantAbsolute = path.join(primaryDir, variantName);
      const variantPublicPath = path
        .join(path.dirname(primaryImage), variantName)
        .replace(/\\/g, "/");

      const variantBuffer = await generateVariant(primaryBuffer, meta, variantIndex);
      await fs.writeFile(variantAbsolute, variantBuffer);
      nextImages.push(variantPublicPath);
      generatedCount += 1;
    }

    product.images = nextImages;
  }

  await fs.writeFile(PRODUCTS_PATH, `${JSON.stringify(products, null, 4)}\n`);
  console.log(
    `Updated ${products.length} products and generated ${generatedCount} image variants.`
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
