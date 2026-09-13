# UI Review: Keyboard Journeys & Accessibility Evaluation Guidance

This guide establishes the environment and evaluation requirements for UI, keyboard navigation, and accessibility reviews in Contoso Outdoors.

## Production Build Requirement

**Keyboard and focus journeys MUST be evaluated against a production build (`make build-web` / production server / Docker stack) rather than the Next.js development server (`next dev` / `make dev`).**

Reviewing UI behavior in Next.js development mode produces invalid keyboard and focus findings. Always test and verify the following surfaces in a production environment:

- **Tab Stop Sequence & Order**: Forward (`Tab`) and backward (`Shift+Tab`) navigation order across all interactive controls.
- **Focus-out Dismissal**: Dismissal handlers triggered when focus leaves a component (e.g., dropdowns, modals, floating panels, or the chat sheet).
- **Boundary Contrast & Focus Rings**: Visibility and contrast compliance of active focus indicators against adjacent surfaces.
- **Modal Focus Traps & Containment**: Proper trapping, cycling, and release of focus within dialogs and sheets.
- **Element Occlusion & Geometry**: Layout clearance, z-index layering, and absence of visual overlap, particularly at compact viewports (such as 390x844).

---

## Technical Rationale: Why Next.js Dev Mode Invalidates Keyboard Reviews

The Next.js development server injects runtime development overlays into the document DOM that fundamentally alter keyboard navigation and layout behavior:

### 1. Injected Portal Nodes and Issues Badges
Next.js development mode renders portal elements directly into the document root (e.g. `<NEXTJS-PORTAL>`, error overlay containers, dev indicators, and the issues badge).
- Even when `devIndicators: false` is configured in `next.config.js` (which disables the Dev Tools menu/trigger, cache badge, and build activity indicator), Next.js retains the separate **issues badge**.
- The issues badge is injected into the DOM upon the first logged error or failed request. In local environments, this occurs immediately upon common testing actions, such as sending a message in the chat widget when the backend chat service is unconfigured or stopped (triggering the `catch` block in `sendChatMessage`).

### 2. Altered Tab Stop Sequences
Injected overlay portals insert interactive, focusable DOM elements into the document. Instead of sequential navigation flowing directly from application controls to neighboring content or out to the browser frame, keyboard focus encounters unexpected intermediate stops inside the dev overlay.

### 3. Premature Focus-out and Focus-in Events
Components that manage focus boundaries—such as the floating chat sheet in `apps/web/src/components/chat.tsx`—rely on precise `focusout` and `focusin` behavior:
- When tabbing forward off an edge control (such as the send button or close trigger), focus should transition either to the next in-page element or out to browser chrome without dismissing the panel.
- In dev mode, focus lands on the injected `NEXTJS-PORTAL` or issues badge. Because this node is inside the document body, it fires document `focusin` / `focusout` events, triggering outside-focus dismissal handlers prematurely and collapsing UI components a keystroke early.

### 4. Unexpected Focus Catching
Injected overlay elements catch focus unexpectedly during keyboard traversal, trapping or redirecting keyboard navigation away from the intentional page hierarchy.

### 5. False-Positive Element Occlusion at Compact Viewports
The dev indicators and issues badge float pinned to the bottom corners of the viewport. At mobile or compact viewports (e.g., 390x844), these badges physically obscure inputs, action buttons, and footer controls, creating artificial occlusion issues that do not exist in production builds.

---

## Recommended Review Workflow

To perform an accurate UI and keyboard accessibility review:

1. **Build the Production Web Bundle**:
   ```bash
   make build-web
   # or from apps/web: npm run build
   ```

2. **Serve the Production Build**:
   - **Standalone Web Server**:
     ```bash
     npm run start --prefix apps/web
     ```
   - **Composed Docker Stack (Full Parity with Backend & Database)**:
     ```bash
     make e2e-smoke KEEP_STACK=1
     # or
     make up
     ```

3. **Perform Keyboard Verification**:
   - Navigate full keyboard loops using `Tab` and `Shift+Tab`.
   - Verify that focus moves smoothly between interactive elements with no phantom dev stops.
   - Test dismiss-on-blur and outside-focus handlers to ensure components remain open or close as designed.
   - Verify that focus traps in modal dialogs trap focus reliably without leaking to portal overlays.
   - Inspect element visibility and tap/click target clearance at compact screen widths (390x844).
   - Verify focus indicator boundaries meet contrast requirements against adjacent backgrounds.
