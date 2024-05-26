import clsx from "clsx";
import React from "react";

import { DroneBay } from "@/components/DroneBay";
import { Icon } from "@/components/Icon";
import { ShipAttribute } from "@/components/ShipAttribute";
import { ShipFit } from "@/components/ShipFit";
import { FitHistory } from "@/components/FitHistory";
import { useCurrentFit } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";

import styles from "./ShipFitExtended.module.css";

const ShipCargoHold = () => {
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

const ShipDroneBay = () => {
  const eveData = useEveData();
  const currentFit = useCurrentFit();

  const [isOpen, setIsOpen] = React.useState(false);

  if (eveData === null) return <></>;

  const isStructure = eveData.typeIDs[currentFit.currentFit?.shipTypeId ?? 0]?.categoryID === 65;

  return (
    <>
      <div onClick={() => setIsOpen(!isOpen)} className={styles.droneBay}>
        <div className={styles.cargoIcon}>
          <Icon name="drone-bay" size={32} />
        </div>
        <div className={styles.cargoText}>
          <div>
            <ShipAttribute name="droneCapacityUsed" fixed={1} />
          </div>
          <div>
            / {isStructure && <>0.0</>}
            {!isStructure && <ShipAttribute name="droneCapacity" fixed={1} />}
          </div>
        </div>
        <div className={styles.cargoPostfix}>m3</div>
      </div>
      <div className={clsx(styles.droneBayOverlay, { [styles.droneBayVisible]: isOpen })}>
        <DroneBay />
      </div>
    </>
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
  const currentFit = useCurrentFit();

  return (
    <>
      <div className={styles.fitNameTitle}>Name</div>
      <div className={styles.fitNameContent}>{currentFit.currentFit?.name}</div>
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
  const currentFit = useCurrentFit();

  return (
    <div className={styles.fit}>
      <ShipFit withStats />

      <div className={styles.fitName}>
        <FitName />
      </div>

      <div className={styles.cargoHold}>
        <ShipCargoHold />
        <ShipDroneBay />
      </div>

      <div className={styles.history}>
        <FitHistory historySize={25} />
      </div>

      <div className={styles.cpuPg}>
        <CpuPg title="CPU">
          <ShipAttribute name="cpuUnused" fixed={1} />/<ShipAttribute name="cpuOutput" fixed={1} />
        </CpuPg>
        <CpuPg title="Power Grid">
          <ShipAttribute name="powerUnused" fixed={1} />/<ShipAttribute name="powerOutput" fixed={1} />
        </CpuPg>
      </div>

      {currentFit.currentFit === null && <div className={styles.empty}>To start, select a hull on the left.</div>}
    </div>
  );
};
