import React from "react";

import { EveDataContext } from "../EveDataProvider";
import { ShipSnapshotContext, ShipSnapshotSlotsType } from "../ShipSnapshotProvider";

/** Mapping between slot types and ESI flags (for first slot in the type). */
const esiFlagMapping: Record<ShipSnapshotSlotsType, number[]> = {
  lowslot: [11, 12, 13, 14, 15, 16, 17, 18],
  medslot: [19, 20, 21, 22, 23, 24, 25, 26],
  hislot: [27, 28, 29, 30, 31, 32, 33, 34],
  rig: [92, 93, 94],
  subsystem: [125, 126, 127, 128],
};

/** Mapping between slot-type and the EFT string name. */
const slotToEft: Record<ShipSnapshotSlotsType, string> = {
  lowslot: "Low Slot",
  medslot: "Mid Slot",
  hislot: "High Slot",
  rig: "Rig Slot",
  subsystem: "Subsystem Slot",
};

/**
 * Convert current fit to an EFT string.
 */
export function useFormatAsEft() {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  return (): string | undefined => {
    if (!eveData?.loaded) return undefined;
    if (!shipSnapshot?.loaded || shipSnapshot.currentFit == undefined) return undefined;

    let eft = "";

    const shipType = eveData.typeIDs?.[shipSnapshot.currentFit.ship_type_id];
    if (!shipType) return undefined;

    eft += `[${shipType.name}, ${shipSnapshot.currentFit.name}]\n`;

    for (const slotType of Object.keys(esiFlagMapping) as ShipSnapshotSlotsType[]) {
      let index = 1;

      for (const flag of esiFlagMapping[slotType]) {
        if (index > shipSnapshot.slots[slotType]) break;
        index += 1;

        const module = shipSnapshot.currentFit.items.find((item) => item.flag === flag);
        if (module === undefined) {
          eft += "[Empty " + slotToEft[slotType] + "]\n";
          continue;
        }

        const moduleType = eveData.typeIDs?.[module.type_id];
        if (moduleType === undefined) {
          eft += "[Empty " + slotToEft[slotType] + "]\n";
          continue;
        }

        eft += `${moduleType.name}\n`;
      }

      eft += "\n";
    }

    return eft;
  };
}

/**
 * useFormatAsEft() converts the current fit to an EFT string.
 *
 * Note: do not use this React component itself, but the useFormatAsEft() React hook instead.
 */
export const FormatAsEft = () => {
  const toEft = useFormatAsEft();

  return <pre>{toEft()}</pre>;
};
