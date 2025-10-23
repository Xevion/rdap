import type { FunctionComponent } from "react";
import React from "react";
import type { Entity, RdapStatusType } from "@/rdap/schemas";
import { Box, Flex, Badge, Text, Code, DataList, Table } from "@radix-ui/themes";
import ContactDisplay from "@/rdap/components/ContactDisplay";
import CopyButton from "@/components/CopyButton";
import StatusBadge from "@/components/StatusBadge";

export type EntitiesSectionProps = {
	entities: Entity[];
};

const EntitiesSection: FunctionComponent<EntitiesSectionProps> = ({ entities }) => {
	if (!entities || entities.length === 0) return null;

	return (
		<Flex direction="column" gap="3">
			{entities.map((entity, index) => {
				return (
					<Box
						key={index}
						p="3"
						style={{
							border: "1px solid var(--gray-a5)",
							borderRadius: "var(--radius-3)",
							backgroundColor: "var(--gray-a2)",
						}}
					>
						<Flex direction="column" gap="3">
							<DataList.Root
								orientation={{ initial: "vertical", sm: "horizontal" }}
								size="2"
							>
								{entity.handle && (
									<DataList.Item>
										<DataList.Label>Handle</DataList.Label>
										<DataList.Value>
											<Flex align="center" gap="2">
												<Code variant="ghost">{entity.handle}</Code>
												<CopyButton value={entity.handle} />
											</Flex>
										</DataList.Value>
									</DataList.Item>
								)}
								{entity.roles && entity.roles.length > 0 && (
									<DataList.Item>
										<DataList.Label>Roles</DataList.Label>
										<DataList.Value>
											<Flex gap="2" wrap="wrap">
												{entity.roles.map(
													(role: string, roleIndex: number) => (
														<Badge
															key={roleIndex}
															variant="soft"
															size="1"
														>
															{role}
														</Badge>
													)
												)}
											</Flex>
										</DataList.Value>
									</DataList.Item>
								)}
								{entity.status && entity.status.length > 0 && (
									<DataList.Item>
										<DataList.Label>Status</DataList.Label>
										<DataList.Value>
											<Flex gap="2" wrap="wrap">
												{entity.status.map(
													(
														status: RdapStatusType,
														statusIndex: number
													) => (
														<StatusBadge
															key={statusIndex}
															status={status}
														/>
													)
												)}
											</Flex>
										</DataList.Value>
									</DataList.Item>
								)}
							</DataList.Root>

							{(entity.vcardArray || entity.jscard) && (
								<Flex direction="column" gap="2">
									<ContactDisplay entity={entity} />
								</Flex>
							)}

							{entity.publicIds && entity.publicIds.length > 0 && (
								<Table.Root size="1" variant="surface">
									<Table.Header>
										<Table.Row>
											<Table.ColumnHeaderCell>
												Public ID Type
											</Table.ColumnHeaderCell>
											<Table.ColumnHeaderCell>
												Identifier
											</Table.ColumnHeaderCell>
										</Table.Row>
									</Table.Header>
									<Table.Body>
										{entity.publicIds.map(
											(
												publicId: { type: string; identifier: string },
												publicIdIndex: number
											) => (
												<Table.Row key={publicIdIndex}>
													<Table.Cell>{publicId.type}</Table.Cell>
													<Table.Cell>
														<Flex align="center" gap="2">
															<Code variant="ghost">
																{publicId.identifier}
															</Code>
															<CopyButton
																value={publicId.identifier}
															/>
														</Flex>
													</Table.Cell>
												</Table.Row>
											)
										)}
									</Table.Body>
								</Table.Root>
							)}

							{entity.port43 && (
								<Flex align="center" gap="2">
									<Text size="2" weight="medium">
										WHOIS Server:
									</Text>
									<Code variant="ghost">{entity.port43}</Code>
									<CopyButton value={entity.port43} />
								</Flex>
							)}
						</Flex>
					</Box>
				);
			})}
		</Flex>
	);
};

export default EntitiesSection;
