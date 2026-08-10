/**
 * The boundary and focus indicator shared by the text fields on `/login`,
 * `/signup`, `/contact` and the chat panel.
 *
 * Eleven fields used to choose this for themselves, and they did not agree.
 * They are not all of them: `/profile` renders eleven more, behind its tabs,
 * which draw a `border` rather than a `ring` and fail the same criterion at
 * the same 1.41:1. See #220 — this constant does not drop into them unchanged,
 * and nothing here covers them.
 * The ten on `/login`, `/signup` and `/contact` drew `ring-gray-300`, which
 * measured 1.41:1 on the account pages and 1.21:1 to 1.28:1 on the contact
 * card; the chat input was fixed separately in #184 and drew `ring-zinc-500`.
 * After this, the same fields measure 4.62:1 on the account pages and no worse
 * than 3.80:1 anywhere on the contact card — that floor swept across fifteen
 * viewport widths and every pixel of each field's perimeter, rather than the
 * three points an edge that a first pass sampled and read as 3.98:1.
 * WCAG 2.2 1.4.11 asks 3:1 of a control's visual boundary, so ten of the
 * eleven had a boundary that was declared rather than visible — which is worse
 * than none, because the layout is built as though the outline were doing the
 * work.
 *
 * Only the boundary lives here. Radius, padding and type scale stay with each
 * field: `/login` is `rounded-md py-1.5`, the contact card is `rounded-lg
 * px-4 py-3`, and pulling those together would be a redesign rather than a
 * fix. What is shared is the part that has a correct answer.
 *
 * ## Why focus adds an outline instead of recolouring the ring
 *
 * The old fields recoloured their ring to `indigo-600` on focus, which is
 * 6.46:1 against white and looks like a strong indicator. It stops working the
 * moment the resting ring is dark enough to satisfy 1.4.11: zinc-500 against
 * indigo-600 is 1.34:1, and zinc-500 against sky-700 is 1.21:1 — the same
 * lightness in two hues, identical in greyscale.
 *
 * That is not a colour that was chosen badly. Both states have to be dark to
 * clear 3:1 against a light surface, so they cannot also differ 3:1 from each
 * other. No pair of colours fixes it, which #184 established by trying: the
 * indicator has to change *shape*. So focus keeps the ring and adds an offset
 * outline, painting a new perimeter over pixels that were background.
 *
 * The ring still recolours to sky-700 as well. It contributes almost nothing —
 * `e2e/support/boundary.ts` measures those pixels changing at 1.21:1, below
 * the 3:1 that counts toward the indicator area — and it is here because the
 * chat panel does it, and having eleven fields that are actually identical is
 * the point of this file.
 *
 * `focus-visible`, not `focus`, for the outline: a pointer user who clicks
 * into a field has not lost track of where they are, and does not need a
 * second marker on top of the caret.
 *
 * ## What the outline is actually buying, measured
 *
 * Not Chromium compliance. Strip these three classes and Chromium paints its
 * own `auto 1px rgb(16,16,16)` ring, which passes 2.4.13 on its own — measured
 * at 1662 qualifying pixels against the 1659 a 2px perimeter of `/login`'s
 * email field needs. With the outline the same field measures 1673. Both
 * clear it; the browser's does so by three pixels.
 *
 * What the outline buys is that the indicator is ours: a known 2px sky-700 at
 * a known offset, the same in every engine, rather than a default that differs
 * between Chromium, Firefox and Safari and that the suite only ever sees one
 * of. It is also what keeps the *change* visible, since the ring recolour it
 * sits beside is a 1.21:1 change that no one would notice.
 *
 * Both margins are thin because the criterion's floor is a 2px perimeter and
 * the indicator is a 2px outline, so the two are nearly the same number by
 * construction. That is a property of the measurement, not of this design.
 */
export const FIELD_BOUNDARY =
  'ring-1 ring-inset ring-zinc-500 focus:ring-sky-700 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700'
