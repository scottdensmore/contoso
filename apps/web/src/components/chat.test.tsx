import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Chat } from './chat'

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'Ada' } } }),
}))

// jsdom does not implement scrollTo; the component calls it after each turn.
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn()

  // Desktop by default, which is the width every test below this line was
  // written against — the panel as a corner card, non-modal, launcher present.
  //
  // Without this they inherit the stub in `src/test/setup.ts`, which reports
  // "no match" for everything; for a `min-width` query that means compact, so
  // the whole pre-existing suite would silently move to the modal sheet variant
  // and desktop would be exercised by nothing. `Chat modality` overrides this
  // per test.
  window.matchMedia = ((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
})

const sendChatMessage = vi.fn()
vi.mock('@/lib/messaging', () => ({
  sendChatMessage: (...args: unknown[]) => sendChatMessage(...args),
}))

function clickReset() {
  fireEvent.click(screen.getByRole('button', { name: 'Clear conversation' }))
}

function openChat() {
  fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
}

function openChatAndSend(text: string) {
  // The launcher is the first button; opening it reveals the input.
  fireEvent.click(screen.getAllByRole('button')[0])
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.keyUp(input, { code: 'Enter' })
}

describe('Chat accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes every control by an accessible name', () => {
    // Rendered review found the reset control was a bare svg with an onClick —
    // no role, no name, unreachable by keyboard — and the send button and
    // input had no names at all.
    render(<Chat />)
    openChat()

    expect(screen.getByRole('button', { name: 'Clear conversation' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Close chat' })).toBeDefined()
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeDefined()
  })

  it('announces conversation updates to assistive technology', () => {
    // A probe at three viewports found zero aria-live/role=log/status/alert
    // anywhere on the page, so turns mutated silently.
    render(<Chat />)
    openChat()

    const log = screen.getByRole('log', { name: 'Conversation' })
    expect(log.getAttribute('aria-live')).toBe('polite')
  })

  it('marks the waiting turn as a status and hides the decorative spinner', async () => {
    let resolveReply: (turn: unknown) => void = () => {}
    sendChatMessage.mockReturnValue(new Promise((resolve) => { resolveReply = resolve }))

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<Chat />)
      openChatAndSend('recommend a tent')
      await act(async () => { vi.advanceTimersByTime(500) })

      const status = screen.getByRole('status')
      expect(status.textContent).toContain('Let me see what I can find')
      expect(status.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')

      await act(async () => {
        resolveReply({
          name: 'Jane Doe', message: 'done', status: 'done',
          type: 'assistant', avatar: '',
        })
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it('moves focus into the panel when it opens', () => {
    // The launcher is the last tabbable element on the home page; opening the
    // panel moved focus nowhere, so the next Tab went into the page behind it.
    render(<Chat />)
    openChat()
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Message' }))
  })

  it('closes on Escape', () => {
    render(<Chat />)
    openChat()
    expect(screen.getByRole('dialog', { name: 'Chat with Jane Doe' })).toBeDefined()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('ignores Escape that did not originate inside the panel', () => {
    // Rendered review: with the site nav drawer open over the chat, Escape
    // closed the chat underneath and left the drawer up — dismissing the layer
    // the user was not interacting with.
    render(<Chat />)
    openChat()
    expect(screen.getByRole('dialog')).toBeDefined()

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeNull()

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message' }), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('returns focus to the launcher when closed', () => {
    // Closing dropped focus to <body>, so the next Tab restarted at the top of
    // the document — 24 stops back to the launcher.
    render(<Chat />)
    openChat()
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message' }), { key: 'Escape' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open chat' }))
  })

  it('re-seeds the greeting when the conversation is cleared', async () => {
    // Reset left the panel completely blank, and the greeting only rendered on
    // open — so a cleared thread stayed empty for the rest of the session.
    // That state was unreachable while the reset control was not a control.
    sendChatMessage.mockResolvedValue({
      name: 'Jane Doe', message: 'an answer', status: 'done',
      type: 'assistant', avatar: '',
    })
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<Chat />)
      openChatAndSend('recommend a tent')

      // Drain the 400ms greeting timer that toggleChat queued. Without this it
      // is still pending at reset and fires afterwards, re-seeding the greeting
      // by accident — which would make this test pass against the old reset.
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })
      await waitFor(() => expect(screen.getByText('an answer')).toBeDefined())

      clickReset()
      // Turn bodies render through react-remark, which updates on an effect.
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getByText(/how can I be helpful today/i)).toBeDefined()
      expect(screen.queryByText('recommend a tent')).toBeNull()
      expect(screen.queryByText('an answer')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('returns focus to the launcher when closed by the button, not just Escape', () => {
    // The Escape path and the button path are separate lines. A test that only
    // closes with Escape leaves the button path unguarded — and Safari does not
    // focus buttons on click, so focus would fall to <body> there.
    render(<Chat />)
    openChat()
    fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Open chat' }))
  })

  it('keeps the panel focusable so a click inside it does not break Escape', () => {
    // In a browser, clicking a non-focusable part of the panel blurs to <body>,
    // and the Escape guard — keyed on "target inside the panel" — then ignores
    // the key. tabIndex={-1} makes the panel the nearest focusable ancestor, so
    // the target stays inside.
    //
    // jsdom does not implement that focus-on-mousedown behaviour, so the
    // consequence cannot be reproduced here; this pins the mechanism only. The
    // behaviour itself was measured in the rendered app.
    render(<Chat />)
    openChat()
    expect(screen.getByRole('dialog').getAttribute('tabindex')).toBe('-1')
  })

  it('closes on Escape raised from within the panel', () => {
    render(<Chat />)
    openChat()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('does not double-seed the greeting when reset races the open timer', () => {
    // toggleChat queues a 400ms greeting timer. reset also seeds one, so a
    // reset inside that window rendered the greeting twice — reproduced in the
    // browser at +50, +150 and +300ms.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<Chat />)
      openChat()
      act(() => {
        vi.advanceTimersByTime(150)
      })
      clickReset()
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getAllByText(/how can I be helpful today/i)).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not double-seed the greeting when reopened inside the open timer', () => {
    // Found in the browser at every delay tried between +50 and +380ms. The
    // open branch guards on turns.length, but the pending timer has not
    // dispatched yet, so a reopen still sees an empty thread and schedules a
    // second timer. Tap-tap-tap on the launcher is an ordinary mobile gesture.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<Chat />)
      openChat()
      act(() => {
        vi.advanceTimersByTime(150)
      })
      fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
      act(() => {
        vi.advanceTimersByTime(50)
      })
      openChat()
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(screen.getAllByText(/how can I be helpful today/i)).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('ignores a whitespace-only message', () => {
    // The guard was `message === ""` with no trim, so three spaces and Enter
    // fired a real request and rendered an empty blue bubble.
    render(<Chat />)
    openChatAndSend('   ')
    expect(sendChatMessage).not.toHaveBeenCalled()
  })

  it('sends the trimmed text, not the padded input', () => {
    sendChatMessage.mockResolvedValue({
      name: 'Jane Doe', message: 'ok', status: 'done', type: 'assistant', avatar: '',
    })
    render(<Chat />)
    openChatAndSend('  recommend a tent  ')

    expect(sendChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'recommend a tent' }),
      undefined,
    )
  })
})

describe('Chat placeholder timing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps the user message and shows no stuck placeholder when the reply is fast', async () => {
    // The placeholder fires on a fixed 400ms timer that nothing cancels, while
    // `replace` swaps the LAST turn. A reply arriving first therefore replaces
    // the user's own message, and the placeholder is appended afterwards and
    // never resolves.
    sendChatMessage.mockResolvedValue({
      name: 'Jane Doe',
      message: 'Here is a tent recommendation.',
      status: 'done',
      type: 'assistant',
      avatar: '',
    })

    render(<Chat />)
    openChatAndSend('recommend a tent')

    await waitFor(() =>
      expect(screen.getByText('Here is a tent recommendation.')).toBeDefined(),
    )

    // The user's own turn must survive.
    expect(screen.getByText('recommend a tent')).toBeDefined()

    // And no placeholder should be left hanging after the reply.
    await new Promise((resolve) => setTimeout(resolve, 600))
    expect(screen.queryByText('Let me see what I can find...')).toBeNull()
  })

  it('still shows a placeholder while a slow reply is in flight', async () => {
    let resolveReply: (turn: unknown) => void = () => {}
    sendChatMessage.mockReturnValue(
      new Promise((resolve) => {
        resolveReply = resolve
      }),
    )

    // Fake timers so the 400ms delay is advanced deterministically. With real
    // timers this raced a wall-clock waitFor and flaked under load.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<Chat />)
      openChatAndSend('recommend a tent')

      await act(async () => {
        vi.advanceTimersByTime(500)
      })
      expect(screen.getByText('Let me see what I can find...')).toBeDefined()

      resolveReply({
        name: 'Jane Doe',
        message: 'A slow but complete answer.',
        status: 'done',
        type: 'assistant',
        avatar: '',
      })

      await act(async () => {})
      expect(screen.getByText('A slow but complete answer.')).toBeDefined()
      expect(screen.queryByText('Let me see what I can find...')).toBeNull()
      expect(screen.getByText('recommend a tent')).toBeDefined()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not let a second send destroy the first answer', async () => {
    // Found by rendered review: with positional replace, two overlapping sends
    // each resolve against "the last turn", so the first answer was rendered
    // and then overwritten, leaving the first placeholder spinning forever.
    const replies: Array<(turn: unknown) => void> = []
    sendChatMessage.mockImplementation(
      () => new Promise((resolve) => replies.push(resolve)),
    )

    render(<Chat />)
    openChatAndSend('FIRST question')
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'SECOND question' } })
    fireEvent.keyUp(input, { code: 'Enter' })

    // resolve in order; each must land on its own placeholder
    replies[0]({
      name: 'Jane Doe', message: 'ANSWER ONE', status: 'done',
      type: 'assistant', avatar: '',
    })
    replies[1]({
      name: 'Jane Doe', message: 'ANSWER TWO', status: 'done',
      type: 'assistant', avatar: '',
    })

    await waitFor(() => expect(screen.getByText('ANSWER TWO')).toBeDefined())
    expect(screen.getByText('ANSWER ONE')).toBeDefined()
    expect(screen.getByText('FIRST question')).toBeDefined()
    expect(screen.getByText('SECOND question')).toBeDefined()
  })

  it('shows an error instead of spinning forever when the request rejects', async () => {
    // A rejected request must not leave the placeholder in place indefinitely;
    // settle was originally attached only via .then.
    sendChatMessage.mockRejectedValue(new Error('network down'))

    render(<Chat />)
    openChatAndSend('will this hang')

    await waitFor(
      () => expect(screen.getByText(/something went wrong/i)).toBeDefined(),
      { timeout: 2000 },
    )
    expect(screen.queryByText('Let me see what I can find...')).toBeNull()
  })

  it('drops a reply that arrives after the thread was reset', async () => {
    // Send, reset within the 400ms placeholder delay, then let the reply land.
    // Nothing told the in-flight request its conversation was gone, so the
    // answer appended into the cleared thread — an assistant reply to nothing.
    let resolveReply: (turn: unknown) => void = () => {}
    sendChatMessage.mockReturnValue(
      new Promise((resolve) => {
        resolveReply = resolve
      }),
    )

    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      render(<Chat />)
      openChatAndSend('recommend a tent')

      // Reset before the placeholder timer fires.
      clickReset()
      expect(screen.queryByText('recommend a tent')).toBeNull()

      await act(async () => {
        vi.advanceTimersByTime(500)
      })
      // The placeholder must not fire into the cleared thread either.
      expect(screen.queryByText('Let me see what I can find...')).toBeNull()

      await act(async () => {
        resolveReply({
          name: 'Jane Doe', message: 'ORPHANED ANSWER', status: 'done',
          type: 'assistant', avatar: '',
        })
      })

      expect(screen.queryByText('ORPHANED ANSWER')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('abandons every send in flight when reset runs, not just the last', async () => {
    // reset clears the whole set, so this generalises trivially — but a fix
    // that tracked a single pending id instead of a set would pass the
    // one-send test above and drop only one of these.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const replies: Array<(turn: unknown) => void> = []
      sendChatMessage.mockImplementation(
        () => new Promise((resolve) => replies.push(resolve)),
      )

      render(<Chat />)
      openChatAndSend('FIRST question')
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'SECOND question' } })
      fireEvent.keyUp(input, { code: 'Enter' })

      await act(async () => {
        vi.advanceTimersByTime(500)
      })
      expect(screen.getAllByText('Let me see what I can find...')).toHaveLength(2)

      clickReset()
      expect(screen.queryByText('Let me see what I can find...')).toBeNull()

      await act(async () => {
        replies[0]({
          name: 'Jane Doe', message: 'ANSWER ONE', status: 'done',
          type: 'assistant', avatar: '',
        })
        replies[1]({
          name: 'Jane Doe', message: 'ANSWER TWO', status: 'done',
          type: 'assistant', avatar: '',
        })
      })

      expect(screen.queryByText('ANSWER ONE')).toBeNull()
      expect(screen.queryByText('ANSWER TWO')).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('sends nothing for an empty message and stays usable', async () => {
    // Note what this does NOT cover: sendMessage also returns early before
    // minting a pending id, so an empty Enter leaves no orphan in the pending
    // set. That ordering is unobservable from outside the component — this
    // test passes either way — so it is an invariant argued in the source, not
    // one pinned here.
    sendChatMessage.mockClear()

    render(<Chat />)
    fireEvent.click(screen.getAllByRole('button')[0])
    const input = screen.getByRole('textbox')
    fireEvent.keyUp(input, { code: 'Enter' })

    expect(sendChatMessage).not.toHaveBeenCalled()

    // And the panel still works afterwards.
    sendChatMessage.mockResolvedValue({
      name: 'Jane Doe', message: 'A REAL ANSWER', status: 'done',
      type: 'assistant', avatar: '',
    })
    fireEvent.change(input, { target: { value: 'a real question' } })
    fireEvent.keyUp(input, { code: 'Enter' })

    await waitFor(() => expect(screen.getByText('A REAL ANSWER')).toBeDefined())
  })

  it('still delivers a reply sent after a reset', async () => {
    // The other half: reset must abandon only what was in flight when it ran.
    // Clearing the pending set without re-registering later sends would make
    // the panel permanently dead after one reset, which the test above would
    // not catch.
    const replies: Array<(turn: unknown) => void> = []
    sendChatMessage.mockImplementation(
      () => new Promise((resolve) => replies.push(resolve)),
    )

    render(<Chat />)
    openChatAndSend('first question')
    clickReset()

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'second question' } })
    fireEvent.keyUp(input, { code: 'Enter' })

    // Resolve the abandoned send first, then the live one.
    replies[0]({
      name: 'Jane Doe', message: 'STALE ANSWER', status: 'done',
      type: 'assistant', avatar: '',
    })
    replies[1]({
      name: 'Jane Doe', message: 'LIVE ANSWER', status: 'done',
      type: 'assistant', avatar: '',
    })

    await waitFor(() => expect(screen.getByText('LIVE ANSWER')).toBeDefined())
    expect(screen.queryByText('STALE ANSWER')).toBeNull()
    expect(screen.getByText('second question')).toBeDefined()
  })

  it('resolves each reply into its own placeholder when two are on screen', async () => {
    // The decisive case. Both placeholders must be mounted at once, or the
    // resolve-by-id branch is never taken: a test that settles before the
    // 400ms timer only ever exercises the append fallback, and would pass
    // even if resolve matched on the wrong criterion.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const replies: Array<(turn: unknown) => void> = []
      sendChatMessage.mockImplementation(
        () => new Promise((resolve) => replies.push(resolve)),
      )

      render(<Chat />)
      openChatAndSend('FIRST question')
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'SECOND question' } })
      fireEvent.keyUp(input, { code: 'Enter' })

      // Let both placeholders mount.
      await act(async () => {
        vi.advanceTimersByTime(500)
      })
      expect(screen.getAllByText('Let me see what I can find...')).toHaveLength(2)

      // Resolve the SECOND send first — out of order on purpose.
      await act(async () => {
        replies[1]({
          name: 'Jane Doe', message: 'ANSWER TWO', status: 'done',
          type: 'assistant', avatar: '',
        })
      })

      // The first placeholder must be untouched, not overwritten.
      expect(screen.getAllByText('Let me see what I can find...')).toHaveLength(1)
      expect(screen.getByText('ANSWER TWO')).toBeDefined()

      await act(async () => {
        replies[0]({
          name: 'Jane Doe', message: 'ANSWER ONE', status: 'done',
          type: 'assistant', avatar: '',
        })
      })

      expect(screen.queryByText('Let me see what I can find...')).toBeNull()

      // Order is the assertion that matters. Checking only that both answers
      // exist passes even when each lands in the other's slot — which is
      // exactly what a wrong match criterion produces.
      const rendered = Array.from(
        document.querySelectorAll('div,p,span'),
      )
        .map((el) => el.textContent?.trim() ?? '')
        .filter((text) =>
          ['FIRST question', 'SECOND question', 'ANSWER ONE', 'ANSWER TWO'].includes(text),
        )
      const order = rendered.filter((text, i) => rendered.indexOf(text) === i)

      // Both sends happen before either placeholder mounts, so the questions
      // come first; each answer must sit in its own placeholder's slot.
      expect(order).toEqual([
        'FIRST question',
        'SECOND question',
        'ANSWER ONE',
        'ANSWER TWO',
      ])
    } finally {
      vi.useRealTimers()
    }
  })

  it('resolves each reply into its own placeholder when replies arrive in order', async () => {
    // The out-of-order case above passes accidentally under a "last waiting
    // turn" match: resolving B then A happens to pick the right slots. Only
    // in-order resolution distinguishes match-by-id from match-by-position.
    vi.useFakeTimers({ shouldAdvanceTime: true })
    try {
      const replies: Array<(turn: unknown) => void> = []
      sendChatMessage.mockImplementation(
        () => new Promise((resolve) => replies.push(resolve)),
      )

      render(<Chat />)
      openChatAndSend('FIRST question')
      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'SECOND question' } })
      fireEvent.keyUp(input, { code: 'Enter' })

      await act(async () => {
        vi.advanceTimersByTime(500)
      })
      expect(screen.getAllByText('Let me see what I can find...')).toHaveLength(2)

      for (const [index, message] of [[0, 'ANSWER ONE'], [1, 'ANSWER TWO']] as const) {
        await act(async () => {
          replies[index]({
            name: 'Jane Doe', message, status: 'done',
            type: 'assistant', avatar: '',
          })
        })
      }

      const rendered = Array.from(document.querySelectorAll('div,p,span'))
        .map((el) => el.textContent?.trim() ?? '')
        .filter((text) =>
          ['FIRST question', 'SECOND question', 'ANSWER ONE', 'ANSWER TWO'].includes(text),
        )
      const order = rendered.filter((text, i) => rendered.indexOf(text) === i)

      // Under a last-waiting match this renders ANSWER TWO before ANSWER ONE,
      // attaching each answer to the wrong question.
      expect(order).toEqual([
        'FIRST question',
        'SECOND question',
        'ANSWER ONE',
        'ANSWER TWO',
      ])
    } finally {
      vi.useRealTimers()
    }
  })
})

