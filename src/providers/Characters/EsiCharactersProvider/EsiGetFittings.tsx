import { EsfFit } from "@/providers/CurrentFitProvider";

export async function getCharFittings(characterId: string, accessToken: string): Promise<EsfFit[] | undefined> {
  let response;
  try {
    response = await fetch(`https://esi.evetech.net/v1/characters/${characterId}/fittings/`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
    });
  } catch (e) {
    return undefined;
  }

  if (response.status !== 200) return undefined;

  const data = await response.json();
  return data;
}
