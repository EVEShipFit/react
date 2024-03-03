export async function getSkills(characterId: string, accessToken: string): Promise<Record<string, number> | undefined> {
  let response;
  try {
    response = await fetch(`https://esi.evetech.net/v4/characters/${characterId}/skills/`, {
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
  const skills: Record<string, number> = {};

  for (const skill of data.skills) {
    skills[skill.skill_id] = skill.active_skill_level;
  }

  return skills;
}
