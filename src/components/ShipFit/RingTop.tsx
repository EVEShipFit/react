import clsx from "clsx";
import React from "react";

import styles from "./ShipFit.module.css";

export const RingTop = (props: { children: React.ReactNode }) => {
  return <div className={styles.ringTop}>{props.children}</div>;
};

export const RingTopItem = (props: { children: React.ReactNode; rotation: number; background?: boolean }) => {
  const rotationStyle = {
    "--rotation": `${props.rotation}deg`,
  } as React.CSSProperties;

  return (
    <div className={clsx(styles.ringTopItem, { [styles.background]: props.background })} style={rotationStyle}>
      {props.children}
    </div>
  );
};
