import React from "react";

import { EsfFit, EsfSlotType } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { useCleanImportFit } from "@/hooks/CleanImportFit";

/** Mapping between dogma effect IDs and slot types. */
const effectIdMapping: Record<number, EsfSlotType | "DroneBay"> = {
  11: "Low",
  13: "Medium",
  12: "High",
  2663: "Rig",
  3772: "SubSystem",
};
const attributeIdMapping: Record<number, EsfSlotType | "DroneBay"> = {
  1272: "DroneBay",
};

/**
 * Convert an EFT string to an ESF Fit.
 */
export function useImportEft() {
  const eveData = useEveData();
  const cleanImportFit = useCleanImportFit();

  return (eft: string): EsfFit | null => {
    if (eveData === null) return null;

    function lookupTypeByName(name: string): number | undefined {
      for (const typeId in eveData?.typeIDs) {
        const type = eveData.typeIDs[typeId];

        if (type.name === name) {
          return parseInt(typeId);
        }
      }

      return undefined;
    }

    const fit: EsfFit = {
      shipTypeId: 0,
      name: "EFT Import",
      description: "",
      modules: [],
      drones: [],
      cargo: [],
    };

    const lines = eft.trim().split("\n");

    if (!lines[0].startsWith("[")) return null;
    if (!lines[0].endsWith("]")) return null;

    const shipType = lines[0].split(",")[0].slice(1);
    const shipTypeId = lookupTypeByName(shipType);
    if (shipTypeId === undefined) throw new Error(`Unknown ship '${shipType}'.`);

    fit.shipTypeId = shipTypeId;
    fit.name = lines[0].split(",")[1].slice(0, -1).trim();

    const slotIndex: Record<EsfSlotType, number> = {
      Low: 1,
      Medium: 1,
      High: 1,
      Rig: 1,
      SubSystem: 1,
    };

    let lastSlotType: EsfSlotType | "DroneBay" | undefined = undefined;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "") continue;

      /* Format is either of these:
       * - [Empty ...]
       * - <module>
       * - <module> [<mutation-index>]
       * - <module>, <charge>
       * - <item> x<quantity>
       * - [<mutation-index>] <module> followed with indented lines with mutated information.
       */

      if (line.startsWith("[") || line.startsWith("  ")) {
        if (lastSlotType !== undefined && lastSlotType !== "DroneBay") {
          slotIndex[lastSlotType]++;
        }
        continue;
      }

      const itemType = line.split(",")[0].split(" x")[0].split("[")[0].trim();
      const itemCount = parseInt(line.split(",")[0].split(" x")[1]?.trim() ?? "1");
      const itemTypeId = lookupTypeByName(itemType);
      /* This can be a typo in the EFT, a field we don't know yet, or our eveData is incomplete.
       * Either way, there is not much we can do, then to skip, and hope that is fine. */
      if (itemTypeId === undefined) continue;

      const chargeType = (line.split(",")[1] ?? "").trim();
      const chargeTypeId = lookupTypeByName(chargeType);

      const effects = eveData.typeDogma[itemTypeId]?.dogmaEffects;
      const attributes = eveData.typeDogma[itemTypeId]?.dogmaAttributes;

      /* Find what type of slot this item goes into. */
      let slotType: EsfSlotType | "DroneBay" | undefined = undefined;
      if (slotType === undefined && effects !== undefined) {
        for (const effectId in effects) {
          slotType = effectIdMapping[effects[effectId].effectID];
          if (slotType) break;
        }
      }
      if (slotType === undefined && attributes !== undefined) {
        for (const attributeId in attributes) {
          slotType = attributeIdMapping[attributes[attributeId].attributeID];
          if (slotType) break;
        }
      }

      /* Ignore items we don't care about. */
      if (slotType === undefined) continue;
      lastSlotType = slotType;

      let charge = undefined;
      if (chargeTypeId !== undefined) {
        charge = {
          typeId: chargeTypeId,
        };
      }

      if (slotType === "DroneBay") {
        fit.drones.push({
          typeId: itemTypeId,
          states: {
            Active: itemCount,
            Passive: 0,
          },
        });
        continue;
      }

      fit.modules.push({
        slot: {
          type: slotType,
          index: slotIndex[slotType],
        },
        typeId: itemTypeId,
        state: "Active",
        charge,
      });
      slotIndex[slotType]++;
    }

    return cleanImportFit(fit);
  };
}

export interface FormatEftToEsiProps {
  /** The EFT string. */
  eft: string;
}

/**
 * `useImportEft` converts an EFT string to an ESF fit.
 *
 * Note: do not use this React component itself, but the `useImportEft` React hook instead.
 */
export const ImportEft = (props: FormatEftToEsiProps) => {
  const importEft = useImportEft();

  try {
    const fit = importEft(props.eft);
    return <pre>{JSON.stringify(fit, null, 2)}</pre>;
  } catch (e: unknown) {
    return <pre>Failed to import EFT fit: {(e as Error).message}</pre>;
  }
};
