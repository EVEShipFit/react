import React from "react";

import { useLocalStorage } from "@/hooks/LocalStorage";
import { EsfFit } from "@/providers/CurrentFitProvider";

import { useCharactersInternal } from "../Characters/CharactersContext";

export type Skills = Record<string, number>;

export interface Character {
  name: string;
  skills: Skills;
  fittings: EsfFit[];
  /** Whether the character is based on expired information / credentials. */
  expired: boolean;
}

interface CurrentCharacter {
  character: Character | undefined;
  characterId: string | undefined;
  setCharacterId: (characterId: string) => void;
}

const CurrentCharacterContext = React.createContext<CurrentCharacter>({
  character: undefined,
  characterId: undefined,
  setCharacterId: () => {},
});

export const useCurrentCharacter = () => {
  return React.useContext(CurrentCharacterContext);
};

interface CurrentCharacterProps {
  /** The initial characterId to use. Changing this value after first render has no effect. */
  initialCharacterId?: string;

  /** Children that can use this provider. */
  children: React.ReactNode;
}

/**
 * Keeps track of the current character.
 *
 * This provider must be present after all `CharacterProviders` in the component tree.
 *
 * Use the `useCurrentCharacter` hook to access or change the current character.
 */
export const CurrentCharacterProvider = (props: CurrentCharacterProps) => {
  const characters = useCharactersInternal();
  const [currentCharacterId, setCurrentCharacterId] = useLocalStorage<string>(
    "currentCharacter",
    props.initialCharacterId ?? ".all-5",
  );
  const [firstLoad, setFirstLoad] = React.useState(true);

  const setCharacterId = React.useCallback(
    (characterId: string) => {
      setFirstLoad(false);
      setCurrentCharacterId(characterId);
      characters.onCharacterIdChange(characterId);
    },
    [characters, setCurrentCharacterId],
  );

  /* Ensure the character is loaded when the provider has retrieved the data. */
  if (firstLoad && characters.characters[currentCharacterId] !== undefined) {
    setFirstLoad(false);
    characters.onCharacterIdChange(currentCharacterId);
  }

  /* Check if any of the Characters Providers requested a character change. */
  if (characters.characterIdChangeRequest !== null) {
    setCharacterId(characters.characterIdChangeRequest);
    characters.characterIdChangeRequest = null;
  }

  const contextValue = React.useMemo(() => {
    return {
      character: characters.characters[currentCharacterId],
      characterId: characters.characters[currentCharacterId] !== undefined ? currentCharacterId : undefined,
      setCharacterId,
    };
  }, [characters, currentCharacterId, setCharacterId]);

  return <CurrentCharacterContext.Provider value={contextValue}>{props.children}</CurrentCharacterContext.Provider>;
};
