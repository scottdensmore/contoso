import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from './sidebar'

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a 
      href={href} 
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick(e);
      }}
    >
      {children}
    </a>
  ),
}))

describe('Sidebar Component', () => {
  // `dialog`, not `complementary`: the panel became a dialog in #306. Querying
  // the old role here would return null whether the drawer rendered or not,
  // which is a guard that cannot fail rather than a guard that passes.
  it('should not be visible when isOpen is false', () => {
    render(<Sidebar isOpen={false} onClose={() => {}} sections={[]} />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('should be visible when isOpen is true', () => {
    render(<Sidebar isOpen={true} onClose={() => {}} sections={[{ title: 'Test', links: [] }]} />)
    expect(screen.getByText('Test')).toBeDefined()
  })

  // One match now, not two: the backdrop kept its click handler but lost its
  // name and its place in the accessibility tree, so the positional index this
  // used to need is gone with it.
  it('should call onClose when clicking the close button', () => {
    const onClose = vi.fn()
    render(<Sidebar isOpen={true} onClose={onClose} sections={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when clicking the backdrop', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Sidebar isOpen={true} onClose={onClose} sections={[]} />,
    )
    fireEvent.click(container.querySelector('button[aria-hidden="true"]')!)
    expect(onClose).toHaveBeenCalled()
  })

  it('should call onClose when clicking a link', () => {
    const onClose = vi.fn()
    const sections = [{ title: 'Shop', links: [{ title: 'Hiking', href: '/hiking' }] }]
    render(<Sidebar isOpen={true} onClose={onClose} sections={sections} />)
    const link = screen.getByText('Hiking')
    fireEvent.click(link)
    expect(onClose).toHaveBeenCalled()
  })
})

/**
 * The drawer covers the page, so it has to behave like the modal it looks like.
 * `chat.tsx` already carries this contract below `lg` and its comment on
 * `isModal` is the reasoning these tests encode: `aria-modal` without a trap
 * tells assistive technology something false.
 *
 * Demonstrated by mutating `sidebar.tsx` and `header.tsx` and watching the
 * named assertion fail:
 *
 * | mutation                         | result                                |
 * | -------------------------------- | ------------------------------------- |
 * | `aria-modal` removed             | names itself as a modal dialog        |
 * | focus-in effect disabled         | moves focus into the drawer           |
 * | Tab trap disabled                | wraps focus at both ends              |
 * | Escape handler disabled          | closes on Escape                      |
 * | Escape containment check removed | leaves Escape alone for another layer |
 * | backdrop back in the tab order   | keeps the backdrop out of it          |
 * | `aria-expanded` removed          | announces whether the drawer is open  |
 * | focus-return effect disabled     | returns focus to the trigger          |
 * | scroll lock neutralised          | stops the page behind it scrolling    |
 * | `preventScroll` dropped          | returns focus without scrolling       |
 * | backward wrap narrowed to first  | wraps backwards from the panel        |
 *
 * Three of those knock out more than one test, which is worth knowing before
 * reading a failure: disabling focus-in also fails the Escape and focus-return
 * cases, because both depend on focus having been moved in first.
 *
 * The last row was added after every row above it was green and two rendered
 * passes had walked the tab order in a browser: a tab walk starts forward, and
 * the wrap test starts from a control, so nothing began from the state the
 * drawer opens in. A hole sits under a complete table when every entry in it
 * starts from the same place.
 *
 * What none of this covers, and what found the defect in the first place: what
 * the browser does with a real Tab. jsdom does not move focus on a Tab keydown
 * at all, so the wrap tests below assert that the handler moved focus, not that
 * tabbing works. The rendered pass at step 6 is what checks the real thing.
 *
 * Also uncovered: that the drawer's contents are actually unreachable behind it.
 * `chat.tsx` marks the page `inert` below `lg`; this cannot, because `Header`
 * renders per page and so the drawer is a descendant of `<main>` rather than a
 * sibling of it. The backdrop covers the pointer case by dismissing on click,
 * and `aria-modal` carries the claim to assistive technology, but no test here
 * measures either.
 */
describe('Sidebar as a modal dialog', () => {
  const sections = [
    { title: 'Shop', links: [{ title: 'Hiking', href: '/hiking' }] },
  ]

  it('names itself as a modal dialog', () => {
    render(<Sidebar isOpen={true} onClose={() => {}} sections={sections} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName()
  })

  it('moves focus into the drawer, not onto whatever opened it', () => {
    const { container } = render(
      <Sidebar isOpen={true} onClose={() => {}} sections={sections} />,
    )
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog?.contains(document.activeElement)).toBe(true)
  })

  it('wraps focus at both ends rather than letting Tab leave the page', () => {
    const { container } = render(
      <Sidebar isOpen={true} onClose={() => {}} sections={sections} />,
    )
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    expect(first).not.toBe(last)

    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(first)

    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
  })

  // The panel is where focus sits immediately after opening, and it is not in
  // the focusable list -- `tabindex="-1"` excludes it. So it is neither `first`
  // nor `last`, and the wrap test above starts from a control and can never
  // reach this state. Backward from here the browser's default took focus to
  // the header's Sign Up link, underneath the backdrop: #306's defect surviving
  // in the direction nobody walks.
  //
  // Reachable two ways -- Shift+Tab as the first keystroke after opening, and
  // Shift+Tab after clicking any non-interactive part of the panel, which
  // focuses the panel because `tabindex="-1"` makes it the nearest focusable
  // ancestor. Both confirmed in a browser, at two viewports, along with six
  // other routes into the panel-focused state.
  //
  // What this asserts is a proxy for that, and the gap is worth stating: the
  // defect was the *browser's* default backward navigation running because the
  // handler declined to act, and jsdom runs no default Tab behaviour at all. So
  // this measures that the handler focused the right element, and it cannot
  // tell that failure apart from one where the handler never ran. It is a
  // regression lock on the condition -- narrow it back to `first` and it goes
  // red in milliseconds -- not a replica of what a browser does.
  it('wraps backwards from the panel itself, not just from its first control', () => {
    const { container } = render(
      <Sidebar isOpen={true} onClose={() => {}} sections={sections} />,
    )
    const dialog = container.querySelector('[role="dialog"]') as HTMLElement
    expect(document.activeElement).toBe(dialog)

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    )
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(focusable[focusable.length - 1])
  })

  // Dispatched from inside the drawer rather than at `document`, because that
  // is where a real Escape lands once focus has been moved in -- and because
  // the handler is scoped to its own subtree on purpose. `chat.tsx` records why
  // in the other direction: an unscoped Escape there dismissed the chat
  // underneath this drawer and left the drawer standing.
  it('closes on Escape from inside the drawer', () => {
    const onClose = vi.fn()
    render(<Sidebar isOpen={true} onClose={onClose} sections={sections} />)
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('leaves Escape alone when it belongs to another layer', () => {
    const onClose = vi.fn()
    render(<Sidebar isOpen={true} onClose={onClose} sections={sections} />)
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    fireEvent.keyDown(outside, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
    outside.remove()
  })

  // A declaration check, and knowingly so: jsdom has no layout, so it cannot
  // scroll and cannot tell you whether the page actually stopped moving. What
  // it does catch is the effect being dropped or failing to restore. The
  // measurement that matters -- a wheel gesture over the backdrop moving the
  // document 0 -> 600 behind the open drawer -- came from the rendered pass and
  // is what put this here.
  it('stops the page behind it scrolling, and gives the scroll back', () => {
    const { rerender } = render(
      <Sidebar isOpen={true} onClose={() => {}} sections={sections} />,
    )
    const scroller = document.documentElement
    expect(scroller.style.overflow).toBe('hidden')

    rerender(<Sidebar isOpen={false} onClose={() => {}} sections={sections} />)
    expect(scroller.style.overflow).not.toBe('hidden')
  })

  // A screen-sized `<button>` is a screen-sized tab stop, and it was one of the
  // stops in the walk that produced #306. It stays a button so the click that
  // dismisses the drawer keeps working; what goes is its place in the tab order
  // and in the accessibility tree, both of which the header's Close button and
  // Escape already cover.
  it('keeps the backdrop out of the tab order', () => {
    const { container } = render(
      <Sidebar isOpen={true} onClose={() => {}} sections={sections} />,
    )
    const backdrop = container.querySelector('button[aria-hidden="true"]')
    expect(backdrop).not.toBeNull()
    expect(backdrop).toHaveAttribute('tabindex', '-1')
  })
})
