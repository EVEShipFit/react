import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  name: string;
  sub: string;
}

export async function login(code: string): Promise<{
  accessToken: string;
  refreshToken: string;
  name: string;
  characterId: string;
} | null> {
  let response;
  try {
    response = await fetch("https://esi.eveship.fit/", {
      method: "POST",
      body: JSON.stringify({
        code: code,
      }),
    });
  } catch (e) {
    return null;
  }

  if (response.status !== 201) {
    return null;
  }

  const data = await response.json();

  /* Decode the access-token as it contains the name and character id. */
  const jwt = jwtDecode<JwtPayload>(data.access_token);
  if (!jwt.name || !jwt.sub?.startsWith("CHARACTER:EVE:")) {
    return null;
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const name = jwt.name;
  const characterId = jwt.sub.slice("CHARACTER:EVE:".length);

  return {
    accessToken,
    refreshToken,
    name,
    characterId,
  };
}
