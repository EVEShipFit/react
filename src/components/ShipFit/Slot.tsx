import clsx from "clsx";
import React from "react";

import { Icon, IconName } from "@/components/Icon";
import { useEveData } from "@/providers/EveDataProvider";
import { useStatistics } from "@/providers/StatisticsProvider";
import { useFitManager } from "@/providers/FitManagerProvider";
import { CalculationSlot } from "@/providers/DogmaEngineProvider";
import { EsfSlot, EsfSlotType, EsfState, useCurrentFit } from "@/providers/CurrentFitProvider";

import styles from "./ShipFit.module.css";

const stateRotation: Record<string, EsfState[]> = {
  Passive: ["Passive"],
  Online: ["Passive", "Online"],
  Active: ["Passive", "Online", "Active"],
  Overload: ["Passive", "Online", "Active", "Overload"],
};

export const Slot = (props: { type: EsfSlotType; index: number; fittable: boolean; main?: boolean }) => {
  const eveData = useEveData();
  const statistics = useStatistics();
  const fitManager = useFitManager();
  const currentFit = useCurrentFit();

  const module = statistics?.items.find((item) => item.slot.type === props.type && item.slot.index === props.index);
  const fitModule = currentFit?.fit?.modules.find(
    (item) => item.slot.type === props.type && item.slot.index === props.index,
  );
  const active = module?.max_state !== "Passive" && module?.max_state !== "Online";

  const offlineState = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      e.stopPropagation();

      if (module === undefined) return;

      if (module.state === "Passive") {
        fitManager.setModuleState(module.slot as EsfSlot, "Online");
      } else {
        fitManager.setModuleState(module.slot as EsfSlot, "Passive");
      }
    },
    [fitManager, module],
  );

  const cycleState = React.useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (module === undefined) return;

      const states = stateRotation[module.max_state];
      const stateIndex = states.indexOf(module.state as EsfState);

      let newState;
      if (e.shiftKey) {
        newState = states[(stateIndex - 1 + states.length) % states.length];
      } else {
        newState = states[(stateIndex + 1) % states.length];
      }

      fitManager.setModuleState(module.slot as EsfSlot, newState);
    },
    [fitManager, module],
  );

  const unfitModule = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      e.stopPropagation();

      if (module === undefined) return;

      fitManager.removeModule(module.slot as EsfSlot);
    },
    [fitManager, module],
  );

  const unfitCharge = React.useCallback(
    (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      e.stopPropagation();
      if (module === undefined) return;

      fitManager.removeCharge(module.slot as EsfSlot);
    },
    [fitManager, module],
  );

  const onDragStart = React.useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (module === undefined) return;

      e.dataTransfer.setData("application/esf-type-id", module.type_id.toString());
      e.dataTransfer.setData("application/esf-slot-type", module.slot.type);
      e.dataTransfer.setData("application/esf-slot-index", module.slot.index?.toString() ?? "");
    },
    [module],
  );

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
      const draggedSlotIndex: CalculationSlot["index"] = parseNumber(
        e.dataTransfer.getData("application/esf-slot-index"),
      );
      const draggedSlotType: CalculationSlot["type"] = e.dataTransfer.getData(
        "application/esf-slot-type",
      ) as CalculationSlot["type"];

      if (draggedTypeId === undefined || draggedSlotType === "DroneBay") {
        return;
      }

      if (draggedSlotType === "Charge") {
        fitManager.setCharge({ type: props.type, index: props.index }, draggedTypeId);
        return;
      }

      const isValidSlotGroup = draggedSlotType === props.type;
      if (!isValidSlotGroup) {
        return;
      }

      const isDraggedFromAnotherSlot = draggedSlotIndex !== undefined;
      if (isDraggedFromAnotherSlot) {
        fitManager.swapModule(
          { type: props.type, index: props.index },
          { type: draggedSlotType, index: draggedSlotIndex },
        );
      } else {
        fitManager.setModule({ type: props.type, index: props.index }, draggedTypeId);
      }
    },
    [fitManager, props],
  );

  if (eveData === null || statistics === null) return <></>;

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
        {props.fittable && fitModule?.state !== "Preview" && module !== undefined && active && (
          <use href="#slot-active" />
        )}
        {props.fittable && fitModule?.state !== "Preview" && module !== undefined && !active && (
          <use href="#slot-passive" />
        )}
      </svg>
    </>
  );

  /* Not fittable and nothing fitted; no need to render the slot. */
  if (module === undefined && !props.fittable) {
    return (
      <div className={styles.slotOuter} data-hasitem={false}>
        <div className={styles.slot} data-state="Unavailable">
          {svg}
        </div>
      </div>
    );
  }

  if (module !== undefined && eveData !== null) {
    if (module.charge !== undefined) {
      item = (
        <img
          src={`https://images.evetech.net/types/${module.charge.type_id}/icon?size=64`}
          title={`${eveData.types[module.type_id].name}\n${eveData.types[module.charge.type_id].name}`}
          draggable={true}
          onDragStart={onDragStart}
        />
      );
    } else {
      item = (
        <img
          src={`https://images.evetech.net/types/${module.type_id}/icon?size=64`}
          title={eveData.types[module.type_id].name}
          draggable={true}
          onDragStart={onDragStart}
          className={clsx({ [styles.preview]: fitModule?.state === "Preview" })}
        />
      );
    }
  } else {
    imageStyle = styles.slotImagePlaceholder;

    let icon: IconName | undefined;
    switch (props.type) {
      case "Low":
        icon = "fitting-lowslot";
        break;

      case "Medium":
        icon = "fitting-medslot";
        break;

      case "High":
        icon = "fitting-hislot";
        break;

      case "Rig":
        icon = "fitting-rig-subsystem";
        break;
    }

    if (icon !== undefined) {
      item = <Icon name={icon} />;
    }
  }

  const state = module?.state === "Passive" && module?.max_state !== "Passive" ? "Offline" : module?.state;

  return (
    <div className={styles.slotOuter} data-hasitem={module !== undefined}>
      <div className={styles.slot} onClick={cycleState} data-state={state} onDrop={onDragEnd} onDragOver={onDragOver}>
        {svg}
        <div className={imageStyle}>{item}</div>
      </div>
      <div className={styles.slotOptions}>
        {module?.charge !== undefined && (
          <svg viewBox="0 0 20 20" width={20} xmlns="http://www.w3.org/2000/svg" onClick={unfitCharge}>
            <title>Remove Charge</title>
            <use href="#uncharge" />
          </svg>
        )}
        <svg viewBox="0 0 20 20" width={20} xmlns="http://www.w3.org/2000/svg" onClick={unfitModule}>
          <title>Unfit Module</title>
          <use href="#unfit" />
        </svg>
        {module?.max_state !== "Passive" && (
          <svg viewBox="0 0 20 20" width={20} xmlns="http://www.w3.org/2000/svg" onClick={offlineState}>
            <title>Put Offline</title>
            <use href="#offline" />
          </svg>
        )}
      </div>
    </div>
  );
};
