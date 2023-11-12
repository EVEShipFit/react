import React from "react";

import { DogmaEngineContext } from '../DogmaEngineProvider';

export interface ShipSnapshotItemAttribute {
  base_value: number,
  value: number,
  effects: {
    penalty: boolean,
  }[],
};

export interface ShipSnapshotItem {
  type_id: number,
  attributes: Map<number, ShipSnapshotItemAttribute>,
  effects: number[],
}

export interface EsiFit {
  name: string;
  description: string;
  ship_type_id: number;
  items: {
    flag: number;
    type_id: number;
    quantity: number;
  }[];
}

interface ShipSnapshot {
  loaded?: boolean;
  hull?: ShipSnapshotItem;
  items?: ShipSnapshotItem[];

  fit?: EsiFit;
}

export const ShipSnapshotContext = React.createContext<ShipSnapshot>({});

export interface ShipSnapshotProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
  /** A ship fit in ESI representation. */
  fit: EsiFit;
  /** A list of skills to apply to the fit (skill_id, skill_level). */
  skills: Record<number, number>;
}

const EsiFlagMapping = [
  11, 12, 13, 14, 15, 16, 17, 18, // lowslot
  19, 20, 21, 22, 23, 24, 25, 26, // medslot
  27, 28, 29, 30, 31, 32, 33, 34, // hislot
  92, 93, 94, // rig
  125, 126, 127, 128, // subsystem
];

function esiFitToDogmaFit(fit: EsiFit): {
  hull: number,
  items: number[],
} {
  const dogmaFit: {
    hull: number,
    items: number[],
  } = {
    "hull": fit.ship_type_id,
    "items": [],
  }

  for (const item of fit.items) {
    if (EsiFlagMapping.includes(item.flag)) {
      dogmaFit.items.push(item.type_id);
    }
  }

  return dogmaFit;
}

/**
 * Calculates the current attrbitues and applied effects of a ship fit.
 */
export const ShipSnapshotProvider = (props: ShipSnapshotProps) => {
  const [shipSnapshot, setShipSnapshot] = React.useState<ShipSnapshot>({});
  const dogmaEngine = React.useContext(DogmaEngineContext);

  React.useEffect(() => {
    if (!dogmaEngine.loaded) return;
    if (!props.fit || !props.skills) return;

    const dogmaFit = esiFitToDogmaFit(props.fit);
    const snapshot = dogmaEngine.engine?.calculate(dogmaFit, props.skills);

    setShipSnapshot({
      loaded: true,
      hull: snapshot.hull,
      items: snapshot.items,
      fit: props.fit,
    });
  }, [dogmaEngine, props.fit, props.skills]);

  return <ShipSnapshotContext.Provider value={shipSnapshot}>
    {props.children}
  </ShipSnapshotContext.Provider>
};
