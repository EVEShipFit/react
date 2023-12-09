import React from "react";

import styles from "./ShipFit.module.css";

export const RingTop = (props: { children: React.ReactNode }) => {
  return <div className={styles.ringTop}>
    {props.children}
  </div>
}

export const RingTopItem = (props: { children: React.ReactNode, rotation: number }) => {
  const rotationStyle = {
    "--rotation": `${props.rotation}deg`,
  } as React.CSSProperties;

  return <div className={styles.ringTopItem} style={rotationStyle}>
    {props.children}
  </div>
}
