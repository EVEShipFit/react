import React from "react";

import { Character } from "@/providers/CurrentCharacterProvider";

interface Characters {
  characters: Record<string, Character>;
  /** Callback given to all Characters Providers, to inform them the character is changed. */
  onCharacterIdChange: (characterId: string) => void;
  /** Request from Characters Providers to whoever maintains the current character, to change it. */
  characterIdChangeRequest: string | null;
}

export const CharactersContext = React.createContext<Characters>({
  characters: {},
  onCharacterIdChange: () => {},
  characterIdChangeRequest: null,
});

export const useCharacters = () => {
  return React.useContext(CharactersContext).characters;
};

export const useCharactersInternal = () => {
  return React.useContext(CharactersContext);
};
