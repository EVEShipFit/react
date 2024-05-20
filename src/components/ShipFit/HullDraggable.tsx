import React from "react";

import { useFitManager } from "@/providers/FitManagerProvider";
import { StatisticsSlotType } from "@/providers/StatisticsProvider";

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

      const draggedTypeId: number | undefined = parseNumber(e.dataTransfer.getData("application/type_id"));
      const draggedSlotId: number | undefined = parseNumber(e.dataTransfer.getData("application/slot_id"));
      const draggedSlotType: StatisticsSlotType | "droneBay" | "charge" = e.dataTransfer.getData(
        "application/slot_type",
      ) as StatisticsSlotType | "droneBay" | "charge";

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
