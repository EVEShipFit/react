import React from "react";

import {
  DogmaAttribute,
  DogmaEffect,
  TypeDogmaAttribute,
  TypeDogmaEffect,
  TypeID,
  useEveData,
} from "@/providers/EveDataProvider";
import { EsfFit } from "@/providers/CurrentFitProvider";
import { Skills } from "@/providers/CurrentCharacterProvider";
import { calculate } from "@eveshipfit/dogma-engine";

import { Calculation } from "./DataTypes";

interface DogmaEngine {
  calculate: (fit: EsfFit, skills: Skills) => Calculation;
}

const DogmaEngineContext = React.createContext<DogmaEngine | null>(null);

export const useDogmaEngine = () => {
  return React.useContext(DogmaEngineContext);
};

declare global {
  interface Window {
    get_dogma_attributes?: unknown;
    get_dogma_attribute?: unknown;
    get_dogma_effects?: unknown;
    get_dogma_effect?: unknown;
    get_type_id?: unknown;
  }
}

export interface DogmaEngineProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

/**
 * Provides method of calculating accurate attributes for a ship fit.
 *
 * ```typescript
 * const dogmaEngine = useDogmaEngine();
 *
 * if (dogmaEngine !== null) {
 *   // calculate(fit: EsfFit, skills: Skills)
 *   const stats = dogmaEngine.calculate(fit, {});
 *   console.log(stats);
 * }
 * ```
 *
 * Due to how the EVE SDE is constructed, a skill is by default
 * assumed to be Level 1. This means that you most likely want
 * to give all the skills to the calculate() function, even those
 * that are not trained.
 */
export const DogmaEngineProvider = (props: DogmaEngineProps) => {
  const eveData = useEveData();

  const [firstLoad, setFirstLoad] = React.useState(true);

  const [dogmaEngine, setDogmaEngine] = React.useState<{
    calculate: typeof calculate;
  } | null>(null);

  if (firstLoad) {
    setFirstLoad(false);

    import("@eveshipfit/dogma-engine").then((newDogmaEngine) => {
      newDogmaEngine.init();
      setDogmaEngine(newDogmaEngine);
    });
  }

  if (eveData !== null) {
    window.get_dogma_attributes = (type_id: number): TypeDogmaAttribute[] | undefined => {
      return eveData.typeDogma[type_id].dogmaAttributes;
    };
    window.get_dogma_attribute = (attribute_id: number): DogmaAttribute | undefined => {
      return eveData.dogmaAttributes[attribute_id];
    };
    window.get_dogma_effects = (type_id: number): TypeDogmaEffect[] | undefined => {
      return eveData.typeDogma[type_id].dogmaEffects;
    };
    window.get_dogma_effect = (effect_id: number): DogmaEffect | undefined => {
      return eveData.dogmaEffects[effect_id];
    };
    window.get_type_id = (type_id: number): TypeID | undefined => {
      return eveData.typeIDs[type_id];
    };
  }

  const contextValue = React.useMemo(() => {
    if (eveData === null || dogmaEngine === null) return null;

    return {
      calculate: (fit: EsfFit, skills: Skills): Calculation => {
        const dogmaFit = {
          ship_type_id: fit.shipTypeId,
          modules: fit.modules.map((module) => ({
            type_id: module.typeId,
            slot: module.slot,
            state: module.state,
            charge:
              module.charge === undefined
                ? undefined
                : {
                    type_id: module.charge.typeId,
                  },
          })),
          drones: fit.drones.flatMap((drone) => {
            const drones = [];
            for (let i = 0; i < drone.states.Active; i++) {
              drones.push({
                type_id: drone.typeId,
                state: "Active",
              });
            }
            for (let i = 0; i < drone.states.Passive; i++) {
              drones.push({
                type_id: drone.typeId,
                state: "Passive",
              });
            }
            return drones;
          }),
        };

        return dogmaEngine.calculate(dogmaFit, skills);
      },
    };
  }, [eveData, dogmaEngine]);

  return <DogmaEngineContext.Provider value={contextValue}>{props.children}</DogmaEngineContext.Provider>;
};
