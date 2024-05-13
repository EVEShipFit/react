import React from "react";
import clsx from "clsx";

import { EveDataContext } from "@/providers/EveDataProvider";
import { ShipSnapshotContext } from "@/providers/ShipSnapshotProvider";
import { Icon } from "@/components/Icon";

import { FitLink } from "./FitLink";
import { Hull } from "./Hull";
import { RadialMenu } from "./RadialMenu";
import { RingInner } from "./RingInner";
import { RingOuter } from "./RingOuter";
import { RingTop, RingTopItem } from "./RingTop";
import { Slot } from "./Slot";
import { Usage } from "./Usage";

import styles from "./ShipFit.module.css";

/**
 * Render a ship fit similar to how it is done in-game.
 */
export const ShipFit = (props: { withStats?: boolean }) => {
  const eveData = React.useContext(EveDataContext);
  const shipSnapshot = React.useContext(ShipSnapshotContext);
  const slots = shipSnapshot.slots;

  let launcherSlotsUsed =
    shipSnapshot.items?.filter((item) =>
      eveData?.typeDogma?.[item.type_id].dogmaEffects.find(
        (effect) => effect.effectID === eveData.effectMapping?.launcherFitted,
      ),
    ).length ?? 0;
  let turretSlotsUsed =
    shipSnapshot.items?.filter((item) =>
      eveData?.typeDogma?.[item.type_id].dogmaEffects.find(
        (effect) => effect.effectID === eveData.effectMapping?.turretFitted,
      ),
    ).length ?? 0;

  return (
    <div className={styles.fit}>
      <RingOuter />
      <RingInner />

      <Hull />
      <FitLink />

      <RingTop>
        {props.withStats && (
          <>
            <RingTopItem rotation={-45}>
              <div className={styles.turretLauncherIcon}>
                <Icon name="hardpoint-turret" size={16} />
              </div>
            </RingTopItem>
            {Array.from({ length: slots?.turret }, (_, i) => {
              turretSlotsUsed--;
              return (
                <RingTopItem key={i} rotation={-40 + i * 3}>
                  <div
                    className={clsx(styles.turretLauncherItem, {
                      [styles.turretLauncherItemUsed]: turretSlotsUsed >= 0,
                    })}
                  >
                    &nbsp;
                  </div>
                </RingTopItem>
              );
            })}

            <RingTopItem rotation={43}>
              <div className={styles.turretLauncherIcon}>
                <Icon name="hardpoint-launcher" size={16} />
              </div>
            </RingTopItem>
            {Array.from({ length: slots?.launcher }, (_, i) => {
              launcherSlotsUsed--;
              return (
                <RingTopItem key={i} rotation={39 - i * 3}>
                  <div
                    className={clsx(styles.turretLauncherItem, {
                      [styles.turretLauncherItemUsed]: launcherSlotsUsed >= 0,
                    })}
                  >
                    &nbsp;
                  </div>
                </RingTopItem>
              );
            })}

            <RingTopItem rotation={-47}>
              <div className={styles.usage}>
                <Usage type="rig" angle={-30} intervals={30} markers={2} color="#3d4547" />
              </div>
            </RingTopItem>
            <RingTopItem rotation={134.5}>
              <div className={styles.usage}>
                <Usage type="cpu" angle={-44} intervals={40} markers={5} color="#2a504f" />
              </div>
            </RingTopItem>
            <RingTopItem rotation={135}>
              <div className={styles.usage}>
                <Usage type="pg" angle={44} intervals={40} markers={5} color="#541208" />
              </div>
            </RingTopItem>
          </>
        )}

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
