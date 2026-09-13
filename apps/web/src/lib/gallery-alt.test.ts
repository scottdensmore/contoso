import { describe, it, expect } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { galleryAlt, GALLERY_ROLES } from './gallery-alt'

/**
 * Alt text for the product gallery, checked against the real catalogue.
 *
 * Every image used to carry `alt={product.name}`, so a screen reader announced
 * "TrailMaster X4 Tent" once per picture — five times in a row for most
 * products, learning nothing about any of them.
 *
 * The catalogue names most of its files by shot type, and this turns that into
 * words. It is a translation, not a description: nobody has looked at the
 * pictures, and `angle.webp` is the catalogue's own label rather than an
 * observation about what is in the frame.
 *
 * The sweep below runs over `public/products.json` itself rather than fixtures.
 * The properties being asserted are about what 852 real images produce, and a
 * fixture would only restate the mapping back at itself.
 */

type Product = { name: string; images: string[] }

async function catalogue(): Promise<Product[]> {
  const file = await fs.readFile(
    path.join(process.cwd(), 'public/products.json'),
    'utf8',
  )
  return JSON.parse(file) as Product[]
}

const stemOf = (image: string) => path.basename(image, path.extname(image))

describe('galleryAlt', () => {
  it('reads a catalogue big enough for the sweeps below to mean anything', async () => {
    const products = await catalogue()
    expect(products.length).toBeGreaterThan(200)
    expect(products.flatMap((product) => product.images).length).toBeGreaterThan(800)
  })

  it('has a phrase for every shot type the catalogue uses', async () => {
    // The point of failing here rather than falling through to decorative: a
    // new role word arriving with new photography is a decision about what to
    // say, and silence is the one answer nobody chose.
    const products = await catalogue()
    const unnamed = /^[0-9a-f-]{30,}$/
    const stems = new Set(
      products
        .flatMap((product) => product.images)
        .map(stemOf)
        .filter((stem) => !unnamed.test(stem)),
    )
    // `Object.hasOwn`, matching the function. With `in` the sweep walks the
    // prototype chain and the two disagree on the one input this exists to
    // refuse: a catalogue file called `valueOf.webp` would be reported as
    // covered here while `galleryAlt` finds no own property and announces it
    // as nothing.
    const missing = Array.from(stems)
      .filter((stem) => !Object.hasOwn(GALLERY_ROLES, stem))
      .sort()
    expect(
      missing,
      'shot types in the catalogue with no phrase, which would be announced as nothing',
    ).toEqual([])
  })

  it('never announces the same thing twice within a product', async () => {
    // The bug itself. Empty alts are excluded because a decorative image
    // announces nothing at all, and any number of those is fine.
    const products = await catalogue()
    const repeated: Record<string, string[]> = {}
    for (const product of products) {
      const spoken = product.images
        .map((image, index) => galleryAlt(product.name, image, index))
        .filter((alt) => alt !== '')
      const duplicates = spoken.filter(
        (alt, index) => spoken.indexOf(alt) !== index,
      )
      if (duplicates.length > 0) repeated[product.name] = duplicates
    }
    expect(repeated, 'products whose gallery repeats an announcement').toEqual({})
  })

  it('names the product exactly once in every gallery', async () => {
    // Once, not zero: a gallery where every image is decorative would satisfy
    // the check above and tell a screen-reader user nothing.
    const products = await catalogue()
    const wrong: Record<string, number> = {}
    for (const product of products) {
      const plain = product.images.filter(
        (image, index) => galleryAlt(product.name, image, index) === product.name,
      ).length
      if (plain !== 1) wrong[product.name] = plain
    }
    expect(
      wrong,
      'products that name themselves other than exactly once across the gallery',
    ).toEqual({})
  })

  it('describes the shot when the catalogue labels it', () => {
    const name = 'TrailMaster X4 Tent'
    expect(galleryAlt(name, '/images/products/tents/1/main.webp', 0)).toBe(name)
    expect(galleryAlt(name, '/images/products/tents/1/angle.webp', 1)).toBe(
      `${name}, another angle`,
    )
    expect(galleryAlt(name, '/images/products/tents/1/detail.webp', 2)).toBe(
      `${name}, detail view`,
    )
    expect(galleryAlt(name, '/images/products/tents/1/lifestyle.webp', 3)).toBe(
      `${name}, in use`,
    )
  })

  it('describes the 20 storefront products with shot types via the sidecar (#203)', () => {
    const name = 'TrailMaster X4 Tent'
    expect(
      galleryAlt(name, '/images/1/242e7165-7c79-4f97-8e63-280f9f8982e2.webp', 0),
    ).toBe(name)
    expect(
      galleryAlt(name, '/images/1/42614d79-4013-4303-9750-7c48f3fb61a9.webp', 1),
    ).toBe(`${name}, another angle`)
    expect(
      galleryAlt(name, '/images/1/6a3111b5-3803-473b-a3dd-12056becea0a.webp', 2),
    ).toBe(`${name}, detail view`)
    expect(
      galleryAlt(name, '/images/1/cb803f98-9bfa-4156-b0ee-df0581ae2862.webp', 3),
    ).toBe(`${name}, in use`)
    expect(
      galleryAlt(name, '/images/1/ff681635-0ce2-4c9a-b227-58de609e3a4e.webp', 4),
    ).toBe(`${name}, packed for carrying`)
  })

  it('covers every product in the first 20 with non-empty shot types for all images beyond index 0 (#203)', async () => {
    const products = await catalogue()
    const first20 = products.slice(0, 20)
    for (const product of first20) {
      // Index 0 is always the product name
      expect(galleryAlt(product.name, product.images[0], 0)).toBe(product.name)
      // Images 1-4 should be described with non-empty shot phrases
      for (let i = 1; i < Math.min(product.images.length, 5); i++) {
        const spoken = galleryAlt(product.name, product.images[i], i)
        expect(spoken).not.toBe('')
        expect(spoken).toContain(product.name)
      }
    }
  })

  it('falls back to decorative when the catalogue labels nothing and no sidecar mapping exists', () => {
    // Images that have no label in the path and no sidecar mapping fall back to
    // decorative beyond the first image.
    const name = 'Unknown Item'
    const unknownMain = '/images/unknown/00000000-0000-0000-0000-000000000000.webp'
    const unknownOther = '/images/unknown/11111111-1111-1111-1111-111111111111.webp'
    expect(galleryAlt(name, unknownMain, 0)).toBe(name)
    expect(galleryAlt(name, unknownOther, 1)).toBe('')
    expect(galleryAlt(name, unknownOther, 4)).toBe('')
  })

  it('is not fooled by a filename matching an inherited property', () => {
    // The lookup was `stem in GALLERY_ROLES`, and `in` walks the prototype
    // chain, so an image called `toString.webp` announced "Widget, function
    // toString() { [native code] }". No such file exists in the catalogue, and
    // the sweep above used the same operator, so neither could have caught it.
    expect(galleryAlt('Widget', '/images/x/toString.webp', 2)).toBe('')
    expect(galleryAlt('Widget', '/images/x/constructor.webp', 0)).toBe('Widget')
    expect(galleryAlt('Widget', '/images/x/hasOwnProperty.webp', 1)).toBe('')
  })

  it('describes a labelled shot wherever it sits in the gallery', () => {
    // Position is not the signal, the label is. `main` is image 0 for all 190
    // role-named products today, and nothing guarantees it stays that way.
    const name = 'Alpine Explorer Tent'
    expect(galleryAlt(name, '/images/products/tents/9/main.webp', 3)).toBe(name)
    expect(galleryAlt(name, '/images/products/tents/9/angle.webp', 0)).toBe(
      `${name}, another angle`,
    )
  })
})
