/**
 * Snapshots the IANA RDAP bootstrap files into src/test/fixtures.
 *
 * Tests resolve against these snapshots so the default suite stays offline and
 * deterministic. Refresh with `pnpm fixtures:refresh`; a resulting diff is a
 * real change in registry data and deserves review rather than a blind commit.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FIXTURE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../src/test/fixtures");

// Keyed by the fixture basename, valued by the IANA source URL.
const SOURCES = {
	dns: "https://data.iana.org/rdap/dns.json",
	ipv4: "https://data.iana.org/rdap/ipv4.json",
	ipv6: "https://data.iana.org/rdap/ipv6.json",
	asn: "https://data.iana.org/rdap/asn.json",
	"object-tags": "https://data.iana.org/rdap/object-tags.json",
};

async function snapshot(name, url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`${url} responded ${response.status} ${response.statusText}`);
	}

	const body = await response.json();
	if (!Array.isArray(body?.services) || body.services.length === 0) {
		throw new Error(`${url} returned no services; refusing to write an empty fixture`);
	}

	await writeFile(`${FIXTURE_DIR}/${name}.json`, `${JSON.stringify(body, null, 2)}\n`, "utf8");
	return { name, services: body.services.length, publication: body.publication };
}

await mkdir(FIXTURE_DIR, { recursive: true });

const results = await Promise.all(
	Object.entries(SOURCES).map(([name, url]) => snapshot(name, url))
);

for (const { name, services, publication } of results) {
	console.log(`${name.padEnd(12)} ${String(services).padStart(4)} services   ${publication}`);
}
