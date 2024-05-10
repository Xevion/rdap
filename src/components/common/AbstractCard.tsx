import type { FunctionComponent, ReactNode } from "react";
import React from "react";
import { useBoolean } from "usehooks-ts";
import {
  LinkIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

type AbstractCardProps = {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  data?: object;
  url?: string;
};

const AbstractCard: FunctionComponent<AbstractCardProps> = ({
  url,
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
          {url != undefined ? (
            <div className="pr-2">
              <a href={url} target="_blank" rel="noreferrer">
                <LinkIcon className="h-5 w-5 mt-1 cursor-pointer" />
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="max-w-full p-2 px-4 overflow-x-auto">
        {showRaw ? (
          <pre className="scrollbar-thin m-2 max-h-[40rem] max-w-full overflow-y-auto whitespace-pre-wrap rounded">
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
