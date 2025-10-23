import type { FunctionComponent } from "react";
import React from "react";
import type { ParsedContact } from "@/rdap/contact-parser";
import { Table, Flex, Code, Link, Text, Badge } from "@radix-ui/themes";
import CopyButton from "@/components/CopyButton";

export type ContactTableProps = {
	contact: ParsedContact;
};

/**
 * Renders contact information in a consistent table format.
 * Accepts normalized contact data from either JSContact or vCard parsers.
 * Memoized to prevent re-renders when contact data hasn't changed.
 */
const ContactTable: FunctionComponent<ContactTableProps> = ({ contact }) => {
	return (
		<Table.Root size="2" variant="surface">
			<Table.Body>
				{/* Name */}
				{contact.name && (
					<Table.Row>
						<Table.RowHeaderCell>Name</Table.RowHeaderCell>
						<Table.Cell>
							<Flex gap="2" align="center">
								<Text>{contact.name}</Text>
								<CopyButton value={contact.name} />
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{/* Kind (JSContact only) */}
				{contact.kind && (
					<Table.Row>
						<Table.RowHeaderCell>Kind</Table.RowHeaderCell>
						<Table.Cell>
							<Badge variant="soft">{contact.kind}</Badge>
						</Table.Cell>
					</Table.Row>
				)}

				{/* Organizations */}
				{contact.organizations && contact.organizations.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Organization</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{contact.organizations.map((org, index) => (
									<Flex key={index} align="center" gap="2">
										<Code variant="ghost">{org}</Code>
										<CopyButton value={org} />
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{/* Titles/Roles */}
				{contact.titles && contact.titles.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Title/Role</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{contact.titles.map((title, index) => (
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

				{/* Emails */}
				{contact.emails && contact.emails.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Email</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{contact.emails.map((email, index) => (
									<Flex key={index} align="center" gap="2">
										<Link href={`mailto:${email.address}`}>
											<Code variant="ghost">{email.address}</Code>
										</Link>
										{email.label && (
											<Badge size="1" variant="soft">
												{email.label}
											</Badge>
										)}
										{email.contexts && email.contexts.length > 0 && (
											<Badge size="1" variant="outline">
												{email.contexts.join(", ")}
											</Badge>
										)}
										<CopyButton value={email.address} />
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{/* Phones */}
				{contact.phones && contact.phones.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Phone</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{contact.phones.map((phone, index) => (
									<Flex key={index} align="center" gap="2">
										<Link href={`tel:${phone.number}`}>
											<Code variant="ghost">{phone.number}</Code>
										</Link>
										{phone.features && phone.features.length > 0 && (
											<Badge size="1" variant="soft">
												{phone.features.join(", ")}
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

				{/* Addresses */}
				{contact.addresses && contact.addresses.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Address</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="2">
								{contact.addresses.map((addr, index) => (
									<Flex key={index} direction="column" gap="1">
										<Text size="2">{addr.text}</Text>
										{addr.details && addr.details.length > 0 && (
											<Flex gap="1">
												{addr.details.map((detail, idx) => (
													<Badge key={idx} size="1" variant="soft">
														{detail}
													</Badge>
												))}
											</Flex>
										)}
									</Flex>
								))}
							</Flex>
						</Table.Cell>
					</Table.Row>
				)}

				{/* Online Services (JSContact only) */}
				{contact.onlineServices && contact.onlineServices.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Online</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{contact.onlineServices.map((service, index) => (
									<Flex key={index} align="center" gap="2">
										{service.uri ? (
											<Link
												href={service.uri}
												target="_blank"
												rel="noreferrer"
											>
												<Code variant="ghost">{service.text}</Code>
											</Link>
										) : (
											<Code variant="ghost">{service.text}</Code>
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

				{/* Links */}
				{contact.links && contact.links.length > 0 && (
					<Table.Row>
						<Table.RowHeaderCell>Links</Table.RowHeaderCell>
						<Table.Cell>
							<Flex direction="column" gap="1">
								{contact.links.map((link, index) => (
									<Flex key={index} align="center" gap="2">
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

export default React.memo(ContactTable);
