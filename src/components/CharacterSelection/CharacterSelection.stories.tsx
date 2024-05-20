import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { EveDataProvider } from "@/providers/EveDataProvider";
import { DefaultCharactersProvider, EsiCharactersProvider } from "@/providers/Characters";
import { CurrentCharacterProvider } from "@/providers/CurrentCharacterProvider";

import { CharacterSelection } from "./";

const meta: Meta<typeof CharacterSelection> = {
  component: CharacterSelection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CharacterSelection>;

export const Default: Story = {
  render: () => (
    <EveDataProvider>
      <DefaultCharactersProvider>
        <EsiCharactersProvider>
          <CurrentCharacterProvider>
            <CharacterSelection />
          </CurrentCharacterProvider>
        </EsiCharactersProvider>
      </DefaultCharactersProvider>
    </EveDataProvider>
  ),
};
