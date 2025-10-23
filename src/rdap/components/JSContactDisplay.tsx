import type { FunctionComponent } from "react";
import React from "react";
import type { JSCard } from "@/rdap/schemas";
import { Table, Flex, Code, Link, Text, Badge } from "@radix-ui/themes";
import CopyButton from "@/components/CopyButton";

export type JSContactDisplayProps = {
	jscard: JSCard;
};

/**
 * Display component for JSContact (RFC 9553) contact cards in RDAP responses.
 * JSContact is a JSON-native alternative to vCard/jCard.
 */
const JSContactDisplay: FunctionComponent<JSContactDisplayProps> = ({ jscard }) => {
	// Extract full name or build from components
	const displayName = jscard.name?.full || "";

	// Extract organization names
	const organizations = jscard.organizations
		? Object.values(jscard.organizations)
				.map((org) => {
					if (org.name && org.units) {
						return `${org.name} > ${org.units.map((u: { name: string }) => u.name).join(" > ")}`;
					}
					return (
						org.name ||
						org.units?.map((u: { name: string }) => u.name).join(" > ") ||
						""
					);
				})
				.filter(Boolean)
		: [];

	// Extract titles/roles - cast to proper type
	const titles = jscard.titles
		? (Object.values(jscard.titles) as Array<{
				name: string;
				kind?: "title" | "role";
				organizationId?: string;
			}>)
		: [];

	// Extract emails - cast to proper type
	const emails = jscard.emails
		? (Object.entries(jscard.emails) as Array<
				[
					string,
					{
						address: string;
						contexts?: Record<string, boolean>;
						pref?: number;
						label?: string;
					},
				]
			>)
		: [];

	// Extract phones - cast to proper type
	const phones = jscard.phones
		? (Object.entries(jscard.phones) as Array<
				[
					string,
					{
						number: string;
						features?: Record<string, boolean>;
						contexts?: Record<string, boolean>;
						pref?: number;
						label?: string;
					},
				]
			>)
		: [];

	// Extract addresses - cast to proper type
	const addresses = jscard.addresses
		? (Object.entries(jscard.addresses) as Array<
				[
					string,
					{
						components?: Array<{ kind?: string; value: string }>;
						full?: string;
						countryCode?: string;
						coordinates?: string;
						timeZone?: string;
						contexts?: Record<string, boolean>;
						pref?: number;
					},
				]
			>)
		: [];

	// Extract online services - cast to proper type
	const onlineServices = jscard.onlineServices
		? (Object.entries(jscard.onlineServices) as Array<
				[
					string,
					{
						service?: string;
						uri?: string;
						user?: string;
						contexts?: Record<string, boolean>;
						pref?: number;
						label?: string;
					},
				]
			>)
		: [];

	// Extract links - cast to proper type
	const links = jscard.links
		? (Object.entries(jscard.links) as Array<
				[
					string,
					{
						uri: string;
						contexts?: Record<string, boolean>;
						pref?: number;
						label?: string;
					},
				]
			>)
		: [];

	return (
		<Table.Root size="2" variant="surface">
			<Table.Body>
				{displayName && (
					<Table.Row>
						<Table.RowHeaderCell>Name</Table.RowHeaderCell>
						<Table.Cell>
							<Flex gap="2" align="center">
								<Text>{displayName}</Text>
								<CopyButton value={displayName} />
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{jscard.kind && jscard.kind !== "individual" && (
					<Table.Row>
						<Table.RowHeaderCell>Kind</Table.RowHeaderCell>
						<Table.Cell>
							<Badge variant="soft">{jscard.kind}</Badge>
						</Table.Cell>
					</Table.Row>
				)}

				{organizations.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Organization</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{organizations.map((org, index) => (
									<Flex key={index} align="center" gap="2">
										<Code variant="ghost">{org}</Code>
										<CopyButton value={org} />
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{titles.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Title/Role</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{titles.map((title, index) => (
									<Flex key={index} align="center" gap="2">
										<Text>{title.name}</Text>
										{title.kind && title.kind !== "title" && (
											<Badge size="1" variant="soft">
												{title.kind}
											</Badge>
										)}
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{emails.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Email</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{emails.map(([key, email]) => (
									<Flex key={key} align="center" gap="2">
										<Link href={`mailto:${email.address}`}>
											<Code variant="ghost">{email.address}</Code>
										</Link>
										{email.label && (
											<Badge size="1" variant="soft">
												{email.label}
											</Badge>
										)}
										{email.contexts &&
											Object.keys(email.contexts).length > 0 && (
												<Badge size="1" variant="outline">
													{Object.keys(email.contexts).join(", ")}
												</Badge>
											)}
										<CopyButton value={email.address} />
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{phones.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Phone</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{phones.map(([key, phone]) => (
									<Flex key={key} align="center" gap="2">
										<Link href={`tel:${phone.number}`}>
											<Code variant="ghost">{phone.number}</Code>
										</Link>
										{phone.features &&
											Object.keys(phone.features).length > 0 && (
												<Badge size="1" variant="soft">
													{Object.keys(phone.features).join(", ")}
												</Badge>
											)}
										{phone.label && (
											<Badge size="1" variant="outline">
												{phone.label}
											</Badge>
										)}
										<CopyButton value={phone.number} />
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{addresses.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Address</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="2">
								{addresses.map(([key, addr]) => {
									// Use full address if available, otherwise build from components
									const addressText =
										addr.full ||
										(addr.components
											? addr.components.map((c) => c.value).join(", ")
											: "");
									const details = [addr.countryCode, addr.timeZone].filter(
										Boolean
									);

									return (
										<Flex key={key} direction="column" gap="1">
											<Text size="2">{addressText}</Text>
											{details.length > 0 && (
												<Flex gap="1">
													{details.map((detail, idx) => (
														<Badge key={idx} size="1" variant="soft">
															{detail}
														</Badge>
													))}
												</Flex>
											)}
										</Flex>
									);
								})}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{onlineServices.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Online</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{onlineServices.map(([key, service]) => (
									<Flex key={key} align="center" gap="2">
										{service.uri && (
											<Link
												href={service.uri}
												target="_blank"
												rel="noreferrer"
											>
												<Code variant="ghost">
													{service.service || service.user || service.uri}
												</Code>
											</Link>
										)}
										{!service.uri && (
											<Code variant="ghost">
												{service.service || service.user || key}
											</Code>
										)}
										{service.service && (
											<Badge size="1" variant="soft">
												{service.service}
											</Badge>
										)}
										{service.uri && <CopyButton value={service.uri} />}
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{links.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Links</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{links.map(([key, link]) => (
									<Flex key={key} align="center" gap="2">
										<Link href={link.uri} target="_blank" rel="noreferrer">
											<Code variant="ghost">{link.label || link.uri}</Code>
										</Link>
										<CopyButton value={link.uri} />
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

export default JSContactDisplay;
