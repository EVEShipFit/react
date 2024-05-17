import React from "react";

import { DogmaEngineContext } from "@/providers/DogmaEngineProvider";
import { EveDataContext } from "@/providers/EveDataProvider";

export interface ShipSnapshotItemAttributeEffect {
  operator: string;
  penalty: boolean;
  source: "Ship" | "Char" | "Structure" | "Target" | { Item?: number; Charge?: number; Skill?: number };
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
  charge: ShipSnapshotItem | undefined;
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
    type_id: number;
    quantity: number;
    flag: number;
    charge?: {
      type_id: number;
    };
    state?: string;
  }[];
}

interface ShipSnapshotSlots {
  hislot: number;
  medslot: number;
  lowslot: number;
  subsystem: number;
  rig: number;
  launcher: number;
  turret: number;
}

export type ShipSnapshotSlotsType = "hislot" | "medslot" | "lowslot" | "subsystem" | "rig" | "droneBay";

interface ShipSnapshot {
  loaded?: boolean;

  hull?: ShipSnapshotItem;
  items?: ShipSnapshotItem[];
  skills?: ShipSnapshotItem[];
  char?: ShipSnapshotItem;
  structure?: ShipSnapshotItem;
  target?: ShipSnapshotItem;

  slots: ShipSnapshotSlots;

  currentFit?: EsiFit;
  currentSkills?: Record<string, number>;

  moveModule: (fromFlag: number, toFlag: number) => void;
  setModule: (typeId: number, flag: number) => void;
  addModule: (typeId: number, slot: ShipSnapshotSlotsType) => void;
  removeModule: (flag: number) => void;
  addCharge: (chargeTypeId: number) => void;
  removeCharge: (flag: number) => void;
  toggleDrones: (typeId: number, active: number) => void;
  removeDrones: (typeId: number) => void;
  changeHull: (typeId: number) => void;
  changeFit: (fit: EsiFit) => void;
  setItemState: (flag: number, state: string) => void;
  setName: (name: string) => void;
  changeSkills: (skills: Record<string, number>) => void;
}

export const ShipSnapshotContext = React.createContext<ShipSnapshot>({
  loaded: undefined,
  slots: {
    hislot: 0,
    medslot: 0,
    lowslot: 0,
    subsystem: 0,
    rig: 0,
    launcher: 0,
    turret: 0,
  },
  moveModule: () => {},
  setModule: () => {},
  addModule: () => {},
  removeModule: () => {},
  addCharge: () => {},
  removeCharge: () => {},
  toggleDrones: () => {},
  removeDrones: () => {},
  changeHull: () => {},
  changeFit: () => {},
  setItemState: () => {},
  setName: () => {},
  changeSkills: () => {},
});

const slotStart: Record<ShipSnapshotSlotsType, number> = {
  hislot: 27,
  medslot: 19,
  lowslot: 11,
  subsystem: 125,
  rig: 92,
  droneBay: 87,
};

export interface ShipSnapshotProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
  /** The initial fit to use. */
  initialFit?: EsiFit;
  /** The initial skills to use. */
  initialSkills?: Record<string, number>;
}

/**
 * Calculates the current attrbitues and applied effects of a ship fit.
 */
