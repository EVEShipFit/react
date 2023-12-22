import React from "react";

import { useClipboard } from "../Helpers/Clipboard";
import { useEveShipFitLink } from "../EveShipFitLink";

import styles from "./FitButtonBar.module.css";

export const ShareButton = () => {
  const link = useEveShipFitLink();
  const { copy, copied } = useClipboard();

  const onClick = React.useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    copy(link);
  }, [copy, link]);

  return <>
    <div className={styles.popupButton}>
      <div className={styles.button} onClick={onClick}>
      {copied ? "In Clipboard" : "Share Link"}
      </div>
    </div>
  </>
}
