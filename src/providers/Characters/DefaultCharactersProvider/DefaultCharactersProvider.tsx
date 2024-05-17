import React from "react";

import { CharactersContext, useCharactersInternal } from "../CharactersContext";
import { EveData, useEveData } from "@/providers/EveDataProvider";
import { Character, Skills } from "@/providers/CurrentCharacterProvider";

interface DefaultCharacterProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

const CreateSkills = (eveData: EveData, level: number) => {
  const skills: Skills = {};
  for (const typeId in eveData.typeIDs) {
    if (eveData.typeIDs[typeId].categoryID !== 16) continue;
    skills[typeId] = level;
  }

  return skills;
};

/**
 * Provisions two default characters: all L0 and all L5.
 *
 * Requires `EveDataProvider` to be present as parent in the component tree.
 *
 * CharactersProviders can be stacked in what ever way works out best.
 */
export const DefaultCharactersProvider = (props: DefaultCharacterProps) => {
  const characters = useCharactersInternal();
  const eveData = useEveData();

  const contextValue = React.useMemo(() => {
    if (eveData === null) return characters;

    const characterAll0: Character = {
      name: "Default character - All Skills L0",
      skills: CreateSkills(eveData, 0),
      fittings: [],
      expired: false,
    };
    const characterAll5: Character = {
      name: "Default character - All Skills L5",
      skills: CreateSkills(eveData, 5),
      fittings: [],
      expired: false,
    };

    return {
      onCharacterIdChange: characters.onCharacterIdChange,
      characters: {
        ...characters.characters,
        ".all-0": characterAll0,
        ".all-5": characterAll5,
      },
      characterIdChangeRequest: characters.characterIdChangeRequest,
    };
  }, [characters, eveData]);

  return <CharactersContext.Provider value={contextValue}>{props.children}</CharactersContext.Provider>;
};
