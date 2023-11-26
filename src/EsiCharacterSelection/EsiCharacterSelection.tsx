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

  if (Object.keys(esi.characters ?? {}).length === 0) {
    return <div className={styles.character}>
      <button className={styles.noCharacter} onClick={esi.login}>
        Login to load characters skills and fits
      </button>
    </div>
  }

  return <div className={styles.character}>
    <select onChange={e => esi.changeCharacter(e.target.value)} value={esi.currentCharacter}>
      {Object.entries(esi.characters).map(([id, name]) => {
        return <option key={id} value={id}>{name.name}</option>
      })}
    </select>
    <button onClick={esi.login} title="Add another character">
      +
    </button>
  </div>
};
