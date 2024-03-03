import React from "react";

import { DogmaEngineContext } from "../DogmaEngineProvider";
import { EveDataContext } from "../EveDataProvider";

export interface ShipSnapshotItemAttributeEffect {
  operator: string;
  penalty: boolean;
  source: "Ship" | { Item: number };
  source_category: string;
  source_attribute_id: number;
}

export interface ShipSnapshotItemAttribute {
  base_value: number;
  value: number;
  effects: ShipSnapshotItemAttributeEffect[];
}

export interface ShipSnapshotItem {
  type_id: number;
  quantity: number;
  flag: number;
  state: "Passive" | "Online" | "Active" | "Overload";
  max_state: "Passive" | "Online" | "Active" | "Overload";
  attributes: Map<number, ShipSnapshotItemAttribute>;
  effects: number[];
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

interface ShipSnapshotSlots {
  hislot: number;
  medslot: number;
  lowslot: number;
  subsystem: number;
  rig: number;
}

export type ShipSnapshotSlotsType = keyof ShipSnapshotSlots;

interface ShipSnapshot {
  loaded?: boolean;
  hull?: ShipSnapshotItem;
  items?: ShipSnapshotItem[];
  slots: ShipSnapshotSlots;

  fit?: EsiFit;

  addModule: (typeId: number, slot: ShipSnapshotSlotsType | "dronebay") => void;
  removeModule: (flag: number) => void;
  changeHull: (typeId: number) => void;
  changeFit: (fit: EsiFit) => void;
  setItemState: (flag: number, state: string) => void;
  setName: (name: string) => void;
}

export const ShipSnapshotContext = React.createContext<ShipSnapshot>({
  loaded: undefined,
  slots: {
    hislot: 0,
    medslot: 0,
    lowslot: 0,
    subsystem: 0,
    rig: 0,
  },
  addModule: () => {},
  removeModule: () => {},
  changeHull: () => {},
  changeFit: () => {},
  setItemState: () => {},
  setName: () => {},
});

const slotStart: Record<ShipSnapshotSlotsType, number> = {
  hislot: 27,
  medslot: 19,
  lowslot: 11,
  subsystem: 125,
  rig: 92,
};

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
  const eveData = React.useContext(EveDataContext);
  const [shipSnapshot, setShipSnapshot] = React.useState<ShipSnapshot>({
    loaded: undefined,
    slots: {
      hislot: 0,
      medslot: 0,
      lowslot: 0,
      subsystem: 0,
      rig: 0,
    },
    addModule: () => {},
    removeModule: () => {},
    changeHull: () => {},
    changeFit: () => {},
    setItemState: () => {},
    setName: () => {},
  });
  const [currentFit, setCurrentFit] = React.useState<EsiFit | undefined>(undefined);
  const dogmaEngine = React.useContext(DogmaEngineContext);

  const setItemState = React.useCallback((flag: number, state: string) => {
    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (oldFit === undefined) return undefined;

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
    });
  }, []);

  const setName = React.useCallback((name: string) => {
    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (oldFit === undefined) return undefined;

      return {
        ...oldFit,
        name: name,
      };
    });
  }, []);

  const addModule = React.useCallback(
    (typeId: number, slot: ShipSnapshotSlotsType | "dronebay") => {
      setCurrentFit((oldFit: EsiFit | undefined) => {
        if (oldFit === undefined) return undefined;

        let flag = 0;

        /* Find the first free slot for that slot-type. */
        if (slot !== "dronebay") {
          for (let i = slotStart[slot]; i < slotStart[slot] + shipSnapshot.slots[slot]; i++) {
            if (oldFit.items.find((item) => item.flag === i) !== undefined) continue;

            flag = i;
            break;
          }
        } else {
          flag = 87;
        }

        /* Couldn't find a free slot. */
        if (flag === 0) return oldFit;

        return {
          ...oldFit,
          items: [
            ...oldFit.items,
            {
              flag: flag,
              type_id: typeId,
              quantity: 1,
            },
          ],
        };
      });
    },
    [shipSnapshot.slots],
  );

  const removeModule = React.useCallback((flag: number) => {
    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (oldFit === undefined) return undefined;

      return {
        ...oldFit,
        items: oldFit.items.filter((item) => item.flag !== flag),
      };
    });
  }, []);

  const changeHull = React.useCallback(
    (typeId: number) => {
      const hullName = eveData?.typeIDs?.[typeId].name;

      setCurrentFit({
        name: `New ${hullName}`,
        description: "",
        ship_type_id: typeId,
        items: [],
      });
    },
    [eveData],
  );

  React.useEffect(() => {
    setShipSnapshot((oldSnapshot) => ({
      ...oldSnapshot,
      addModule,
      removeModule,
      changeHull,
      changeFit: setCurrentFit,
      setItemState,
      setName,
    }));
  }, [addModule, removeModule, changeHull, setItemState, setName]);

  React.useEffect(() => {
    if (!dogmaEngine.loaded) return;
    if (currentFit === undefined || props.skills === undefined) return;

    const snapshot = dogmaEngine.engine?.calculate(currentFit, props.skills);

    const slots = {
      hislot: 0,
      medslot: 0,
      lowslot: 0,
      subsystem: 0,
      rig: 0,
    };

    slots.hislot = snapshot.hull.attributes.get(eveData?.attributeMapping?.hiSlots || 0)?.value || 0;
    slots.medslot = snapshot.hull.attributes.get(eveData?.attributeMapping?.medSlots || 0)?.value || 0;
    slots.lowslot = snapshot.hull.attributes.get(eveData?.attributeMapping?.lowSlots || 0)?.value || 0;
    slots.subsystem = snapshot.hull.attributes.get(eveData?.attributeMapping?.maxSubSystems || 0)?.value || 0;
    slots.rig = snapshot.hull?.attributes.get(eveData?.attributeMapping?.rigSlots || 0)?.value || 0;

    const items = snapshot.items;
    for (const item of items) {
      slots.hislot += item.attributes.get(eveData?.attributeMapping?.hiSlotModifier || 0)?.value || 0;
      slots.medslot += item.attributes.get(eveData?.attributeMapping?.medSlotModifier || 0)?.value || 0;
      slots.lowslot += item.attributes.get(eveData?.attributeMapping?.lowSlotModifier || 0)?.value || 0;
    }

    setShipSnapshot((oldSnapshot) => {
      return {
        ...oldSnapshot,
        loaded: true,
        hull: snapshot.hull,
        items: snapshot.items,
        slots,
        fit: currentFit,
      };
    });
  }, [eveData, dogmaEngine, currentFit, props.skills]);

  React.useEffect(() => {
    setCurrentFit(props.fit);
  }, [props.fit]);

  return <ShipSnapshotContext.Provider value={shipSnapshot}>{props.children}</ShipSnapshotContext.Provider>;
};
