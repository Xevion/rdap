import type { FunctionComponent } from "react";
import React from "react";
import type { Remark, Notice } from "@/rdap/schemas";
import { Box, Text, Heading, Flex, Badge } from "@radix-ui/themes";
import LinksSection from "@/rdap/components/LinksSection";

export type RemarksSectionProps = {
	remarks?: Remark[] | Notice[];
};

const RemarksSection: FunctionComponent<RemarksSectionProps> = ({ remarks }) => {
	if (!remarks || remarks.length === 0) return null;

	return (
		<Flex direction="column" gap="3">
			{remarks.map((remark, index) => (
				<Box
					key={index}
					p="3"
					style={{
						borderLeft: "3px solid var(--accent-a5)",
						backgroundColor: "var(--gray-a2)",
						borderRadius: "var(--radius-3)",
					}}
				>
					<Flex direction="column" gap="2">
						{remark.title && (
							<Flex align="center" gap="2">
								<Heading size="3">{remark.title}</Heading>
								{remark.type && (
									<Badge variant="soft" size="1">
										{remark.type}
									</Badge>
								)}
							</Flex>
						)}
						{remark.description && remark.description.length > 0 && (
							<Flex direction="column" gap="1">
								{remark.description.map((desc, descIndex) => (
									<Text key={descIndex} size="2" style={{ lineHeight: "1.6" }}>
										{desc}
									</Text>
								))}
							</Flex>
						)}
						{remark.links && remark.links.length > 0 && (
							<Box mt="2">
								<Text size="2" weight="medium" mb="1" style={{ display: "block" }}>
									Related Links
								</Text>
								<LinksSection links={remark.links} />
							</Box>
						)}
					</Flex>
				</Box>
			))}
		</Flex>
	);
};

export default RemarksSection;
