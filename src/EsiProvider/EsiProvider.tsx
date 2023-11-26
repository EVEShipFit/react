import { jwtDecode } from "jwt-decode";
import React from "react";
import { getAccessToken } from "./EsiAccessToken";
import { getSkills } from "./EsiSkills";

export interface EsiCharacter {
  name: string;
  skills?: Record<string, number>;
}

export interface Esi {
  loaded?: boolean;
  characters: Record<string, EsiCharacter>;
  currentCharacter?: string;

  changeCharacter: (character: string) => void;
  login: () => void;
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
});

export interface EsiProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

const useLocalStorage = function <T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setValue = React.useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') return;
    if (storedValue == value) return;

    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);

    if (valueToStore === undefined) {
      window.localStorage.removeItem(key);
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  }, [key, storedValue]);

  return [ storedValue, setValue ] as const;
}

/**
 * Keeps track (in local storage) of ESI characters and their refresh token.
 */
export const EsiProvider = (props: EsiProps) => {
  const [esi, setEsi] = React.useState<Esi>({
    loaded: undefined,
    characters: {},
    changeCharacter: () => {},
    login: () => {},
  });
  const [esiPrivate, setEsiPrivate] = React.useState<EsiPrivate>({
    loaded: undefined,
    refreshTokens: {},
    accessTokens: {},
  });

  const [characters, setCharacters] = useLocalStorage<Record<string, EsiCharacter>>('characters', {});
  const [refreshTokens, setRefreshTokens] = useLocalStorage('refreshTokens', {});
  const [currentCharacter, setCurrentCharacter] = useLocalStorage<string | undefined>('currentCharacter', undefined);

  const changeCharacter = React.useCallback((character: string) => {
    setCurrentCharacter(character);

    setEsi((oldEsi: Esi) => {
      return {
        ...oldEsi,
        currentCharacter: character,
      };
    });
  }, [setCurrentCharacter]);

  const login = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    window.location.href = "https://esi.eveship.fit/";
  }, []);

  const ensureAccessToken = React.useCallback(async (characterId: string): Promise<string | undefined> => {
    if (esiPrivate.accessTokens[characterId]) {
      return esiPrivate.accessTokens[characterId];
    }

    const { accessToken, refreshToken } = await getAccessToken(esiPrivate.refreshTokens[characterId]);
    if (accessToken === undefined || refreshToken === undefined) {
      console.log('Failed to get access token');
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
  }, [esiPrivate.accessTokens, esiPrivate.refreshTokens]);

  React.useEffect(() => {
    const characterId = esi.currentCharacter;
    if (characterId === undefined) return;
    /* Skills already fetched? We won't do it again till the user reloads. */
    if (esi.characters[characterId]?.skills !== undefined) return;

    ensureAccessToken(characterId).then((accessToken) => {
      if (accessToken === undefined) return;

      getSkills(characterId, accessToken).then((skills) => {
        if (skills === undefined) return;

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
      });
    });

    /* We only update when currentCharacter changes, and ignore all others. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esi.currentCharacter]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    async function loginCharacter(code: string) {
      let response;
      try {
        response = await fetch('https://esi.eveship.fit/', {
          method: 'POST',
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
      setEsi({
        loaded: true,
        characters,
        currentCharacter,
        changeCharacter,
        login,
      });
      setEsiPrivate({
        loaded: true,
        refreshTokens,
        accessTokens: {},
      });

      /* Check if this was a login request. */
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        /* Remove the code from the URL. */
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);

        if (!await loginCharacter(code)) {
          console.log('Failed to login character');
        }
      }
    }

    startup();

    /* This should only on first start. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <EsiContext.Provider value={esi}>
    {props.children}
  </EsiContext.Provider>
};
