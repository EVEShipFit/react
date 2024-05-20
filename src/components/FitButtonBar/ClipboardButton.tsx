import clsx from "clsx";
import React from "react";

import { ModalDialog } from "@/components/ModalDialog";
import { useClipboard } from "@/hooks/Clipboard";
import { useExportEft } from "@/hooks/ExportEft";
import { useImportEft } from "@/hooks/ImportEft";
import { EsfFit } from "@/providers/CurrentFitProvider";
import { useFitManager } from "@/providers/FitManagerProvider";

import styles from "./FitButtonBar.module.css";

export const ClipboardButton = () => {
  const fitManager = useFitManager();
  const exportEft = useExportEft();
  const importEft = useImportEft();
  const { copy, copied } = useClipboard();

  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isPasteOpen, setIsPasteOpen] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const copyToClipboard = React.useCallback(() => {
    const eft = exportEft();
    if (eft === null) return;

    copy(eft);

    setIsPopupOpen(false);
  }, [copy, exportEft]);

  const importFromClipboard = React.useCallback(() => {
    setError(undefined);

    const textArea = textAreaRef.current;
    if (textArea === null) return;

    const fitString = textArea.value;
    if (fitString === "") return;

    let fit: EsfFit | undefined | null;
    if (fitString.startsWith("{")) {
      fit = JSON.parse(fitString);
    } else {
      try {
        fit = importEft(fitString);
      } catch (e: unknown) {
        const message = (e as Error).message;
        setError(`Importing EFT fit failed: ${message}`);
        return;
      }
    }

    if (fit === undefined) {
      setError("Unknown fit format");
      return;
    }
    if (fit === null) {
      setError("Invalid fit");
      return;
    }

    fitManager.setFit(fit);

    setIsPasteOpen(false);
    setIsPopupOpen(false);
  }, [fitManager, importEft]);

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
            <div
              className={styles.button}
              onClick={() => {
                setError(undefined);
                setIsPasteOpen(true);
              }}
            >
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
          {error && <div className={styles.importError}>{error}</div>}
        </div>
      </ModalDialog>
    </>
  );
};
