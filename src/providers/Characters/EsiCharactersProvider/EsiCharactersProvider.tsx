import React from "react";

import { Character } from "@/providers/CurrentCharacterProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { useLocalStorage } from "@/hooks/LocalStorage";

import { CharactersContext, useCharactersInternal } from "../CharactersContext";
import { getAccessToken } from "./EsiGetAccessToken";
import { getSkills } from "./EsiGetSkills";
import { getCharFittings } from "./EsiGetFittings";
import { login } from "./EsiLogin";

interface EsiLocalCharacters {
  name: string;
}

interface EsiCharacters {
  login: () => void;
  refresh: () => void;
}

const EsiCharactersContext = React.createContext<EsiCharacters>({
  login: () => {
    if (typeof window === "undefined") return;
    window.location.href = "https://esi.eveship.fit/";
  },
  refresh: () => {
    if (typeof window === "undefined") return;
    window.location.href = "https://esi.eveship.fit/";
  },
});

export const useEsiCharacters = () => {
  return React.useContext(EsiCharactersContext);
};

interface EsiProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

const createEmptyCharacter = (name: string): Character => {
  return {
    name,
    skills: {},
    fittings: [],
    expired: false,
  };
};

/**
 * Provisions all logged-in ESI characters.
 *
 * Refresh-tokens and characters are stored in the LocalStorage of the browser.
 * Use `useEsiCharacters` to refresh or login a character.
 *
 * Requires `EveDataProvider` to be present as parent in the component tree.
 *
 * CharactersProviders can be stacked in what ever way works out best.
 */
export const EsiCharactersProvider = (props: EsiProps) => {
  const characters = useCharactersInternal();
  const eveData = useEveData();

  const [firstLoad, setFirstLoad] = React.useState(true);

  const [esiCharacters, setEsiCharacters] = React.useState<Record<string, Character>>({});
  const [accessTokens, setAccessTokens] = React.useState<Record<string, string>>({});
  const [characterIdChangeRequest, setCharacterIdChangeRequest] = React.useState<string | null>(null);

  const [storedCharacters, setStoredCharacters] = useLocalStorage<Record<string, EsiLocalCharacters>>("characters", {});
  const [refreshTokens, setRefreshTokens] = useLocalStorage<Record<string, string>>("refreshTokens", {});

  /* Use reference for callbacks; they only want to read the content, and are never triggered because of it. */
  const accessTokensRef = React.useRef(accessTokens);
  const refreshTokensRef = React.useRef(refreshTokens);
  const esiCharactersRef = React.useRef(esiCharacters);
  accessTokensRef.current = accessTokens;
  refreshTokensRef.current = refreshTokens;
  esiCharactersRef.current = esiCharacters;

  const ensureAccessToken = React.useCallback(
    async (characterId: string): Promise<string | undefined> => {
      if (accessTokensRef.current[characterId] !== undefined) {
        return accessTokensRef.current[characterId];
      }

      const { accessToken, refreshToken } = await getAccessToken(refreshTokensRef.current[characterId]);
      if (accessToken === undefined || refreshToken === undefined) {
        /* Refresh-token is no longer valid; mark the character as expired. */
        setEsiCharacters((oldEsiCharacters: Record<string, Character>) => {
          return {
            ...oldEsiCharacters,
            [characterId]: {
              ...oldEsiCharacters[characterId],
              expired: true,
            },
          };
        });

        return undefined;
      }

      setAccessTokens((oldAccessTokens: Record<string, string>) => {
        return {
          ...oldAccessTokens,
          [characterId]: accessToken,
        };
      });
      setRefreshTokens((oldRefreshTokens: Record<string, string>) => {
        return {
          ...oldRefreshTokens,
          [characterId]: refreshToken,
        };
      });

      return accessToken;
    },
    [setAccessTokens, setRefreshTokens],
  );

  const updateCharacter = React.useCallback(
    async (characterId: string) => {
      if (eveData === null) return;
      if (esiCharactersRef.current[characterId] === undefined) return;

      /* Skills already fetched? We won't do it again till the user reloads. */
      if (Object.keys(esiCharactersRef.current[characterId]?.skills).length !== 0) {
        return;
      }

      const accessToken = await ensureAccessToken(characterId);
      if (accessToken === undefined) return;

      const skills = await getSkills(characterId, accessToken);
      if (skills === undefined) return;
      const fittings = await getCharFittings(characterId, accessToken);
      if (fittings === undefined) return;

      /* Ensure all skills are set; also those not learnt. */
      for (const typeId in eveData.typeIDs) {
        if (eveData?.typeIDs[typeId].categoryID !== 16) continue;
        if (skills[typeId] !== undefined) continue;
        skills[typeId] = 0;
      }

      setEsiCharacters((oldEsiCharacters: Record<string, Character>) => {
        return {
          ...oldEsiCharacters,
          [characterId]: {
            ...oldEsiCharacters[characterId],
            skills,
            fittings,
          },
        };
      });
    },
    [setEsiCharacters, ensureAccessToken, eveData],
  );

  if (firstLoad) {
    setFirstLoad(false);

    async function loginCharacter(code: string) {
      const character = await login(code);
      if (character === null) return;

      setAccessTokens((oldAccessTokens: Record<string, string>) => {
        return {
          ...oldAccessTokens,
          [character.characterId]: character.accessToken,
        };
      });
      setRefreshTokens((oldRefreshTokens: Record<string, string>) => {
        return {
          ...oldRefreshTokens,
          [character.characterId]: character.refreshToken,
        };
      });
      setStoredCharacters((oldStoredCharacters: Record<string, EsiLocalCharacters>) => {
        return {
          ...oldStoredCharacters,
          [character.characterId]: {
            name: character.name,
          },
        };
      });
      setEsiCharacters((oldEsiCharacters: Record<string, Character>) => {
        return {
          ...oldEsiCharacters,
          [character.characterId]: createEmptyCharacter(character.name),
        };
      });

      setCharacterIdChangeRequest(character.characterId);

      return true;
    }

    /* Check if this was a login request. */
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      /* Remove the code from the URL. */
      window.history.replaceState(null, "", window.location.pathname + window.location.hash);

      loginCharacter(code);
    }

    /* Restore characters from local storage. */
    const newEsiCharacters: Record<string, Character> = {};
    for (const characterId in storedCharacters) {
      const character = storedCharacters[characterId];
      newEsiCharacters[characterId] = createEmptyCharacter(character.name);
    }

    setEsiCharacters(newEsiCharacters);
  }

  const contextValue = React.useMemo(() => {
    return {
      onCharacterIdChange: (characterId: string) => {
        updateCharacter(characterId);
        characters.onCharacterIdChange(characterId);
      },
      characters: {
        ...characters.characters,
        ...esiCharacters,
      },
      characterIdChangeRequest: characterIdChangeRequest ?? characters.characterIdChangeRequest,
    };
  }, [characters, esiCharacters, characterIdChangeRequest, updateCharacter]);

  return <CharactersContext.Provider value={contextValue}>{props.children}</CharactersContext.Provider>;
};
