import clsx from "clsx";
import React from "react";

import { ShipSnapshotContext } from "@/providers/ShipSnapshotProvider";
import { ModalDialog } from "@/components/ModalDialog";

import styles from "./FitButtonBar.module.css";

export const RenameButton = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [rename, setRename] = React.useState("");

  const saveRename = React.useCallback(() => {
    shipSnapshot?.setName(rename);
    setIsRenameOpen(false);
  }, [rename, shipSnapshot]);

  const openRename = React.useCallback(() => {
    setRename(shipSnapshot?.currentFit?.name ?? "");
    setIsRenameOpen(true);
  }, [shipSnapshot]);

  return (
    <>
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
  );
};
