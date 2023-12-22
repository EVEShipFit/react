import React from "react";

import { SaveButton } from "./SaveButton";
import { ClipboardButton } from "./ClipboardButton";
import { ShareButton } from "./ShareButton";
import { RenameButton } from "./RenameButton";

import styles from "./FitButtonBar.module.css";

/**
 * Bar with buttons to load/save fits.
 */
export const FitButtonBar = () => {
  return <div className={styles.fitButtonBar}>
    <SaveButton />
    <ClipboardButton />
    <ShareButton />
    <RenameButton />
  </div>
};
