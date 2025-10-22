import type { FunctionComponent } from "react";
import React from "react";
import type { VCardArray } from "@/rdap/schemas";
import { Table, Flex, Code, Link, Text } from "@radix-ui/themes";
import CopyButton from "@/components/CopyButton";

export type VCardDisplayProps = {
	vcardArray: VCardArray;
};

type VCardProperty = [string, Record<string, string>, string, string];

type StructuredName = {
	family: string;
	given: string;
	additional: string;
	prefix: string;
	suffix: string;
};

type Address = {
	street: string;
	locality: string;
	region: string;
	postal: string;
	country: string;
};

type ParsedVCard = {
	fn?: string;
	name?: StructuredName;
	org?: string;
	emails?: string[];
	phones?: string[];
	addresses?: Address[];
	urls?: string[];
	title?: string;
	role?: string;
};

/**
 * Parses a vCard (jCard) array and extracts common contact properties.
 * jCard format: ["vcard", [[prop_name, params, value_type, value], ...]]
 */
const parseVCard = (vcardArray: VCardArray): ParsedVCard => {
	const [, properties] = vcardArray;
	const result: ParsedVCard = {};

	properties.forEach((prop: VCardProperty) => {
		if (!Array.isArray(prop) || prop.length < 4) return;

		const [name, , , value] = prop as VCardProperty;
		const nameLower = name.toLowerCase();

		switch (nameLower) {
			case "fn": // Formatted name
				result.fn = value;
				break;
			case "n": // Structured name [family, given, additional, prefix, suffix]
				if (Array.isArray(value)) {
					result.name = {
						family: value[0],
						given: value[1],
						additional: value[2],
						prefix: value[3],
						suffix: value[4],
					};
				}
				break;
			case "org": // Organization
				result.org = Array.isArray(value) ? value.join(" > ") : value;
				break;
			case "email":
				if (!result.emails) result.emails = [];
				result.emails.push(value);
				break;
			case "tel": // Telephone
				if (!result.phones) result.phones = [];
				result.phones.push(value);
				break;
			case "adr": // Address [PO, extended, street, locality, region, postal, country]
				if (Array.isArray(value)) {
					const address = {
						street: value[2],
						locality: value[3],
						region: value[4],
						postal: value[5],
						country: value[6],
					};
					if (!result.addresses) result.addresses = [];
					result.addresses.push(address);
				}
				break;
			case "url":
				if (!result.urls) result.urls = [];
				result.urls.push(value);
				break;
			case "title":
				result.title = value;
				break;
			case "role":
				result.role = value;
				break;
		}
	});

	return result;
};

const VCardDisplay: FunctionComponent<VCardDisplayProps> = ({ vcardArray }) => {
	const vcard = parseVCard(vcardArray);

	return (
		<Table.Root size="2" variant="surface">
			<Table.Body>
				{vcard.fn && (
					<Table.Row>
						<Table.RowHeaderCell>Name</Table.RowHeaderCell>
						<Table.Cell>
							<Flex gap="2" align="center">
								<Text>{vcard.fn}</Text>
								<CopyButton value={vcard.fn} />
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{vcard.org && (
					<Table.Row>
						<Table.RowHeaderCell>Organization</Table.RowHeaderCell>
						<Table.Cell>
							<Flex align="center" gap="2">
								<Code variant="ghost">{vcard.org}</Code>
								<CopyButton value={vcard.org} />
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{vcard.title && (
					<Table.Row>
						<Table.RowHeaderCell>Title</Table.RowHeaderCell>
						<Table.Cell>
							<Text>{vcard.title}</Text>
						</Table.Cell>
					</Table.Row>
				)}

				{vcard.role && (
					<Table.Row>
						<Table.RowHeaderCell>Role</Table.RowHeaderCell>
						<Table.Cell>
							<Text>{vcard.role}</Text>
						</Table.Cell>
					</Table.Row>
				)}

				{vcard.emails && vcard.emails.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Email</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{vcard.emails.map((email: string, index: number) => (
									<Flex key={index} align="center" gap="2">
										<Link href={`mailto:${email}`}>
											<Code variant="ghost">{email}</Code>
										</Link>
										<CopyButton value={email} />
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{vcard.phones && vcard.phones.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Phone</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{vcard.phones.map((phone: string, index: number) => (
									<Flex key={index} align="center" gap="2">
										<Link href={`tel:${phone}`}>
											<Code variant="ghost">{phone}</Code>
										</Link>
										<CopyButton value={phone} />
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{vcard.addresses && vcard.addresses.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Address</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="2">
								{vcard.addresses.map((addr: Address, index: number) => (
									<Text key={index} size="2">
										{[
											addr.street,
											addr.locality,
											addr.region,
											addr.postal,
											addr.country,
										]
											.filter(Boolean)
											.join(", ")}
									</Text>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{vcard.urls && vcard.urls.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>URL</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{vcard.urls.map((url: string, index: number) => (
									<Flex key={index} align="center" gap="2">
										<Link href={url} target="_blank" rel="noreferrer">
											<Code variant="ghost">{url}</Code>
										</Link>
										<CopyButton value={url} />
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}
			</Table.Body>
		</Table.Root>
	);
};

export default VCardDisplay;
