import React from "react";

import { DogmaAttribute, DogmaEffect, TypeDogmaAttribute, TypeDogmaEffect, TypeID, EveDataContext } from "../EveDataProvider";
import type { init, calculate } from "@eveshipfit/dogma-engine";

interface EsfDogmaEngine {
  init: typeof init,
  calculate: typeof calculate,
}

interface DogmaEngine {
  loaded?: boolean,
  loadedData?: boolean,
  engine?: EsfDogmaEngine,
}

export const DogmaEngineContext = React.createContext<DogmaEngine>({});

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
 * const dogmaEngine = React.useContext(DogmaEngineContext);
 *
 * if (dogmaEngine?.loaded) {
 *   // calculate({hull: number, items: number[]}, skills: Map<number, number>)
 *   const stats = dogmaEngine.engine.calculate({hull: 12747, items: [20639]}, []);
 *   console.log(stats);
 * }
 * ```
 */
export const DogmaEngineProvider = (props: DogmaEngineProps) => {
  const [dogmaEngine, setDogmaEngine] = React.useState<DogmaEngine>({});
  const eveData = React.useContext(EveDataContext);

  React.useEffect(() => {
    if (!eveData.loaded) return;

    setDogmaEngine((prevDogmaEngine: DogmaEngine) => {
      return {
        ...prevDogmaEngine,
        loadedData: true,
        loaded: prevDogmaEngine.engine !== undefined,
      };
    });

    window.get_dogma_attributes = (type_id: number): TypeDogmaAttribute[] | undefined => {
      return eveData.typeDogma?.[type_id].dogmaAttributes;
    };
    window.get_dogma_attribute = (attribute_id: number): DogmaAttribute | undefined => {
      return eveData.dogmaAttributes?.[attribute_id];
    };
    window.get_dogma_effects = (type_id: number): TypeDogmaEffect[] | undefined => {
      return eveData.typeDogma?.[type_id].dogmaEffects;
    };
    window.get_dogma_effect = (effect_id: number): DogmaEffect | undefined => {
      return eveData.dogmaEffects?.[effect_id];
    };
    window.get_type_id = (type_id: number): TypeID | undefined => {
      return eveData.typeIDs?.[type_id];
    };

    return () => {
      window.get_dogma_attributes = undefined;
      window.get_dogma_attribute = undefined;
      window.get_dogma_effects = undefined;
      window.get_dogma_effect = undefined;
      window.get_type_id = undefined;
    }
  }, [eveData]);

  React.useEffect(() => {
    import("@eveshipfit/dogma-engine").then((newDogmaEngine) => {
      newDogmaEngine.init();

      setDogmaEngine((prevDogmaEngine: DogmaEngine) => {
        return {
          ...prevDogmaEngine,
          engine: newDogmaEngine,
          loaded: prevDogmaEngine.loadedData,
        };
      });
    });
  }, []);

  return <DogmaEngineContext.Provider value={dogmaEngine}>
    {props.children}
  </DogmaEngineContext.Provider>
};
