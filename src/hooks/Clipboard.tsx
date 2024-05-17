import React from "react";

/* Based on https://github.com/mantinedev/mantine/blob/master/src/mantine-hooks/src/use-clipboard/use-clipboard.ts */
export function useClipboard({ timeout = 2000 } = {}) {
  const [copied, setCopied] = React.useState(false);
  const [copyTimeout, setCopyTimeout] = React.useState<number | undefined>(undefined);

  const copyTimeoutRef = React.useRef(copyTimeout);
  copyTimeoutRef.current = copyTimeout;

  const handleCopyResult = React.useCallback(
    (value: boolean) => {
      if (copyTimeoutRef.current !== undefined) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      setCopyTimeout(window.setTimeout(() => setCopied(false), timeout));
      setCopied(value);
    },
    [timeout],
  );

  const copy = React.useCallback(
    (valueToCopy: string) => {
      navigator.clipboard.writeText(valueToCopy).then(() => handleCopyResult(true));
    },
    [handleCopyResult],
  );

  return { copy, copied };
}
