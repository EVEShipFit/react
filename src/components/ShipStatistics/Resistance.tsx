import React from "react";

import { ShipAttribute, useAttribute } from "@/components/ShipAttribute";

import styles from "./ShipStatistics.module.css";

export const Resistance = (props: { name: string }) => {
  const { value } = useAttribute("Ship", {
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

  return (
    <span className={styles.resistance}>
      <span className={styles.resistanceProgress} data-type={type} style={{ width: `${value}%` }}></span>
      <ShipAttribute name={props.name} fixed={0} unit=" %" isResistance={true} />
    </span>
  );
};
