import clsx from "clsx";
import React from "react";

import { LocalFitContext } from "../LocalFitProvider";
import { ModalDialog } from "../ModalDialog";
import { EsiFit, ShipSnapshotContext } from "../ShipSnapshotProvider";
import { useFormatAsEft } from "../FormatAsEft";
import { useFormatEftToEsi } from "../FormatEftToEsi";

import styles from "./FitButtonBar.module.css";

const SaveButton = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);
  const localFit = React.useContext(LocalFitContext);

  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isAlreadyExistsOpen, setIsAlreadyExistsOpen] = React.useState(false);

  const saveBrowser = React.useCallback((force?: boolean) => {
    if (!localFit.loaded) return;
    if (!shipSnapshot.loaded || !shipSnapshot?.fit) return;

    setIsPopupOpen(false);

    if (!force) {
      for (const fit of localFit.fittings) {
        if (fit.name === shipSnapshot.fit.name) {
          setIsAlreadyExistsOpen(true);
          return;
        }
      }
    }

    setIsAlreadyExistsOpen(false);

    localFit.addFit(shipSnapshot.fit);
  }, [localFit, shipSnapshot]);

  return <>
    <div className={styles.popupButton} onMouseOver={() => setIsPopupOpen(true)} onMouseOut={() => setIsPopupOpen(false)}>
      <div className={styles.button}>
        Save
      </div>
      <div className={clsx(styles.popup, {[styles.collapsed]: !isPopupOpen})}>
        <div>
          <div className={styles.button} onClick={() => saveBrowser()}>
            Save in Browser
          </div>
        </div>
      </div>
    </div>

    <ModalDialog visible={isAlreadyExistsOpen} onClose={() => setIsAlreadyExistsOpen(false)} className={styles.alreadyExists} title="Update Fitting?">
      <div>
        <div>
          You have a fitting with the name {shipSnapshot?.fit?.name}, do you want to update it?
        </div>
        <div className={styles.alreadyExistsButtons}>
          <span className={clsx(styles.button, styles.buttonSmall)} onClick={() => saveBrowser(true)}>
            Yes
          </span>
          <span className={clsx(styles.button, styles.buttonSmall)} onClick={() => setIsAlreadyExistsOpen(false)}>
            No
          </span>
        </div>
      </div>
    </ModalDialog>
  </>
}

const ClipboardButton = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);
  const toEft = useFormatAsEft();
  const eftToEsiFit = useFormatEftToEsi();

  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isPasteOpen, setIsPasteOpen] = React.useState(false);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const copyToClipboard = React.useCallback(() => {
    const eft = toEft();
    if (eft === undefined) return;

    navigator.clipboard.writeText(eft);

    setIsPopupOpen(false);
  }, [toEft]);

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

  return <>
    <div className={styles.popupButton} onMouseOver={() => setIsPopupOpen(true)} onMouseOut={() => setIsPopupOpen(false)}>
      <div className={styles.button}>
        Clipboard
      </div>
      <div className={clsx(styles.popup, {[styles.collapsed]: !isPopupOpen})}>
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

    <ModalDialog visible={isPasteOpen} onClose={() => setIsPasteOpen(false)} className={styles.paste} title="Import from Clipboard">
      <div>
        <div>
          Paste the EFT fit here
        </div>
        <div>
          <textarea autoFocus className={styles.pasteTextarea} ref={textAreaRef} />
        </div>
        <span className={clsx(styles.button, styles.buttonSmall)} onClick={() => importFromClipboard()}>
          Import
        </span>
      </div>
    </ModalDialog>
  </>
}

const RenameButton = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [rename, setRename] = React.useState("");

  const saveRename = React.useCallback(() => {
    shipSnapshot?.setName(rename);
    setIsRenameOpen(false);
  }, [rename, shipSnapshot]);

  const openRename = React.useCallback(() => {
    setRename(shipSnapshot?.fit?.name ?? "");
    setIsRenameOpen(true);
  }, [shipSnapshot]);

  return <>
    <div className={styles.button} onClick={() => openRename()}>
      Rename
    </div>

    <ModalDialog visible={isRenameOpen} onClose={() => setIsRenameOpen(false)} title="Fit Name">
      <div>
        <span className={styles.renameEdit}>
          <input type="text" autoFocus value={rename} onChange={(e) => setRename(e.target.value)} />
        </span>
        <span className={clsx(styles.button, styles.buttonSmall)} onClick={() => saveRename()}>
          Save
        </span>
      </div>
    </ModalDialog>
  </>
}

/**
 * Bar with buttons to load/save fits.
 */
export const FitButtonBar = () => {
  return <div className={styles.fitButtonBar}>
    <SaveButton />
    <ClipboardButton />
    <RenameButton />
  </div>
};
