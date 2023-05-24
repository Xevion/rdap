import React, { FunctionComponent, ReactNode } from "react";

type AbstractCardProps = {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
};

const AbstractCard: FunctionComponent<AbstractCardProps> = ({
  children,
  header,
  footer,
}) => {
  return (
    <div className="mb-4 overflow-clip rounded bg-zinc-800 shadow">
      {header != null ? (
        <div className="space-x-2 bg-zinc-700 p-2 pl-5">{header}</div>
      ) : null}
      <div className="p-2 px-4">{children}</div>
      {footer != null ? (
        <div className="space-x-2 bg-zinc-700 p-2 pl-5">{footer}</div>
      ) : null}
    </div>
  );
};

export default AbstractCard;
