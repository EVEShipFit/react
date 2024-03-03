import ctlx from "clsx";
import React from "react";

import styles from "./ShipStatistics.module.css";

export const Category = (props: { headerLabel: string; headerContent: React.ReactNode; children: React.ReactNode }) => {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <div className={styles.panel}>
      <div onClick={() => setExpanded((current) => !current)} className={styles.header}>
        <div>{props.headerLabel}</div>
        <div style={{ textAlign: "right" }}>{props.headerContent}</div>
      </div>

      <div className={expanded ? styles.expanded : styles.collapsed}>{props.children}</div>
    </div>
  );
};

export const CategoryLine = (props: { className?: string; children: React.ReactNode }) => {
  return <div className={ctlx(styles.line, props.className)}>{props.children}</div>;
};
