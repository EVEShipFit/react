import { jwtDecode } from "jwt-decode";
import React from "react";

import { EsiFit, ShipSnapshotContext } from "../ShipSnapshotProvider";

import { getAccessToken } from "./EsiAccessToken";
import { getSkills } from "./EsiSkills";
import { getCharFittings } from "./EsiFittings";
import { EveDataContext } from "../EveDataProvider";

import { useLocalStorage } from "../../hooks/LocalStorage";

export interface EsiCharacter {
  name: string;
  expired: boolean;
  skills?: Record<string, number>;
  charFittings?: EsiFit[];
}

export interface Esi {
  loaded?: boolean;
  characters: Record<string, EsiCharacter>;
  currentCharacter?: string;

  changeCharacter: (character: string) => void;
  login: () => void;
  refresh: () => void;
}

interface EsiPrivate {
  loaded?: boolean;
  refreshTokens: Record<string, string>;
  accessTokens: Record<string, string>;
}

interface JwtPayload {
  name: string;
  sub: string;
}

export const EsiContext = React.createContext<Esi>({
  loaded: undefined,
  characters: {},
  changeCharacter: () => {},
  login: () => {},
  refresh: () => {},
});

export interface EsiProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

/**
 * Keeps track (in local storage) of ESI characters and their refresh token.
 */
