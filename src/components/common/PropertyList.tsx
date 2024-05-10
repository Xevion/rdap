import type { FunctionComponent, ReactNode } from "react";
import React from "react";
import Property from "@/components/common/Property";

const PropertyListItem: FunctionComponent<{
  title: string;
  children: string;
}> = ({ title, children }) => {
  return (
    <li>
      <span className="dashed" title={title}>{children}</span>
    </li>
  );
};

type PropertyListProps = {
  title: string;
  children: ReactNode;
};

const PropertyList: FunctionComponent<PropertyListProps> & {
  Item: typeof PropertyListItem;
} = ({ title, children }) => {
  return (
    <Property title={title}>
      <ul key={2} className="list-disc">
        {children}
      </ul>
    </Property>
  );
};

PropertyList.Item = PropertyListItem;

export default PropertyList;
