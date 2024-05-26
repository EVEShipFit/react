import React from "react";

import { EsfFit, EsfSlot, EsfSlotType, EsfState, useCurrentFit } from "@/providers/CurrentFitProvider";
import { useStatistics } from "@/providers/StatisticsProvider";
import { useEveData } from "@/providers/EveDataProvider";

interface FitManager {
  /** Set the current fit. */
  setFit: (fit: EsfFit) => void;
  /** Remove the preview fit, reverting back to the actual fit. */
  removePreview: () => void;
  /** Create a new fit of the given ship type. */
  createNewFit: (typeId: number) => void;
  /** Set the name of the current fit. */
  setName: (name: string) => void;

  /** Add an item (module, charge, drone) to the fit. */
  addItem: (typeId: number, slot: EsfSlotType | "DroneBay" | "Charge", preview?: boolean) => void;

  /** Set a module in a slot. */
  setModule: (slot: EsfSlot, typeId: number) => void;
  /** Set the state of a module. */
  setModuleState: (slot: EsfSlot, state: EsfState) => void;
  /** Remove a module from a slot. */
  removeModule: (slot: EsfSlot) => void;
  /** Swap two modules. */
  swapModule: (slotA: EsfSlot, slotB: EsfSlot) => void;

  /** Set a charge in a module. */
  setCharge: (slot: EsfSlot, typeId: number) => void;
  /** Remove a charge from a module. */
  removeCharge: (slot: EsfSlot) => void;

  /** Activate N drones of a given type. */
  activateDrones: (typeId: number, amount: number) => void;
  /** Remove all drones of a given type. */
  removeDrones: (typeId: number) => void;
}

