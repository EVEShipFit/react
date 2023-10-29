import type { Decorator, Meta, StoryObj } from '@storybook/react';
import React from "react";

import { EveDataProvider  } from '../EveDataProvider';
import { FormatEftToEsi } from './FormatEftToEsi';

const meta: Meta<typeof FormatEftToEsi> = {
  component: FormatEftToEsi,
  tags: ['autodocs'],
  title: 'Function/EftToEsiJson',
};

const withEveDataProvider: Decorator<{eft: string}> = (Story) => {
  return (
    <EveDataProvider>
      <Story />
    </EveDataProvider>
  );
}

export default meta;
type Story = StoryObj<typeof FormatEftToEsi>;

export const Default: Story = {
  args: {
    eft: `[Loki,Loki basic PVE]
Caldari Navy Ballistic Control System
Caldari Navy Ballistic Control System
Caldari Navy Ballistic Control System
Damage Control II

Gist X-Type Large Shield Booster
Republic Fleet Large Cap Battery
Missile Guidance Computer II
10MN Afterburner II
Multispectrum Shield Hardener II

Heavy Assault Missile Launcher II, Mjolnir Rage Heavy Assault Missile
Heavy Assault Missile Launcher II, Mjolnir Rage Heavy Assault Missile
Heavy Assault Missile Launcher II, Mjolnir Rage Heavy Assault Missile
Heavy Assault Missile Launcher II, Mjolnir Rage Heavy Assault Missile
Heavy Assault Missile Launcher II, Mjolnir Rage Heavy Assault Missile
Covert Ops Cloaking Device II
Sisters Core Probe Launcher

Medium Hydraulic Bay Thrusters II
Medium Rocket Fuel Cache Partition II
Medium Rocket Fuel Cache Partition I

Loki Core - Augmented Nuclear Reactor
Loki Defensive - Covert Reconfiguration
Loki Offensive - Launcher Efficiency Configuration
Loki Propulsion - Wake Limiter
`,
  },
  decorators: [withEveDataProvider],
};
