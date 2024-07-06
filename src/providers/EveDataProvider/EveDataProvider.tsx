import React from "react";

import { defaultDataUrl } from "@/settings";

import { DogmaAttribute, DogmaEffect, Group, MarketGroup, TypeDogma, Type } from "./DataTypes";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/extensions
import * as esf_pb2 from "./esf_pb2.js";

export interface EveData {
  types: Record<string, Type>;
  groups: Record<string, Group>;
  marketGroups: Record<string, MarketGroup>;
  typeDogma: Record<string, TypeDogma>;
  dogmaEffects: Record<string, DogmaEffect>;
  dogmaAttributes: Record<string, DogmaAttribute>;
  effectMapping: Record<string, number>;
  attributeMapping: Record<string, number>;
}

const EveDataContext = React.createContext<EveData | null>(null);

export const useEveData = () => {
  return React.useContext(EveDataContext);
};

export interface EveDataProps {
  /**
   * URL where the data-files are located. Changing this value after first render has no effect.
   * If not set, a built-in default is used, which can only be used for localhost development.
   */
  dataUrl?: string;

  /** Children that can use this provider. */
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchDataFile(dataUrl: string, name: string, pb2: any): Promise<object[]> {
  const response = await fetch(dataUrl + name + ".pb2");
  const reader = response.body?.getReader();
  const result = await pb2.decode(reader, 0xffffffff);

  return result.entries;
}

function isLoaded(dogmaData: EveData): boolean {
  if (Object.keys(dogmaData.types).length === 0) return false;
  if (Object.keys(dogmaData.groups).length === 0) return false;
  if (Object.keys(dogmaData.marketGroups).length === 0) return false;
  if (Object.keys(dogmaData.typeDogma).length === 0) return false;
  if (Object.keys(dogmaData.dogmaEffects).length === 0) return false;
  if (Object.keys(dogmaData.dogmaAttributes).length === 0) return false;

  return true;
}

/**
 * Provides information like types, Dogma information, etc.
 *
 * ```typescript
 * const eveData = useEveData();
 *
 * if (eveData !== null) {
 *   console.log(eveData.types.length);
 * }
 * ```
 */
export const EveDataProvider = (props: EveDataProps) => {
  const dataUrl = props.dataUrl ?? `${defaultDataUrl}sde/`;
  /* Initialize with empty data; we never set the context till everything is loaded. */
  const [dogmaData, setDogmaData] = React.useState<EveData>({
    types: {},
    groups: {},
    marketGroups: {},
    typeDogma: {},
    dogmaEffects: {},
    dogmaAttributes: {},
    effectMapping: {},
    attributeMapping: {},
  });

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function fetchAndLoadDataFile(name: string, pb2: any) {
      fetchDataFile(dataUrl, name, pb2).then((result) => {
        setDogmaData((prevDogmaData: EveData) => {
          const newDogmaData = {
            ...prevDogmaData,
            [name]: result,
          };

          return newDogmaData;
        });
      });
    }

    fetchAndLoadDataFile("types", esf_pb2.esf.Types);
    fetchAndLoadDataFile("groups", esf_pb2.esf.Groups);
    fetchAndLoadDataFile("marketGroups", esf_pb2.esf.MarketGroups);
    fetchAndLoadDataFile("typeDogma", esf_pb2.esf.TypeDogma);
    fetchAndLoadDataFile("dogmaEffects", esf_pb2.esf.DogmaEffects);
    fetchAndLoadDataFile("dogmaAttributes", esf_pb2.esf.DogmaAttributes);

    /* Only fire on first load of this component. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoaded(dogmaData)) return <></>;

  /* Create a reverse mapping to quickly lookup attribute/effect name to attribute/effect ID. */
  const attributeMapping: Record<string, number> = {};
  for (const id in dogmaData.dogmaAttributes) {
    const name = dogmaData.dogmaAttributes[id].name;
    attributeMapping[name] = parseInt(id);
  }
  const effectMapping: Record<string, number> = {};
  for (const id in dogmaData.dogmaEffects) {
    const name = dogmaData.dogmaEffects[id].name;
    effectMapping[name] = parseInt(id);
  }

  const contextValue = {
    ...dogmaData,
    attributeMapping: attributeMapping,
    effectMapping: effectMapping,
  };

  return <EveDataContext.Provider value={contextValue}>{props.children}</EveDataContext.Provider>;
};
