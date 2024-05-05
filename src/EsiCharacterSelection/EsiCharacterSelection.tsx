import React from "react";

import { EsiContext } from "../EsiProvider";

import styles from "./EsiCharacterSelection.module.css";

/**
 * Character selection for EsiProvider.
 *
 * It shows both a dropdown for all the characters that the EsiProvider knows,
 * and a button to add another character.
 */
export const EsiCharacterSelection = () => {
  const esi = React.useContext(EsiContext);

  const isExpired = esi.currentCharacter && esi.characters[esi.currentCharacter].expired;

  return (
    <div className={styles.character}>
      <select onChange={(e) => esi.changeCharacter(e.target.value)} value={esi.currentCharacter}>
        {Object.entries(esi.characters)
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
        <button onClick={esi.refresh} title="Refresh access">
          R
        </button>
      )}
      {!isExpired && (
        <button onClick={esi.login} title="Add another character">
          +
        </button>
      )}
    </div>
  );
};
