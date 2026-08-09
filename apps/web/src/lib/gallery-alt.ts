/**
 * What a screen reader says about each image in a product gallery.
 *
 * Every image used to carry `alt={product.name}`, so a gallery of five
 * announced the same six words five times and distinguished none of them.
 *
 * Most of the catalogue names its files by shot type — `main`, `angle`,
 * `detail`, `lifestyle` — and this turns that label into words. It is mostly
 * translation rather than description: nobody has looked at these pictures, so
 * the phrasing stays close to what the filename claims. "another angle", not
 * "side view" — the second asserts a viewpoint the label does not, and the
 * first is the fact the listener actually needs, which is that this is the same
 * product again.
 *
 * `lifestyle` is the one entry that infers rather than translates. It is a
 * photography-genre label, and ", in use" says something about the content of
 * the frame. It is the right inference and a mild one, but it is an inference,
 * and the alternatives either over-claim or say nothing.
 *
 * Twenty of the 210 products have UUID filenames and no label at all. There is
 * nothing to translate for those, so their images beyond the first are marked
 * decorative rather than given a description invented here.
 */

/**
 * Shot type to the phrase that follows the product name.
 *
 * An empty phrase means the image is the product plainly, and the name alone is
 * the description.
 *
 * A shot type missing from this table *is* silently decorative as far as this
 * function is concerned — there is nothing else it could safely do. What
 * refuses is the sweep in `gallery-alt.test.ts`, which fails on any label the
 * catalogue uses and this table lacks, because new photography arriving with a
 * new label is a decision about what to say and silence is the one answer
 * nobody chose. That guard only bites while the suite runs on catalogue
 * changes.
 */
export const GALLERY_ROLES: Record<string, string> = {
  main: '',
  angle: 'another angle',
  detail: 'detail view',
  lifestyle: 'in use',
  packed: 'packed for carrying',
}

export function galleryAlt(
  productName: string,
  imagePath: string,
  index: number,
): string {
  const file = imagePath.split('/').pop() ?? ''
  const stem = file.replace(/\.[^.]+$/, '')

  // `Object.hasOwn`, not `in`: `in` walks the prototype chain, so an image
  // called `toString.webp` would be announced as "…, function toString() {
  // [native code] }". No such file exists, and the sweep uses the same lookup
  // so it could not have seen one either.
  if (Object.hasOwn(GALLERY_ROLES, stem)) {
    const phrase = GALLERY_ROLES[stem]
    return phrase ? `${productName}, ${phrase}` : productName
  }

  // Unlabelled. The first image still says what the product is, so the gallery
  // is never entirely silent; the rest announce nothing, which is honest about
  // how much is known about them.
  return index === 0 ? productName : ''
}
