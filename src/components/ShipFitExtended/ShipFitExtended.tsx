import clsx from "clsx";
import React from "react";

import { CargoBay } from "@/components/CargoBay";
import { DroneBay } from "@/components/DroneBay";
import { Icon } from "@/components/Icon";
import { ShipAttribute } from "@/components/ShipAttribute";
import { ShipFit } from "@/components/ShipFit";
import { FitHistory } from "@/components/FitHistory";
import { useCurrentFit } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { useStatistics } from "@/providers/StatisticsProvider";
import { useFitManager } from "@/providers/FitManagerProvider";

import styles from "./ShipFitExtended.module.css";

const ShipCargoHold = () => {
  const statistics = useStatistics();
  const fitManager = useFitManager();

  const [isOpen, setIsOpen] = React.useState(false);

  const onDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const onDragEnd = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const parseNumber = (maybeNumber: string): number | undefined => {
        const num = parseInt(maybeNumber);
        return Number.isInteger(num) ? num : undefined;
      };

      const draggedTypeId: number | undefined = parseNumber(e.dataTransfer.getData("application/esf-type-id"));
      if (draggedTypeId === undefined) {
        return;
      }

      fitManager.addCargo(draggedTypeId, 1);
    },
    [fitManager],
  );

  if (statistics?.capacityUsed === 0 && isOpen) {
    setIsOpen(false);
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(statistics?.capacityUsed !== 0 && !isOpen)}
        className={clsx({ [styles.cargoBay]: statistics?.capacityUsed !== 0 })}
        onDragOver={onDragOver}
        onDrop={onDragEnd}
      >
        <div className={styles.cargoIcon}>
          <Icon name="cargo-hold" size={32} />
        </div>
        <div className={styles.cargoText}>
          <div>
            <ShipAttribute name="capacityUsed" fixed={1} roundUp />
          </div>
          <div>
            / <ShipAttribute name="capacity" fixed={1} />
          </div>
        </div>
        <div className={styles.cargoPostfix}>m3</div>
      </div>
      <div className={clsx(styles.cargoBayOverlay, { [styles.cargoBayVisible]: isOpen })}>
        <CargoBay />
      </div>
    </>
  );
};

const ShipDroneBay = () => {
  const eveData = useEveData();
  const currentFit = useCurrentFit();

  const [isOpen, setIsOpen] = React.useState(false);

  if (eveData === null) return <></>;

  const isStructure = eveData.typeIDs[currentFit.currentFit?.shipTypeId ?? 0]?.categoryID === 65;

  if (currentFit.fit?.drones.length === 0 && isOpen) {
    setIsOpen(false);
  }

  return (
    <>
      <div
        onClick={() => setIsOpen(currentFit.fit?.drones.length !== 0 && !isOpen)}
        className={clsx({ [styles.droneBay]: currentFit.fit?.drones.length !== 0 })}
      >
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
