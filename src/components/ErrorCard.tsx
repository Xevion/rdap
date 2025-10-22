import type { FunctionComponent, ReactNode } from "react";
import { CrossCircledIcon } from "@radix-ui/react-icons";
import { Callout, Box, Flex } from "@radix-ui/themes";

export type ErrorCardProps = {
	title: ReactNode;
	description?: ReactNode;
	issues?: ReactNode[];
	className?: string;
};

const ErrorCard: FunctionComponent<ErrorCardProps> = ({
	title,
	description,
	issues,
	className,
}) => {
	return (
		<Box className={className}>
			<Callout.Root color="red" role="alert">
				<Callout.Icon>
					<CrossCircledIcon />
				</Callout.Icon>
				<Flex direction="column" gap="2">
					<Callout.Text weight="medium" size="3">
						{title}
					</Callout.Text>
					{description != undefined ? (
						<Box
							style={{
								maxHeight: "6rem",
								overflowY: "auto",
								whiteSpace: "pre-wrap",
							}}
						>
							<Callout.Text size="2">{description}</Callout.Text>
						</Box>
					) : null}
					{issues != undefined && issues.length > 0 ? (
						<Box asChild>
							<ul
								role="list"
								style={{
									listStyleType: "disc",
									paddingLeft: "1.25rem",
								}}
							>
								{issues.map((issueText, index) => (
									<li key={index}>
										<Callout.Text size="2">{issueText}</Callout.Text>
									</li>
								))}
							</ul>
						</Box>
					) : null}
				</Flex>
			</Callout.Root>
		</Box>
	);
};

export default ErrorCard;
