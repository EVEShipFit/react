import React from "react";

import { EsfFit, State, useCurrentFit } from "@/providers/CurrentFitProvider";
import { StatisticsSlotType, useStatistics } from "@/providers/StatisticsProvider";
import { useEveData } from "@/providers/EveDataProvider";

interface FitManager {
  /** Set the current fit. */
  setFit: (fit: EsfFit) => void;
  /** Create a new fit of the given ship type. */
  createNewFit: (typeId: number) => void;
  /** Set the name of the current fit. */
  setName: (name: string) => void;

  /** Add an item (module, charge, drone) to the fit. */
  addItem: (typeId: number, slot: StatisticsSlotType | "droneBay" | "charge") => void;

  /** Set a module in a slot. */
  setModule: (flag: number, typeId: number) => void;
  /** Set the state of a module. */
  setModuleState: (flag: number, state: State) => void;
  /** Remove a module from a slot. */
  removeModule: (flag: number) => void;
  /** Swap two modules. */
  swapModule: (flagA: number, flagB: number) => void;

  /** Set a charge in a module. */
  setCharge: (flag: number, typeId: number) => void;
  /** Remove a charge from a module. */
  removeCharge: (flag: number) => void;

  /** Activate N drones of a given type. */
  activateDrones: (typeId: number, amount: number) => void;
  /** Remove all drones of a given type. */
  removeDrones: (typeId: number) => void;
}

const slotStart: Record<StatisticsSlotType, number> = {
  hislot: 27,
  medslot: 19,
  lowslot: 11,
  subsystem: 125,
  rig: 92,
  launcher: 0,
  turret: 0,
};

const FitManagerContext = React.createContext<FitManager>({
  setFit: () => {},
  createNewFit: () => {},
  setName: () => {},

  addItem: () => {},

  setModule: () => {},
  setModuleState: () => {},
  removeModule: () => {},
  swapModule: () => {},

  setCharge: () => {},
  removeCharge: () => {},

  activateDrones: () => {},
  removeDrones: () => {},
});

export const useFitManager = () => {
  return React.useContext(FitManagerContext);
};

export interface FitManagerProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

/**
 * Provides methods to manipulate the current fit.
 */
