export async function getAccessToken(refreshToken: string): Promise<string | undefined> {
  let response;
  try {
    response = await fetch('https://esi.eveship.fit/', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
  } catch (e) {
    return undefined;
  }

  if (response.status !== 201) {
    return undefined;
  }

  const data = await response.json();
  return data.access_token;
};
