# rdap

A private RDAP query client built with React & Next.js.

## Usage

This project uses [Next.js][nextjs] (SSG only) and React. Install [Node.js][nodejs] and [Yarn][yarn], then run the following commands:

```bash
# install dependencies
yarn
# run the development server
yarn dev
# or build and run the production server
yarn build && yarn start
```

The project is also hosted on [my website][rdap].

## Why?

Built for personal use, this project is an RDAP client; a tool that lets you execute RDAP queries on any entities that are associated with an RDAP server.
In more simpler terms, it's a tool that lets you look up information about IP addresses, domain names, and autonomous systems (a network of controlled IP addresses), and a little more.

The tool hosted by [rdap.org](https://client.rdap.org) is fantastic, but it's too simple, and isn't as overly-complicated and annoying as I want it to be. So, I built my own. Mine has dark mode.

But in all seriousness, my project does intend to have more features:
- Proxying: Some RDAP servers are inaccessible over the browser, and so proxying requests through a server is necessary.
- Self Hosting: For those worried about privacy, the project can be self-hosted.
- No Tracking: The project can't track you, because it's a static site. And in terms of the proxy, you can self-host if you're worried about that.
- Better UI: I'm not a designer, but I can try.
- Dark Mode: The blistering white of the original RDAP client is painful to look at.
- Shareable Links: Each search produces a unique URL that can be shared with others to view the same query.
- Whois: RDAP is a newer protocol that is meant to replace Whois, but some servers still use Whois. I might add support for that.
- Punycode: Some domain names use punycode, which is a way to represent Unicode characters in ASCII. I might add support for working with these domains.
- Better Error Handling: The original RDAP client doesn't handle errors very well, or tell you what went wrong. I want to fix that.
  - For example, when querying a TLD that does not have a RDAP server, or one that does not exist, the original client doesn't explain this very well.
- RDAP Schema Adherence: RDAP servers are supposed to follow a schema, but it appears a large number simply don't. I intend to provide handling for this.
  - Essentially, two separate schemas will be available: one for basic type checking, and one for the RFC-compliant schema.
  - If the server doesn't follow the RFC-compliant schema, the basic schema will be used instead.
  - It's hard to tell at this moment if Typescript can handle this well, but I'll try.

[rdap]: https://rdap.xevion.dev
[nextjs]: https://nextjs.org
[nodejs]: https://nodejs.org
[yarn]: https://yarnpkg.com