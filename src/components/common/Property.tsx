import type { FunctionComponent, ReactNode } from "react";
import React from "react";
import { DataList } from "@radix-ui/themes";

type PropertyProps = {
	title: string | ReactNode;
	children: string | ReactNode;
	titleClass?: string;
	valueClass?: string;
};

/**
 * A simple wrapper around Radix DataList for displaying key-value pairs.
 * This component uses DataList.Item, DataList.Label, and DataList.Value
 * to provide semantic HTML and consistent styling.
 */
const Property: FunctionComponent<PropertyProps> = ({
	title,
	children,
	titleClass,
	valueClass,
}) => {
	return (
		<DataList.Item>
			<DataList.Label className={titleClass}>{title}</DataList.Label>
			<DataList.Value className={valueClass}>{children}</DataList.Value>
		</DataList.Item>
	);
};

export default Property;
