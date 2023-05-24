import React, { FunctionComponent, ReactNode } from "react";
import { useBoolean } from "usehooks-ts";
import { CodeBracketIcon } from "@heroicons/react/24/solid";

type AbstractCardProps = {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  data?: object;
};

const AbstractCard: FunctionComponent<AbstractCardProps> = ({
  children,
  header,
  footer,
  data,
}) => {
  const { value: showRaw, toggle: toggleRaw } = useBoolean(false);

  return (
    <div className="mb-4 overflow-clip rounded bg-zinc-800 shadow">
      {header != undefined || data != undefined ? (
        <div className="flex bg-zinc-700 p-2 pl-5">
          <div className="grow space-x-2">{header}</div>
          {data != undefined ? (
            <div className="pr-1">
              <CodeBracketIcon
                onClick={toggleRaw}
                className="h-6 w-6 cursor-pointer"
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="max-w-full p-2 px-4">
        {showRaw ? (
          <pre className="m-2 max-h-[40rem] max-w-full overflow-y-auto whitespace-pre-wrap rounded">
            {JSON.stringify(data, null, 4)}
          </pre>
        ) : (
          children
        )}
      </div>
      {footer != null ? (
        <div className="space-x-2 bg-zinc-700 p-2 pl-5">{footer}</div>
      ) : null}
    </div>
  );
};

export default AbstractCard;
