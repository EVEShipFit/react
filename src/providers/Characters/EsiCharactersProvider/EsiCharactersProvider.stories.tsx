import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { EveDataProvider } from "@/providers/EveDataProvider";

import { useCharacters, useCharactersInternal } from "../CharactersContext";
import { EsiCharactersProvider } from "./";

const meta: Meta<typeof EsiCharactersProvider> = {
  component: EsiCharactersProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EsiCharactersProvider>;

const TestStory = () => {
  const characters = useCharacters();
  const charactersInternal = useCharactersInternal();

  return (
    <div>
      {Object.values(characters).map((character) => {
        return (
          <div key={character.name}>
            {character.name} - {Object.keys(character.skills).length} skills, {Object.keys(character.fittings).length}{" "}
            fits {character.expired && " (expired)"}
          </div>
        );
      })}

      <div>
        <br />
        Press button to load character:
        <br />
        {Object.keys(characters).map((characterId) => (
          <div key={characterId}>
            <button onClick={() => charactersInternal.onCharacterIdChange(characterId)}>
              {characters[characterId].name}
            </button>
          </div>
        ))}
      </div>
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
          <Story />
        </EveDataProvider>
      );
    },
  ],
  render: (args) => (
    <EsiCharactersProvider {...args}>
      <TestStory />
    </EsiCharactersProvider>
  ),
};
