import React from "react";

import { EsfFit } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";

/** Mapping between slot types and ESI flags (for first slot in the type). */
const esiFlagMapping: Record<string, number[]> = {
  lowslot: [11, 12, 13, 14, 15, 16, 17, 18],
  medslot: [19, 20, 21, 22, 23, 24, 25, 26],
  hislot: [27, 28, 29, 30, 31, 32, 33, 34],
  rig: [92, 93, 94],
  subsystem: [125, 126, 127, 128],
};

/** Mapping between dogma effect IDs and slot types. */
const effectIdMapping: Record<number, string> = {
  11: "lowslot",
  13: "medslot",
  12: "hislot",
  2663: "rig",
  3772: "subsystem",
};
const attributeIdMapping: Record<number, string> = {
  1272: "droneBay",
};

/**
 * Convert an EFT string to an ESF Fit.
 */
export function useImportEft() {
  const eveData = useEveData();

  return (eft: string): EsfFit | null => {
    if (eveData === null) return null;

    function lookupTypeByName(name: string): number | undefined {
      if (eveData === null) return undefined;

      for (const typeId in eveData.typeIDs) {
        const type = eveData.typeIDs[typeId];

        if (type.name === name) {
          return parseInt(typeId);
        }
      }

      return undefined;
    }

    const fit: EsfFit = {
      name: "EFT Import",
      description: "",
      ship_type_id: 0,
      items: [],
    };

    const lines = eft.trim().split("\n");

    if (!lines[0].startsWith("[")) return null;
    if (!lines[0].endsWith("]")) return null;

    const shipType = lines[0].split(",")[0].slice(1);
    const shipTypeId = lookupTypeByName(shipType);
    if (shipTypeId === undefined) throw new Error(`Unknown ship '${shipType}'.`);

    fit.ship_type_id = shipTypeId;
    fit.name = lines[0].split(",")[1].slice(0, -1).trim();

    const slotIndex: Record<string, number> = {
      lowslot: 0,
      medslot: 0,
      hislot: 0,
      rig: 0,
      subsystem: 0,
      droneBay: 0,
    };

    let lastSlotType = "";
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
        if (lastSlotType != "") {
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
      let slotType = undefined;
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

      const flag = slotType === "droneBay" ? 87 : esiFlagMapping[slotType][slotIndex[slotType]];
      let charge = undefined;
      if (chargeTypeId !== undefined) {
        charge = {
          type_id: chargeTypeId,
        };
      }

      fit.items.push({
        flag,
        quantity: itemCount,
        type_id: itemTypeId,
        charge,
      });
      slotIndex[slotType]++;
    }

    return fit;
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
