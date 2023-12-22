import clsx from "clsx";
import React, { useLayoutEffect } from "react";
import { createPortal } from "react-dom";

import styles from "./ModalDialog.module.css";

export interface ModalDialogProps {
  /** Children that build up the modal dialog. */
  children: React.ReactNode;
  /** Classname to add to the content of the dialog. */
  className?: string;
  /** Whether the dialog should be visible. */
  visible: boolean;
  /** Callback called when the dialog should be closed. */
  onClose: () => void;
  /** Title of the modal dialog. */
  title: string;
}

/**
 * Create a modal dialog on top of all content.
 *
 * You need to set an <ModalDialogAnchor /> somewhere in the DOM for this to work.
 */
export const ModalDialog = (props: ModalDialogProps) => {
  const [modalDialogAnchor, setModalDialogAnchor] = React.useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (modalDialogAnchor !== null) return;

    const newModalDialogAnchor = document.getElementById("modalDialogAnchor");
    if (newModalDialogAnchor === null) return;

    setModalDialogAnchor(newModalDialogAnchor);
  }, [modalDialogAnchor]);

  if (!props.visible) return null;
  if (modalDialogAnchor === null) return null;

  return createPortal(<div className={styles.modalDialog} onClick={() => props.onClose()}>
    <div className={clsx(styles.content, props.className)} onClick={(e) => e.stopPropagation()}>
      <div className={styles.header}>{props.title}</div>
      {props.children}
    </div>
  </div>, modalDialogAnchor);
};

/**
 * Anchor for where the Modal Dialogs should be inserted in the DOM.
 *
 * This should be in a <div> which has a position and dimensions set. The modal
 * will always use the full size of this <div> when rendering its content.
 */
export const ModalDialogAnchor = () => {
  return <div id="modalDialogAnchor">
  </div>
}
