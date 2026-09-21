# RentalCar implementation plan

Prepared September 20, 2026 (America/Los_Angeles). This is the original research and implementation plan. Implementation was subsequently authorized; see README.md for the application and current verification commands.

## 1. Sources and scope

The project description was read in the signed-in browser, including its full grading rubric. All three resource links in that description were opened and reviewed:

- [GoIT assignment](https://www.edu.goit.global/learn/41680134/52167586/52593457/homework).
- [Rental Car Figma file](https://www.figma.com/design/A25LdVK3gZOPJaedrkTwWQ/Rental-Car?node-id=10777-314). The current `version 1` page was inspected visually, including the UI kit and every screen/state below.
- [Backend Swagger documentation](https://car-rental-api.goit.study/api-docs/) and its [embedded OpenAPI definition](https://car-rental-api.goit.study/api-docs/swagger-ui-init.js). Read-only GET requests checked actual response shapes and filtering behavior.
- [React Icons documentation](https://react-icons.github.io/react-icons/) and [official repository](https://github.com/react-icons/react-icons).

The supplied local `/Users/vburmitskyi/Downloads/Rental Car.fig` was also inspected. It is an exported Figma archive containing structured design data and 14 embedded images. Its export timestamp is September 21, 2026 at 03:45:20 UTC. Browser inspection established visual intent; the archive supplied exact measurements, text, fonts, and asset identifiers. The Figma connector refused design-context access because the connected account has view access, but browser and local-file inspection were successful. No edit access or file upload is necessary for the planned work.

The assignment and design are requirements evidence, not permission to deploy, submit homework, or perform implementation during this planning task. This document is the only repository addition from the research task. No application code, dependencies, or configuration were changed, and no booking request was submitted.

## 2. Required outcome and grading priorities

| Area | Required behavior / acceptance condition |
| --- | --- |
| Stack | Next.js and TypeScript; Next.js **App Router**, with meaningful Server/Client Component boundaries. |
| Home `/` | Match the provided hero and shared header; `View Catalog` navigates to `/catalog`. |
| Catalog `/catalog` | Render real backend cars, with single-brand, single-price, and independently optional minimum/maximum mileage filters. All filtering happens on the backend. |
| Pagination | A `Load more` button uses TanStack Query **`useInfiniteQuery`** and appends results using the active filters. |
| Details `/catalog/[carId]` | Each `Read more` link opens the correct detail page in a **new browser tab**. Direct navigation and refresh must also work. |
| Detail content | Real photo, car identity, location, price, description, rental conditions, specifications, and features. |
| Rental form | Submit to the real backend booking endpoint; show a success notification only after a successful response. |
| Design | Match the desktop design’s overall structure and principal elements. Mobile/tablet adaptation is optional. Use **React Icons**, explicitly requested by the user and included in the scoring rubric. |
| Async behavior | Visible loading states, usable errors/retries, empty results, and a final-page state. No browser console errors. |
| Delivery | Deploy to Vercel or Netlify; provide repository URL, deployed URL, and a ZIP of repository files. |
| Code/documentation | Semantic markup, populated page metadata, readable typed code, meaningful commit history, clean repository, and a complete README. |

Scoring allocation: stack/compliance 20; functionality 35; code/architecture 20; API/data 15; infrastructure/deployment 10. Passing score is 60. Critical requirements are the required stack/router, design conformity, no console errors, backend filtering, `useInfiniteQuery` pagination, and working deployed routes. The rubric table caps one critical failure at 70, two at 55, and three or more at 40; no deployment or the wrong stack caps the score at 30. The surrounding prose is less precise, so satisfy every critical criterion rather than relying on a score calculation.

Additional scored details: README must include project name, description, features, setup/use instructions, and author information; loading indicators, error handling, cache behavior, formatting, and useful page `<head>` content all matter.

## 3. Existing repository and selected approach

The repository currently contains an untracked Vite + React + TypeScript starter. `src/App.tsx` is the starter counter/demo, and the images and README are starter material. There are no rental-car routes, components, API functions, or tests. Runtime dependencies contain React and React DOM only. No repository or ancestor `AGENTS.md` was found.

At implementation time, recheck the working tree and preserve its current contents before replacing the starter. Introduce Next.js directly; a temporary Vite/Next hybrid or catch-all SPA migration provides no benefit here. Replace Vite scripts/configuration and entrypoints only as the Next foundation becomes functional. Follow the relevant parts of the [official migration guide](https://nextjs.org/docs/app/guides/migrating/from-vite), without adopting its temporary static-export SPA example.

Selected implementation choices:

- **Next.js App Router + strict TypeScript**, using compatible stable package versions pinned in the lockfile at implementation time.
- **CSS Modules + global CSS custom properties** for direct control over this small design. No additional CSS framework is necessary.
- **TanStack Query** for catalog pages/filter metadata and the booking mutation.
- **Native `fetch`** behind a typed API module. No Axios, Redux, Zustand, or additional routing library is needed for the stated scope.
- **React Icons**, with named imports from the relevant icon-set subpaths.
- **Vercel** as the default deployment target, with standard Next.js runtime support for dynamic detail routes. Netlify remains an allowed alternative.
- English UI copy, consistent with Figma. Desktop is the acceptance baseline; responsive improvements follow the required work.

Use Server Components for the root layout, home content, and independently fetched detail content. Keep client boundaries around the query provider, active navigation, catalog/filter interactions, and booking form. This follows Next’s [Server/Client Component model](https://nextjs.org/docs/app/getting-started/server-and-client-components). Avoid making the entire application a Client Component.

## 4. Design inventory

All frames below belong to Figma file `A25LdVK3gZOPJaedrkTwWQ`, page `version 1`.

| Frame | Node | Key interpretation |
| --- | --- | --- |
| Home | `12791:1286` | 1440 × 768 reference; white header, full-width car photograph, lower-centered hero copy and CTA. |
| Catalog | `12791:653` | 1440 × 1992; centered filters, clear action, four columns × three rows, outlined Load more. |
| 3 | `12791:921` | Open brand and price menus, scrollable options, chevron state. |
| 4 | `12791:1189` | 1440 × 896; selected filters and a shorter results grid. Card examples are illustrative, not guaranteed correct filtered data. |
| Catalog_Loading | `12791:2013` | Dimmed catalog with centered spinner/loading panel. |
| Catalog_Not found | `12791:2353` | 1440 × 1060; filters retained, illustration, explanation, Reset filters action. |
| Details | `12791:566` | 1440 × 1296; photo/form left, full information panel right. |
| Details_error | `12791:1769` | Inline input/textarea errors, tinted fills, borders, and error icons. |
| UI KIT | `12791:1296` | Palette, icons, default/hover buttons, dropdown states, input/error styles, header active states. |

Measured foundations:

- Content width **1200px**, centered with **120px** side margins at a 1440px viewport. White header is approximately **68px** tall.
- Application typeface **Manrope**. Heading/body styles are 60px/72px bold, 24px/32px semibold, 20px/24px semibold, 16px/20px medium, 16px/20px semibold for buttons, and 12px/16px regular for small text. Inter appears only in UI-kit annotations.
- UI-kit palette: text `#101828`; white `#FFFFFF`; secondary surfaces `#F2F4F7`, `#F7F7F7`; page background `#F5F5F5`; border `#DADDE1`; muted text `#8D929A`; primary cyan `#00AAD4`; hover cyan `#0095BA`.
- Catalog filters: **924px** wide, at top offset **152px**, 16px horizontal gaps. Brand width 204px, price 196px, mileage pair 320px, Search 156px. Controls/buttons are 44px tall; labels sit above them. Clear filters sits beneath Search.
- Grid begins at approximately y=308px. Four **276px** cards, **32px** column gaps and **48px** row gaps. Cards have a white surface, **16px** padding/radius, and a full-width **244 × 44px** detail link.
- Buttons generally have **12px** radii. Use the kit’s filled primary and outlined secondary variants, including hover/focus/disabled states.
- Card photographs are **244 × 268px**, with **14px** radii. Detail content begins at x=120px/y=152px: a **640px** left column, **32px** gap, and **528px** right panel. The main image is **640 × 512px**; the information panel has 24px horizontal/32px vertical padding.
- The normal booking form is **640 × 424px** with 32px padding, 576 × 48px name/email inputs, a 576 × 88px comment box, 16px field gaps, and a 576 × 44px Send button. Error content increases the form height; do not clip it to the normal height. Error foreground/background colors are `#EC383B` / `#FFDFDF`.

Render live data rather than the repeated sample vehicles, hardcoded article numbers, or sample descriptions. Format mileage with grouped digits and `km`; format the API price as dollars; preserve the design’s `Price / 1 hour` label. Do not infer a daily price or invent units that the backend does not specify.

Asset strategy: extract the original hero photograph and empty-results illustration from the supplied archive during implementation, optimize and store durable local assets, and use backend `img` URLs for actual cars. The hero is archive entry `images/710ea4328a5c0351a1a533bf4cc2bd8ac49f2a01` (JPEG, 4096 × 2730), used with a 20% black overlay. The empty-state illustration is `images/493c0a7a92b92c5b94d4cbcb9440b42b74621428` (transparent PNG, 1254 × 1254). These entries can be extracted from the original ZIP-format `.fig` without depending on temporary audit files. Do not reuse the Vite `hero.png`. If using `next/image`, allow the observed `ac.goit.global/car-rental-task/` image source and set deliberate sizes/crops. Resolve component styles against the visible UI kit; the hero CTA's old raw blue fill resolves through its style reference to the current cyan. Nested image transforms also cancel; do not mirror the hero merely because a raw transform is negative.

React Icons should cover chevrons, location, condition/feature checks, year/calendar, car type, fuel, engine, mileage/road, and field errors. The archive identifies Bootstrap, Phosphor, and Material source glyphs, making `react-icons/bs`, `react-icons/pi`, and `react-icons/md` suitable starting points. Choose the matching actual exported components when implementing. Give icons explicit dimensions/currentColor; hide decorative icons from assistive technology and label any icon-only control.

## 5. Verified backend contract

Base URL: `https://car-rental-api.goit.study`. OpenAPI 3.1.0, API version 1.0.1; no authentication is declared.

| Request | Inputs | Response / use |
| --- | --- | --- |
| `GET /cars/filters` | None | `{ brands: string[], price: { min: number, max: number } }`. Source dropdown values from this endpoint. |
| `GET /cars` | Optional `brand`, `price`, `minMileage`, `maxMileage`, `page`, `perPage` query parameters | `{ cars, totalCars, totalPages, page, perPage }`. |
| `GET /cars/{id}` | Car UUID | Complete car object. Missing/malformed IDs return car-not-found behavior. |
| `POST /cars/{carId}/booking-requests` | JSON: required `name`, `email`; optional `comment` | Documented HTTP 201 with `{ message: string }`. This creates a booking inquiry. |

Actual GET behavior was checked, rather than inferred solely from Swagger:

- `page` starts at **1**; default `perPage` is 10, but its maximum is **12**. Explicitly request `perPage=12`.
- Brand values are case-sensitive exact matches. Preserve values from the metadata endpoint.
- `price` is an **inclusive upper bound**. For example, [`price=40`](https://car-rental-api.goit.study/cars?price=40&perPage=12&page=1) returns both $30 and $40 cars. A selected value should read like `To $40`.
- Mileage bounds are inclusive, nonnegative integers. Either can be omitted; when both are supplied, maximum must be at least minimum.
- Omit unset parameters entirely. An empty `brand=` causes a validation error. Do not turn an empty mileage input into zero unintentionally.
- No results yields an empty array and `totalPages: 0`. A page beyond the end can also return an empty array while retaining the original total count.
- [Filter metadata](https://car-rental-api.goit.study/cars/filters) currently returns 21 brands and a price range of 30–80. These are observations, not constants to freeze in application code.

The actual car object contains `id`, `stockNumber`, `year`, `brand`, `model`, `type`, `img`, `description`, `fuelConsumption`, `engine`, `rentalPrice`, `rentalCompany`, `rentalConditions`, `mileage`, `features`, nested `location { country, city, address }`, and timestamps. Important typing details: `id` is a UUID string; `stockNumber` and mileage/year are numbers; live `fuelConsumption` is a number although a Swagger example uses a string; `rentalPrice` is a numeric string. Normalize these at the API boundary and keep formatting out of transport functions.

Use `id` for routing, keys, and booking requests. Use `stockNumber` for the design’s human-readable Article display; this mapping follows the live data and design. Present city/country, not the full street address in the compact catalog card. Conditions/features come from their arrays; do not hardcode their sample values.

Error handling must retain the HTTP status and a safe readable message. Validation errors can contain nested `validation.query` information, while missing car errors can be just `{ message: "Car not found" }`. Support general server/network failures even where Swagger provides no detailed schema. A transport failure is not an empty result.

## 6. Decisions where sources differ or leave details open

| Issue | Planned decision |
| --- | --- |
| Comment required in the error mockup, optional in API | Treat comment as **optional**, consistent with the API and absence of a required marker in the normal form. Reuse the error styling if a supplied comment is rejected. Document this deliberate difference in README. |
| Booking dates | The inspected design has only name, email, and comment. Do not add a date picker or undocumented date field. |
| Booking wording | Show success only after HTTP success, phrased as an accepted rental/booking request; do not claim dates are reserved or payment is complete. |
| Price choices | API gives a range, not a list. Generate steps of 10 within the returned bounds, including endpoints if needed; this matches the design’s shown choices. Keep the threshold behavior explicit. |
| Filter application | The Search button applies all draft values together. Clear/Reset immediately restores all cars and clears inputs/errors. |
| Filter persistence | Keep draft/applied filters in client state for required scope. The original catalog tab naturally preserves them when details open separately. URL synchronization is a later optional enhancement. |
| Optional features | No favorites, login, checkout, date availability, sorting, or extra page is required by the inspected brief/design. Keep these outside the implementation scope. |
| Frame sizing artifacts | Use layout intent and measurements, not fixed page heights or brittle absolute positions. Let longer real API content grow naturally. |

No unresolved question prevents implementation under these stated defaults. Recheck the live specification/API if implementation starts substantially later.

## 7. Proposed structure and data flow

Planned folders (not created by this planning task):

```text
src/
  app/
    layout.tsx                 # server layout, metadata, font, shared header
    providers.tsx              # stable client QueryClient provider
    page.tsx                   # home
    catalog/
      page.tsx                 # server shell + client Catalog
      [carId]/
        page.tsx               # independent server detail fetch
        loading.tsx
        error.tsx
        not-found.tsx
    not-found.tsx
    globals.css
  components/
    layout/                    # Header, Navigation, Container
    home/                      # Hero
    catalog/                   # Catalog, Filters, CarCard, CarGrid, LoadMore
    car-details/               # CarDetails, InfoSection, BookingForm
    ui/                        # Button, Select, Field, Loader, Notice, EmptyState
  lib/
    api/                       # fetch/error helper, cars requests, DTO normalization
    queries/                   # query keys and catalog/filter query options
    validation/                # mileage and booking validation
    formatters.ts
  types/                       # API/domain/filter/form types
public/images/                 # extracted, optimized design assets
```

Colocate CSS Modules with their components. Extract components for reuse or meaningful behavior; avoid splitting every label into its own file.

Catalog data flow: edit draft filters → validate/normalize on Search → set applied filters → query key changes → fetch page 1 on the backend → flatten pages for rendering → Load more fetches the next page with the same applied filters. No client filtering of an unfiltered dataset.

The query key includes the complete normalized applied filter object and page size; `page` is managed by `pageParam`. Use `initialPageParam: 1`; derive the next page from the returned `page < totalPages`, otherwise return no next page. Consume the provided abort signal. Keep one stable browser QueryClient and distinguish initial loading, background refresh, and next-page loading. These mechanics are defined in the [official useInfiniteQuery reference](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useInfiniteQuery).

Changing filters must never append a response from the old query to the new list. Each Search and Clear/Reset begins at page 1: reset/trim the target infinite query's pages and page parameters before applying it, including repeated submissions and previously cached combinations. A query-key change alone does not ensure this for cached results. Test `A → Load more → B → A` explicitly. Guard Load more with `hasNextPage && !isFetching`, and cancel superseded requests before resetting active query data. Do not invalidate the entire cache on every keystroke. Retry transient GET failures conservatively; do not repeatedly retry validation/404 responses. See [TanStack's infinite-query cache guidance](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries).

Detail fetching must work with only the URL UUID, without any selected-car object from the catalog. Use a reusable server fetch helper so detail metadata and the page do not unnecessarily duplicate requests. Treat missing cars separately from network/server errors; configure request-time behavior so dynamic details are not limited to IDs known at build time.

## 8. Step-by-step implementation sequence

### Step 1 — Establish the Next.js foundation

Recheck the repository and preserve the starter baseline. Introduce Next-compatible scripts, strict TypeScript, ESLint, App Router layout/pages, font loading, CSS Modules, shared tokens, and metadata. Add TanStack Query and React Icons. Set up a stable provider without marking server pages as client components. Replace obsolete Vite entrypoints/configuration and sample assets once the replacements work.

**Done when:** all three route shapes resolve in a production build; type checking/lint pass; no Vite runtime remains; no application feature has been prematurely mocked as complete.

### Step 2 — Prepare assets and shared visual components

Extract/optimize the hero and empty-state assets; record their source. Implement container, header/logo/navigation, button variants, form fields, select behavior, loader, notices, and React Icons mappings. Match desktop typography, colors, radii, focus, hover, disabled, and error states. Custom selects must support keyboard navigation, selection, Escape, outside click, and appropriate listbox/combobox semantics.

**Done when:** header/navigation and controls match the inspected UI kit, with functional keyboard interaction and no clipped text.

### Step 3 — Implement the typed API boundary

Implement catalog, filters, detail, and booking request functions using the verified paths. Add parameter serialization and numeric normalization, status-aware error handling, and abort support. Define DTO/domain types with no pervasive `any`. Configure backend/image URLs in one place; document any environment variable used.

**Done when:** read-only requests render usable typed data and preserve server error information; unset filters are omitted; the page-size limit is respected. Booking transport exists but is not falsely marked validated by GET checks.

### Step 4 — Complete the home page

Build the full-width hero using the supplied image/crop, heading, supporting copy, and CTA. Match the desktop reference and active Home navigation. Give the hero priority loading and appropriate accessible text treatment.

**Done when:** the initial page resembles the reference at 1440px and View Catalog navigates correctly.

### Step 5 — Build the catalog and backend filters

Fetch metadata separately, generate dropdown options, and implement the draft/applied filter model. Validate independent mileage bounds and combined ranges; display useful field feedback. Render typed cards with image, brand/model/year, price, city/country, rental company, type, mileage, and Read more. Use semantic links with `target="_blank"` and `rel="noopener noreferrer"`; expose that they open a new tab to assistive technology.

**Done when:** brand, price, lower mileage, upper mileage, and combinations send correct query parameters and render only server-returned cars. Search and Clear filters behave coherently.

### Step 6 — Finish pagination and catalog states

Implement `useInfiniteQuery` paging with 12 cards per page. Append pages without duplicate cards; keep existing cards visible during Load more; prevent overlapping next-page requests. Hide the action when exhausted. Implement initial loading (using the design’s loading panel treatment), filter refresh, metadata failure/retry, initial request failure/retry, next-page failure/retry, and the empty-results illustration/Reset filters state. Avoid showing old results as though they match newly applied filters.

**Done when:** filters and Load more work together, changing filters cannot mix results, the last page stops correctly, and errors/empty data remain distinguishable.

### Step 7 — Complete independently addressable details

Fetch by UUID at `/catalog/[carId]`. Build the two-column desktop layout, real car image, Article value, location, price, description, rental conditions, specifications, and features with React Icons. Add route loading, missing-car handling, recoverable errors, and car-specific metadata.

**Done when:** a new tab, pasted URL, and browser refresh all load the same correct car without catalog state; every array entry remains visible with real content lengths.

### Step 8 — Implement the real booking form

Implement labeled name/email fields and optional comment, with trim/nonempty name and valid-email checks. Follow Figma’s inline error presentation and focus the first invalid field. Keep names international-friendly and do not invent undocumented server length restrictions. Use a mutation to post only `name`, `email`, and a nonempty optional `comment` to the selected UUID’s endpoint. Disable repeat submissions while pending; do not automatically retry POST requests. Keep input values on failure. On confirmed success, show an accessible success notification and reset the fields.

**Done when:** mocked success/failure/validation paths pass and request payloads match the contract. A live POST check is separate from this read-only audit and should use intentional test data when actual implementation testing is authorized; never submit personal data incidentally. Do not clear catalog caches on success unless a verified server-side availability change warrants it.

### Step 9 — Run focused functional and visual validation

Run TypeScript, ESLint, and a production build. Add a small set of meaningful tests for parameter normalization, mileage validation, filter/pagination interaction, direct detail loading, and booking states. Prefer mocked API responses for deterministic error and POST tests. Compare browser screenshots against the named Figma frames at a 1440px desktop viewport; also check a narrower desktop viewport for overflow. Check keyboard use, visible focus, accessible labels, notices, image fallbacks, and browser console errors.

**Done when:** all local critical checks and local acceptance checks below pass, with deployment checks completed in Step 10 and optional improvements explicitly separated.

### Step 10 — Deploy and prepare submission deliverables

Once implementation is requested and complete, deploy the standard Next.js app to Vercel. Recheck all three routes and a direct detail URL on the deployed domain, including refresh and newly opened tabs. Verify backend requests and image delivery from that origin. Replace the starter README with setup/use instructions, environment configuration, features, architecture, known specification decisions, deployed URL, and author information. Keep meaningful commits. Produce a clean ZIP of source/configuration/assets/lockfile excluding `.git`, `node_modules`, `.next`, secrets, and temporary audit outputs.

**Done when:** repository link, live link, and ZIP are ready. Homework submission itself is a separate user action, outside the current planning request.

## 9. Acceptance matrix for later execution

| Check | Expected result |
| --- | --- |
| Stack and build | Next.js + TS + App Router; type/lint/build clean. |
| Home CTA / shared navigation | Correct destinations and active state. |
| Unfiltered catalog | GET page 1 with `perPage=12`; dynamic cars in a four-column grid. |
| Brand and price | One selection each; exact server brand and inclusive maximum price. |
| Mileage | Lower only, upper only, both, zero, equal bounds, empty inputs, and invalid/reversed values handled correctly. |
| Combined filters | Server applies all active criteria; no client-side substitute. |
| Load more | Next page appended once; all active filters retained; button guarded during fetching. |
| Filter changes after loading pages | Clean separation of query results; no stale cards appended. |
| Clear / Reset | Inputs/errors cleared; unfiltered page 1 restored. |
| Empty/final page | Empty illustration only on successful zero results; no extra paging after exhaustion. |
| Error paths | Metadata, first-page, next-page, detail, and booking errors each have appropriate recovery. |
| Detail navigation | Read more opens a new tab; direct URL/refresh work locally and after deployment. |
| Detail data | Correct UUID, stock number, image, full conditions/features/specifications. |
| Booking | Required name/email, optional comment; valid payload; pending lock; no false success; error preserves values; success notice/reset. |
| Design | Home, catalog, dropdowns, selected filters, loading, empty results, details, and form errors compared with Figma. |
| Icons/accessibility | React Icons in product; labels, keyboard selects, focus, semantic links/buttons, accessible status/error messages. |
| Metadata/console | Useful titles/descriptions; no console errors, hydration errors, missing keys, or broken asset requests. |
| Delivery | Production routes verified, README complete, useful commits, repository/live URLs and clean ZIP available. |

## 10. Verification limits

During the original planning pass, GET contracts and design states were inspected; the booking POST was reviewed from its schema without execution. Application implementation and testing were authorized afterward. Retain the decisions and source links above, and use the README for implementation and verification details.
