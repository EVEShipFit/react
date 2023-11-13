import React from "react";
import ctlx from "clsx";

import { EveDataContext } from '../EveDataProvider';
import { ShipSnapshotContext } from '../ShipSnapshotProvider';

import styles from "./ShipFit.module.css";

const esiFlagMapping: Record<string, number[]> = {
  "lowslot": [
    11, 12, 13, 14, 15, 16, 17, 18
  ],
  "medslot": [
    19, 20, 21, 22, 23, 24, 25, 26
  ],
  "hislot": [
    27, 28, 29, 30, 31, 32, 33, 34
  ],
  "rig": [
    92, 93, 94
  ],
  "subsystem": [
    125, 126, 127, 128
  ],
};

const stateRotation: Record<string, string[]> = {
  "Passive": ["Passive"],
  "Online": ["Passive", "Online"],
  "Active": ["Passive", "Online", "Active"],
  "Overload": ["Passive", "Online", "Active", "Overload"],
};

export const Slot = (props: {type: string, index: number, fittable: boolean, rotation: string}) => {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  const rotationStyle = { "--rotation": props.rotation } as React.CSSProperties;
  const esiFlag = esiFlagMapping[props.type][props.index - 1];

  const esiItem = shipSnapshot?.items?.find((item) => item.flag == esiFlag);
  let item = <></>;

  /* Not fittable and nothing fitted; no need to render the slot. */
  if (esiItem === undefined && !props.fittable) {
    return <></>
  }

  if (esiItem !== undefined) {
    item = <img src={`https://images.evetech.net/types/${esiItem.type_id}/icon?size=64`} title={eveData?.typeIDs?.[esiItem.type_id].name} />
  }

  const isOffline = esiItem?.state === "Passive" && esiItem?.max_state !== "Passive";

  function cycleState(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!shipSnapshot?.loaded || !esiItem) return;

    const states = stateRotation[esiItem.max_state];
    const stateIndex = states.indexOf(esiItem.state);

    let newState;
    if (e.shiftKey) {
      newState = states[(stateIndex - 1 + states.length) % states.length];
    } else {
      newState = states[(stateIndex + 1) % states.length];
    }

    shipSnapshot.setItemState(esiItem.flag, newState);
  }

  return <div className={styles.slot} style={rotationStyle} onClick={cycleState}>
    <div className={ctlx(styles.slotInner, { [styles.slotInnerInvalid]: !props.fittable, })} data-state={esiItem?.state}>
    </div>
    <div className={ctlx(styles.slotItem, { [styles.slotItemOffline]: isOffline })}>
      {item}
    </div>
  </div>
}
