import type { FunctionComponent, ReactNode } from "react";
import { useMemo } from "react";
import { useBoolean } from "usehooks-ts";
import { Link2Icon, CodeIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Card, Flex, Box, IconButton, Code, Tooltip } from "@radix-ui/themes";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import type { ParsedGeneric } from "@/rdap/components/RdapObjectRouter";
import { generateDownloadFilename } from "@/lib/filename";
import CopyButton from "@/components/CopyButton";

type AbstractCardProps = {
	children?: ReactNode;
	header?: ReactNode;
	footer?: ReactNode;
	/** RDAP response data for download/display. When provided, enables JSON actions. */
	data?: ParsedGeneric | object;
	/** RDAP query URL. When provided, enables "open RDAP URL" button. */
	url?: string;
	/** Query execution timestamp for filename generation */
	queryTimestamp?: Date;
};

/**
 * Type guard to check if data is ParsedGeneric with objectClassName
 */
function isParsedGeneric(data: unknown): data is ParsedGeneric {
	return (
		data != null &&
		typeof data === "object" &&
		"objectClassName" in data &&
		typeof (data as ParsedGeneric).objectClassName === "string"
	);
}

/**
 * Downloads JSON data as a file with automatic filename generation
 * Handles blob creation, download triggering, and cleanup
 */
function downloadJSON(data: object, queryTimestamp?: Date): void {
	const jsonString = JSON.stringify(data, null, 4);
	const blob = new Blob([jsonString], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const filename = isParsedGeneric(data)
		? generateDownloadFilename(data, queryTimestamp)
		: "response.json";

	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.click();

	// Clean up to prevent memory leak
	URL.revokeObjectURL(url);
}

const AbstractCard: FunctionComponent<AbstractCardProps> = ({
	url,
	children,
	header,
	footer,
	data,
	queryTimestamp,
}) => {
	const { value: showRaw, toggle: toggleRaw } = useBoolean(false);

	// Memoize JSON stringification to avoid repeated calls
	const jsonString = useMemo(() => (data != null ? JSON.stringify(data, null, 4) : ""), [data]);

	return (
		<Box mb="4">
			<Card size="2">
				{(header != null || data != null) && (
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
							{url != null && (
								<Tooltip content="Open RDAP URL">
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
							{data != null && (
								<>
									<CopyButton
										value={jsonString}
										size="2"
										color={null}
										variant="ghost"
										tooltipText="Copy JSON to clipboard"
									/>
									<Tooltip content="Download JSON">
										<IconButton
											variant="ghost"
											size="2"
											onClick={() => downloadJSON(data, queryTimestamp)}
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
								{jsonString}
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
