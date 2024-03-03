import clsx from "clsx";
import React from "react";

import { EsiFit, ShipSnapshotContext } from "../ShipSnapshotProvider";
import { ModalDialog } from "../ModalDialog";
import { useClipboard } from "../Helpers/Clipboard";
import { useFormatAsEft } from "../FormatAsEft";
import { useFormatEftToEsi } from "../FormatEftToEsi";

import styles from "./FitButtonBar.module.css";

export const ClipboardButton = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);
  const toEft = useFormatAsEft();
  const eftToEsiFit = useFormatEftToEsi();
  const { copy, copied } = useClipboard();

  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isPasteOpen, setIsPasteOpen] = React.useState(false);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const copyToClipboard = React.useCallback(() => {
    const eft = toEft();
    if (eft === undefined) return;

    copy(eft);

    setIsPopupOpen(false);
  }, [copy, toEft]);

  const importFromClipboard = React.useCallback(() => {
    if (!shipSnapshot.loaded) return;

    const textArea = textAreaRef.current;
    if (textArea === null) return;

    const fitString = textArea.value;
    if (fitString === "") return;

    let fit: EsiFit | undefined;
    if (fitString.startsWith("{")) {
      fit = JSON.parse(fitString);
    } else {
      fit = eftToEsiFit(fitString);
    }
    if (fit === undefined) return;

    shipSnapshot.changeFit(fit);

    setIsPasteOpen(false);
    setIsPopupOpen(false);
  }, [eftToEsiFit, shipSnapshot]);

  return (
    <>
      <div
        className={styles.popupButton}
        onMouseOver={() => setIsPopupOpen(true)}
        onMouseOut={() => setIsPopupOpen(false)}
      >
        <div className={styles.button}>{copied ? "In Clipboard" : "Clipboard"}</div>
        <div className={clsx(styles.popup, { [styles.collapsed]: !isPopupOpen })}>
          <div>
            <div className={styles.button} onClick={() => setIsPasteOpen(true)}>
              Import from Clipboard
            </div>
            <div className={clsx(styles.button, styles.buttonMax)} onClick={() => copyToClipboard()}>
              Copy to Clipboard
            </div>
          </div>
        </div>
      </div>

      <ModalDialog
        visible={isPasteOpen}
        onClose={() => setIsPasteOpen(false)}
        className={styles.paste}
        title="Import from Clipboard"
      >
        <div>
          <div>Paste your fit here</div>
          <div>
            <textarea autoFocus className={styles.pasteTextarea} ref={textAreaRef} />
          </div>
          <span className={clsx(styles.button, styles.buttonSmall)} onClick={() => importFromClipboard()}>
            Import
          </span>
        </div>
      </ModalDialog>
    </>
  );
};