export const EsiProvider = (props: EsiProps) => {
  const eveData = React.useContext(EveDataContext);
  const snapshot = React.useContext(ShipSnapshotContext);

  const [esi, setEsi] = React.useState<Esi>({
    loaded: undefined,
    characters: {},
    changeCharacter: () => {},
    login: () => {},
    refresh: () => {},
  });
  const [esiPrivate, setEsiPrivate] = React.useState<EsiPrivate>({
    loaded: undefined,
    refreshTokens: {},
    accessTokens: {},
  });

  const [characters, setCharacters] = useLocalStorage<Record<string, EsiCharacter>>("characters", {});
  const [refreshTokens, setRefreshTokens] = useLocalStorage("refreshTokens", {});
  const [currentCharacter, setCurrentCharacter] = useLocalStorage<string | undefined>("currentCharacter", undefined);

  const changeCharacter = React.useCallback(
    (character: string) => {
      setCurrentCharacter(character);

      setEsi((oldEsi: Esi) => {
        return {
          ...oldEsi,
          currentCharacter: character,
        };
      });
    },
    [setCurrentCharacter],
  );

  const login = React.useCallback(() => {
    if (typeof window === "undefined") return;
    window.location.href = "https://esi.eveship.fit/";
  }, []);
  const refresh = React.useCallback(() => {
    if (typeof window === "undefined") return;
    window.location.href = "https://esi.eveship.fit/";
  }, []);

  const ensureAccessToken = React.useCallback(
    async (characterId: string): Promise<string | undefined> => {
      if (esiPrivate.accessTokens[characterId]) {
        return esiPrivate.accessTokens[characterId];
      }

      const { accessToken, refreshToken } = await getAccessToken(esiPrivate.refreshTokens[characterId]);
      if (accessToken === undefined || refreshToken === undefined) {
        setEsi((oldEsi: Esi) => {
          return {
            ...oldEsi,
            characters: {
              ...oldEsi.characters,
              [characterId]: {
                ...oldEsi.characters[characterId],
                expired: true,
              },
            },
          };
        });

        return undefined;
      }

      /* New access token; store for later use. */
      setEsiPrivate((oldEsiPrivate: EsiPrivate) => {
        return {
          ...oldEsiPrivate,
          refreshTokens: {
            ...oldEsiPrivate.refreshTokens,
            [characterId]: refreshToken,
          },
          accessToken: {
            ...oldEsiPrivate.accessTokens,
            [characterId]: accessToken,
          },
        };
      });

      return accessToken;
    },
    [esiPrivate.accessTokens, esiPrivate.refreshTokens],
  );

  React.useEffect(() => {
    if (!eveData.loaded) return;

    const characterId = esi.currentCharacter;
    if (characterId === undefined) return;
    /* Skills already fetched? We won't do it again till the user reloads. */
    const currentSkills = esi.characters[characterId]?.skills;
    if (currentSkills !== undefined) {
      snapshot.changeSkills(currentSkills);
      return;
    }

    if (characterId === ".all-0" || characterId === ".all-5") {
      const level = characterId === ".all-0" ? 0 : 5;

      const skills: Record<string, number> = {};
      for (const typeId in eveData.typeIDs) {
        if (eveData?.typeIDs?.[typeId].categoryID !== 16) continue;
        skills[typeId] = level;
      }

      setEsi((oldEsi: Esi) => {
        return {
          ...oldEsi,
          characters: {
            ...oldEsi.characters,
            [characterId]: {
              ...oldEsi.characters[characterId],
              skills,
              charFittings: [],
            },
          },
        };
      });

      snapshot.changeSkills(skills);
      return;
    }

    ensureAccessToken(characterId).then((accessToken) => {
      if (accessToken === undefined) return;

      getSkills(characterId, accessToken).then((skills) => {
        if (skills === undefined) return;

        /* Ensure all skills are set; also those not learnt. */
        for (const typeId in eveData.typeIDs) {
          if (eveData?.typeIDs?.[typeId].categoryID !== 16) continue;
          if (skills[typeId] !== undefined) continue;
          skills[typeId] = 0;
        }

        setEsi((oldEsi: Esi) => {
          return {
            ...oldEsi,
            characters: {
              ...oldEsi.characters,
              [characterId]: {
                ...oldEsi.characters[characterId],
                skills,
              },
            },
          };
        });

        snapshot.changeSkills(skills);
      });

      getCharFittings(characterId, accessToken).then((charFittings) => {
        if (charFittings === undefined) return;

        setEsi((oldEsi: Esi) => {
          return {
            ...oldEsi,
            characters: {
              ...oldEsi.characters,
              [characterId]: {
                ...oldEsi.characters[characterId],
                charFittings,
              },
            },
          };
        });
      });
    });

    /* We only update when currentCharacter changes, and ignore all others. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esi.currentCharacter, eveData.loaded]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    async function loginCharacter(code: string) {
      let response;
      try {
        response = await fetch("https://esi.eveship.fit/", {
          method: "POST",
          body: JSON.stringify({
            code: code,
          }),
        });
      } catch (e) {
        return false;
      }

      if (response.status !== 201) {
        return false;
      }

      const data = await response.json();

      /* Decode the access-token as it contains the name and character id. */
      const jwt = jwtDecode<JwtPayload>(data.access_token);
      if (!jwt.name || !jwt.sub?.startsWith("CHARACTER:EVE:")) {
        return false;
      }

      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;
      const name = jwt.name;
      const characterId = jwt.sub.slice("CHARACTER:EVE:".length);

      /* Update the local storage with the new character. */
      setCharacters((oldCharacters: Record<string, EsiCharacter>) => {
        return {
          ...oldCharacters,
          [characterId]: {
            name: name,
            expired: false,
          },
        };
      });
      setRefreshTokens((oldRefreshTokens: Record<string, string>) => {
        return {
          ...oldRefreshTokens,
          [characterId]: refreshToken,
        };
      });
      setCurrentCharacter(characterId);

      /* Update the current render with the new character. */
      setEsi((oldEsi: Esi) => {
        return {
          ...oldEsi,
          characters: {
            ...oldEsi.characters,
            [characterId]: {
              name: name,
              expired: false,
            },
          },
          currentCharacter: characterId,
        };
      });
      setEsiPrivate((oldEsiPrivate: EsiPrivate) => {
        return {
          ...oldEsiPrivate,
          refreshTokens: {
            ...oldEsiPrivate.refreshTokens,
            [characterId]: refreshToken,
          },
          accessToken: {
            ...oldEsiPrivate.accessTokens,
            [characterId]: accessToken,
          },
        };
      });

      return true;
    }

    async function startup() {
      const charactersDefault = {
        ".all-0": {
          name: "Default character - All Skills L0",
          expired: false,
        },
        ".all-5": {
          name: "Default character - All Skills L5",
          expired: false,
        },
        ...characters,
      };

      setEsi({
        loaded: true,
        characters: charactersDefault,
        currentCharacter,
        changeCharacter,
        login,
        refresh,
      });
      setEsiPrivate({
        loaded: true,
        refreshTokens,
        accessTokens: {},
      });

      /* Check if this was a login request. */
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        /* Remove the code from the URL. */
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);

        if (!(await loginCharacter(code))) {
          console.log("Failed to login character");
        }
      }
    }

    startup();

    /* This should only on first start. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <EsiContext.Provider value={esi}>{props.children}</EsiContext.Provider>;
};
