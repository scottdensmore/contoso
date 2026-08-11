/**
 * What the app's controls share, for the parts that have one right answer.
 *
 * Four exports, because fields and action controls fail differently, are fixed
 * differently, and a control whose focusable element is a descendant needs a
 * different variant again. None of them carries an accent. A control's focus
 * colour is indigo on the page and sky-700 inside the chat widget — #184 chose
 * that split so the panel reads as its own place — so the mechanism is shared
 * and the accent stays at the call site, the same division as radius and
 * padding staying with each field below.
 *
 * Two things were contradicting that and both moved together. The fields took
 * sky-700 in #221, standardising on the only example that existed at the time,
 * and `/profile`'s signed-out CTA had carried it since #144 — both predating
 * #236, which named the axis as location rather than control type and so made
 * a field on `/login` a page control. Until they moved, `/login` changed the
 * colour of its focus indicator between the password field and the button
 * underneath it.
 *
 * Sky now appears only inside the widget: the chat input, its send button, and
 * its clear and close controls. `chat-controls.spec.ts` walks whatever the
 * panel renders, in both shapes, and asserts they agree with each other and
 * differ from the page. `action-controls.spec.ts` asserts the same agreement
 * across the eleven page controls it lists — which is not every page control:
 * the chat launcher is one, sits outside the dialog, and nothing reads its
 * accent. The header's `Open menu` has no focus accent at all, which predates
 * any of this.
 */

/**
 * The boundary and focus indicator shared by the text fields on `/login`,
 * `/signup`, `/contact`, `/profile` and the chat panel.
 *
 * Eleven fields used to choose this for themselves, and they did not agree.
 * `/profile` renders eleven more behind its tabs. They drew a `border` rather
 * than a `ring` and failed the same criterion at the same 1.41:1, and #220
 * converted them to this constant — which did drop in unchanged, contrary to
 * what this comment said while that was still unmeasured. What it cost was 2px
 * of height each, since a `border` occupies layout and an inset `ring` does
 * not, and nothing in forced colors, where `forced-colors:border` puts the
 * same border back.
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
 * The accent is not here, for the reason `ACTION_FOCUS` gives: a control on the
 * page focuses indigo and one inside the chat widget focuses sky-700, which
 * #184 chose so the panel reads as its own place. The fields carried sky-700
 * everywhere until that convention existed, which left `/login` changing the
 * colour of its focus indicator between the password field and the button
 * underneath it — 45 degrees of hue, inside one form, for no reason a user
 * could infer.
 *
 * Each call site pairs this with `focus:ring-<accent> focus-visible:outline-<accent>`.
 * The ring recolour contributes almost nothing on its own —
 * `e2e/support/boundary.ts` measures those pixels changing at 1.21:1, below the
 * 3:1 that counts toward the indicator area — and is kept so that a field and
 * its neighbours agree rather than because it is doing work.
 *
 * `focus-visible`, not `focus`, for the outline: a pointer user who clicks
 * into a field has not lost track of where they are, and does not need a
 * second marker on top of the caret.
 *
 * ## What the outline is actually buying, measured
 *
 * Not Chromium compliance. Strip the outline entirely — the two classes here
 * and the call site's colour with them — and Chromium paints its own
 * `auto 1px rgb(16,16,16)` ring, which passes 2.4.13 on its own: measured at
 * 1662 qualifying pixels against the 1659 a 2px perimeter of `/login`'s email
 * field needs. With the outline the same field measures 1673. Both clear it;
 * the browser's does so by three pixels.
 *
 * Strip only `outline-2` and the fallback is worse to spot, because the colour
 * survives: `auto 1px` in the call site's own accent, which looks deliberate
 * and passes every pixel check here. That happened on this branch and shipped
 * green twice. `form-fields.spec.ts` now reads the computed width and style
 * against the submit's, which is the only thing that catches it.
 *
 * What the outline buys is that the indicator is ours: a known 2px at a known
 * offset in the surface's own accent, the same in every engine, rather than a
 * default that differs between Chromium, Firefox and Safari and that the suite
 * only ever sees one of. It is also what keeps the *change* visible, since the
 * ring recolour it sits beside moves 1.34:1 against indigo and 1.21:1 against
 * sky — neither of which anyone would notice on its own.
 *
 * Both margins are thin because the criterion's floor is a 2px perimeter and
 * the indicator is a 2px outline, so the two are nearly the same number by
 * construction. That is a property of the measurement, not of this design.
 *
 * Changing shape rather than colour is also what keeps focus legible in forced
 * colors, which was luck rather than foresight. There the resting border and
 * the focused one differ by 1.86:1 in light and 2.41:1 in dark — under 3:1
 * both times, so an indicator that recoloured would fail. What carries it is
 * the outline painting on pixels that were Canvas: 11.31:1 and 8.73:1.
 *
 * ## `forced-colors:border`, and why the ring alone was not enough
 *
 * Tailwind compiles `ring-*` to an inset box-shadow, and forced-colors strips
 * box-shadow outright. Ten of the eleven also carry `border-0`, so in Windows High
 * Contrast and its equivalents there was nothing left to draw an edge:
 * measured on `/login #email`, a vertical scan through the top edge returned
 * sixteen rows of rgb(255,255,255) and a computed `boxShadow` of `none`. All
 * ten fields read 1.00:1. Not a weak boundary — none.
 *
 * `forced-colors:border` adds a 1px border in that mode only. Chromium paints
 * it in a system colour, which is why no colour is named here: naming one
 * would be overridden anyway, and a `transparent` border works identically
 * since forced-colors replaces the colour either way.
 *
 * The 2px of height it adds lands on whatever the field already was: 36 to 38
 * on the account pages, 44 to 46 on the contact card, 48 to 50 there at phone
 * widths. Everything below a field moves down by that much; what is unchanged
 * is the gaps, which absorb it through `space-y`, and the absence of horizontal
 * overflow on any route in either palette.
 *
 * Those are the ten page fields. The chat input answers differently and was
 * measured rather than predicted: 44px in both modes. It is `grow` in a flex
 * row whose height is set by a `size-11` button, so `align-items: stretch`
 * fixes its height and the border comes out of the content box instead of
 * adding to it. `chat-controls.spec.ts` covers it in forced colors.
 *
 * The usual advice is an unconditional `border border-transparent`. Measured,
 * that does nothing on the ten page fields: they carry `border-0`, which beats
 * an unvariant `border` — swapping the variant for one leaves the field 36px
 * tall and all six forced-colors checks failing, exactly as if nothing had been
 * added. Taking that route means deleting `border-0` from ten call sites first,
 * and then paying 2px of height on every field everywhere for an edge nobody
 * outside forced-colors can see. The chat input is the exception that proves
 * the point: it carries no `border-0`, so there the rejected alternative would
 * have worked and the two halves of this constant would have diverged again.
 *
 * The variant needs neither. It out-ranks `border-0` because Tailwind orders
 * variant utilities after unvariant ones, so the media query wins where it
 * applies and `border-0` holds everywhere else. That is cascade order rather
 * than specificity — the kind of thing that changes quietly between releases —
 * so `form-fields.spec.ts` measures painted pixels in both modes rather than
 * trusting it, and the swap above is one of the mutations it catches.
 */
