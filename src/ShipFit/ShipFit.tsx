import React from "react";

import { ShipSnapshotContext } from "../ShipSnapshotProvider";

import { FitLink } from "./FitLink";
import { Hull } from "./Hull";
import { Slot } from "./Slot";
import { RadialMenu } from "./RadialMenu";
import { RingOuter } from "./RingOuter";
import { RingInner } from "./RingInner";
import { RingTop, RingTopItem } from "./RingTop";

import styles from "./ShipFit.module.css";

/**
 * Render a ship fit similar to how it is done in-game.
 */
export const ShipFit = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);
  const slots = shipSnapshot.slots;

  return (
    <div className={styles.fit}>
      <RingOuter />
      <RingInner />

      <Hull />
      <FitLink />

      <RingTop>
        <RingTopItem rotation={-45}>
          <RadialMenu type="hislot" />
        </RingTopItem>

        <RingTopItem rotation={-36.5 + (71 / 7) * 0}>
          <Slot type="hislot" index={1} fittable={slots?.hislot >= 1} main />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 1}>
          <Slot type="hislot" index={2} fittable={slots?.hislot >= 2} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 2}>
          <Slot type="hislot" index={3} fittable={slots?.hislot >= 3} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 3}>
          <Slot type="hislot" index={4} fittable={slots?.hislot >= 4} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 4}>
          <Slot type="hislot" index={5} fittable={slots?.hislot >= 5} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 5}>
          <Slot type="hislot" index={6} fittable={slots?.hislot >= 6} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 6}>
          <Slot type="hislot" index={7} fittable={slots?.hislot >= 7} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 7}>
          <Slot type="hislot" index={8} fittable={slots?.hislot >= 8} />
        </RingTopItem>

        <RingTopItem rotation={43}>
          <RadialMenu type="medslot" />
        </RingTopItem>

        <RingTopItem rotation={53 + (72 / 7) * 0}>
          <Slot type="medslot" index={1} fittable={slots?.medslot >= 1} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 1}>
          <Slot type="medslot" index={2} fittable={slots?.medslot >= 2} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 2}>
          <Slot type="medslot" index={3} fittable={slots?.medslot >= 3} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 3}>
          <Slot type="medslot" index={4} fittable={slots?.medslot >= 4} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 4}>
          <Slot type="medslot" index={5} fittable={slots?.medslot >= 5} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 5}>
          <Slot type="medslot" index={6} fittable={slots?.medslot >= 6} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 6}>
          <Slot type="medslot" index={7} fittable={slots?.medslot >= 7} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 7}>
          <Slot type="medslot" index={8} fittable={slots?.medslot >= 8} />
        </RingTopItem>

        <RingTopItem rotation={133}>
          <RadialMenu type="lowslot" />
        </RingTopItem>

        <RingTopItem rotation={142 + (72 / 7) * 0}>
          <Slot type="lowslot" index={1} fittable={slots?.lowslot >= 1} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 1}>
          <Slot type="lowslot" index={2} fittable={slots?.lowslot >= 2} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 2}>
          <Slot type="lowslot" index={3} fittable={slots?.lowslot >= 3} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 3}>
          <Slot type="lowslot" index={4} fittable={slots?.lowslot >= 4} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 4}>
          <Slot type="lowslot" index={5} fittable={slots?.lowslot >= 5} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 5}>
          <Slot type="lowslot" index={6} fittable={slots?.lowslot >= 6} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 6}>
          <Slot type="lowslot" index={7} fittable={slots?.lowslot >= 7} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 7}>
          <Slot type="lowslot" index={8} fittable={slots?.lowslot >= 8} />
        </RingTopItem>

        <RingTopItem rotation={-74 + (21 / 2) * 0}>
          <Slot type="rig" index={1} fittable={slots?.rig >= 1} />
        </RingTopItem>
        <RingTopItem rotation={-74 + (21 / 2) * 1}>
          <Slot type="rig" index={2} fittable={slots?.rig >= 2} />
        </RingTopItem>
        <RingTopItem rotation={-74 + (21 / 2) * 2}>
          <Slot type="rig" index={3} fittable={slots?.rig >= 3} />
        </RingTopItem>

        <RingTopItem rotation={-128 + (38 / 3) * 0}>
          <Slot type="subsystem" index={1} fittable={slots?.subsystem >= 1} />
        </RingTopItem>
        <RingTopItem rotation={-128 + (38 / 3) * 1}>
          <Slot type="subsystem" index={2} fittable={slots?.subsystem >= 2} />
        </RingTopItem>
        <RingTopItem rotation={-128 + (38 / 3) * 2}>
          <Slot type="subsystem" index={3} fittable={slots?.subsystem >= 3} />
        </RingTopItem>
        <RingTopItem rotation={-128 + (38 / 3) * 3}>
          <Slot type="subsystem" index={4} fittable={slots?.subsystem >= 4} />
        </RingTopItem>
      </RingTop>
    </div>
  );
};
