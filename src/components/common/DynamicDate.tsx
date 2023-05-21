import type { FunctionComponent } from "react";
import { useBoolean } from "usehooks-ts";
import { format, formatDistanceToNow } from "date-fns";

type DynamicDateProps = {
  value: Date | number;
  absoluteFormat?: string;
};

/**
 * A component for a toggleable switch between the absolute & human-relative date.
 * @param value The date to be displayed, the Date value, or
 * @param absoluteFormat Optional - the date-fns format string to use for the absolute date rendering.
 */
const DynamicDate: FunctionComponent<DynamicDateProps> = ({
  value,
  absoluteFormat,
}) => {
  const { value: showAbsolute, toggle: toggleFormat } = useBoolean(true);

  const date = new Date(value);
  return (
    <button onClick={toggleFormat}>
      <span title={date.toISOString()}>
        {showAbsolute
          ? format(date, absoluteFormat ?? "LLL do, y HH:mm:ss")
          : formatDistanceToNow(date, {
              includeSeconds: true,
              addSuffix: true,
            })}
      </span>
    </button>
  );
};

export default DynamicDate;
