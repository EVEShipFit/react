export async function getAccessToken(refreshToken: string): Promise<{ accessToken?: string, refreshToken?: string }> {
  let response;
  try {
    response = await fetch('https://esi.eveship.fit/', {
      method: 'POST',
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });
  } catch (e) {
    return {};
  }

  if (response.status !== 201) {
    return {};
  }

  const data = await response.json();
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
};