const FitManagerContext = React.createContext<FitManager>({
  setFit: () => {},
  removePreview: () => {},
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
  const setPreview = currentFit.setPreview;

  const currentFitRef = React.useRef<EsfFit | null>(currentFit.currentFit);
  currentFitRef.current = currentFit.currentFit;

  const contextValue = React.useMemo(() => {
    if (eveData === null) {
      return {
        setFit: () => {},
        removePreview: () => {},
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
      removePreview: () => {
        setPreview(null);
      },
      createNewFit: (typeId: number) => {
        setFit({
          name: "Unnamed Fit",
          description: "",
          shipTypeId: typeId,
          modules: [],
          drones: [],
          cargo: [],
        });
      },
      setName: (name: string) => {
        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            name,
          };
        });
      },

      addItem: (typeId: number, slot: EsfSlotType | "DroneBay" | "Charge", preview?: boolean) => {
        const setFitOrPreview = preview ? setPreview : setFit;
        setFitOrPreview((oldFit: EsfFit | null): EsfFit | null => {
          /* Previews are always based on the current fit. */
          if (preview) oldFit = currentFitRef.current;
          if (oldFit === null) return null;

          if (slot === "Charge") {
            const chargeSize =
              eveData.typeDogma[typeId]?.dogmaAttributes.find(
                (attr) => attr.attributeID === eveData.attributeMapping?.chargeSize,
              )?.value ?? -1;
            const groupID = eveData.typeIDs[typeId]?.groupID ?? -1;

            const newModules = [];
            for (let module of oldFit.modules) {
              /* If the module has size restrictions, ensure the charge matches. */
              const moduleChargeSize = eveData.typeDogma[module.typeId]?.dogmaAttributes.find(
                (attr) => attr.attributeID === eveData.attributeMapping.chargeSize,
              )?.value;
              if (moduleChargeSize !== undefined && moduleChargeSize !== chargeSize) {
                newModules.push(module);
                continue;
              }

              /* Check if the charge fits in this module; if so, assign it. */
              for (const attr of eveData.typeDogma[module.typeId]?.dogmaAttributes ?? []) {
                switch (attr.attributeID) {
                  case eveData.attributeMapping.chargeGroup1:
                  case eveData.attributeMapping.chargeGroup2:
                  case eveData.attributeMapping.chargeGroup3:
                  case eveData.attributeMapping.chargeGroup4:
                  case eveData.attributeMapping.chargeGroup5:
                    if (attr.value === groupID) {
                      module = {
                        ...module,
                        charge: {
                          typeId,
                        },
                      };
                    }
                    break;
                }
              }

              newModules.push(module);
            }

            return {
              ...oldFit,
              modules: newModules,
            };
          }

          if (slot === "DroneBay") {
            const drone = oldFit.drones.find((item) => item.typeId === typeId);

            if (drone !== undefined) {
              drone.states.Active++;
              return oldFit;
            }

            return {
              ...oldFit,
              drones: [
                ...oldFit.drones,
                {
                  typeId: typeId,
                  states: {
                    Active: 1,
                    Passive: 0,
                  },
                },
              ],
            };
          }

          /* Find the first free slot for that slot-type. */
          let index = undefined;
          const slotsAvailable = statistics?.slots[slot] ?? 0;
          for (let i = 1; i <= slotsAvailable; i++) {
            if (oldFit.modules.find((item) => item.slot.type === slot && item.slot.index === i) !== undefined) continue;

            index = i;
            break;
          }

          /* Couldn't find a free slot. */
          if (index === undefined) return oldFit;

          return {
            ...oldFit,
            modules: [
              ...oldFit.modules,
              {
                slot: {
                  type: slot,
                  index: index,
                },
                typeId: typeId,
                charge: undefined,
                state: preview ? "Preview" : "Active",
              },
            ],
          };
        });
      },

      setModule: (slot: EsfSlot, typeId: number) => {
        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            modules: oldFit.modules
              .filter((item) => item.slot.type !== slot.type || item.slot.index !== slot.index)
              .concat({ slot, typeId, state: "Active" }),
          };
        });
      },
      setModuleState: (slot: EsfSlot, state: EsfState) => {
        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            modules: oldFit.modules.map((item) => {
              if (item.slot.type === slot.type && item.slot.index === slot.index) {
                return {
                  ...item,
                  state,
                };
              }

              return item;
            }),
          };
        });
      },
      removeModule: (slot: EsfSlot) => {
        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            modules: oldFit.modules.filter((item) => item.slot.type !== slot.type || item.slot.index !== slot.index),
          };
        });
      },
      swapModule: (slotA: EsfSlot, slotB: EsfSlot) => {
        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          const modules = [...oldFit.modules];

          const moduleA = modules.find((item) => item.slot.type === slotA.type && item.slot.index === slotA.index);
          const moduleB = modules.find((item) => item.slot.type === slotB.type && item.slot.index === slotB.index);

          if (moduleA !== undefined) {
            moduleA.slot.index = slotB.index;
          }

          if (moduleB !== undefined) {
            moduleB.slot.index = slotA.index;
          }

          return {
            ...oldFit,
            modules,
          };
        });
      },

      setCharge: (slot: EsfSlot, typeId: number) => {
        const chargeSize =
          eveData.typeDogma[typeId]?.dogmaAttributes.find(
            (attr) => attr.attributeID === eveData.attributeMapping?.chargeSize,
          )?.value ?? -1;
        const groupID = eveData.typeIDs[typeId]?.groupID ?? -1;

        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          const modules = [];

          for (let module of oldFit.modules) {
            /* If the module has size restrictions, ensure the charge matches. */
            const moduleChargeSize = eveData.typeDogma[module.typeId]?.dogmaAttributes.find(
              (attr) => attr.attributeID === eveData.attributeMapping.chargeSize,
            )?.value;
            if (moduleChargeSize !== undefined && moduleChargeSize !== chargeSize) {
              modules.push(module);
              continue;
            }
            if (module.slot.type !== slot.type || module.slot.index !== slot.index) {
              modules.push(module);
              continue;
            }

            /* Check if the charge fits in this module; if so, assign it. */
            for (const attr of eveData.typeDogma[module.typeId]?.dogmaAttributes ?? []) {
              switch (attr.attributeID) {
                case eveData.attributeMapping.chargeGroup1:
                case eveData.attributeMapping.chargeGroup2:
                case eveData.attributeMapping.chargeGroup3:
                case eveData.attributeMapping.chargeGroup4:
                case eveData.attributeMapping.chargeGroup5:
                  if (attr.value === groupID) {
                    module = {
                      ...module,
                      charge: {
                        typeId: typeId,
                      },
                    };
                  }
                  break;
              }
            }

            modules.push(module);
          }

          return {
            ...oldFit,
            modules,
          };
        });
      },
      removeCharge: (slot: EsfSlot) => {
        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            modules: oldFit.modules.map((item) => {
              if (item.slot.type === slot.type && item.slot.index === slot.index) {
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
        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          /* Find the amount of drones in the current fit. */
          const count = oldFit.drones
            .filter((item) => item.typeId === typeId)
            .reduce((acc, item) => acc + item.states.Active + item.states.Passive, 0);
          if (count === 0) return oldFit;

          /* If we request the same amount of active than we had, assume we want to deactivate the current. */
          const currentActive = oldFit.drones
            .filter((item) => item.typeId === typeId)
            .reduce((acc, item) => acc + item.states.Active, 0);
          if (currentActive === active) {
            active = active - 1;
          }

          /* Ensure we never have more active than available. */
          active = Math.min(count, active);

          /* Remove all drones of this type. */
          const drones = oldFit.drones.filter((item) => item.typeId !== typeId);
          const passive = count - active;

          drones.push({
            typeId,
            states: {
              Active: active,
              Passive: passive,
            },
          });

          return {
            ...oldFit,
            drones,
          };
        });
      },
      removeDrones: (typeId: number) => {
        setFit((oldFit: EsfFit | null): EsfFit | null => {
          if (oldFit === null) return null;

          return {
            ...oldFit,
            drones: oldFit.drones.filter((item) => item.typeId !== typeId),
          };
        });
      },
    };
  }, [eveData, statistics?.slots, setFit, setPreview]);

  return <FitManagerContext.Provider value={contextValue}>{props.children}</FitManagerContext.Provider>;
};
