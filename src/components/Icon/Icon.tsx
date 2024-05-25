import React from "react";

import { defaultDataUrl } from "@/settings";

const iconMapping = {
  "align-time": "texture/classes/fitting/statsicons/aligntime.png",
  "armor-hp": "texture/classes/fitting/statsicons/armorhp.png",
  "armor-repair-rate": "texture/classes/fitting/statsicons/armorrepairrate.png",
  "arrow-left": "texture/shared/triangleleft.png",
  "arrow-right": "texture/shared/triangleright.png",
  "cargo-hold": "texture/windowicons/ships.png",
  "damage-alpha": "texture/classes/fitting/statsicons/alphastrike.png",
  "damage-dps": "texture/classes/fitting/statsicons/turretdps.png",
  "drone-bay": "texture/windowicons/dronebay.png",
  "em-resistance": "texture/classes/fitting/statsicons/emresistance.png",
  "explosive-resistance": "texture/classes/fitting/statsicons/explosiveresistance.png",
  "fitting-alliance": "texture/classes/fitting/taballiancefits.png",
  "fitting-character": "texture/windowicons/member.png",
  "fitting-corporation": "texture/windowicons/corporation.png",
  "fitting-drones": "texture/classes/fitting/filtericondrones.png",
  "fitting-hislot": "texture/classes/fitting/filtericonhighslot.png",
  "fitting-hull": "texture/classes/fitting/tabfittings.png",
  "fitting-local": "texture/windowicons/note.png",
  "fitting-lowslot": "texture/classes/fitting/filtericonlowslot.png",
  "fitting-medslot": "texture/classes/fitting/filtericonmediumslot.png",
  "fitting-rig-subsystem": "texture/classes/fitting/filtericonrigslot.png",
  "hardpoint-launcher": "texture/classes/fitting/iconlauncherhardpoint.png",
  "hardpoint-turret": "texture/classes/fitting/iconturrethardpoint.png",
  "hull-hp": "texture/classes/fitting/statsicons/structurehp.png",
  "hull-repair-rate": "texture/classes/fitting/statsicons/hullrepairrate.png",
  "inertia-modifier": "texture/classes/fitting/statsicons/inertiamodifier.png",
  "kinetic-resistance": "texture/classes/fitting/statsicons/kineticresistance.png",
  mass: "texture/classes/fitting/statsicons/mass.png",
  "maximum-locked-targets": "texture/classes/fitting/statsicons/maximumlockedtargets.png",
  "menu-collapse": "texture/shared/triangleright.png",
  "menu-expand": "texture/shared/triangledown.png",
  "passive-shield-recharge": "texture/classes/fitting/statsicons/passiveshieldrecharge.png",
  "scan-resolution": "texture/classes/fitting/statsicons/scanresolution.png",
  "sensor-strength": "texture/classes/fitting/statsicons/sensorstrength.png",
  "shield-boost-rate": "texture/classes/fitting/statsicons/shieldboostrate.png",
  "shield-hp": "texture/classes/fitting/statsicons/shieldhp.png",
  "signature-radius": "texture/classes/fitting/statsicons/signatureradius.png",
  simulate: "texture/classes/fitting/iconsimulatorhover.png",
  "thermal-resistance": "texture/classes/fitting/statsicons/thermalresistance.png",
  "warp-speed": "texture/classes/fitting/statsicons/warpspeed.png",
} as const;

export type IconName = keyof typeof iconMapping;

export interface IconProps {
  /** Name of the icon. */
  name: IconName;
  /** Size (in pixels) of the icon. */
  size?: number;
  /** Title of the icon. */
  title?: string;
  /** Class name of the icon. */
  className?: string;
  /** Callback for when icon is clicked. */
  onClick?: () => void;
}

/**
 * Render a single attribute of a ship's snapshot.
 */
export const Icon = (props: IconProps) => {
  const icon = iconMapping[props.name];
  if (icon === undefined) {
    return <span>Unknown icon: {props.name}</span>;
  }
  return (
    <img
      src={`${defaultDataUrl}ui/${icon}`}
      width={props.size}
      title={props.title}
      className={props.className}
      onClick={props.onClick}
    />
  );
};
