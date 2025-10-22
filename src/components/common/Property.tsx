import type { FunctionComponent, ReactNode } from "react";
import React from "react";
import { cn } from "@/lib/utils";

type PropertyProps = {
	title: string | ReactNode;
	children: string | ReactNode;
	titleClass?: string;
	valueClass?: string;
};

const Property: FunctionComponent<PropertyProps> = ({
	title,
	children,
	titleClass,
	valueClass,
}) => {
	return (
		<>
			<dt className={cn("font-medium", titleClass)}>{title}:</dt>
			<dd className={cn("mt-2 mb-2 ml-6", valueClass)}>{children}</dd>
		</>
	);
};

export default Property;
