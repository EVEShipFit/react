import React from "react";

import { Icon } from "../Icon";
import { ShipFit } from "../ShipFit";
import { ShipAttribute } from "../ShipAttribute";
import { ShipSnapshotContext } from "../ShipSnapshotProvider";

import styles from "./ShipFitExtended.module.css";

const CargoHold = () => {
  return (
    <div>
      <div className={styles.cargoIcon}>
        <Icon name="cargo-hold" size={32} />
      </div>
      <div className={styles.cargoText}>
        <div>0</div>
        <div>
          / <ShipAttribute name="capacity" fixed={1} />
        </div>
      </div>
      <div className={styles.cargoPostfix}>m3</div>
    </div>
  );
};

const DroneBay = () => {
  return (
    <div>
      <div className={styles.cargoIcon}>
        <Icon name="drone-bay" size={32} />
      </div>
      <div className={styles.cargoText}>
        <div>0</div>
        <div>
          / <ShipAttribute name="droneCapacity" fixed={1} />
        </div>
      </div>
      <div className={styles.cargoPostfix}>m3</div>
    </div>
  );
};

const CpuPg = (props: { title: string; children: React.ReactNode }) => {
  return (
    <>
      <div className={styles.cpuPgTitle}>{props.title}</div>
      <div className={styles.cpuPgContent}>{props.children}</div>
    </>
  );
};

const FitName = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  return (
    <>
      <div className={styles.fitNameTitle}>Name</div>
      <div className={styles.fitNameContent}>{shipSnapshot?.fit?.name}</div>
    </>
  );
};

/**
 * Render a ship fit similar to how it is done in-game.
 *
 * The difference between this component and ShipFit, is that this
 * also adds the cargo hold, drone bay, and CPU/PG usage at the
 * bottom of the fit.
 */
export const ShipFitExtended = () => {
  return (
    <div className={styles.fit}>
      <ShipFit />

      <div className={styles.fitName}>
        <FitName />
      </div>

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
  );
};
