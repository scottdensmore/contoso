"use client";

import { useState, ChangeEvent } from "react";
import { ACTION_FOCUS_WITHIN } from "@/lib/control-classes";

interface AvatarUploadProps {
  initialAvatar: string;
  /**
   * Saves the picture, and rejects if it was not saved.
   *
   * Rejecting is the contract, not an implementation detail: this component
   * shows the new picture the moment it is chosen, which is a claim that the
   * change took. An `onUpload` that swallows its own failures makes that claim
   * false and there is nothing here that could tell.
   */
  onUpload: (url: string) => void | Promise<void>;
}

/**
 * `FileReader` as a promise, rejecting on the failures the callback API reports
 * by other means.
 *
 * `onloadend` fires whether the read succeeded or failed, so awaiting it alone
 * would treat an unreadable file as a successful read of `null`. `error` is
 * what separates them, and `onerror` covers the same ground for readers that
 * report it that way.
 */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fail = (why?: string) =>
      reject(why ? new Error(why) : (reader.error ?? new Error("The file could not be read")));
    reader.onerror = () => fail();
    reader.onloadend = () => {
      if (reader.error || typeof reader.result !== "string") {
        fail();
        return;
      }
      // `accept="image/*"` is a hint to the file picker, not a rule: it filters
      // what the dialog offers and any file can still be chosen past it. This
      // is the only place that checks, and what it protects is what the string
      // becomes — the value is stored on the account and later handed to an
      // `<img src>`, here and in the chat. A data URL declaring some other type
      // is not a picture, so refusing it is both the security answer and the
      // correct one.
      if (!reader.result.startsWith("data:image/")) {
        fail("That file is not an image");
        return;
      }
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * The URL forms this frame will render, and nothing else.
 *
 * `preview` is not a value this component chose. It arrives as `initialAvatar`
 * from `/api/profile`, which returns what is stored on the account, and what is
 * stored on the account is whatever a previous upload put there. Handing that
 * straight to `src` is CodeQL's `js/xss-through-dom`, open against this line
 * since February.
 *
 * The exploit that rule names does not land here — an `<img src>` runs neither
 * `javascript:` nor `data:text/html`, it just fails to paint — and only the
 * account holder can write their own avatar. But "an arbitrary string from the
 * database is fine as a URL because of how one element happens to treat it" is
 * an argument that stops being true the moment the value is rendered somewhere
 * else, and it already is: the chat panel reads the same field.
 *
 * So the three shapes an avatar can legitimately have: a `blob:` URL this
 * component just minted, a `data:image/` URL a save produced, and an ordinary
 * http(s) or site-relative path for accounts whose picture is hosted. Anything
 * else renders as no picture at all, which is the honest outcome — it is not a
 * picture.
 */
const RENDERABLE = /^(?:blob:|data:image\/|https?:\/\/|\/)/;

function pictureSrc(value: string): string {
  return RENDERABLE.test(value) ? value : "";
}

type Status =
  | { state: "idle" }
  | { state: "uploading" }
  | { state: "saved" }
  | { state: "failed"; hadPicture: boolean };

/**
 * What the visitor is looking at, rather than a cause this cannot know or an
 * instruction it cannot back.
 *
 * The picture reverted in front of them and the sentence has to account for
 * that; "please try again" accounted for nothing and promised that repeating a
 * 500 would go differently. Retrying is obvious anyway — the control is right
 * there, and the input's value is cleared so choosing the same file again still
 * counts as a change.
 *
 * `hadPicture`, because the second sentence is a claim about the screen and it
 * is false on the branch most accounts are on. An account with no avatar reverts
 * to no avatar, and "your previous picture is still in place" then sits directly
 * under a circle reading "No Image".
 */
function message(status: Status): string {
  switch (status.state) {
    case "idle":
      return "";
    case "uploading":
      return "Uploading your picture…";
    case "saved":
      return "Picture saved.";
    case "failed":
      return status.hadPicture
        ? "That picture was not saved. Your previous picture is still in place."
        : "That picture was not saved.";
  }
}

const STATUS_ID = "avatar-upload-status";

export default function AvatarUpload({ initialAvatar, onUpload }: AvatarUploadProps) {
  const [preview, setPreview] = useState(initialAvatar);
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const isUploading = status.state === "uploading";

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    // Cleared here, before anything can return early, and the `File` above
    // survives it — the reference is independent of the input.
    //
    // Choosing the same file twice in a row is not a change event, so whatever
    // is left in the value is a file the visitor cannot pick again. Clearing on
    // the completed paths only meant the *ignored* file was the one that stuck:
    // pick A, change your mind mid-upload and pick B, B is refused by the guard
    // below and stays in the value, and once the control is idle picking B does
    // nothing at all — no event, no message. The one selection someone is most
    // likely to repeat was the one made impossible.
    input.value = "";

    // One at a time, and this is the only thing enforcing it — the label below
    // shows that the control is busy but nothing takes it out of reach. Two
    // overlapping attempts each captured the *other's* object URL as the
    // picture to go back to, and the first failure revoked it: the frame was
    // left holding a dead blob, which paints as a broken-image glyph with its
    // alt text spilling out of the circle, directly above a sentence saying the
    // picture was not saved.
    if (isUploading) return;

    // What to go back to. The preview changes before the save is attempted,
    // because waiting for a round trip to show the picture someone just chose
    // is the worse trade — but that makes the picture a claim, so a save that
    // does not happen has to take it back.
    const saved = preview;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setStatus({ state: "uploading" });

    try {
      // Awaited, so `uploading` covers the whole operation. It used to end when
      // the file finished *reading*, which is before the request is even sent:
      // the spinner stopped, and a save that took two seconds and failed looked
      // like a save that took no time and worked.
      await onUpload(await readAsDataUrl(file));
      setStatus({ state: "saved" });
    } catch {
      setPreview(saved);
      URL.revokeObjectURL(objectUrl);
      setStatus({ state: "failed", hadPicture: saved !== "" });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/*
        The frame carries the boundary rather than either branch below, so it
        is there whether or not a picture is.

        Without it, `bg-gray-200` resolves to Canvas in forced colors and the
        circle vanishes, leaving "No Image" floating in nothing — the same
        mechanism as #216 and #227, on an element that is neither a field nor a
        control.

        `border-2` here is geometry rather than the weight convention those two
        set, where 1px means a field and 2px means an action. A curve cannot
        hold a 1px stroke: measured on this frame, black on Canvas reads 19.56:1
        where the circle runs straight past the axes and 1.47:1 at 45 degrees,
        because the stroke lands about a fifth covered on a diagonal pixel and
        antialiasing takes the rest. The straight-edged fields do not pay that,
        which is why the same class is enough for them. At 2px the weakest point
        on the whole perimeter is 15.52:1.
      */}
      <div className="relative h-32 w-32 rounded-full forced-colors:border-2">
        {pictureSrc(preview) ? (
          <img
            src={pictureSrc(preview)}
            alt="Avatar Preview"
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          // `text-gray-700`, not `text-gray-400`: on `bg-gray-200` that was
          // 2.10:1 at 16px, against the 4.5:1 WCAG 2.2 1.4.3 asks. It is the
          // branch the seeded account renders, so it was the default view.
          <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
            No Image
          </div>
        )}
        {isUploading && (
          // Decoration. The spinner says nothing a screen reader can read, and
          // the sentence below says it in words for everyone.
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
          >
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/*
        The boundary and the focus indicator both belong here rather than on
        the input: this label is the control anyone can see, and the input it
        wraps is `sr-only`. `border-gray-300` measured 1.41:1 against the
        white it sits on, the same value #196 took off the text fields.

        `forced-colors:border-2` because that is flatly what an action is in
        this app there, and a field is 1px. Not because of what sits nearby: in
        ordinary rendering this control is a 1px zinc-500 rounded edge, which
        is `FIELD_BOUNDARY`'s treatment exactly, so it reads as a field
        normally and as an action in forced colors. The convention carries it;
        the neighbours are on another tab and never share a screen.

        Written out rather than taken from `ACTION_BOUNDARY`, which pairs it
        with `focus-visible` — and the focusable element here is a descendant.
        If a second control ever needs this pairing, the edge wants its own
        constant rather than a second copy of this literal.
      */}
      <label
        className={`px-3 py-2 border border-zinc-500 rounded-md shadow-xs text-sm font-medium text-gray-700 has-[:focus-visible]:outline-indigo-600 forced-colors:border-2 ${ACTION_FOCUS_WITHIN} ${
          // Busy rather than disabled, and the styling is the whole of it: the
          // handler is what refuses a second file. The cursor and the changed
          // surface are so a pointer user can see the control will not take
          // one, since a click that is quietly ignored is worse than one that
          // is visibly unavailable.
          //
          // The surface changes; nothing fades. `opacity` composites the
          // element with its border and outline as one group, so an `opacity-60`
          // busy state took the label text to 3.37:1, the border to 2.27:1 and
          // the focus outline to 2.86:1 — all below their floors, and the focus
          // one is the worst of the three precisely because this state exists
          // to keep a keyboard user *on* the control rather than disabling it
          // out from under them.
          isUploading ? "cursor-wait bg-zinc-100" : "cursor-pointer bg-white hover:bg-gray-50"
        }`}
      >
        <span>Upload Avatar</span>
        <input
          type="file"
          className="sr-only"
          accept="image/*"
          aria-label="upload avatar"
          // So the result is available on the control itself, not only as an
          // announcement that has already gone by. Someone who tabs away and
          // back after a failure would otherwise have no way to hear it again.
          aria-describedby={STATUS_ID}
          // `aria-busy` and not `disabled`. Disabling a *focused* input moves
          // focus to `body`, and re-enabling does not bring it back — measured
          // in Chromium, and this input is where focus sits at the moment the
          // change fires, because `sr-only` clips rather than removes. So the
          // guard against two uploads would have put a keyboard user back at
          // the top of the document on every upload: the same defect that
          // `/profile`'s loading branch caused, moved into the component that
          // was fixing it.
          aria-busy={isUploading}
          onChange={handleFileChange}
        />
      </label>

      {/*
        Visible text in a live region, rather than an `sr-only` announcement
        beside a visual spinner. One sentence then serves both: it is spoken
        when it changes, and a sighted user gets a result rather than a spinner
        that stops.

        `aria-live` without `role="status"`, following `chat.tsx` — `/profile`
        already renders a `role="status"` while it loads, and a test addresses
        the region by that role.

        Always rendered, empty when idle. A live region that appears at the same
        moment as its content is not reliably announced; the region has to be
        there first for the change to be a change.

        Below the control rather than above it, and this is the only reason:
        the message wraps. `min-h-5` reserves one line, which is enough at 100%
        but not at 200% text, where the failure sentence takes three — measured
        at 390px, the button moved 80px between idle and failed, 40px of it
        while someone would be reaching for it to retry. Reserving the worst
        case is guesswork at an unknown zoom. Nothing sits below this, so here
        the message can grow to any height and move nothing at all.
      */}
      <p
        id={STATUS_ID}
        aria-live="polite"
        className={`min-h-5 max-w-xs text-center text-sm ${
          status.state === "failed" ? "text-red-700" : "text-gray-700"
        }`}
      >
        {message(status)}
      </p>
    </div>
  );
}
