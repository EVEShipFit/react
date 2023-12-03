import React from "react";

import { DogmaEngineContext } from '../DogmaEngineProvider';

export interface ShipSnapshotItemAttributeEffect {
  operator: string,
  penalty: boolean,
  source: "Ship" | { Item: number },
  source_category: string,
  source_attribute_id: number,
};

export interface ShipSnapshotItemAttribute {
  base_value: number,
  value: number,
  effects: ShipSnapshotItemAttributeEffect[],
};

export interface ShipSnapshotItem {
  type_id: number,
  quantity: number,
  flag: number,
  state: string,
  max_state: string,
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
    state?: string;
  }[];
}

interface ShipSnapshot {
  loaded?: boolean;
  hull?: ShipSnapshotItem;
  items?: ShipSnapshotItem[];

  fit?: EsiFit;

  changeHull: (typeId: number) => void;
  changeFit: (fit: EsiFit) => void;
  setItemState: (flag: number, state: string) => void;
}

export const ShipSnapshotContext = React.createContext<ShipSnapshot>({
  loaded: undefined,
  changeHull: () => {},
  changeFit: () => {},
  setItemState: () => {},
});

export interface ShipSnapshotProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
  /** A ship fit in ESI representation. */
  fit: EsiFit;
  /** A list of skills to apply to the fit: {skill_id: skill_level}. */
  skills: Record<string, number>;
}

/**
 * Calculates the current attrbitues and applied effects of a ship fit.
 */
export const ShipSnapshotProvider = (props: ShipSnapshotProps) => {
  const [shipSnapshot, setShipSnapshot] = React.useState<ShipSnapshot>({
    loaded: undefined,
    changeHull: () => {},
    changeFit: () => {},
    setItemState: () => {},
  });
  const [currentFit, setCurrentFit] = React.useState<EsiFit | undefined>(undefined);
  const dogmaEngine = React.useContext(DogmaEngineContext);

  const setItemState = React.useCallback((flag: number, state: string) => {
    if (!currentFit) return;

    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (!oldFit) return oldFit;

      return {
        ...oldFit,
        items: oldFit?.items?.map((item) => {
          if (item.flag === flag) {
            return {
              ...item,
              state: state,
            };
          }

          return item;
        }),
      };
    })
  }, [currentFit]);

  const changeHull = React.useCallback((typeId: number) => {
    setCurrentFit({
      "name": "New Ship",
      "description": "",
      "ship_type_id": typeId,
      "items": []
    })
  }, []);

  React.useEffect(() => {
    if (!dogmaEngine.loaded) return;
    if (!currentFit || !props.skills) return;

    const snapshot = dogmaEngine.engine?.calculate(currentFit, props.skills);

    setShipSnapshot({
      loaded: true,
      hull: snapshot.hull,
      items: snapshot.items,
      fit: currentFit,
      changeHull,
      changeFit: setCurrentFit,
      setItemState,
    });
  }, [dogmaEngine, currentFit, props.skills, changeHull, setItemState]);

  React.useEffect(() => {
    setCurrentFit(props.fit);
  }, [props.fit]);

  return <ShipSnapshotContext.Provider value={shipSnapshot}>
    {props.children}
  </ShipSnapshotContext.Provider>
};