export const FIELD_BOUNDARY =
  'ring-1 ring-inset ring-zinc-500 forced-colors:border ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2'

/**
 * What every button and button-shaped link needs, minus its colour.
 *
 * Filled controls have no boundary of their own — their edge *is* their
 * background, and forced-colors replaces every background with a system
 * colour. Measured at 1440x900 before this: `Sign in`, `Create account`,
 * `Contact Support` and the header's `Sign In` all read 6.19:1 normally and
 * **1.00:1** in forced colors, `Send Message` 5.28:1 and 1.09:1. The header's
 * `Sign Up` is the control that proves the mechanism — it is outlined rather
 * than filled, carries `border border-indigo-600`, and reads 13.99:1 there.
 * `forced-colors:border-2` gives the filled ones the same edge.
 *
 * Two pixels, not one, and the second is doing work. At 1px every control
 * converges on the same rectangle there: measured on `/login`, the submit came
 * out 384x38 with a 1px border and a 6px radius — the same three numbers as
 * the two fields above it, with only a bold centred label to say which one you
 * press. The header was worse: filled `Sign In` and outlined `Sign Up`
 * rendered as identical declarations, so primary and secondary became tellable
 * apart only by label width. Forced colors takes the colours away, so weight
 * is what is left to carry hierarchy, and an action gets twice a field's.
 *
 * The outline width and offset are here; the colour is not. `outline-2` and
 * `outline-offset-2` are right for anything sitting on a page — the chat
 * launcher is the exception, at `outline-offset-4`, because it sits on
 * photography and #190 gave it the extra air deliberately. Every call site
 * should already
 * pair this with its own `focus-visible:outline-indigo-600` or
 * `-outline-sky-700`. Six controls carried no focus treatment at all before
 * this — both `/profile` submits, the FAQ's `Contact Support`, and all three
 * in the header — which measured 2 qualifying pixels against the 728 a 2px
 * perimeter needs, because Chromium's dark default ring on `indigo-600` is
 * 2.44:1.
 *
 * Deliberately not a function taking the colour. Tailwind scans source text
 * for literal class names, so a computed `outline-${accent}` is a class that
 * never reaches the stylesheet — the failure would be a silently missing
 * indicator, which is the thing this file exists to prevent.
 */
export const ACTION_FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2'

/**
 * The focus half plus the forced-colors edge, for controls whose edge is their
 * fill.
 *
 * Split from `ACTION_FOCUS` because the two halves are independent and two
 * controls need exactly one each. The header's `Sign Up` is outlined rather
 * than filled — it already has an edge forced colors keeps, measured 13.99:1
 * there — so taking `border-2` would put it at 2px beside the filled `Sign In`
 * and render the two as identical declarations, which is the distinction
 * `border-2` exists to restore. The chat launcher needs the opposite: the edge,
 * but not `outline-offset-2`, since #190 gave it offset-4 to clear the
 * photography behind it.
 *
 * Both wrote their classes out longhand before this split. That is the failure
 * this file exists to prevent — six literal classes copied by the next outlined
 * control, with one of them dropped.
 */
export const ACTION_BOUNDARY = `forced-colors:border-2 ${ACTION_FOCUS}`

/**
 * `ACTION_FOCUS` for a control whose focusable element is a descendant.
 *
 * The avatar upload is a `<label>` wrapping an `sr-only` `<input type="file">`.
 * The label is what a person sees and clicks; the input is a 1x1 clipped box,
 * and it is the input that takes focus. So Chromium paints its default ring on
 * a 1x1 element and the visible control shows nothing at all — measured, the
 * pixels changing anywhere around it on focus were 0, against the 610 a 2px
 * perimeter of the label needs. Not a weak indicator; none.
 *
 * `has-[:focus-visible]:`, not `focus-within:`. Focus-within also fires for a
 * pointer, and the whole reason the rest of this file uses `focus-visible` is
 * that someone who clicked a control knows where they are.
 *
 * The geometry is the same as `ACTION_FOCUS` and has to be repeated rather
 * than composed, because a Tailwind variant is a prefix on each class and the
 * scanner only sees literals.
 */
export const ACTION_FOCUS_WITHIN =
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2'
