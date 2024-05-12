import React from "react";

import { EveDataContext } from "../EveDataProvider";
import { EsiFit } from "../ShipSnapshotProvider";

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
 * Convert an EFT string to an ESI JSON object.
 */
export function useFormatEftToEsi() {
  const eveData = React.useContext(EveDataContext);

  return (eft: string): EsiFit | undefined => {
    if (!eveData?.loaded) return undefined;

    function lookupTypeByName(name: string): number | undefined {
      for (const typeId in eveData.typeIDs) {
        const type = eveData.typeIDs[typeId];

        if (type.name === name) {
          return parseInt(typeId);
        }
      }

      return undefined;
    }

    const esiFit: EsiFit = {
      name: "EFT Import",
      description: "",
      ship_type_id: 0,
      items: [],
    };

    const lines = eft.trim().split("\n");

    if (!lines[0].startsWith("[")) return undefined;
    if (!lines[0].endsWith("]")) return undefined;

    const shipType = lines[0].split(",")[0].slice(1);
    const shipTypeId = lookupTypeByName(shipType);
    if (shipTypeId === undefined) throw new Error(`Unknown ship '${shipType}'.`);

    esiFit.ship_type_id = shipTypeId;
    esiFit.name = lines[0].split(",")[1].slice(0, -1).trim();

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

      const effects = eveData.typeDogma?.[itemTypeId]?.dogmaEffects;
      if (effects === undefined) throw new Error(`No dogma effects defined for item '${itemType}'.`);
      const attributes = eveData.typeDogma?.[itemTypeId]?.dogmaAttributes;
      if (attributes === undefined) throw new Error(`No dogma attributes defined for item '${itemType}'.`);

      /* Find what type of slot this item goes into. */
      let slotType = "";
      for (const effectId in effects) {
        slotType = effectIdMapping[effects[effectId].effectID];
        if (slotType) break;
      }
      if (!slotType) {
        for (const attributeId in attributes) {
          slotType = attributeIdMapping[attributes[attributeId].attributeID];
          if (slotType) break;
        }
      }
      lastSlotType = slotType;

      /* Ignore items we don't care about. */
      if (!slotType) continue;

      const flag = slotType === "droneBay" ? 87 : esiFlagMapping[slotType][slotIndex[slotType]];
      let charge = undefined;
      if (chargeTypeId !== undefined) {
        charge = {
          type_id: chargeTypeId,
        };
      }

      esiFit.items.push({
        flag,
        quantity: itemCount,
        type_id: itemTypeId,
        charge,
      });
      slotIndex[slotType]++;
    }

    return esiFit;
  };
}

export interface FormatEftToEsiProps {
  /** The EFT string. */
  eft: string;
}

/**
 * useFormatEftToEsi() converts an EFT string to an ESI JSON object.
 *
 * Note: do not use this React component itself, but the useFormatEftToEsi() React hook instead.
 */
export const FormatEftToEsi = (props: FormatEftToEsiProps) => {
  const esiFit = useFormatEftToEsi();

  return <pre>{JSON.stringify(esiFit(props.eft), null, 2)}</pre>;
};
