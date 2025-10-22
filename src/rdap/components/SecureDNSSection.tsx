import CopyButton from "@/components/CopyButton";
import type { SecureDNS } from "@/rdap/schemas";
import { Badge, Box, Code, DataList, Flex, Table, Text } from "@radix-ui/themes";
import type { FunctionComponent } from "react";

export type SecureDNSSectionProps = {
	secureDNS: SecureDNS;
};

const SecureDNSSection: FunctionComponent<SecureDNSSectionProps> = ({ secureDNS }) => {
	const hasData =
		secureDNS.zoneSigned !== undefined ||
		secureDNS.delegationSigned !== undefined ||
		secureDNS.maxSigLife !== undefined ||
		(secureDNS.dsData && secureDNS.dsData.length > 0) ||
		(secureDNS.keyData && secureDNS.keyData.length > 0);

	if (!hasData) return null;

	return (
		<Box>
			<DataList.Root orientation={{ initial: "vertical", sm: "horizontal" }} size="2">
				{secureDNS.zoneSigned !== undefined && (
					<DataList.Item>
						<DataList.Label>Zone Signed</DataList.Label>
						<DataList.Value>
							<Badge color={secureDNS.zoneSigned ? "green" : "gray"} variant="soft">
								{secureDNS.zoneSigned ? "Yes" : "No"}
							</Badge>
						</DataList.Value>
					</DataList.Item>
				)}

				{secureDNS.delegationSigned !== undefined && (
					<DataList.Item>
						<DataList.Label>Delegation Signed</DataList.Label>
						<DataList.Value>
							<Badge
								color={secureDNS.delegationSigned ? "green" : "gray"}
								variant="soft"
							>
								{secureDNS.delegationSigned ? "Yes" : "No"}
							</Badge>
						</DataList.Value>
					</DataList.Item>
				)}

				{secureDNS.maxSigLife !== undefined && (
					<DataList.Item>
						<DataList.Label>Max Signature Life</DataList.Label>
						<DataList.Value>
							<Text>{secureDNS.maxSigLife} seconds</Text>
						</DataList.Value>
					</DataList.Item>
				)}
			</DataList.Root>

			{secureDNS.dsData && secureDNS.dsData.length > 0 && (
				<Table.Root size="1" variant="surface" mt="3">
					<Table.Header>
						<Table.Row>
							<Table.ColumnHeaderCell>Key Tag</Table.ColumnHeaderCell>
							<Table.ColumnHeaderCell>Algorithm</Table.ColumnHeaderCell>
							<Table.ColumnHeaderCell>Digest Type</Table.ColumnHeaderCell>
							<Table.ColumnHeaderCell>Digest</Table.ColumnHeaderCell>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{secureDNS.dsData.map((ds, index) => (
							<Table.Row key={index}>
								<Table.Cell>
									<Code variant="ghost">{ds.keyTag}</Code>
								</Table.Cell>
								<Table.Cell>
									<Code variant="ghost">{ds.algorithm}</Code>
								</Table.Cell>
								<Table.Cell>
									<Code variant="ghost">{ds.digestType}</Code>
								</Table.Cell>
								<Table.Cell>
									<Flex align="center" gap="2">
										<Code
											variant="ghost"
											style={{
												maxWidth: "300px",
												overflow: "hidden",
												textOverflow: "ellipsis",
											}}
										>
											{ds.digest}
										</Code>
										<CopyButton value={ds.digest} />
									</Flex>
								</Table.Cell>
							</Table.Row>
						))}
					</Table.Body>
				</Table.Root>
			)}

			{secureDNS.keyData && secureDNS.keyData.length > 0 && (
				<Box mt="4">
					<Text size="3" weight="medium" mb="2" style={{ display: "block" }}>
						Key Data
					</Text>
					<Table.Root size="1" variant="surface">
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeaderCell>Flags</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>Protocol</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>Algorithm</Table.ColumnHeaderCell>
								<Table.ColumnHeaderCell>Public Key</Table.ColumnHeaderCell>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{secureDNS.keyData.map((key, index) => (
								<Table.Row key={index}>
									<Table.Cell>
										<Code variant="ghost">{key.flags}</Code>
									</Table.Cell>
									<Table.Cell>
										<Code variant="ghost">{key.protocol}</Code>
									</Table.Cell>
									<Table.Cell>
										<Code variant="ghost">{key.algorithm}</Code>
									</Table.Cell>
									<Table.Cell>
										<Flex align="center" gap="2">
											<Code
												variant="ghost"
												style={{
													maxWidth: "300px",
													overflow: "hidden",
													textOverflow: "ellipsis",
												}}
											>
												{key.publicKey}
											</Code>
											<CopyButton value={key.publicKey} />
										</Flex>
									</Table.Cell>
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</Box>
			)}
		</Box>
	);
};

export default SecureDNSSection;
