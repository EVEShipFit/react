import React from "react";

import { EveDataContext } from '../EveDataProvider';
import { ShipSnapshotContext } from '../ShipSnapshotProvider';

import { FitLink } from './FitLink';
import { Hull } from './Hull';
import { Slot } from './Slot';

import styles from "./ShipFit.module.css";

export interface ShipFitProps {
  radius?: number;
}

/**
 * Render a ship fit similar to how it is done in-game.
 */
export const ShipFit = (props: ShipFitProps) => {
  const radius = props.radius ?? 365;

  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  const scaleStyle = {
    "--radius": `${radius}px`,
    "--scale": `${radius / 365}`
  } as React.CSSProperties;

  const slots = {
    "hislot": 0,
    "medslot": 0,
    "lowslot": 0,
    "subsystem": 0,
    "rig": 0,
  };

  if (shipSnapshot?.loaded) {
    slots.hislot = shipSnapshot.hull?.attributes.get(eveData?.attributeMapping?.hiSlots || 0)?.value || 0;
    slots.medslot = shipSnapshot.hull?.attributes.get(eveData?.attributeMapping?.medSlots || 0)?.value || 0;
    slots.lowslot = shipSnapshot.hull?.attributes.get(eveData?.attributeMapping?.lowSlots || 0)?.value || 0;
    slots.subsystem = shipSnapshot.hull?.attributes.get(eveData?.attributeMapping?.maxSubSystems || 0)?.value || 0;
    slots.rig = shipSnapshot.hull?.attributes.get(eveData?.attributeMapping?.rigSlots || 0)?.value || 0;

    const items = shipSnapshot.items || [];
    for (const item of items) {
      slots.hislot += item.attributes.get(eveData?.attributeMapping?.hiSlotModifier || 0)?.value || 0;
      slots.medslot += item.attributes.get(eveData?.attributeMapping?.medSlotModifier || 0)?.value || 0;
      slots.lowslot += item.attributes.get(eveData?.attributeMapping?.lowSlotModifier || 0)?.value || 0;
    }
  }

  return <div className={styles.fit} style={scaleStyle}>
    <div className={styles.outerBand} />
    <div className={styles.innerBand} />

    <Hull />
    <FitLink />

    <div className={styles.slots}>
      <Slot type="subsystem" index={1} fittable={slots.subsystem >= 1} rotation="-125deg" />
      <Slot type="subsystem" index={2} fittable={slots.subsystem >= 2} rotation="-114deg" />
      <Slot type="subsystem" index={3} fittable={slots.subsystem >= 3} rotation="-103deg" />
      <Slot type="subsystem" index={4} fittable={slots.subsystem >= 4} rotation="-92deg" />

      <Slot type="rig" index={1} fittable={slots.rig >= 1} rotation="-73deg" />
      <Slot type="rig" index={2} fittable={slots.rig >= 2} rotation="-63deg" />
      <Slot type="rig" index={3} fittable={slots.rig >= 3} rotation="-53deg" />

      <Slot type="hislot" index={1} fittable={slots.hislot >= 1} rotation="-34deg" />
      <Slot type="hislot" index={2} fittable={slots.hislot >= 2} rotation="-24deg" />
      <Slot type="hislot" index={3} fittable={slots.hislot >= 3} rotation="-14deg" />
      <Slot type="hislot" index={4} fittable={slots.hislot >= 4} rotation="-4deg" />
      <Slot type="hislot" index={5} fittable={slots.hislot >= 5} rotation="6deg" />
      <Slot type="hislot" index={6} fittable={slots.hislot >= 6} rotation="16deg" />
      <Slot type="hislot" index={7} fittable={slots.hislot >= 7} rotation="26deg" />
      <Slot type="hislot" index={8} fittable={slots.hislot >= 8} rotation="36deg" />

      <Slot type="medslot" index={1} fittable={slots.medslot >= 1} rotation="55deg" />
      <Slot type="medslot" index={2} fittable={slots.medslot >= 2} rotation="65deg" />
      <Slot type="medslot" index={3} fittable={slots.medslot >= 3} rotation="75deg" />
      <Slot type="medslot" index={4} fittable={slots.medslot >= 4} rotation="85deg" />
      <Slot type="medslot" index={5} fittable={slots.medslot >= 5} rotation="95deg" />
      <Slot type="medslot" index={6} fittable={slots.medslot >= 6} rotation="105deg" />
      <Slot type="medslot" index={7} fittable={slots.medslot >= 7} rotation="115deg" />
      <Slot type="medslot" index={8} fittable={slots.medslot >= 8} rotation="125deg" />

      <Slot type="lowslot" index={1} fittable={slots.lowslot >= 1} rotation="144deg" />
      <Slot type="lowslot" index={2} fittable={slots.lowslot >= 2} rotation="154deg" />
      <Slot type="lowslot" index={3} fittable={slots.lowslot >= 3} rotation="164deg" />
      <Slot type="lowslot" index={4} fittable={slots.lowslot >= 4} rotation="174deg" />
      <Slot type="lowslot" index={5} fittable={slots.lowslot >= 5} rotation="184deg" />
      <Slot type="lowslot" index={6} fittable={slots.lowslot >= 6} rotation="194deg" />
      <Slot type="lowslot" index={7} fittable={slots.lowslot >= 7} rotation="204deg" />
      <Slot type="lowslot" index={8} fittable={slots.lowslot >= 8} rotation="214deg" />
    </div>
  </div>
};
