import type { FunctionComponent } from "react";
import React from "react";
import type { Link as RdapLink } from "@/rdap/schemas";
import { Table, Link, Text, Badge } from "@radix-ui/themes";

export type LinksSectionProps = {
	links: RdapLink[];
};

const LinksSection: FunctionComponent<LinksSectionProps> = ({ links }) => {
	if (!links || links.length === 0) return null;

	return (
		<Table.Root size="1" variant="surface" layout="auto">
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Relation</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Title</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{links.map((link, index) => (
					<Table.Row key={index}>
						<Table.Cell>
							<Link href={link.href} target="_blank" rel="noreferrer" size="2">
								{link.value || link.href}
							</Link>
						</Table.Cell>
						<Table.Cell>
							{link.rel ? (
								<Badge variant="soft" size="1">
									{link.rel}
								</Badge>
							) : (
								<Text size="2" style={{ color: "var(--gray-a6)" }}>
									—
								</Text>
							)}
						</Table.Cell>
						<Table.Cell>
							{link.title ? (
								<Text size="2">{link.title}</Text>
							) : (
								<Text size="2" style={{ color: "var(--gray-a6)" }}>
									—
								</Text>
							)}
						</Table.Cell>
						<Table.Cell>
							{link.type ? (
								<Text size="2" color="gray">
									{link.type}
								</Text>
							) : (
								<Text size="2" style={{ color: "var(--gray-a6)" }}>
									—
								</Text>
							)}
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
	);
};

export default LinksSection;
