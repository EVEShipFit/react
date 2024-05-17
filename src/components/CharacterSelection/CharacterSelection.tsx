import React from "react";

import { useCharacters, useEsiCharacters } from "@/providers/Characters";
import { useCurrentCharacter } from "@/providers/CurrentCharacterProvider";

import styles from "./CharacterSelection.module.css";

/**
 * Character selection for EsiProvider.
 *
 * It shows both a dropdown for all the characters that the EsiProvider knows,
 * and a button to add another character.
 */
export const CharacterSelection = () => {
  const characters = useCharacters();
  const currentCharacter = useCurrentCharacter();
  const esiCharactersProvider = useEsiCharacters();

  const isExpired = currentCharacter.character?.expired ?? false;

  return (
    <div className={styles.character}>
      <select onChange={(e) => currentCharacter.setCharacterId(e.target.value)} value={currentCharacter.characterId}>
        {Object.entries(characters)
          .sort()
          .map(([id, name]) => {
            return (
              <option key={id} value={id}>
                {name.name} {name.expired ? "(access expired)" : ""}
              </option>
            );
          })}
      </select>
      {isExpired && (
        <button onClick={esiCharactersProvider.refresh} title="Refresh access">
          R
        </button>
      )}
      {!isExpired && (
        <button onClick={esiCharactersProvider.login} title="Add another character">
          +
        </button>
      )}
    </div>
  );
};
