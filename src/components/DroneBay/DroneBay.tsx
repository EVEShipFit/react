import clsx from "clsx";
import React from "react";

import { CharAttribute, ShipAttribute } from "@/components/ShipAttribute";
import { useFitManager } from "@/providers/FitManagerProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { useStatistics } from "@/providers/StatisticsProvider";
import { CalculationItem } from "@/providers/DogmaEngineProvider";

import styles from "./DroneBay.module.css";

const DroneBayEntrySelected = ({
  drone,
  index,
  isOpen,
}: {
  drone: CalculationItem;
  index: number;
  isOpen: boolean;
}) => {
  const fitManager = useFitManager();

  const onClick = React.useCallback(() => {
    fitManager.activateDrones(drone.type_id, index + 1);
  }, [fitManager, drone, index]);

  return (
    <div
      className={clsx(styles.droneBayEntrySelected, {
        [styles.active]: drone.state === "Active",
        [styles.open]: isOpen,
      })}
      onClick={onClick}
    >
      {drone.state === "Active" && <>X</>}
      {drone.state === "Passive" && <>&nbsp;</>}
    </div>
  );
};

const DroneBayEntry = ({ name, drones }: { name: string; drones: CalculationItem[] }) => {
  const eveData = useEveData();
  const statistics = useStatistics();
  const fitManager = useFitManager();

  const onRemove = React.useCallback(() => {
    fitManager.removeDrones(drones[0].type_id);
  }, [fitManager, drones]);

  if (eveData === null || statistics === null) return <></>;

  const attributeDroneBandwidthUsedTotal = eveData.attributeMapping.droneBandwidthUsedTotal ?? 0;
  const attributeDroneActive = eveData.attributeMapping.droneActive ?? 0;
  const attributeDroneBandwidthUsed = eveData.attributeMapping.droneBandwidthUsed ?? 0;
  const attributeDroneBandwidth = eveData.attributeMapping.droneBandwidth ?? 0;
  const attributeMaxActiveDrones = eveData.attributeMapping.maxActiveDrones ?? 0;

  const bandwidthUsed = statistics.hull.attributes.get(attributeDroneBandwidthUsedTotal)?.value ?? 0;
  const bandwidthAvailable = statistics.hull.attributes.get(attributeDroneBandwidth)?.value ?? 0;
  const dronesActive = statistics.hull.attributes.get(attributeDroneActive)?.value ?? 0;
  const maxDronesActive = statistics.char.attributes.get(attributeMaxActiveDrones)?.value ?? 0;
  const droneBandwidth = drones[0].attributes.get(attributeDroneBandwidthUsed)?.value ?? 0;
  const maxSelected = Math.max(0, Math.min(maxDronesActive, Math.floor(bandwidthAvailable / droneBandwidth)));

  let maxOpen = Math.max(
    0,
    Math.min(maxDronesActive - dronesActive, Math.floor((bandwidthAvailable - bandwidthUsed) / droneBandwidth)),
  );
  let index = 0;

  const dronesSelected = drones.slice(0, maxSelected);

  return (
    <div className={styles.droneBayEntry}>
      <div className={styles.amount}>{drones.length} x</div>
      <div>
        <img src={`https://images.evetech.net/types/${drones[0].type_id}/icon?size=64`} />
      </div>
      <div className={styles.middle}>
        <div className={styles.name}>{name}</div>
        <div className={styles.selected}>
          Selected:
          {Object.entries(dronesSelected).map(([key, drone]) => {
            const isOpen = drone.state !== "Active" && maxOpen > 0;
            if (isOpen) maxOpen--;

            return <DroneBayEntrySelected key={key} drone={drone} index={index++} isOpen={isOpen} />;
          })}
        </div>
      </div>
      <div className={styles.close} onClick={onRemove}>
        X
      </div>
    </div>
  );
};

export const DroneBay = () => {
  const eveData = useEveData();
  const statistics = useStatistics();

  if (eveData === null || statistics === null) return <></>;

  /* Group drones by type_id */
  const dronesGrouped: Record<string, CalculationItem[]> = {};
  for (const drone of statistics.items.filter((item) => item.slot.type == "DroneBay")) {
    const name = eveData.typeIDs?.[drone.type_id].name ?? "";

    if (dronesGrouped[name] === undefined) {
      dronesGrouped[name] = [];
    }
    dronesGrouped[name].push(drone);
  }

  return (
    <div className={styles.droneBay}>
      <div>
        Active drones: <ShipAttribute name="droneActive" fixed={0} /> /{" "}
        <CharAttribute name="maxActiveDrones" fixed={0} />
      </div>
      {Object.entries(dronesGrouped)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, droneList]) => {
          return <DroneBayEntry key={name} name={name} drones={droneList} />;
        })}
    </div>
  );
};
