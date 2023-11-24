import React from "react";

import { useEveShipFitLink } from "../EveShipFitLink";

import styles from "./ShipFit.module.css";

export const FitLink = () => {
  const link = useEveShipFitLink();

  /* Detect if the fit is loaded on https://eveship.fit */
  const isEveShipFit = typeof window !== "undefined" && window.location.hostname === "eveship.fit";
  const linkText = isEveShipFit ? "link to fit" : "open on eveship.fit";

  return <div className={styles.fitlink}>
    <svg viewBox="0 0 730 730" xmlns="http://www.w3.org/2000/svg">
      <path
        id="fitlink"
        fill="none"
        d="M18,365 A25,25 0 0,1 712,365" />

      <a href={link} target="_new">
        <text textAnchor="middle">
          <textPath startOffset="50%" href="#fitlink" fill="#cdcdcd">{linkText}</textPath>
        </text>
      </a>
    </svg>
  </div>
}
