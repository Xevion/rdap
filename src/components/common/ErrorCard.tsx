import { FunctionComponent, ReactNode } from "react";
import { XCircleIcon } from "@heroicons/react/20/solid";

export type ErrorCardProps = {
  title: ReactNode;
  description?: ReactNode;
  issues?: ReactNode[];
};

const ErrorCard: FunctionComponent<ErrorCardProps> = ({
  title,
  description,
  issues,
}) => {
  return (
    <div className="rounded-md border border-red-700/30 bg-zinc-800 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-300" aria-hidden="true" />
        </div>
        <div className="ml-3 text-sm text-red-300">
          <h3 className="font-medium text-red-200">{title}</h3>
          {description != undefined ? (
            <div className="mt-2">{description}</div>
          ) : null}
          <div className="mt-2">
            {issues != undefined ? (
              <ul role="list" className="list-disc space-y-1 pl-5">
                {issues.map((issueText, index) => (
                  <li key={index}>{issueText}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
