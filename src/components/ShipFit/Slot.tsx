import React from "react";

import { EveDataContext } from "@/providers/EveDataProvider";
import { ShipSnapshotContext } from "@/providers/ShipSnapshotProvider";
import { Icon, IconName } from "@/components/Icon";

import styles from "./ShipFit.module.css";

const esiFlagMapping: Record<string, number[]> = {
  lowslot: [11, 12, 13, 14, 15, 16, 17, 18],
  medslot: [19, 20, 21, 22, 23, 24, 25, 26],
  hislot: [27, 28, 29, 30, 31, 32, 33, 34],
  rig: [92, 93, 94],
  subsystem: [125, 126, 127, 128],
};

const stateRotation: Record<string, string[]> = {
  Passive: ["Passive"],
  Online: ["Passive", "Online"],
  Active: ["Passive", "Online", "Active"],
  Overload: ["Passive", "Online", "Active", "Overload"],
};

export const Slot = (props: { type: string; index: number; fittable: boolean; main?: boolean }) => {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  const esiFlag = esiFlagMapping[props.type][props.index - 1];

  const esiItem = shipSnapshot?.items?.find((item) => item.flag == esiFlag);
  const active = esiItem?.max_state !== "Passive" && esiItem?.max_state !== "Online";

  let item = <></>;
  let svg = <></>;
  let imageStyle = styles.slotImage;

  if (props.main !== undefined) {
    svg = (
      <>
        <svg
          viewBox="235 40 52 50"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMin slice"
          style={{ display: "none" }}
        >
          <g id="slot">
            <path
              style={{ fillOpacity: 0.1, strokeWidth: 1, strokeOpacity: 0.5 }}
              d="M 243 46 A 210 210 0 0 1 279 46.7 L 276 84.7 A 172 172 0 0 0 246 84 L 243 46"
            />
          </g>
          <g id="slot-active">
            <path style={{ fillOpacity: 0.6, strokeWidth: 1 }} d="M 250 84 L 254 79 L 268 79 L 272 84" />
          </g>
          <g id="slot-passive">
            <path style={{ strokeWidth: 1 }} d="M 245 48 A 208 208 0 0 1 250 47.5 L 248 50 L 245 50" />
            <path style={{ strokeWidth: 1 }} d="M 277.5 48.5 A 208 208 0 0 0 273 48 L 275 50.5 L 277.5 50.5" />
            <path style={{ strokeWidth: 1 }} d="M 247 82 A 170 170 0 0 1 252 82 L 250 80 L 246.8 80" />
            <path style={{ strokeWidth: 1 }} d="M 275 82.5 A 170 170 0 0 0 270 82 L 272 80 L 275.2 80" />
          </g>
        </svg>
        <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
          <g id="uncharge">
            <path style={{ fill: "none", strokeWidth: 1 }} d="M 4 6 A 8 8 0 1 1 4 14" />
            <path style={{ fill: "none", strokeWidth: 1 }} d="M 11 6 L 6 10 L 11 14" />
            <path style={{ fill: "none", strokeWidth: 1 }} d="M 6 10 L 16 10" />
          </g>
          <g id="unfit">
            <path style={{ fill: "none", strokeWidth: 1 }} d="M 4 6 A 8 8 0 1 1 4 14" />
            <path style={{ fill: "none", strokeWidth: 1 }} d="M 11 6 L 6 10 L 11 14" />
            <path style={{ fill: "none", strokeWidth: 1 }} d="M 6 10 L 16 10" />
          </g>
          <g id="offline">
            <path style={{ fill: "none", strokeWidth: 1 }} d="M 12 4 A 8 8 0 1 1 6 4" />
            <path style={{ fill: "none", strokeWidth: 1 }} d="M 9 2 L 9 12" />
          </g>
        </svg>
      </>
    );
  }

  svg = (
    <>
      {svg}
      <svg
        viewBox="235 40 52 50"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.ringInner}
        preserveAspectRatio="xMidYMin slice"
      >
        <use href="#slot" />
        {props.fittable && esiItem && active && <use href="#slot-active" />}
        {props.fittable && esiItem && !active && <use href="#slot-passive" />}
      </svg>
    </>
  );

  const offlineState = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      e.stopPropagation();
      if (!shipSnapshot?.loaded || !esiItem) return;

      if (esiItem.state === "Passive") {
        shipSnapshot.setItemState(esiItem.flag, "Online");
      } else {
        shipSnapshot.setItemState(esiItem.flag, "Passive");
      }
    },
    [shipSnapshot, esiItem],
  );

  const cycleState = React.useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
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
    },
    [shipSnapshot, esiItem],
  );

  const unfitModule = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      e.stopPropagation();
      if (!shipSnapshot?.loaded || !esiItem) return;

      shipSnapshot.removeModule(esiItem.flag);
    },
    [shipSnapshot, esiItem],
  );

  const unfitCharge = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      e.stopPropagation();
      if (!shipSnapshot?.loaded || !esiItem) return;

      shipSnapshot.removeCharge(esiItem.flag);
    },
    [shipSnapshot, esiItem],
  );

  /* Not fittable and nothing fitted; no need to render the slot. */
  if (esiItem === undefined && !props.fittable) {
    return (
      <div className={styles.slotOuter} data-hasitem={false}>
        <div className={styles.slot} data-state="Unavailable">
          {svg}
        </div>
      </div>
    );
  }

  if (esiItem !== undefined) {
    if (esiItem.charge !== undefined) {
      item = (
        <img
          src={`https://images.evetech.net/types/${esiItem.charge.type_id}/icon?size=64`}
          title={`${eveData?.typeIDs?.[esiItem.type_id].name}\n${eveData?.typeIDs?.[esiItem.charge.type_id].name}`}
        />
      );
    } else {
      item = (
        <img
          src={`https://images.evetech.net/types/${esiItem.type_id}/icon?size=64`}
          title={eveData?.typeIDs?.[esiItem.type_id].name}
        />
      );
    }
  } else {
    imageStyle = styles.slotImagePlaceholder;

    let icon: IconName | undefined;
    switch (props.type) {
      case "lowslot":
        icon = "fitting-lowslot";
        break;

      case "medslot":
        icon = "fitting-medslot";
        break;

      case "hislot":
        icon = "fitting-hislot";
        break;

      case "rig":
        icon = "fitting-rig-subsystem";
        break;
    }

    if (icon !== undefined) {
      item = <Icon name={icon} />;
    }
  }

  const state = esiItem?.state === "Passive" && esiItem?.max_state !== "Passive" ? "Offline" : esiItem?.state;

  return (
    <div className={styles.slotOuter} data-hasitem={esiItem !== undefined}>
      <div className={styles.slot} onClick={cycleState} data-state={state}>
        {svg}
        <div className={imageStyle}>{item}</div>
      </div>
      <div className={styles.slotOptions}>
        {esiItem?.charge !== undefined && (
          <svg viewBox="0 0 20 20" width={20} xmlns="http://www.w3.org/2000/svg" onClick={unfitCharge}>
            <use href="#uncharge" />
          </svg>
        )}
        <svg viewBox="0 0 20 20" width={20} xmlns="http://www.w3.org/2000/svg" onClick={unfitModule}>
          <use href="#unfit" />
        </svg>
        {esiItem?.max_state !== "Passive" && (
          <svg viewBox="0 0 20 20" width={20} xmlns="http://www.w3.org/2000/svg" onClick={offlineState}>
            <use href="#offline" />
          </svg>
        )}
      </div>
    </div>
  );
};
