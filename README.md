# rdap

[![Version][badge-version]][npm]
[![License][badge-license]][license]
[![CI][badge-ci]][ci-workflow]
[![Codecov][badge-codecov]][codecov]
[![TypeScript][badge-typescript]][typescript]
[![Next.js][badge-nextjs]][nextjs]
[![React][badge-react]][react]

[badge-version]: https://img.shields.io/badge/version-0.9.1-blue
[badge-license]: https://img.shields.io/badge/license-MIT-green
[badge-ci]: https://github.com/Xevion/rdap/actions/workflows/ci.yml/badge.svg
[badge-codecov]: https://codecov.io/gh/Xevion/rdap/branch/master/graph/badge.svg
[badge-typescript]: https://img.shields.io/badge/TypeScript-5.9-blue
[badge-nextjs]: https://img.shields.io/badge/Next.js-16-black
[badge-react]: https://img.shields.io/badge/React-19-blue

A web-based RDAP client for querying domains, IP addresses, and ASNs. Has dark mode.

[![Domain query screenshot](.media/domain.png)][live-demo]
[![IPv4 query screenshot](.media/ipv4.png)][live-demo]

> [!TIP]
> **Try the live demo at [rdap.xevion.dev][live-demo]** to query domains, IPs, ASNs, and more in real-time.

## What is RDAP?

RDAP (Registration Data Access Protocol) is the successor to WHOIS. It returns structured JSON instead of inconsistent plaintext, making it easier to parse and use programmatically.

## Why?

The [rdap.org client][rdap-client] works fine, but I wanted something with dark mode and shareable URLs. Plus it was a good excuse to learn Next.js 16.

Main additions:

- Dark mode (actually important when you stare at this stuff all day)
- Every query gets a shareable URL
- Better type detection for inputs
- Cleaner UI with status badges and collapsible sections
- JSContact support alongside vCard
- Static export, no backend needed

## Features

**Query types**: domains, IPv4/IPv6 (with CIDR), ASNs, entity handles, nameservers, or raw RDAP URLs. Type detection is automatic but can be overridden.

**Supported objects**: domains, IP networks, autonomous systems, entities (contacts/registrars), and nameservers. Shows all the standard RDAP fields plus DNSSEC info when available.

**Contacts**: Displays both vCard (jCard) and JSContact (RFC 9553) formats. Shows names, organizations, emails, phones, addresses, etc.

**UI stuff**: Dark/light mode, copy buttons everywhere, collapsible sections, status badges with hover tooltips, relative timestamps ("2 days ago"), responsive layout.

**Technical**: Uses IANA bootstrap files to resolve RDAP server URLs. All queries happen client-side from your browser. Zod schemas for validation. Fully static build.

## Development

Uses pnpm:

```bash
pnpm install
pnpm dev          # localhost:3000
pnpm build        # static export
pnpm test         # vitest
pnpm check        # tsc + eslint
```

## Self-Hosting

Fully static. Queries go directly from your browser to RDAP servers (no backend). Just run `pnpm build` and host the output anywhere.

CORS issue: Some RDAP servers don't set CORS headers, so those queries will fail in the browser. Might add an optional proxy later.

## Privacy

The demo at [rdap.xevion.dev][live-demo] has telemetry (PostHog) to track what breaks. Query targets aren't logged for successful queries, only type/timing. Failed queries might include the target for debugging. Self-hosted builds have no telemetry.

## Contributing

PRs welcome. Uses ESLint, Prettier, Husky git hooks, and conventional commits.

## License

[MIT License][license] © 2025 Ryan Walters

<!-- Links -->

[live-demo]: https://rdap.xevion.dev
[rdap-client]: https://client.rdap.org
[ci-workflow]: https://github.com/Xevion/rdap/actions/workflows/ci.yml
[codecov]: https://codecov.io/gh/Xevion/rdap
[pnpm]: https://pnpm.io/
[nodejs]: https://nodejs.org
[nextjs]: https://nextjs.org
[react]: https://react.dev
[typescript]: https://www.typescriptlang.org
[radix]: https://www.radix-ui.com
[tailwind]: https://tailwindcss.com
[zod]: https://zod.dev
[vitest]: https://vitest.dev
[next-themes]: https://github.com/pacocoursey/next-themes
[license]: LICENSE
[npm]: https://www.npmjs.com/package/rdap
