import clsx from "clsx";
import React from "react";

import { ModalDialog } from "@/components/ModalDialog";
import { useCurrentFit } from "@/providers/CurrentFitProvider";
import { useLocalFits } from "@/providers/LocalFitsProvider";

import styles from "./FitButtonBar.module.css";

export const SaveButton = () => {
  const currentFit = useCurrentFit();
  const localFits = useLocalFits();

  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  const [isAlreadyExistsOpen, setIsAlreadyExistsOpen] = React.useState(false);

  const saveBrowser = React.useCallback(
    (force?: boolean) => {
      if (currentFit.currentFit === null) return;

      setIsPopupOpen(false);

      if (!force) {
        for (const fit of localFits.fittings) {
          if (fit.name === currentFit.currentFit.name) {
            setIsAlreadyExistsOpen(true);
            return;
          }
        }
      }

      setIsAlreadyExistsOpen(false);
      localFits.addFit(currentFit.currentFit);
    },
    [localFits, currentFit.currentFit],
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
          <div>
            You have a local fitting with the name &quot;{currentFit.currentFit?.name}&quot;; do you want to update it?
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
  );
};
