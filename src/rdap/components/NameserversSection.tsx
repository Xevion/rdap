import type { FunctionComponent } from "react";
import React from "react";
import type { Nameserver } from "@/rdap/schemas";
import { Table, Code, Flex, Badge } from "@radix-ui/themes";
import CopyButton from "@/components/CopyButton";
import EmDash from "@/components/EmDash";

export type NameserversSectionProps = {
	nameservers: Nameserver[];
};

const NameserversSection: FunctionComponent<NameserversSectionProps> = ({ nameservers }) => {
	if (!nameservers || nameservers.length === 0) return null;

	return (
		<Table.Root size="1" variant="surface" layout="auto">
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeaderCell>Nameserver</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>IPv4 Addresses</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>IPv6 Addresses</Table.ColumnHeaderCell>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{nameservers.map((ns, index) => (
					<Table.Row key={index}>
						<Table.Cell>
							<Flex align="center" gap="2">
								<Code variant="ghost">{ns.ldhName}</Code>
								<CopyButton value={ns.ldhName} />
							</Flex>
							{ns.unicodeName && ns.unicodeName !== ns.ldhName && (
								<Flex align="center" gap="2" mt="1">
									<Badge variant="soft" size="1">
										Unicode
									</Badge>
									<Code variant="ghost" size="1">
										{ns.unicodeName}
									</Code>
								</Flex>
							)}
						</Table.Cell>
						<Table.Cell align="center">
							{ns.ipAddresses?.v4 && ns.ipAddresses.v4.length > 0 ? (
								<Flex direction="column" gap="1">
									{ns.ipAddresses.v4.map((ip, ipIndex) => (
										<Flex key={ipIndex} align="center" gap="2">
											<Code variant="ghost" size="1">
												{ip}
											</Code>
											<CopyButton value={ip} />
										</Flex>
									))}
								</Flex>
							) : (
								<EmDash />
							)}
						</Table.Cell>
						<Table.Cell align="right">
							{ns.ipAddresses?.v6 && ns.ipAddresses.v6.length > 0 ? (
								<Flex direction="column" gap="1">
									{ns.ipAddresses.v6.map((ip, ipIndex) => (
										<Flex key={ipIndex} align="center" gap="2">
											<Code variant="ghost" size="1">
												{ip}
											</Code>
											<CopyButton value={ip} />
										</Flex>
									))}
								</Flex>
							) : (
								<EmDash />
							)}
						</Table.Cell>
					</Table.Row>
				))}
			</Table.Body>
		</Table.Root>
	);
};

export default NameserversSection;
