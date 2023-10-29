import React from "react";

import { EveDataContext } from '../EveDataProvider';
import { EsiFit } from "../ShipSnapshotProvider";

/** Mapping between slot types and ESI flags (for first slot in the type). */
const EsiFlagMapping: Record<string, number> = {
  "low": 11,
  "med": 19,
  "high": 27,
  "rig": 92,
  "sub": 125,
};

/** Mapping between dogma effect IDs and slot types. */
const EffectIdMapping: Record<number, string> = {
  11: "low",
  13: "med",
  12: "high",
  2663: "rig",
  3772: "sub",
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
      "low": 0,
      "med": 0,
      "high": 0,
      "rig": 0,
      "sub": 0,
    };

    let lastSlotType = "";
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === "") continue;

      if (line.startsWith("[Empty ")) {
        if (lastSlotType != "") {
          slotIndex[lastSlotType]++;
        }
        continue;
      }

      const itemType = line.split(",")[0].trim();
      const itemTypeId = lookupTypeByName(itemType);
      if (itemTypeId === undefined) throw new Error(`Unknown item '${itemType}'.`);

      const effects = eveData.typeDogma?.[itemTypeId]?.dogmaEffects;
      if (effects === undefined) throw new Error(`No dogma defined for item '${itemType}'.`);

      /* Find what type of slot this item goes into. */
      let slotType = "";
      for (const effectId in effects) {
        slotType = EffectIdMapping[effects[effectId].effectID];
        if (slotType) break;
      }
      lastSlotType = slotType;

      /* Ignore items we don't care about. */
      if (slotType === "") continue;

      esiFit.items.push({"flag": EsiFlagMapping[slotType] + slotIndex[slotType], "quantity": 1, "type_id": itemTypeId});
      slotIndex[slotType]++;
    }

    return esiFit;
  };
};

export interface FormatEftToEsiProps {
  /** The EFT string. */
  eft: string;
}

/**
 * Use useFormatEftToEsi() instead of this component.
 */
export const FormatEftToEsi = (props: FormatEftToEsiProps) => {
  const esiFit = useFormatEftToEsi();

  return <pre>{JSON.stringify(esiFit(props.eft), null, 2)}</pre>
};
