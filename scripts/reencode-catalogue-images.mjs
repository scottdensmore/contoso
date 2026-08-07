/**
 * Re-encode the product catalogue images to WebP at display resolution.
 *
 * The catalogue was committed as 1024x1024 originals, 102 of them lossless PNG
 * encodings of photographs at ~3 MB each, while the app renders them at 350px
 * (grids) and 550px (product detail). This converts them in place to WebP at
 * `--max-dimension` on the long edge and rewrites the data files that point at
 * them.
 *
 * Scope is whatever the catalogue data references, so it does not reach images
 * referenced only from source -- the two CSS backgrounds and the about page's
 * `fill` image. #158 converted the backgrounds by hand and they are now held to
 * this contract by `tests/scripts/test_image_encoding.py`; a third asset stays
 * exempt there, for reasons that file records. Anything new added under
 * `public/images` is governed by that guard whether or not this script can see
 * it, which is the part that matters: it fails rather than silently skipping.
 *
 * Idempotent: references already pointing at an existing WebP are left alone,
 * so a re-run after new images land converts only the new ones.
 *
 * Defaults come from `config/catalogue_images.json`, which the guard reads too.
 * Changing the encoding is a matter of editing that file and re-running; passing
 * a flag here without editing it leaves a guard that no longer describes what is
 * on disk, so the flags are for trying a setting out, not for landing one.
 *
 *   node scripts/reencode-catalogue-images.mjs [--dry-run] [--quality 82]
 *                                              [--max-dimension 600]
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "apps/web/public");
const CONFIG_PATH = path.join(REPO_ROOT, "config/catalogue_images.json");
const DATA_FILES = ["products.json", "categories.json", "brands.json"];

const SOURCE_SUFFIXES = new Set([".jpg", ".jpeg", ".png"]);
const IMAGE_REF = /\/images\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp)/gi;

const config = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));

function parseArgs(argv) {
  const options = {
    dryRun: false,
    quality: config.quality,
    maxDimension: config.maxDimension,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--quality") {
      options.quality = Number(argv[(i += 1)]);
    } else if (arg === "--max-dimension") {
      options.maxDimension = Number(argv[(i += 1)]);
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!Number.isInteger(options.quality) || options.quality < 1 || options.quality > 100) {
    throw new Error("--quality must be an integer between 1 and 100");
  }
  if (!Number.isInteger(options.maxDimension) || options.maxDimension < 1) {
    throw new Error("--max-dimension must be a positive integer");
  }
  return options;
}

const toAbsolute = (ref) => path.join(PUBLIC_DIR, ref.replace(/^\//, ""));
const toWebpRef = (ref) => `${ref.slice(0, ref.length - path.extname(ref).length)}.webp`;

async function readDataFiles() {
  return Promise.all(
    DATA_FILES.map(async (name) => ({
      name,
      absolutePath: path.join(PUBLIC_DIR, name),
      text: await fs.readFile(path.join(PUBLIC_DIR, name), "utf8"),
    }))
  );
}

async function fileSize(absolutePath) {
  const stat = await fs.stat(absolutePath);
  return stat.size;
}

async function exists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Every distinct catalogue reference still pointing at a JPEG or PNG.
 *
 * Reads the references rather than walking the directory so a file the data
 * stopped pointing at is left for the orphan check in
 * `tests/scripts/test_image_references.py` to report, instead of being silently
 * re-encoded and kept alive.
 */
function collectSourceRefs(dataFiles) {
  const refs = new Set();
  for (const file of dataFiles) {
    for (const match of file.text.matchAll(IMAGE_REF)) {
      const ref = match[0];
      if (SOURCE_SUFFIXES.has(path.extname(ref).toLowerCase())) {
        refs.add(ref);
      }
    }
  }
  return [...refs].sort();
}

async function convert(ref, options) {
  const source = toAbsolute(ref);
  const target = toAbsolute(toWebpRef(ref));
  const before = await fileSize(source);

  const buffer = await sharp(source)
    .resize(options.maxDimension, options.maxDimension, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: options.quality })
    .toBuffer();

  if (!options.dryRun) {
    await fs.writeFile(target, buffer);
    await fs.rm(source);
  }
  return { before, after: buffer.length };
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const dataFiles = await readDataFiles();
  const refs = collectSourceRefs(dataFiles);

  // `a.jpg` and `a.png` in one directory would both become `a.webp`, and the
  // second conversion would silently win. Nothing in the catalogue does this
  // today, which is exactly why it would go unnoticed if something started to.
  const collisions = new Map();
  for (const ref of refs) {
    const target = toWebpRef(ref);
    collisions.set(target, [...(collisions.get(target) ?? []), ref]);
  }
  const collided = [...collisions.values()].filter((group) => group.length > 1);
  if (collided.length > 0) {
    throw new Error(`sources collide on one WebP name: ${collided[0].join(", ")}`);
  }

  // A run interrupted between converting the files and rewriting the data files
  // leaves references pointing at sources that are gone. Re-running has to
  // finish that job rather than refuse: a source that is missing but already
  // has its WebP alongside it is done, not broken.
  const pending = [];
  const missing = [];
  for (const ref of refs) {
    if (await exists(toAbsolute(ref))) {
      pending.push(ref);
    } else if (!(await exists(toAbsolute(toWebpRef(ref))))) {
      missing.push(ref);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `catalogue references ${missing.length} file(s) that do not exist, ` +
        `starting with ${missing[0]}`
    );
  }

  let before = 0;
  let after = 0;
  let largest = 0;
  for (const [index, ref] of pending.entries()) {
    const result = await convert(ref, options);
    before += result.before;
    after += result.after;
    largest = Math.max(largest, result.after);
    if ((index + 1) % 100 === 0) {
      process.stdout.write(`  ${index + 1}/${pending.length}\n`);
    }
  }

  if (!options.dryRun) {
    for (const file of dataFiles) {
      const rewritten = file.text.replace(IMAGE_REF, (ref) =>
        SOURCE_SUFFIXES.has(path.extname(ref).toLowerCase()) ? toWebpRef(ref) : ref
      );
      if (rewritten !== file.text) {
        await fs.writeFile(file.absolutePath, rewritten);
      }
    }
  }

  const mib = (bytes) => `${(bytes / 1024 ** 2).toFixed(1)} MiB`;
  const saved = before === 0 ? 0 : Math.round((1 - after / before) * 100);
  console.log(
    `${options.dryRun ? "[dry run] " : ""}re-encoded ${pending.length} image(s) at ` +
      `q${options.quality}/${options.maxDimension}px: ${mib(before)} -> ${mib(after)} ` +
      `(${saved}% smaller, largest ${(largest / 1024).toFixed(0)} KiB)`
  );
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