/**
 * Modality below `sm` only.
 *
 * The e2e spec is where the fix is really proven, because obscuring is a
 * question about painted pixels and jsdom paints nothing. What is worth
 * asserting here is the part that is pure state: which of the four modal
 * behaviours are attached, on which side of the breakpoint, and whether they
 * come off again.
 */
describe('Chat modality', () => {
  // The component inerts its own *siblings*, so the fixture has to put one
  // there. This mirrors the root layout, where <main> and <Chat> sit together
  // inside one flex container.
  //
  // Getting this wrong is silent in the useful direction: with `behind`
  // somewhere else in the tree it simply never receives `inert`, and the test
  // fails saying so rather than passing on a structure the app does not have.
  function renderInLayout() {
    const parent = document.createElement('div')
    document.body.appendChild(parent)
    render(<Chat />, { container: parent })
    // After `render`, not before: React takes ownership of the container and
    // clears it, so a sibling added first is gone by the time the panel exists.
    // Still before the panel opens, though — the effect reads the sibling list
    // once, when the panel becomes modal.
    const behind = document.createElement('main')
    behind.innerHTML = '<a href="/products">a product</a>'
    parent.appendChild(behind)
    return { parent, behind, cleanup: () => parent.remove() }
  }

  // A controllable `matchMedia`, replacing the always-false one in setup.ts.
  // The component asks for `(min-width: 640px)` and treats a non-match as
  // compact, so `matches` is the inverse of the thing being described.
  //
  // One object per mount, with a live getter: the component captures the
  // MediaQueryList once and re-reads `matches` when a change fires, so a
  // harness that swapped in a fresh object would leave it reading the old one
  // forever — and would report that as the component ignoring resizes.
  function useViewport(compact: boolean) {
    const state = { compact }
    const listeners = new Set<() => void>()
    window.matchMedia = ((query: string) => ({
      get matches() {
        return !state.compact
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia
    return {
      resizeTo(nowCompact: boolean) {
        state.compact = nowCompact
        act(() => {
          listeners.forEach((listener) => listener())
        })
      },
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('claims containment and inerts the page below sm', () => {
    useViewport(true)
    const { behind, cleanup } = renderInLayout()
    openChat()

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(behind).toHaveAttribute('inert')
    // Never the widget itself — that would take the panel down with the page.
    expect(screen.getByRole('dialog').parentElement).not.toHaveAttribute('inert')

    cleanup()
  })

  it('claims nothing at sm and up', () => {
    useViewport(false)
    const { behind, cleanup } = renderInLayout()
    openChat()

    // `role="dialog"` stays: it carries the accessible name and the grouping
    // boundary. Only the containment claim is width-dependent.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal')
    expect(behind).not.toHaveAttribute('inert')

    cleanup()
  })

  it('releases the page when the panel closes', () => {
    useViewport(true)
    const { behind, cleanup } = renderInLayout()
    openChat()
    expect(behind).toHaveAttribute('inert')

    // `inert` outliving the panel is the failure that leaves a page nothing can
    // click and nothing on screen to explain why.
    fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
    expect(behind).not.toHaveAttribute('inert')

    cleanup()
  })

  it('restores body scrolling when the panel closes', () => {
    useViewport(true)
    const { cleanup } = renderInLayout()

    openChat()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.click(screen.getByRole('button', { name: 'Close chat' }))
    expect(document.body.style.overflow).toBe('')

    cleanup()
  })

  it('releases the page when Escape closes the sheet', () => {
    // The cleanups key off `isModal`, not off which control did the closing —
    // but nothing demonstrated that, and every other release test clicks the
    // button. A trigger-specific leak would leave the page unusable with no
    // dialog on screen to blame.
    useViewport(true)
    const { behind, cleanup } = renderInLayout()
    openChat()
    expect(behind).toHaveAttribute('inert')

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(behind).not.toHaveAttribute('inert')
    expect(document.body.style.overflow).toBe('')

    cleanup()
  })

  it('wraps focus at both ends of the sheet', () => {
    // The backward branch of the trap had no assertion pointed at it: the e2e
    // spec only ever presses Tab forward, and 50 forward presses wrap the
    // forward direction incidentally while never touching Shift+Tab.
    //
    // jsdom moves focus for neither, so this asserts the handler's own
    // `focus()` calls rather than real tab navigation. That is the whole of
    // what the handler contributes.
    useViewport(true)
    const { cleanup } = renderInLayout()
    openChat()

    const first = screen.getByRole('button', { name: 'Clear conversation' })
    const last = screen.getByRole('button', { name: 'Send message' })

    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    cleanup()
  })

  it('does not trap focus at sm and up', () => {
    // The same keystroke that wraps on the sheet must do nothing on the card,
    // or the site navigation is unreachable at desktop width — the outcome
    // #112's reviewers rejected and the reason this is width-scoped at all.
    useViewport(false)
    const { cleanup } = renderInLayout()
    openChat()

    const first = screen.getByRole('button', { name: 'Clear conversation' })
    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(first)

    cleanup()
  })

  it('keeps focus inside the panel across a resize', () => {
    // Widening unmounts the sheet's header close button. Focus sitting on it
    // would otherwise land on <body>, and the next Tab restarts at the top of
    // the document — 24 stops back, the same failure open and close already
    // guard against.
    const viewport = useViewport(true)
    const { cleanup } = renderInLayout()
    openChat()

    screen.getByRole('button', { name: 'Close chat' }).focus()
    viewport.resizeTo(false)

    expect(document.activeElement).not.toBe(document.body)
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)

    cleanup()
  })

  it('follows a resize across the breakpoint while open', () => {
    const viewport = useViewport(false)
    const { behind, cleanup } = renderInLayout()
    openChat()
    expect(behind).not.toHaveAttribute('inert')

    // Narrowing with the panel already open. Modality is not only a decision
    // made at first paint — rotating a phone crosses this line.
    viewport.resizeTo(true)
    expect(behind).toHaveAttribute('inert')
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')

    // And back, because a trap left behind at desktop width is the regression
    // that would make this whole change worse than not doing it.
    viewport.resizeTo(false)
    expect(behind).not.toHaveAttribute('inert')
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal')

    cleanup()
  })
})
