import React from "react";

import { useClipboard } from "@/hooks/Clipboard";
import { useExportEveShipFit } from "@/hooks/ExportEveShipFit";

import styles from "./FitButtonBar.module.css";

export const ShareButton = () => {
  const link = useExportEveShipFit();
  const { copy, copied } = useClipboard();

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();

      if (link === null) return;
      copy(link);
    },
    [copy, link],
  );

  return (
    <>
      <div className={styles.popupButton}>
        <div className={styles.button} onClick={onClick}>
          {copied ? "In Clipboard" : "Share Link"}
        </div>
      </div>
    </>
  );
};
