import React from "react";

import { EsfSlotType, useCurrentFit } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { useStatistics } from "@/providers/StatisticsProvider";

/** Mapping between slot-type and the EFT string name. */
const slotToEft: Record<EsfSlotType, string> = {
  Low: "Low Slot",
  Medium: "Med Slot",
  High: "High Slot",
  Rig: "Rig Slot",
  SubSystem: "Subsystem Slot",
};

/**
 * Convert current fit to an EFT string.
 */
export function useExportEft() {
  const eveData = useEveData();
  const currentFit = useCurrentFit();
  const statistics = useStatistics();

  return (): string | null => {
    const fit = currentFit.currentFit;

    if (eveData === null || fit === null || statistics === null) return null;

    let eft = "";

    const shipType = eveData.types[fit.shipTypeId];
    if (shipType === undefined) return null;

    eft += `[${shipType.name}, ${fit.name}]\n`;

    for (const slotType of ["High", "Medium", "Low", "Rig", "SubSystem"] as EsfSlotType[]) {
      for (let i = 1; i <= statistics.slots[slotType]; i++) {
        const module = fit.modules.find((item) => item.slot.type === slotType && item.slot.index === i);
        if (module === undefined) {
          eft += "[Empty " + slotToEft[slotType] + "]\n";
          continue;
        }

        const moduleType = eveData.types[module.typeId];
        if (moduleType === undefined) {
          eft += "[Empty " + slotToEft[slotType] + "]\n";
          continue;
        }

        eft += moduleType.name;
        if (module.charge !== undefined) {
          const chargeType = eveData.types[module.charge.typeId];
          if (chargeType !== undefined) {
            eft += `, ${chargeType.name}`;
          }
        }
        eft += "\n";
      }

      eft += "\n";
    }

    /* Add an "end-of-modules" marker by having two newlines. */
    eft += "\n";

    for (const drone of fit.drones) {
      const droneType = eveData.types[drone.typeId];
      if (droneType === undefined) continue;

      eft += droneType.name;
      if (drone.states.Active > 1) {
        eft += ` x${drone.states.Active + drone.states.Passive}`;
      }
      eft += "\n";
    }
    eft += "\n";

    for (const cargo of fit.cargo) {
      const cargoType = eveData.types[cargo.typeId];
      if (cargoType === undefined) continue;

      eft += `${cargoType.name} x${cargo.quantity}`;
      eft += "\n";
    }
    eft += "\n";

    return eft.trim() + "\n";
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