export const ShipSnapshotProvider = (props: ShipSnapshotProps) => {
  const eveData = React.useContext(EveDataContext);
  const dogmaEngine = React.useContext(DogmaEngineContext);

  const [currentFit, setCurrentFit] = React.useState<EsiFit | undefined>(props.initialFit);
  const [currentSkills, setCurrentSkills] = React.useState<Record<string, number>>(props.initialSkills ?? {});
  const [shipSnapshot, setShipSnapshot] = React.useState<ShipSnapshot>({
    loaded: undefined,
    slots: {
      hislot: 0,
      medslot: 0,
      lowslot: 0,
      subsystem: 0,
      rig: 0,
      launcher: 0,
      turret: 0,
    },
    moveModule: () => {},
    setModule: () => {},
    addModule: () => {},
    removeModule: () => {},
    addCharge: () => {},
    removeCharge: () => {},
    toggleDrones: () => {},
    removeDrones: () => {},
    changeHull: () => {},
    setItemState: () => {},
    setName: () => {},
    changeFit: setCurrentFit,
    changeSkills: setCurrentSkills,
  });

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

  const moveModule = React.useCallback((fromFlag: number, toFlag: number) => {
    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (oldFit === undefined) return undefined;

      const newItems = [...oldFit.items];

      const fromItemIndex = newItems.findIndex((item) => item.flag === fromFlag);
      const fromItem = newItems[fromItemIndex];

      const toItemIndex = newItems.findIndex((item) => item.flag === toFlag);
      const toItem = newItems[toItemIndex];

      fromItem.flag = toFlag;

      if (toItem !== undefined) {
        /* Target slot is non-empty, swap items. */
        toItem.flag = fromFlag;
      }

      return {
        ...oldFit,
        items: newItems,
      };
    });
  }, []);

  const setModule = React.useCallback((typeId: number, flag: number) => {
    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (oldFit === undefined) return undefined;

      const newItems = oldFit.items
        .filter((item) => item.flag !== flag)
        .concat({ flag: flag, type_id: typeId, quantity: 1 });

      return {
        ...oldFit,
        items: newItems,
      };
    });
  }, []);

  const addModule = React.useCallback(
    (typeId: number, slot: ShipSnapshotSlotsType) => {
      setCurrentFit((oldFit: EsiFit | undefined) => {
        if (oldFit === undefined) return undefined;

        let flag = 0;

        /* Find the first free slot for that slot-type. */
        if (slot !== "droneBay") {
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

  const addCharge = React.useCallback(
    (chargeTypeId: number) => {
      const chargeSize =
        eveData.typeDogma?.[chargeTypeId]?.dogmaAttributes.find(
          (attr) => attr.attributeID === eveData.attributeMapping?.chargeSize,
        )?.value ?? -1;
      const groupID = eveData.typeIDs?.[chargeTypeId]?.groupID ?? -1;

      setCurrentFit((oldFit: EsiFit | undefined) => {
        if (oldFit === undefined) return undefined;

        const newItems = [];

        for (let item of oldFit.items) {
          /* If the module has size restrictions, ensure the charge matches. */
          const moduleChargeSize = eveData.typeDogma?.[item.type_id]?.dogmaAttributes.find(
            (attr) => attr.attributeID === eveData.attributeMapping?.chargeSize,
          )?.value;
          if (moduleChargeSize !== undefined && moduleChargeSize !== chargeSize) {
            newItems.push(item);
            continue;
          }

          /* Check if the charge fits in this module; if so, assign it. */
          for (const attr of eveData.typeDogma?.[item.type_id]?.dogmaAttributes ?? []) {
            switch (attr.attributeID) {
              case eveData.attributeMapping?.chargeGroup1:
              case eveData.attributeMapping?.chargeGroup2:
              case eveData.attributeMapping?.chargeGroup3:
              case eveData.attributeMapping?.chargeGroup4:
              case eveData.attributeMapping?.chargeGroup5:
                if (attr.value === groupID) {
                  item = {
                    ...item,
                    charge: {
                      type_id: chargeTypeId,
                    },
                  };
                }
                break;
            }
          }

          newItems.push(item);
        }

        return {
          ...oldFit,
          items: newItems,
        };
      });
    },
    [eveData],
  );

  const removeCharge = React.useCallback((flag: number) => {
    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (oldFit === undefined) return undefined;

      return {
        ...oldFit,
        items: oldFit.items.map((item) => {
          if (item.flag === flag) {
            return {
              ...item,
              charge: undefined,
            };
          }

          return item;
        }),
      };
    });
  }, []);

  const toggleDrones = React.useCallback((typeId: number, active: number) => {
    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (oldFit === undefined) return undefined;

      /* Find the amount of drones in the current fit. */
      const count = oldFit.items
        .filter((item) => item.flag === 87 && item.type_id === typeId)
        .reduce((acc, item) => acc + item.quantity, 0);
      if (count === 0) return oldFit;

      /* If we request the same amount of active than we had, assume we want to deactive the current. */
      const currentActive = oldFit.items
        .filter((item) => item.flag === 87 && item.type_id === typeId && item.state === "Active")
        .reduce((acc, item) => acc + item.quantity, 0);
      if (currentActive === active) {
        active = active - 1;
      }

      /* Ensure we never have more active than available. */
      active = Math.min(count, active);

      /* Remove all drones of this type. */
      const newItems = oldFit.items.filter((item) => item.flag !== 87 || item.type_id !== typeId);

      /* Add the active drones. */
      if (active > 0) {
        newItems.push({
          flag: 87,
          type_id: typeId,
          quantity: active,
          state: "Active",
        });
      }

      /* Add the passive drones. */
      if (active < count) {
        newItems.push({
          flag: 87,
          type_id: typeId,
          quantity: count - active,
          state: "Passive",
        });
      }

      return {
        ...oldFit,
        items: newItems,
      };
    });
  }, []);

  const removeDrones = React.useCallback((typeId: number) => {
    setCurrentFit((oldFit: EsiFit | undefined) => {
      if (oldFit === undefined) return undefined;

      return {
        ...oldFit,
        items: oldFit.items.filter((item) => item.flag !== 87 || item.type_id !== typeId),
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
      moveModule,
      setModule,
      addModule,
      removeModule,
      addCharge,
      removeCharge,
      toggleDrones,
      removeDrones,
      changeHull,
      setItemState,
      setName,
    }));
  }, [
    moveModule,
    setModule,
    addModule,
    removeModule,
    addCharge,
    removeCharge,
    toggleDrones,
    removeDrones,
    changeHull,
    setItemState,
    setName,
  ]);

  React.useEffect(() => {
    if (!dogmaEngine.loaded || !eveData.loaded) return;
    if (currentFit === undefined || currentSkills === undefined) return;

    const snapshot = dogmaEngine.engine?.calculate(currentFit, currentSkills);

    const slots = {
      hislot: 0,
      medslot: 0,
      lowslot: 0,
      subsystem: 0,
      rig: 0,
      launcher: 0,
      turret: 0,
    };

    slots.hislot = snapshot.hull.attributes.get(eveData?.attributeMapping?.hiSlots || 0)?.value || 0;
    slots.medslot = snapshot.hull.attributes.get(eveData?.attributeMapping?.medSlots || 0)?.value || 0;
    slots.lowslot = snapshot.hull.attributes.get(eveData?.attributeMapping?.lowSlots || 0)?.value || 0;
    slots.subsystem = snapshot.hull.attributes.get(eveData?.attributeMapping?.maxSubSystems || 0)?.value || 0;
    slots.rig = snapshot.hull?.attributes.get(eveData?.attributeMapping?.rigSlots || 0)?.value || 0;
    slots.launcher = snapshot.hull?.attributes.get(eveData?.attributeMapping?.launcherSlotsLeft || 0)?.value || 0;
    slots.turret = snapshot.hull?.attributes.get(eveData?.attributeMapping?.turretSlotsLeft || 0)?.value || 0;

    const items = snapshot.items;
    for (const item of items) {
      slots.hislot += item.attributes.get(eveData?.attributeMapping?.hiSlotModifier || 0)?.value || 0;
      slots.medslot += item.attributes.get(eveData?.attributeMapping?.medSlotModifier || 0)?.value || 0;
      slots.lowslot += item.attributes.get(eveData?.attributeMapping?.lowSlotModifier || 0)?.value || 0;
      slots.launcher += item.attributes.get(eveData?.attributeMapping?.launcherHardPointModifier || 0)?.value || 0;
      slots.turret += item.attributes.get(eveData?.attributeMapping?.turretHardPointModifier || 0)?.value || 0;
    }

    setShipSnapshot((oldSnapshot) => {
      return {
        ...oldSnapshot,
        loaded: true,
        hull: snapshot.hull,
        items: snapshot.items,
        skills: snapshot.skills,
        char: snapshot.char,
        structure: snapshot.structure,
        target: snapshot.target,
        slots,
        currentFit,
        currentSkills,
      };
    });
  }, [eveData, dogmaEngine, currentFit, currentSkills]);

  return <ShipSnapshotContext.Provider value={shipSnapshot}>{props.children}</ShipSnapshotContext.Provider>;
};
