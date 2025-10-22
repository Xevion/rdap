import type { FunctionComponent, ReactNode } from "react";
import React from "react";
import { useBoolean } from "usehooks-ts";
import {
  LinkIcon,
  CodeBracketIcon,
  DocumentArrowDownIcon,
  ClipboardDocumentIcon,
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
        <div className="flex bg-zinc-700 p-2 pl-3 md:pl-5">
          <div className="flex grow gap-2">{header}</div>
          {url != undefined ? (
            <div className="pr-2">
              <a href={url} target="_blank" rel="noreferrer">
                <LinkIcon className="mt-1 h-5 w-5 cursor-pointer" />
              </a>
            </div>
          ) : null}
          {data != undefined ? (
            <>
              <div className="pr-2">
                <ClipboardDocumentIcon
                  onClick={() => {
                    // stringify the JSON object, then begin the async clipboard write
                    navigator.clipboard
                      .writeText(JSON.stringify(data, null, 4))
                      .then(
                        () => {
                          console.log("Copied to clipboard.");
                        },
                        (err) => {
                          if (err instanceof Error)
                            console.error(
                              `Failed to copy to clipboard (${err.toString()}).`
                            );
                          else console.error("Failed to copy to clipboard.");
                        }
                      );
                  }}
                  className="h-6 w-6 cursor-pointer"
                />
              </div>
              <div className="pr-2">
                <DocumentArrowDownIcon
                  onClick={() => {
                    const file = new Blob([JSON.stringify(data, null, 4)], {
                      type: "application/json",
                    });

                    const anchor = document.createElement("a");
                    anchor.href = URL.createObjectURL(file);
                    anchor.download = "response.json";
                    anchor.click();
                  }}
                  className="h-6 w-6 cursor-pointer"
                />
              </div>
              <div className="pr-1">
                <CodeBracketIcon
                  onClick={toggleRaw}
                  className="h-6 w-6 cursor-pointer"
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}
      <div className="max-w-full overflow-x-auto p-2 px-4">
        {showRaw ? (
          <pre className="scrollbar-thin m-2 max-h-[40rem] max-w-full overflow-y-auto whitespace-pre-wrap rounded">
            {JSON.stringify(data, null, 4)}
          </pre>
        ) : (
          children
        )}
      </div>
      {footer != null ? (
        <div className="flex gap-2 bg-zinc-700 p-2 pl-5">{footer}</div>
      ) : null}
    </div>
  );
};

export default AbstractCard;
