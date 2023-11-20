import React from "react";

import { defaultDataUrl } from "../settings";

const iconMapping = {
  "align-time": "texture/classes/fitting/statsicons/aligntime.png",
  "armor-hp": "texture/classes/fitting/statsicons/armorhp.png",
  "armor-repair-rate": "texture/classes/fitting/statsicons/armorrepairrate.png",
  "em-resistance": "texture/classes/fitting/statsicons/emresistance.png",
  "explosive-resistance": "texture/classes/fitting/statsicons/explosiveresistance.png",
  "hull-hp": "texture/classes/fitting/statsicons/structurehp.png",
  "hull-repair-rate": "texture/classes/fitting/statsicons/hullrepairrate.png",
  "inertia-modifier": "texture/classes/fitting/statsicons/inertiamodifier.png",
  "kinetic-resistance": "texture/classes/fitting/statsicons/kineticresistance.png",
  "mass": "texture/classes/fitting/statsicons/mass.png",
  "maximum-locked-targets": "texture/classes/fitting/statsicons/maximumlockedtargets.png",
  "passive-shield-recharge": "texture/classes/fitting/statsicons/passiveshieldrecharge.png",
  "scan-resolution": "texture/classes/fitting/statsicons/scanresolution.png",
  "sensor-strength": "texture/classes/fitting/statsicons/sensorstrength.png",
  "shield-boost-rate": "texture/classes/fitting/statsicons/shieldboostrate.png",
  "shield-hp": "texture/classes/fitting/statsicons/shieldhp.png",
  "signature-radius": "texture/classes/fitting/statsicons/signatureradius.png",
  "thermal-resistance": "texture/classes/fitting/statsicons/thermalresistance.png",
  "warp-speed": "texture/classes/fitting/statsicons/warpspeed.png",
} as const;

export type IconName = keyof typeof iconMapping;

export interface IconProps {
  /** Name of the icon. */
  name: IconName;
  /** Size (in pixels) of the icon. */
  size?: number;
}

/**
 * Render a single attribute of a ship's snapshot.
 */
export const Icon = (props: IconProps) => {
  const icon = iconMapping[props.name];
  if (icon === undefined) {
    return <span>Unknown icon: {props.name}</span>;
  }
  return <img src={`${defaultDataUrl}ui/${icon}`} width={props.size} />
};
