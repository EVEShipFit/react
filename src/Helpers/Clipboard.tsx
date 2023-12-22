import React from "react";

/* Based on https://github.com/mantinedev/mantine/blob/master/src/mantine-hooks/src/use-clipboard/use-clipboard.ts */
export function useClipboard({ timeout = 2000 } = {}) {
  const [copied, setCopied] = React.useState(false);
  const [copyTimeout, setCopyTimeout] = React.useState<number | undefined>(undefined);

  const handleCopyResult = (value: boolean) => {
    if (copyTimeout !== undefined) {
      window.clearTimeout(copyTimeout);
    }
    setCopyTimeout(window.setTimeout(() => setCopied(false), timeout));
    setCopied(value);
  };

  const copy = (valueToCopy: string) => {
    navigator.clipboard.writeText(valueToCopy).then(() => handleCopyResult(true));
  };

  return { copy, copied };
}
