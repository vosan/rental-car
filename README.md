# RentalCar

A car-rental frontend built with Next.js App Router and TypeScript for the GoIT Rental Car project. Browse real vehicles, filter by brand, hourly price and mileage, and send a booking request for a selected car.

## Features

- Home page with the original Figma hero image and a catalog call to action.
- Backend filtering by one brand, maximum price, and either or both mileage bounds.
- Twelve cars per page and **Load more** pagination using TanStack Query `useInfiniteQuery`.
- Car details open in a new tab and work independently on direct navigation or refresh.
- Booking form with required name/email, optional comment, inline validation, pending/error states, and a server-confirmed success notification.
- Loading, retry, empty-results, missing-car, and image-fallback states.
- Desktop design based on the supplied Figma file, with responsive layouts, keyboard-accessible controls, and React Icons.

## Run locally

Requires Node.js 20.9 or newer and npm.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The public API defaults to `https://car-rental-api.goit.study`; no authentication is required. To override it, copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL`. This is a public browser configuration value, not a secret.

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

Tests use Node's test runner with `tsx`. They cover query serialization, response normalization, API errors/cancellation, request payloads, mileage and booking validation, and display formatting. Booking tests mock the network and do not send real inquiries.

## Architecture

- `src/app`: App Router pages, metadata, server layout, query provider, loading/error/not-found boundaries.
- `src/components`: shared layout and UI, catalog/filter controls, car details and booking form; colocated CSS Modules.
- `src/lib/api`: typed native-fetch API functions and consistent error handling.
- `src/lib/validation.ts`: form and filter validation.
- `src/types`: API/domain types.
- `public/images`: optimized hero and empty-results illustration from the supplied design.

The home and car-detail pages use Server Components. The detail fetch is request-time and deduplicated within rendering; it does not depend on catalog state. Catalog data and filter metadata use TanStack Query. Draft filters apply on Search; Search and Clear reset pagination even when returning to a cached filter combination. Booking uses a mutation with duplicate-submit protection and no automatic retries.

## API and design decisions

- `GET /cars/filters` supplies available brands and price bounds.
- `GET /cars` receives filtering and pagination parameters. `price` is an inclusive maximum, and `perPage` cannot exceed 12. Blank parameters are omitted.
- `GET /cars/{id}` uses the car UUID. The shorter Article shown in the design comes from `stockNumber`.
- `POST /cars/{carId}/booking-requests` accepts `name`, `email`, and optional `comment`. The UI confirms an accepted inquiry, not a paid or date-reserved rental.
- The normal Figma form marks name/email required and leaves comment unmarked; an error mockup also shows a required-comment error. This implementation follows the API's optional-comment contract and the normal form. There is no booking-date field.
- Icons are named imports from React Icons. Main typography is locally bundled Manrope; styling uses CSS Modules and shared CSS variables.
- Browser extensions such as Grammarly can add attributes to `<body>` before hydration. The root body suppresses only that shallow attribute warning; child components retain React's hydration checks.

## Deployment and submission

Use the Vercel **Next.js** preset with the repository root as the project directory, `npm run build` as the build command, and a supported Node.js runtime. Netlify with its Next.js integration is also supported. Do not use a static HTML-only export: detail routes are dynamic.

After deployment, verify `/`, `/catalog`, and a real `/catalog/{carId}` URL, including refresh and opening details in a new tab. Check filtering, pagination, API/image access, and form behavior on the deployed origin. No production URL has been published by this implementation task yet.

The assignment requires the repository URL, deployed URL, and a ZIP of source/configuration/assets. Exclude `node_modules`, `.next`, `.git`, local environment files, and temporary outputs from that ZIP.

## References

- [Implementation plan](IMPLEMENTATION_PLAN.md)
- [Figma design](https://www.figma.com/design/A25LdVK3gZOPJaedrkTwWQ/Rental-Car?node-id=10777-314)
- [Backend Swagger](https://car-rental-api.goit.study/api-docs/)
- [React Icons](https://react-icons.github.io/react-icons/)

Author: [Volodymyr Burmitskyi (vosan)](https://github.com/vosan).
