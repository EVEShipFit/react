import clsx from "clsx";
import React from "react";

import { LocalFitContext } from "../LocalFitProvider";
import { ModalDialog } from "../ModalDialog";
import { ShipSnapshotContext } from "../ShipSnapshotProvider";

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
    <RenameButton />
  </div>
};