export const FitManagerProvider = (props: FitManagerProps) => {
  const eveData = useEveData();
  const currentFit = useCurrentFit();
  const statistics = useStatistics();
  const setFit = currentFit.setFit;

  const contextValue = React.useMemo(() => {
    if (eveData === null) {
      return {
        setFit: () => {},
        createNewFit: () => {},
        setName: () => {},

        addItem: () => {},

        setModule: () => {},
        setModuleState: () => {},
        removeModule: () => {},
        swapModule: () => {},

        setCharge: () => {},
        removeCharge: () => {},

        activateDrones: () => {},
        removeDrones: () => {},
      };
    }

    return {
      setFit: (fit: EsfFit) => {
        setFit(fit);
      },
      createNewFit: (typeId: number) => {
        setFit({
          name: "Unnamed Fit",
          description: "",
          ship_type_id: typeId,
          items: [],
        });
      },
      setName: (name: string) => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            name,
          };
        });
      },

      addItem: (typeId: number, slot: StatisticsSlotType | "droneBay" | "charge") => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

          if (slot === "charge") {
            const chargeSize =
              eveData.typeDogma[typeId]?.dogmaAttributes.find(
                (attr) => attr.attributeID === eveData.attributeMapping?.chargeSize,
              )?.value ?? -1;
            const groupID = eveData.typeIDs[typeId]?.groupID ?? -1;

            const newItems = [];
            for (let item of oldFit.items) {
              /* If the module has size restrictions, ensure the charge matches. */
              const moduleChargeSize = eveData.typeDogma[item.type_id]?.dogmaAttributes.find(
                (attr) => attr.attributeID === eveData.attributeMapping.chargeSize,
              )?.value;
              if (moduleChargeSize !== undefined && moduleChargeSize !== chargeSize) {
                newItems.push(item);
                continue;
              }

              /* Check if the charge fits in this module; if so, assign it. */
              for (const attr of eveData.typeDogma[item.type_id]?.dogmaAttributes ?? []) {
                switch (attr.attributeID) {
                  case eveData.attributeMapping.chargeGroup1:
                  case eveData.attributeMapping.chargeGroup2:
                  case eveData.attributeMapping.chargeGroup3:
                  case eveData.attributeMapping.chargeGroup4:
                  case eveData.attributeMapping.chargeGroup5:
                    if (attr.value === groupID) {
                      item = {
                        ...item,
                        charge: {
                          type_id: typeId,
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
          }

          let flag = undefined;

          /* Find the first free slot for that slot-type. */
          if (slot !== "droneBay") {
            const slotsAvailable = statistics?.slots[slot] ?? 0;
            for (let i = slotStart[slot]; i < slotStart[slot] + slotsAvailable; i++) {
              if (oldFit.items.find((item) => item.flag === i) !== undefined) continue;

              flag = i;
              break;
            }
            console.log(flag);
          } else {
            flag = 87;
          }

          /* Couldn't find a free slot. */
          if (flag === undefined) return oldFit;

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

      setModule: (flag: number, typeId: number) => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

          const newItems = oldFit.items
            .filter((item) => item.flag !== flag)
            .concat({ flag: flag, type_id: typeId, quantity: 1 });

          return {
            ...oldFit,
            items: newItems,
          };
        });
      },
      setModuleState: (flag: number, state: State) => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            items: oldFit?.items.map((item) => {
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
      },
      removeModule: (flag: number) => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            items: oldFit.items.filter((item) => item.flag !== flag),
          };
        });
      },
      swapModule: (flagA: number, flagB: number) => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

          const newItems = [...oldFit.items];

          const fromItemIndex = newItems.findIndex((item) => item.flag === flagA);
          const fromItem = newItems[fromItemIndex];

          const toItemIndex = newItems.findIndex((item) => item.flag === flagB);
          const toItem = newItems[toItemIndex];

          fromItem.flag = flagB;

          if (toItem !== undefined) {
            /* Target slot is non-empty, swap items. */
            toItem.flag = flagA;
          }

          return {
            ...oldFit,
            items: newItems,
          };
        });
      },

      setCharge: (flag: number, typeId: number) => {
        const chargeSize =
          eveData.typeDogma[typeId]?.dogmaAttributes.find(
            (attr) => attr.attributeID === eveData.attributeMapping?.chargeSize,
          )?.value ?? -1;
        const groupID = eveData.typeIDs[typeId]?.groupID ?? -1;

        setFit((oldFit) => {
          if (oldFit === null) return null;

          const newItems = [];

          for (let item of oldFit.items) {
            /* If the module has size restrictions, ensure the charge matches. */
            const moduleChargeSize = eveData.typeDogma[item.type_id]?.dogmaAttributes.find(
              (attr) => attr.attributeID === eveData.attributeMapping.chargeSize,
            )?.value;
            if (moduleChargeSize !== undefined && moduleChargeSize !== chargeSize) {
              newItems.push(item);
              continue;
            }
            if (item.flag !== flag) {
              newItems.push(item);
              continue;
            }

            /* Check if the charge fits in this module; if so, assign it. */
            for (const attr of eveData.typeDogma[item.type_id]?.dogmaAttributes ?? []) {
              switch (attr.attributeID) {
                case eveData.attributeMapping.chargeGroup1:
                case eveData.attributeMapping.chargeGroup2:
                case eveData.attributeMapping.chargeGroup3:
                case eveData.attributeMapping.chargeGroup4:
                case eveData.attributeMapping.chargeGroup5:
                  if (attr.value === groupID) {
                    item = {
                      ...item,
                      charge: {
                        type_id: typeId,
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
      removeCharge: (flag: number) => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

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
      },

      activateDrones: (typeId: number, active: number) => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

          /* Find the amount of drones in the current fit. */
          const count = oldFit.items
            .filter((item) => item.flag === 87 && item.type_id === typeId)
            .reduce((acc, item) => acc + item.quantity, 0);
          if (count === 0) return oldFit;

          /* If we request the same amount of active than we had, assume we want to deactivate the current. */
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
      },
      removeDrones: (typeId: number) => {
        setFit((oldFit) => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            items: oldFit.items.filter((item) => item.flag !== 87 || item.type_id !== typeId),
          };
        });
      },
    };
  }, [eveData, statistics?.slots, setFit]);

  return <FitManagerContext.Provider value={contextValue}>{props.children}</FitManagerContext.Provider>;
};
