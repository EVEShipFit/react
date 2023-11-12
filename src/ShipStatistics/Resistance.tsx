import React from "react";

import { useShipAttribute } from '../ShipAttribute';

import styles from "./ShipStatistics.module.css";

export const Resistance = (props: {name: string}) => {
  const stringValue = useShipAttribute({
    name: props.name,
    fixed: 0,
    isResistance: true,
  });

  const lname = props.name.toLowerCase();
  let type = "";
  if (lname.includes("emdamage")) {
    type = "em";
  } else if (lname.includes("thermaldamage")) {
    type = "thermal";
  } else if (lname.includes("kineticdamage")) {
    type = "kinetic";
  } else if (lname.includes("explosivedamage")) {
    type = "explosive";
  }

  return <span className={styles.resistance}>
    <span className={styles.resistanceProgress} data-type={type} style={{width: `${stringValue}%`}}>
    </span>
    <span>{stringValue} %</span>
  </span>
}
