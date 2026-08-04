import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Chat } from './chat'

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'Ada' } } }),
}))

// jsdom does not implement scrollTo; the component calls it after each turn.
beforeEach(() => {
  Element.prototype.scrollTo = vi.fn()
})

const sendChatMessage = vi.fn()
vi.mock('@/lib/messaging', () => ({
  sendChatMessage: (...args: unknown[]) => sendChatMessage(...args),
}))

function openChatAndSend(text: string) {
  // The launcher is the first button; opening it reveals the input.
  fireEvent.click(screen.getAllByRole('button')[0])
  const input = screen.getByRole('textbox')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.keyUp(input, { code: 'Enter' })
}

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
