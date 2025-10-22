import type { FunctionComponent, ReactFragment, ReactNode } from "react";
import React from "react";
import clsx from "clsx";

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
      <dt className={clsx("font-medium", titleClass)}>{title}:</dt>
      <dd className={clsx("mb-2 ml-6 mt-2", valueClass)}>{children}</dd>
    </>
  );
};

export default Property;
