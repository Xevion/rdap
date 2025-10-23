import type { FunctionComponent, ReactNode } from "react";
import React from "react";
import { useBoolean } from "usehooks-ts";
import { Link2Icon, CodeIcon, DownloadIcon, ClipboardIcon } from "@radix-ui/react-icons";
import { Card, Flex, Box, IconButton, Code, Tooltip } from "@radix-ui/themes";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import type { ParsedGeneric } from "@/rdap/components/Generic";
import { generateDownloadFilename } from "@/utils/generateFilename";

type AbstractCardProps = {
	children?: ReactNode;
	header?: ReactNode;
	footer?: ReactNode;
	data?: object;
	url?: string;
	queryTimestamp?: Date;
};

const AbstractCard: FunctionComponent<AbstractCardProps> = ({
	url,
	children,
	header,
	footer,
	data,
	queryTimestamp,
}) => {
	const { value: showRaw, toggle: toggleRaw } = useBoolean(false);

	return (
		<Box mb="4">
			<Card size="2">
				{(header != undefined || data != undefined) && (
					<Flex
						justify="between"
						align="center"
						px="3"
						pb="3"
						style={{
							borderBottom: "1px solid var(--gray-a5)",
						}}
					>
						<Flex gap="2" style={{ flex: 1 }}>
							{header}
						</Flex>
						<Flex gap="2" align="center">
							{url != undefined && (
								<Tooltip content="Open in new tab">
									<IconButton variant="ghost" size="2" asChild>
										<a
											href={url}
											target="_blank"
											rel="noreferrer"
											aria-label="Open RDAP URL"
										>
											<Link2Icon width="18" height="18" />
										</a>
									</IconButton>
								</Tooltip>
							)}
							{data != undefined && (
								<>
									<Tooltip content="Copy JSON to clipboard">
										<IconButton
											variant="ghost"
											size="2"
											onClick={() => {
												navigator.clipboard
													.writeText(JSON.stringify(data, null, 4))
													.then(
														() => {
															// Successfully copied to clipboard
														},
														(err) => {
															if (err instanceof Error)
																console.error(
																	`Failed to copy to clipboard (${err.toString()}).`
																);
															else
																console.error(
																	"Failed to copy to clipboard."
																);
														}
													);
											}}
											aria-label="Copy JSON to clipboard"
										>
											<ClipboardIcon width="18" height="18" />
										</IconButton>
									</Tooltip>
									<Tooltip content="Download JSON">
										<IconButton
											variant="ghost"
											size="2"
											onClick={() => {
												const file = new Blob(
													[JSON.stringify(data, null, 4)],
													{
														type: "application/json",
													}
												);

												const anchor = document.createElement("a");
												anchor.href = URL.createObjectURL(file);

												// Generate filename based on data and timestamp
												const filename =
													data != null &&
													typeof data === "object" &&
													"objectClassName" in data
														? generateDownloadFilename(
																data as ParsedGeneric,
																queryTimestamp
															)
														: "response.json";

												anchor.download = filename;
												anchor.click();
											}}
											aria-label="Download JSON"
										>
											<DownloadIcon width="18" height="18" />
										</IconButton>
									</Tooltip>
									<Tooltip
										content={showRaw ? "Show formatted view" : "Show raw JSON"}
									>
										<IconButton
											variant="ghost"
											size="2"
											onClick={toggleRaw}
											aria-label={
												showRaw ? "Show formatted view" : "Show raw JSON"
											}
										>
											<CodeIcon width="18" height="18" />
										</IconButton>
									</Tooltip>
								</>
							)}
						</Flex>
					</Flex>
				)}
				<Box p="4">
					{showRaw ? (
						<OverlayScrollbarsComponent
							defer
							options={{
								scrollbars: {
									autoHide: "leave",
									autoHideDelay: 1300,
								},
							}}
							style={{ maxHeight: "40rem" }}
						>
							<Code
								variant="ghost"
								size="2"
								style={{
									display: "block",
									whiteSpace: "pre-wrap",
									fontFamily: "var(--font-mono)",
								}}
							>
								{JSON.stringify(data, null, 4)}
							</Code>
						</OverlayScrollbarsComponent>
					) : (
						children
					)}
				</Box>
				{footer != null && (
					<Flex
						gap="2"
						p="3"
						style={{
							borderTop: "1px solid var(--gray-a5)",
						}}
					>
						{footer}
					</Flex>
				)}
			</Card>
		</Box>
	);
};

export default AbstractCard;
