import React from "react";

import { ShipSnapshotContext, ShipSnapshotSlotsType } from "@/providers";

import styles from "./ShipFit.module.css";

export const HullDraggable = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);

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
      const draggedSlotType: ShipSnapshotSlotsType | "charge" = e.dataTransfer.getData("application/slot_type") as
        | ShipSnapshotSlotsType
        | "charge";

      if (draggedTypeId === undefined) {
        return;
      }
      /* Dragging a fitted module to the middle has no effect. */
      if (draggedSlotId !== undefined) {
        return;
      }

      if (draggedSlotType === "charge") {
        shipSnapshot.addCharge(draggedTypeId);
        return;
      }

      shipSnapshot.addModule(draggedTypeId, draggedSlotType);
    },
    [shipSnapshot],
  );

  return <div className={styles.hullDraggable} onDragOver={onDragOver} onDrop={onDragEnd} />;
};
