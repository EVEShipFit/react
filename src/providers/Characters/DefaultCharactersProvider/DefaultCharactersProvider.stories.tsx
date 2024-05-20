import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { EveDataProvider } from "@/providers/EveDataProvider";

import { useCharacters } from "..";
import { DefaultCharactersProvider } from "./";

const meta: Meta<typeof DefaultCharactersProvider> = {
  component: DefaultCharactersProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DefaultCharactersProvider>;

const TestStory = () => {
  const characters = useCharacters();

  return (
    <div>
      {Object.values(characters).map((character) => {
        return (
          <div key={character.name}>
            {character.name} - {Object.keys(character.skills).length} skills
          </div>
        );
      })}
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
    <DefaultCharactersProvider {...args}>
      <TestStory />
    </DefaultCharactersProvider>
  ),
};
