import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { fitArgType } from "../../../.storybook/fits";
import { useFitSelection, withDecoratorFull } from "../../../.storybook/helpers";

import { HardwareListing } from "@/components/HardwareListing";
import { HullListing } from "@/components/HullListing";
import { ShipStatistics } from "@/components/ShipStatistics";
import { EsfFit } from "@/providers/CurrentFitProvider";

import { ShipFitExtended } from "./";

type StoryProps = React.ComponentProps<typeof ShipFitExtended> & { fit: EsfFit | null; width: number };

const meta: Meta<StoryProps> = {
  component: ShipFitExtended,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<StoryProps>;

export const Default: Story = {
  argTypes: {
    fit: fitArgType,
  },
  args: {
    fit: null,
    width: 730,
  },
  decorators: [withDecoratorFull],
  render: ({ fit, width, ...args }) => {
    useFitSelection(fit);

    return (
      <div style={{ width: width, height: width }}>
        <ShipFitExtended {...args} />
      </div>
    );
  },
};

export const WithHardwareListing: Story = {
  argTypes: {
    fit: fitArgType,
  },
  args: {
    fit: null,
  },
  decorators: [withDecoratorFull],
  render: ({ fit, width, ...args }) => {
    useFitSelection(fit);

    return (
      <div style={{ width: 1530, height: 730, display: "flex" }}>
        <div style={{ width: 400 }}>
          <HardwareListing />
        </div>
        <div style={{ width: 100 }}></div>
        <div style={{ width: 730, height: 730 }}>
          <ShipFitExtended {...args} />
        </div>
        <div style={{ width: 100 }}></div>
        <div style={{ width: 200 }}>
          <ShipStatistics />
        </div>
      </div>
    );
  },
};

export const WithHullListing: Story = {
  argTypes: {
    fit: fitArgType,
  },
  args: {
    fit: null,
  },
  decorators: [withDecoratorFull],
  render: ({ fit, width, ...args }) => {
    useFitSelection(fit);

    return (
      <div style={{ width: 1530, height: 730, display: "flex" }}>
        <div style={{ width: 400 }}>
          <HullListing />
        </div>
        <div style={{ width: 100 }}></div>
        <div style={{ width: 730, height: 730 }}>
          <ShipFitExtended {...args} />
        </div>
        <div style={{ width: 100 }}></div>
        <div style={{ width: 200 }}>
          <ShipStatistics />
        </div>
      </div>
    );
  },
};
