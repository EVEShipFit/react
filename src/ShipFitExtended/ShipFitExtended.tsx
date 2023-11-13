import React from "react";

import { ShipFit } from "../ShipFit";
import { ShipAttribute } from "../ShipAttribute";

import styles from "./ShipFitExtended.module.css";

export interface ShipFitExtendedProps {
  radius?: number;
}

const CargoHold = () => {
  return <div>
    <div className={styles.cargoIcon}>
      C
    </div>
    <div className={styles.cargoText}>
      <div>
        0
      </div>
      <div>
        / <ShipAttribute name="capacity" fixed={1} />
      </div>
    </div>
    <div className={styles.cargoPostfix}>
      m3
    </div>
  </div>
}

const DroneBay = () => {
  return <div>
    <div className={styles.cargoIcon}>
      D
    </div>
    <div className={styles.cargoText}>
      <div>
        0
      </div>
      <div>
        / <ShipAttribute name="droneCapacity" fixed={1} />
      </div>
    </div>
    <div className={styles.cargoPostfix}>
      m3
    </div>
  </div>
}

const CpuPg = (props: { title: string, children: React.ReactNode }) => {
  return <>
    <div className={styles.cpuPgTitle}>{props.title}</div>
    <div className={styles.cpuPgContent}>{props.children}</div>
  </>
}

/**
 * Render a ship fit similar to how it is done in-game.
 *
 * The difference between this component and ShipFit, is that this
 * also adds the cargo hold, drone bay, and CPU/PG usage at the
 * bottom of the fit.
 */
export const ShipFitExtended = (props: ShipFitExtendedProps) => {
  const radius = props.radius ?? 365;

  const scaleStyle = {
    "--radius": `${radius}px`,
  } as React.CSSProperties;

  return <div className={styles.fit} style={scaleStyle}>
    <ShipFit radius={radius} />

    <div className={styles.cargoHold}>
      <CargoHold />
      <DroneBay />
    </div>

    <div className={styles.cpuPg}>
      <CpuPg title="CPU">
        <ShipAttribute name="cpuUnused" fixed={1} />/<ShipAttribute name="cpuOutput" fixed={1} />
      </CpuPg>
      <CpuPg title="Power Grid">
        <ShipAttribute name="powerUnused" fixed={1} />/<ShipAttribute name="powerOutput" fixed={1} />
      </CpuPg>
    </div>
  </div>
};
