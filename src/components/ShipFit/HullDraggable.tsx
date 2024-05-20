import React from "react";

import { useFitManager } from "@/providers/FitManagerProvider";
import { CalculationSlotType } from "@/providers/DogmaEngineProvider";

import styles from "./ShipFit.module.css";

export const HullDraggable = () => {
  const fitManager = useFitManager();

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
      const draggedSlotId: number | undefined = parseNumber(e.dataTransfer.getData("application/esf-slot-index"));
      const draggedSlotType: CalculationSlotType = e.dataTransfer.getData(
        "application/esf-slot-type",
      ) as CalculationSlotType;

      if (draggedTypeId === undefined) {
        return;
      }
      /* Dragging a fitted module to the middle has no effect. */
      if (draggedSlotId !== undefined) {
        return;
      }

      fitManager.addItem(draggedTypeId, draggedSlotType);
    },
    [fitManager],
  );

  return <div className={styles.hullDraggable} onDragOver={onDragOver} onDrop={onDragEnd} />;
};
