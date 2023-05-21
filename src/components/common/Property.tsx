import type { FunctionComponent, ReactFragment, ReactNode } from "react";
import React from "react";
import { classNames } from "@/helpers";

type PropertyProps = {
  title: string | ReactNode | ReactFragment;
  children: string | ReactNode | ReactFragment;
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
      <dt className={titleClass}>{title}:</dt>
      <dd className={classNames("mt-2 mb-2 ml-6", valueClass)}>{children}</dd>
    </>
  );
};

export default Property;
