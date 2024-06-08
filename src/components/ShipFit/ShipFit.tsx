import React from "react";
import clsx from "clsx";

import { Icon } from "@/components/Icon";
import { useEveData } from "@/providers/EveDataProvider";
import { StatisticsSlots, useStatistics } from "@/providers/StatisticsProvider";

import { FitLink } from "./FitLink";
import { Hull } from "./Hull";
import { HullDraggable } from "./HullDraggable";
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
export const ShipFit = (props: { withStats?: boolean; isPreview?: boolean }) => {
  const eveData = useEveData();
  const statistics = useStatistics();

  if (eveData === null) return <></>;

  const slots: StatisticsSlots = statistics?.slots ?? {
    High: 0,
    Medium: 0,
    Low: 0,
    Rig: 0,
    SubSystem: 0,
    Turret: 0,
    Launcher: 0,
  };

  let launcherSlotsUsed =
    statistics?.items.filter((item) =>
      eveData.typeDogma[item.type_id].dogmaEffects.find(
        (effect) => effect.effectID === eveData.effectMapping.launcherFitted,
      ),
    ).length ?? 0;
  let turretSlotsUsed =
    statistics?.items.filter((item) =>
      eveData.typeDogma[item.type_id].dogmaEffects.find(
        (effect) => effect.effectID === eveData.effectMapping.turretFitted,
      ),
    ).length ?? 0;

  return (
    <div className={styles.fit}>
      <RingOuter />
      <RingInner />

      <Hull />
      <FitLink isPreview={props.isPreview} />

      <RingTop>
        {props.withStats && (
          <>
            <RingTopItem rotation={-45} background>
              <div className={styles.turretLauncherIcon}>
                <Icon name="hardpoint-turret" size={16} />
              </div>
            </RingTopItem>
            {Array.from({ length: slots.Turret }, (_, i) => {
              turretSlotsUsed--;
              return (
                <RingTopItem key={i} rotation={-40 + i * 3} background>
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

            <RingTopItem rotation={43} background>
              <div className={styles.turretLauncherIcon}>
                <Icon name="hardpoint-launcher" size={16} />
              </div>
            </RingTopItem>
            {Array.from({ length: slots.Launcher }, (_, i) => {
              launcherSlotsUsed--;
              return (
                <RingTopItem key={i} rotation={39 - i * 3} background>
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

            <RingTopItem rotation={-47} background>
              <div className={styles.usage}>
                <Usage type="rig" angle={-30} intervals={30} markers={2} color="#3d4547" />
              </div>
            </RingTopItem>
            <RingTopItem rotation={134.5} background>
              <div className={styles.usage}>
                <Usage type="cpu" angle={-44} intervals={40} markers={5} color="#2a504f" />
              </div>
            </RingTopItem>
            <RingTopItem rotation={135} background>
              <div className={styles.usage}>
                <Usage type="pg" angle={44} intervals={40} markers={5} color="#541208" />
              </div>
            </RingTopItem>
          </>
        )}

        <RingTopItem rotation={-45} background>
          <RadialMenu type="High" />
        </RingTopItem>

        <RingTopItem rotation={-36.5 + (71 / 7) * 0}>
          <Slot type="High" index={1} fittable={slots.High >= 1} main />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 1}>
          <Slot type="High" index={2} fittable={slots.High >= 2} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 2}>
          <Slot type="High" index={3} fittable={slots.High >= 3} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 3}>
          <Slot type="High" index={4} fittable={slots.High >= 4} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 4}>
          <Slot type="High" index={5} fittable={slots.High >= 5} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 5}>
          <Slot type="High" index={6} fittable={slots.High >= 6} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 6}>
          <Slot type="High" index={7} fittable={slots.High >= 7} />
        </RingTopItem>
        <RingTopItem rotation={-36.5 + (71 / 7) * 7}>
          <Slot type="High" index={8} fittable={slots.High >= 8} />
        </RingTopItem>

        <RingTopItem rotation={43} background>
          <RadialMenu type="Medium" />
        </RingTopItem>

        <RingTopItem rotation={53 + (72 / 7) * 0}>
          <Slot type="Medium" index={1} fittable={slots.Medium >= 1} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 1}>
          <Slot type="Medium" index={2} fittable={slots.Medium >= 2} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 2}>
          <Slot type="Medium" index={3} fittable={slots.Medium >= 3} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 3}>
          <Slot type="Medium" index={4} fittable={slots.Medium >= 4} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 4}>
          <Slot type="Medium" index={5} fittable={slots.Medium >= 5} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 5}>
          <Slot type="Medium" index={6} fittable={slots.Medium >= 6} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 6}>
          <Slot type="Medium" index={7} fittable={slots.Medium >= 7} />
        </RingTopItem>
        <RingTopItem rotation={53 + (72 / 7) * 7}>
          <Slot type="Medium" index={8} fittable={slots.Medium >= 8} />
        </RingTopItem>

        <RingTopItem rotation={133} background>
          <RadialMenu type="Low" />
        </RingTopItem>

        <RingTopItem rotation={142 + (72 / 7) * 0}>
          <Slot type="Low" index={1} fittable={slots.Low >= 1} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 1}>
          <Slot type="Low" index={2} fittable={slots.Low >= 2} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 2}>
          <Slot type="Low" index={3} fittable={slots.Low >= 3} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 3}>
          <Slot type="Low" index={4} fittable={slots.Low >= 4} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 4}>
          <Slot type="Low" index={5} fittable={slots.Low >= 5} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 5}>
          <Slot type="Low" index={6} fittable={slots.Low >= 6} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 6}>
          <Slot type="Low" index={7} fittable={slots.Low >= 7} />
        </RingTopItem>
        <RingTopItem rotation={142 + (72 / 7) * 7}>
          <Slot type="Low" index={8} fittable={slots.Low >= 8} />
        </RingTopItem>

        <RingTopItem rotation={-74 + (21 / 2) * 0}>
          <Slot type="Rig" index={1} fittable={slots.Rig >= 1} />
        </RingTopItem>
        <RingTopItem rotation={-74 + (21 / 2) * 1}>
          <Slot type="Rig" index={2} fittable={slots.Rig >= 2} />
        </RingTopItem>
        <RingTopItem rotation={-74 + (21 / 2) * 2}>
          <Slot type="Rig" index={3} fittable={slots.Rig >= 3} />
        </RingTopItem>

        <RingTopItem rotation={-128 + (38 / 3) * 0}>
          <Slot type="SubSystem" index={1} fittable={slots.SubSystem >= 1} />
        </RingTopItem>
        <RingTopItem rotation={-128 + (38 / 3) * 1}>
          <Slot type="SubSystem" index={2} fittable={slots.SubSystem >= 2} />
        </RingTopItem>
        <RingTopItem rotation={-128 + (38 / 3) * 2}>
          <Slot type="SubSystem" index={3} fittable={slots.SubSystem >= 3} />
        </RingTopItem>
        <RingTopItem rotation={-128 + (38 / 3) * 3}>
          <Slot type="SubSystem" index={4} fittable={slots.SubSystem >= 4} />
        </RingTopItem>
      </RingTop>

      <HullDraggable />
    </div>
  );
};
