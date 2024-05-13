import React from "react";

import { defaultDataUrl } from "@/settings";

import { DogmaAttribute, DogmaEffect, GroupID, MarketGroup, TypeDogma, TypeID } from "./DataTypes";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/extensions
import * as esf_pb2 from "./esf_pb2.js";

interface DogmaData {
  loaded?: boolean;
  typeIDs?: Record<string, TypeID>;
  groupIDs?: Record<string, GroupID>;
  marketGroups?: Record<string, MarketGroup>;
  typeDogma?: Record<string, TypeDogma>;
  dogmaEffects?: Record<string, DogmaEffect>;
  dogmaAttributes?: Record<string, DogmaAttribute>;
  effectMapping?: Record<string, number>;
  attributeMapping?: Record<string, number>;
}

export const EveDataContext = React.createContext<DogmaData>({});

export interface DogmaDataProps {
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

function isLoaded(dogmaData: DogmaData): boolean | undefined {
  if (dogmaData.typeIDs === undefined) return undefined;
  if (dogmaData.groupIDs === undefined) return undefined;
  if (dogmaData.marketGroups === undefined) return undefined;
  if (dogmaData.typeDogma === undefined) return undefined;
  if (dogmaData.dogmaEffects === undefined) return undefined;
  if (dogmaData.dogmaAttributes === undefined) return undefined;
  if (dogmaData.effectMapping === undefined) return undefined;
  if (dogmaData.attributeMapping === undefined) return undefined;

  return true;
}

/**
 * Provides information like TypeIDs, Dogma information, etc.
 *
 * ```typescript
 * const eveData = React.useContext(EveDataContext);
 *
 * if (eveData?.loaded) {
 *   console.log(eveData.typeIDs.length);
 * }
 * ```
 */
export const EveDataProvider = (props: DogmaDataProps) => {
  const dataUrl = props.dataUrl ?? `${defaultDataUrl}sde/`;
  const [dogmaData, setDogmaData] = React.useState<DogmaData>({});

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function fetchAndLoadDataFile(name: string, pb2: any) {
      fetchDataFile(dataUrl, name, pb2).then((result) => {
        setDogmaData((prevDogmaData: DogmaData) => {
          const newDogmaData = {
            ...prevDogmaData,
            [name]: result,
          };

          newDogmaData.loaded = isLoaded(newDogmaData);
          return newDogmaData;
        });
      });
    }

    fetchAndLoadDataFile("typeIDs", esf_pb2.esf.TypeIDs);
    fetchAndLoadDataFile("groupIDs", esf_pb2.esf.GroupIDs);
    fetchAndLoadDataFile("marketGroups", esf_pb2.esf.MarketGroups);
    fetchAndLoadDataFile("typeDogma", esf_pb2.esf.TypeDogma);
    fetchAndLoadDataFile("dogmaEffects", esf_pb2.esf.DogmaEffects);
    fetchAndLoadDataFile("dogmaAttributes", esf_pb2.esf.DogmaAttributes);
  }, [dataUrl]);

  React.useEffect(() => {
    if (!dogmaData.dogmaAttributes || !dogmaData.dogmaEffects) return;

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

    setDogmaData((prevDogmaData: DogmaData) => {
      const newDogmaData = {
        ...prevDogmaData,
        attributeMapping: attributeMapping,
        effectMapping: effectMapping,
      };

      newDogmaData.loaded = isLoaded(newDogmaData);
      return newDogmaData;
    });
  }, [dogmaData.dogmaAttributes, dogmaData.dogmaEffects]);

  return <EveDataContext.Provider value={dogmaData}>{props.children}</EveDataContext.Provider>;
};
