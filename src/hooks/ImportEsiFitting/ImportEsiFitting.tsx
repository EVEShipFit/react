import React from "react";

import { EsfCargo, EsfDrone, EsfFit, EsfModule } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { esiFlagToEsfSlot } from "@/hooks/ImportEveShipFitHash";
import { useCleanImportFit } from "@/hooks/CleanImportFit";

export interface EsiFit {
  name: string;
  description: string;
  ship_type_id: number;
  items: {
    item_id: number;
    type_id: number;
    flag: number;
    quantity: number;
  }[];
}

/**
 * Convert an ESI Fitting JSON to an ESF Fit.
 */
export function useImportEsiFitting() {
  const eveData = useEveData();
  const cleanImportFit = useCleanImportFit();

  return (esiFit: EsiFit): EsfFit | null => {
    if (eveData === null) return null;

    const modules = esiFit.items
      .map((item): EsfModule | undefined => {
        const slot = esiFlagToEsfSlot[item.flag];
        if (slot === undefined) return undefined;

        return {
          typeId: item.type_id,
          slot,
          state: "Active",
        };
      })
      .filter((item): item is EsfModule => item !== undefined);

    const drones = esiFit.items
      .map((item): EsfDrone | undefined => {
        if (item.flag !== 87) return undefined;

        return {
          typeId: item.type_id,
          states: {
            Active: item.quantity,
            Passive: 0,
          },
        };
      })
      .filter((item): item is EsfDrone => item !== undefined);

    const cargo = esiFit.items
      .map((item): EsfCargo | undefined => {
        if (item.flag !== 5) return undefined;

        return {
          typeId: item.type_id,
          quantity: item.quantity,
        };
      })
      .filter((item): item is EsfCargo => item !== undefined);

    const fit: EsfFit = cleanImportFit({
      name: esiFit.name,
      description: esiFit.description,
      shipTypeId: esiFit.ship_type_id,
      modules,
      drones,
      cargo,
    });

    return fit;
  };
}

export interface FormatEftToEsiProps {
  /** The ESI Fitting JSON. */
  esiFit: EsiFit;
}

/**
 * `useImportEsiFitting` converts an ESI Fitting JSON to an ESF fit.
 *
 * Note: do not use this React component itself, but the `useImportEsiFitting` React hook instead.
 */
export const ImportEsiFitting = (props: FormatEftToEsiProps) => {
  const importEsiFitting = useImportEsiFitting();

  if (props.esiFit === undefined) {
    return <div>No fit selected.</div>;
  }

  const fit = importEsiFitting(props.esiFit);
  return <pre>{JSON.stringify(fit, null, 2)}</pre>;
};
