import clsx from "clsx";
import React from "react";

import { ShipSnapshotContext } from "../ShipSnapshotProvider";
import { LocalFitContext } from "../LocalFitProvider";
import { ModalDialog } from "../ModalDialog";

import styles from "./FitButtonBar.module.css";

export const SaveButton = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);
  const localFit = React.useContext(LocalFitContext);

  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isAlreadyExistsOpen, setIsAlreadyExistsOpen] = React.useState(false);

  const saveBrowser = React.useCallback(
    (force?: boolean) => {
      if (!localFit.loaded) return;
      if (!shipSnapshot.loaded || !shipSnapshot?.currentFit) return;

      setIsPopupOpen(false);

      if (!force) {
        for (const fit of localFit.fittings) {
          if (fit.name === shipSnapshot.currentFit.name) {
            setIsAlreadyExistsOpen(true);
            return;
          }
        }
      }

      setIsAlreadyExistsOpen(false);

      localFit.addFit(shipSnapshot.currentFit);
    },
    [localFit, shipSnapshot],
  );

  return (
    <>
      <div
        className={styles.popupButton}
        onMouseOver={() => setIsPopupOpen(true)}
        onMouseOut={() => setIsPopupOpen(false)}
      >
        <div className={styles.button}>Save</div>
        <div className={clsx(styles.popup, { [styles.collapsed]: !isPopupOpen })}>
          <div>
            <div className={styles.button} onClick={() => saveBrowser()}>
              Save in Browser
            </div>
          </div>
        </div>
      </div>

      <ModalDialog
        visible={isAlreadyExistsOpen}
        onClose={() => setIsAlreadyExistsOpen(false)}
        className={styles.alreadyExists}
        title="Update Fitting?"
      >
        <div>
          <div>You have a fitting with the name {shipSnapshot?.currentFit?.name}, do you want to update it?</div>
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
  );
};
