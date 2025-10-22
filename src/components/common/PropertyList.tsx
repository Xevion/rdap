import type { FunctionComponent, ReactNode } from "react";
import React from "react";
import { Text, Box, DataList } from "@radix-ui/themes";

const PropertyListItem: FunctionComponent<{
	title: string;
	children: string;
}> = ({ title, children }) => {
	return (
		<Box asChild>
			<li>
				<Text className="dashed" title={title} size="2">
					{children}
				</Text>
			</li>
		</Box>
	);
};

type PropertyListProps = {
	title: string;
	children: ReactNode;
};

/**
 * PropertyList displays a labeled list of items (not key-value pairs).
 * Uses DataList.Item for the label, and renders children as a bulleted list.
 */
const PropertyList: FunctionComponent<PropertyListProps> & {
	Item: typeof PropertyListItem;
} = ({ title, children }) => {
	return (
		<DataList.Item>
			<DataList.Label>{title}</DataList.Label>
			<DataList.Value>
				<Box asChild>
					<ul
						style={{
							listStyleType: "disc",
							paddingLeft: "1.25rem",
							margin: 0,
						}}
					>
						{children}
					</ul>
				</Box>
			</DataList.Value>
		</DataList.Item>
	);
};

PropertyList.Item = PropertyListItem;

export default PropertyList;
