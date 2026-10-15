# Copilot Task Manager

A Trello-style task manager prototype built with Vue 3, TypeScript, and Vite.

## Getting started

Install Node.js 20.19 or newer, then run:

```sh
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Project commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run typecheck` | Check Vue templates and TypeScript |
| `npm run lint` | Lint the project with ESLint |
| `npm run build` | Typecheck and build the static site into `dist/` |
| `npm run preview` | Serve the production build locally |

## Structure

```text
src/
  components/ui/  Shared interface components
  composables/    Reusable Composition API logic
  features/
    boards/       Board feature
    cards/        Card feature
    lists/        List feature
  platform/       Runtime-specific adapters
  router/         Hash-based Vue Router setup
  stores/         Pinia state stores
  types/          Shared TypeScript types
  views/          Route-level views
```

The app uses Vue 3 Composition API with `<script setup>`, strict TypeScript,
Vue Router hash history, Pinia, and Tailwind CSS. Feature work is organized on
GitFlow branches; `master` is the production branch and `develop` is the
integration branch.

## Deployment

Run `npm run build` and publish the generated `dist/` directory to a static
host such as Vercel, Netlify, Cloudflare Pages, or S3 + CloudFront. PWA
configuration and desktop installer instructions will be added with their
respective features.

## Project status

The board, list, card, checklist, and label models live in `src/types/`.
`src/stores/board.ts` owns normalized board data and its mutations;
`src/stores/board-repository.ts` defines the persistence boundary and its
localStorage implementation. Pinia state is persisted under the `board-store`
key. On first launch, the store seeds a Product Launch board with To Do, In
Progress, In Review, and Done lists and nine varied sample cards.

The app shell in `src/App.vue` provides a collapsible workspace sidebar, board
navigation, header, and responsive home screen. `useTheme()` follows the
system color preference until the user selects a theme; that choice is saved
locally. `usePlatform()` isolates web/desktop detection, external links, and
optional window controls from UI components.

The boards home view lists saved boards and supports creating, renaming,
coloring, opening, and deleting them. Board deletion asks for confirmation
before removing that board and its lists and cards. Open a board from the
sidebar or its home-page tile to view its lists and card counts.

The board view now presents lists as a horizontally scrollable Kanban board.
Create lists inline, rename a list by selecting its title, and confirm before
deleting a list and its cards. Drag a list by its grip to reorder it; the new
order is persisted with the board data. On touch-sized screens, the columns
scroll horizontally with snap points.

Cards can be added inline at the bottom of each list (Enter to save, Escape to
cancel). Drag cards by their grip within or between lists. Card tiles show
their colored labels, due dates, checklist progress, and assignee initials;
overdue dates are highlighted in red.

Select a card to open its details. Edit its title, Markdown description,
labels, due date, checklist, and assignee; use the Move to control to choose a
destination list and position without dragging. The dialog supports Escape,
focus trapping, and keyboard navigation. Deleting a card asks for
confirmation.

Search the current board by card title, description, assignee, or label name.
Use the Labels filter to select one or more labels; cards must match every
selected label as well as the search text. Clear filters to show all cards
again. Card dragging is paused while a search or label filter is active so
hidden cards cannot change position accidentally.

Keyboard shortcuts: press `/` to focus board search, or focus a list and press
`N` to open its quick-add card composer. Shortcuts are ignored while typing in
form fields or while a dialog is open.

This is an incremental prototype. Board interactions, offline support, and
desktop packaging are being added feature by feature.
