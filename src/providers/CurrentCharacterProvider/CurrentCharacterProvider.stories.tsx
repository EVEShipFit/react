import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { CurrentCharacterProvider, useCurrentCharacter } from "./";
import { DefaultCharactersProvider, useCharacters } from "../Characters";
import { EsiCharactersProvider } from "../Characters/EsiCharactersProvider";
import { EveDataProvider } from "../EveDataProvider";

const meta: Meta<typeof CurrentCharacterProvider> = {
  component: CurrentCharacterProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CurrentCharacterProvider>;

const TestStory = () => {
  const currentCharacter = useCurrentCharacter();
  const characters = useCharacters();

  return (
    <div>
      <pre>{JSON.stringify(currentCharacter.character, null, 2)}</pre>
      Press button to load character:
      <br />
      {Object.keys(characters).map((characterId) => (
        <div key={characterId}>
          <button onClick={() => currentCharacter.setCharacterId(characterId)}>{characters[characterId].name}</button>
        </div>
      ))}
    </div>
  );
};

export const Default: Story = {
  argTypes: {
    children: { control: false },
  },
  decorators: [
    (Story) => {
      return (
        <EveDataProvider>
          <DefaultCharactersProvider>
            <EsiCharactersProvider>
              <Story />
            </EsiCharactersProvider>
          </DefaultCharactersProvider>
        </EveDataProvider>
      );
    },
  ],
  render: (args) => (
    <CurrentCharacterProvider {...args}>
      <TestStory />
    </CurrentCharacterProvider>
  ),
};
