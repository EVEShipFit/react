import React from "react";

import { useCurrentFit } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { useStatistics } from "@/providers/StatisticsProvider";

/** Mapping between slot types and ESI flags (for first slot in the type). */
const esiFlagMapping: Record<"hislot" | "medslot" | "lowslot" | "subsystem" | "rig" | "droneBay", number[]> = {
  lowslot: [11, 12, 13, 14, 15, 16, 17, 18],
  medslot: [19, 20, 21, 22, 23, 24, 25, 26],
  hislot: [27, 28, 29, 30, 31, 32, 33, 34],
  rig: [92, 93, 94],
  subsystem: [125, 126, 127, 128],
  droneBay: [87],
};

/** Mapping between slot-type and the EFT string name. */
const slotToEft: Record<"hislot" | "medslot" | "lowslot" | "subsystem" | "rig" | "droneBay", string> = {
  lowslot: "Low Slot",
  medslot: "Mid Slot",
  hislot: "High Slot",
  rig: "Rig Slot",
  subsystem: "Subsystem Slot",
  droneBay: "Drone Bay",
};

/**
 * Convert current fit to an EFT string.
 */
export function useExportEft() {
  const eveData = useEveData();
  const currentFit = useCurrentFit();
  const statistics = useStatistics();

  return (): string | null => {
    const fit = currentFit.fit;

    if (eveData === null || fit === null || statistics === null) return null;

    let eft = "";

    const shipType = eveData.typeIDs[fit.ship_type_id];
    if (shipType === undefined) return null;

    eft += `[${shipType.name}, ${fit.name}]\n`;

    for (const slotType of Object.keys(esiFlagMapping) as (
      | "hislot"
      | "medslot"
      | "lowslot"
      | "subsystem"
      | "rig"
      | "droneBay"
    )[]) {
      let index = 1;

      for (const flag of esiFlagMapping[slotType]) {
        if (slotType !== "droneBay" && index > statistics.slots[slotType]) break;
        index += 1;

        const modules = fit.items.filter((item) => item.flag === flag);
        if (modules === undefined || modules.length === 0) {
          eft += "[Empty " + slotToEft[slotType] + "]\n";
          continue;
        }

        for (const module of modules) {
          const moduleType = eveData.typeIDs[module.type_id];
          if (moduleType === undefined) {
            eft += "[Empty " + slotToEft[slotType] + "]\n";
            continue;
          }

          eft += moduleType.name;
          if (module.quantity > 1) {
            eft += ` x${module.quantity}`;
          }
          if (module.charge !== undefined) {
            const chargeType = eveData.typeIDs[module.charge.type_id];
            if (chargeType !== undefined) {
              eft += `, ${chargeType.name}`;
            }
          }
          eft += "\n";
        }
      }

      eft += "\n";
    }

    return eft;
  };
}

/**
 * `useExportEft` converts the current fit to an EFT string.
 *
 * Note: do not use this React component itself, but the `useExportEft`) React hook instead.
 */
export const ExportEft = () => {
  const exportEft = useExportEft();

  return <pre>{exportEft()}</pre>;
};
