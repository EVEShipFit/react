import clsx from "clsx";
import React from "react";

import { ModalDialog } from "@/components/ModalDialog";
import { useCurrentFit } from "@/providers/CurrentFitProvider";
import { useFitManager } from "@/providers/FitManagerProvider";

import styles from "./FitButtonBar.module.css";

export const RenameButton = () => {
  const currentFit = useCurrentFit();
  const fitManager = useFitManager();

  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const nameRef = React.useRef<string>(name);
  nameRef.current = name;

  const saveRename = React.useCallback(() => {
    fitManager.setName(nameRef.current);
    setIsRenameOpen(false);
  }, [fitManager]);

  const openRename = React.useCallback(() => {
    if (currentFit.currentFit === null) return;
    setName(currentFit.currentFit.name);
    setIsRenameOpen(true);
  }, [currentFit.currentFit]);

  return (
    <>
      <div className={styles.button} onClick={() => openRename()}>
        Rename
      </div>

      <ModalDialog visible={isRenameOpen} onClose={() => setIsRenameOpen(false)} title="Fit Name">
        <div>
          <span className={styles.renameEdit}>
            <input type="text" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          </span>
          <span className={clsx(styles.button, styles.buttonSmall)} onClick={() => saveRename()}>
            Save
          </span>
        </div>
      </ModalDialog>
    </>
  );
};
