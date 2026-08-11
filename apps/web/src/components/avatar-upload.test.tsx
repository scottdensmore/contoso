import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AvatarUpload from './avatar-upload'

/**
 * A stub `FileReader` that resolves on the next tick, standing in for the real
 * one because jsdom's does not run in this environment.
 *
 * `onloadend` fires for success and failure alike in the real API, which is why
 * the component reads `error` rather than treating the event as a result. The
 * stub reproduces that: `fails` makes it set `error` and still call `onloadend`.
 */
function stubFileReader({
  fails = false,
  via = 'onloadend' as 'onloadend' | 'onerror',
  result = 'data:image/png;base64,hello',
} = {}) {
  vi.stubGlobal(
    'FileReader',
    class {
      readAsDataURL = vi.fn()
      result = fails ? null : result
      error = fails ? new Error('unreadable') : null
      onloadend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor() {
        setTimeout(() => {
          if (fails && via === 'onerror') this.onerror?.()
          else this.onloadend?.()
        }, 0)
      }
    },
  )
}

function selectAFile() {
  const input = screen.getByLabelText(/upload avatar/i) as HTMLInputElement
  const file = new File(['hello'], 'hello.png', { type: 'image/png' })
  fireEvent.change(input, { target: { files: [file] } })
}

describe('AvatarUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('renders initial avatar if provided', () => {
    render(<AvatarUpload initialAvatar="http://example.com/avatar.png" onUpload={() => {}} />)
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('example.com/avatar.png')
  })

  it('handles file selection and uploads base64', async () => {
    const onUpload = vi.fn()
    render(<AvatarUpload initialAvatar="" onUpload={onUpload} />)
    stubFileReader()

    selectAFile()

    await waitFor(() => {
      const img = screen.getByRole('img') as HTMLImageElement
      expect(img.src).toBe('blob:mock')
      expect(onUpload).toHaveBeenCalledWith('data:image/png;base64,hello')
    })
  })

  /**
   * The three below are #237's first two defects.
   *
   * The picture was shown, the spinner stopped, and nothing was saved: the
   * component called `setPreview` before the upload started and cleared
   * `isUploading` when the file finished *reading*, so a rejected save left a
   * visitor looking at the picture they thought they had just set. Reload and
   * it is gone.
   *
   * And the upload was announced to nobody. The only signal it was happening
   * was a spinning div with no accessible name, so a screen-reader user got
   * nothing at the start and nothing at the end.
   *
   * One mechanism answers both: the state is a sentence, it is rendered where
   * everyone can see it, and it sits in a live region so it is spoken as well.
   */
  it('keeps the picture that was saved when a save fails, and says so', async () => {
    const onUpload = vi.fn().mockRejectedValue(new Error('the server said no'))
    render(<AvatarUpload initialAvatar="http://example.com/old.png" onUpload={onUpload} />)
    stubFileReader()

    selectAFile()

    await waitFor(() => {
      expect(
        screen.getByText('That picture was not saved. Your previous picture is still in place.'),
      ).toBeDefined()
    })
    // The old picture, not the one that failed to save. Showing the new one is
    // the defect: it is a claim that the change took.
    const img = screen.getByRole('img') as HTMLImageElement
    expect(img.src).toContain('example.com/old.png')

    // The retry that failure invites is *not* asserted here, and the reason is
    // worth writing down. `handleFileChange` clears `e.target.value` so that
    // choosing the same file again counts as a change; in jsdom a file input's
    // value is never set in the first place, since `fireEvent.change` assigns
    // `files` directly. So both halves — that the value is empty, and that a
    // second identical selection reaches `onUpload` — hold whether or not the
    // component clears anything. Measured: deleting that line leaves all
    // fourteen tests green. It is real behaviour with no unit-level guard.
  })

  it('does not claim a previous picture when there was none', async () => {
    // The second sentence is a claim about the screen, and on an account with
    // no avatar — the seeded one, and the branch this component renders most —
    // the revert restores nothing. Saying "your previous picture is still in
    // place" there puts it directly under a circle reading "No Image".
    const onUpload = vi.fn().mockRejectedValue(new Error('the server said no'))
    render(<AvatarUpload initialAvatar="" onUpload={onUpload} />)
    stubFileReader()

    selectAFile()

    await waitFor(() => {
      expect(screen.getByText('That picture was not saved.')).toBeDefined()
    })
    expect(screen.queryByText(/previous picture/i)).toBeNull()
  })

  it('announces the upload while it is running and once it is saved', async () => {
    let finish: (() => void) | undefined
    const onUpload = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    render(<AvatarUpload initialAvatar="" onUpload={onUpload} />)
    stubFileReader()

    selectAFile()

    const live = await screen.findByText(/uploading/i)
    // Live rather than merely present: the same text arriving in an ordinary
    // paragraph is a change no screen reader would mention.
    expect(live.closest('[aria-live]')).not.toBeNull()

    finish?.()
    // The exact sentence, and the absence of the other one. `/saved/i` also
    // matches "That picture was not saved…", so it could not tell success from
    // failure — measured, this test stayed green with the success branch
    // setting `failed`, which is a component that tells every visitor their
    // picture was not saved.
    await waitFor(() => {
      expect(screen.getByText('Picture saved.')).toBeDefined()
    })
    expect(screen.queryByText(/not saved/i)).toBeNull()
  })

  it('takes one upload at a time', async () => {
    // Two overlapping attempts each captured the other's object URL as the
    // picture to revert to, and the first failure revoked it — leaving the
    // frame holding a dead blob, which paints as a broken-image glyph with its
    // alt text spilling out of the circle, above a sentence saying the picture
    // was not saved. `ui-review` drove it and photographed it.
    let finish: (() => void) | undefined
    const onUpload = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        }),
    )
    render(<AvatarUpload initialAvatar="" onUpload={onUpload} />)
    stubFileReader()

    selectAFile()
    await screen.findByText(/uploading/i)

    const input = screen.getByLabelText(/upload avatar/i) as HTMLInputElement
    expect(input.getAttribute('aria-busy')).toBe('true')
    // The pointer half of the same signal. Asserted through the class name
    // because jsdom computes no Tailwind, so there is no cursor to read — a
    // weak guard, but the alternative is a claimed affordance with nothing
    // behind it.
    expect(input.closest('label')?.className).toContain('cursor-wait')
    // Not `disabled`: disabling a focused input drops focus to `body` and
    // re-enabling does not bring it back, and this input is exactly where focus
    // sits when the change fires. The handler is what refuses the second file.
    expect(input.disabled).toBe(false)

    selectAFile()
    // Settled first. A second call would not arrive until the stub reader's own
    // tick, so asserting straight after the event holds whether or not the
    // handler guards — measured, that version of this test survived deleting
    // the guard, and a probe confirmed the event itself is delivered.
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(onUpload).toHaveBeenCalledTimes(1)

    finish?.()
    // And it takes the next one once the first is done, so the guard is a
    // window rather than a latch.
    await waitFor(() => {
      expect(screen.getByLabelText(/upload avatar/i).getAttribute('aria-busy')).toBe('false')
    })
    selectAFile()
    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(2)
    })
  })

  it('points the control at the sentence describing what happened', async () => {
    // The announcement has gone by the time someone tabs back to the control.
    render(<AvatarUpload initialAvatar="" onUpload={() => {}} />)
    const input = screen.getByLabelText(/upload avatar/i)
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy!)?.getAttribute('aria-live')).toBe('polite')
  })

  it('reports a file it cannot read rather than spinning forever', async () => {
    const onUpload = vi.fn()
    render(<AvatarUpload initialAvatar="" onUpload={onUpload} />)
    stubFileReader({ fails: true })

    selectAFile()

    await waitFor(() => {
      expect(screen.getByText(/not saved/i)).toBeDefined()
    })
    // Nothing was sent, so nothing can have been stored under a picture the
    // browser never managed to read.
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('refuses a file that is not an image', async () => {
    // `accept="image/*"` filters the picker's dialog and nothing else; any file
    // can be chosen past it. What the string becomes is the reason to check —
    // it is stored on the account and later handed to an `<img src>`, here and
    // in the chat.
    const onUpload = vi.fn()
    render(<AvatarUpload initialAvatar="" onUpload={onUpload} />)
    stubFileReader({ result: 'data:text/html;base64,PHNjcmlwdD4=' })

    selectAFile()

    await waitFor(() => {
      expect(screen.getByText('That picture was not saved.')).toBeDefined()
    })
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('reports a read that fails through onerror as well', async () => {
    // The same failure, reported the other way the API allows. `readAsDataUrl`
    // handles both because engines differ on which fires, and the test above
    // only drives one of them — a reader that reported failure solely through
    // `onerror` would have left the upload hanging with no path out.
    const onUpload = vi.fn()
    render(<AvatarUpload initialAvatar="" onUpload={onUpload} />)
    stubFileReader({ fails: true, via: 'onerror' })

    selectAFile()

    await waitFor(() => {
      expect(screen.getByText(/not saved/i)).toBeDefined()
    })
    expect(onUpload).not.toHaveBeenCalled()
  })
})
