import React from "react";

import styles from "./ShipFit.module.css";

export const RingInner = () => {
  return <svg viewBox="24 24 464 464" xmlns="http://www.w3.org/2000/svg" className={styles.ringInner}>
    <defs>
      <mask id="slot-corners">
        <rect style={{ fill: "#ffffff" }} width="512" height="512" x="0" y="0" />

        <rect style={{ fill: "#000000" }} width="17" height="17" x="133" y="126" />
        <rect style={{ fill: "#000000" }} width="17" height="17" x="366" y="129" />
        <rect style={{ fill: "#000000" }} width="17" height="17" x="366" y="366" />
        <rect style={{ fill: "#000000" }} width="17" height="17" x="132" y="369" />
        <rect style={{ fill: "#000000" }} width="12" height="12" x="230" y="44" transform="rotate(56)" />
      </mask>
    </defs>

    <g>
      <circle style={{ fill: "none", stroke: "#000000", strokeWidth: 46, strokeOpacity: 0.6 }} cx="256" cy="256" r="195" mask="url(#slot-corners)" />
    </g>
  </svg>
}
