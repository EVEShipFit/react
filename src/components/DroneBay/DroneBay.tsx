import clsx from "clsx";
import React from "react";

import styles from "./DroneBay.module.css";
import { CharAttribute, ShipAttribute } from "../ShipAttribute";
import { ShipSnapshotContext, ShipSnapshotItem } from "../../providers/ShipSnapshotProvider";
import { EveDataContext } from "../../providers/EveDataProvider";

const DroneBayEntrySelected = ({
  drone,
  index,
  isOpen,
}: {
  drone: ShipSnapshotItem;
  index: number;
  isOpen: boolean;
}) => {
  const snapshot = React.useContext(ShipSnapshotContext);

  const onClick = React.useCallback(() => {
    snapshot.toggleDrones(drone.type_id, index + 1);
  }, [snapshot, drone, index]);

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

const DroneBayEntry = ({ name, drones }: { name: string; drones: ShipSnapshotItem[] }) => {
  const eveData = React.useContext(EveDataContext);
  const snapshot = React.useContext(ShipSnapshotContext);

  const attributeDroneBandwidthUsedTotal = eveData.attributeMapping?.droneBandwidthUsedTotal || 0;
  const attributeDroneActive = eveData.attributeMapping?.droneActive || 0;
  const attributeDroneBandwidthUsed = eveData.attributeMapping?.droneBandwidthUsed || 0;
  const attributeDroneBandwidth = eveData.attributeMapping?.droneBandwidth || 0;
  const attributeMaxActiveDrones = eveData.attributeMapping?.maxActiveDrones || 0;

  const bandwidthUsed = snapshot.hull?.attributes?.get(attributeDroneBandwidthUsedTotal)?.value ?? 0;
  const bandwidthAvailable = snapshot.hull?.attributes?.get(attributeDroneBandwidth)?.value ?? 0;
  const dronesActive = snapshot.hull?.attributes?.get(attributeDroneActive)?.value ?? 0;
  const maxDronesActive = snapshot.char?.attributes?.get(attributeMaxActiveDrones)?.value ?? 0;
  const droneBandwidth = drones[0].attributes?.get(attributeDroneBandwidthUsed)?.value ?? 0;
  const maxSelected = Math.max(0, Math.min(maxDronesActive, Math.floor(bandwidthAvailable / droneBandwidth)));

  let maxOpen = Math.max(
    0,
    Math.min(maxDronesActive - dronesActive, Math.floor((bandwidthAvailable - bandwidthUsed) / droneBandwidth)),
  );
  let index = 0;

  const dronesSelected = drones.slice(0, maxSelected);

  const onRemove = React.useCallback(() => {
    snapshot.removeDrones(drones[0].type_id);
  }, [snapshot, drones]);

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
  const eveData = React.useContext(EveDataContext);
  const snapshot = React.useContext(ShipSnapshotContext);

  const [drones, setDrones] = React.useState<Record<string, ShipSnapshotItem[]>>({});

  React.useEffect(() => {
    if (snapshot === undefined || !snapshot.loaded || snapshot.items === undefined) return;
    if (eveData === undefined || !eveData.loaded || eveData.typeIDs === undefined) return;

    /* Group drones by type_id */
    const dronesGrouped: Record<string, ShipSnapshotItem[]> = {};
    for (const drone of snapshot.items.filter((item) => item.flag == 87)) {
      const name = eveData.typeIDs?.[drone.type_id].name ?? "";

      if (dronesGrouped[name] === undefined) {
        dronesGrouped[name] = [];
      }
      dronesGrouped[name].push(drone);
    }

    setDrones(dronesGrouped);
  }, [snapshot, eveData]);

  return (
    <div className={styles.droneBay}>
      <div>
        Active drones: <ShipAttribute name="droneActive" fixed={0} /> /{" "}
        <CharAttribute name="maxActiveDrones" fixed={0} />
      </div>
      {Object.entries(drones)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, droneList]) => {
          return <DroneBayEntry key={name} name={name} drones={droneList} />;
        })}
    </div>
  );
};
