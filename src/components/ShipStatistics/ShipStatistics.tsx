import clsx from "clsx";
import React from "react";

import { Icon } from "@/components/Icon";
import { CharAttribute, ShipAttribute } from "@/components/ShipAttribute";
import { useCurrentFit } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";
import { useStatistics } from "@/providers/StatisticsProvider";

import { Category, CategoryLine } from "./Category";
import { RechargeRate } from "./RechargeRate";
import { Resistance } from "./Resistance";

import styles from "./ShipStatistics.module.css";

/**
 * Render ship statistics similar to how it is done in-game.
 */
export const ShipStatistics = () => {
  const eveData = useEveData();
  const currentFit = useCurrentFit();
  const statistics = useStatistics();

  let capacitorState = "Stable";
  const isStructure = eveData?.types[currentFit.currentFit?.shipTypeId ?? 0]?.categoryID === 65;

  const attributeId = eveData?.attributeMapping.capacitorDepletesIn ?? 0;
  const capacitorDepletesIn = statistics?.hull.attributes.get(attributeId)?.value;

  if (capacitorDepletesIn !== undefined && capacitorDepletesIn >= 0) {
    const hours = Math.floor(capacitorDepletesIn / 3600);
    const minutes = Math.floor((capacitorDepletesIn % 3600) / 60);
    const seconds = Math.floor(capacitorDepletesIn % 60);
    capacitorState = `Depletes in ${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else {
    capacitorState = "Stable";
  }

  return (
    <div>
      <Category
        headerLabel="Capacitor"
        headerContent={
          <span
            className={clsx({
              [styles.capacitorStable]: capacitorState === "Stable",
              [styles.capacitorUnstable]: capacitorState !== "Stable",
            })}
          >
            {capacitorState}
          </span>
        }
      >
        <CategoryLine>
          <span>
            <ShipAttribute name="capacitorCapacity" fixed={1} unit="GJ" /> /{" "}
            <ShipAttribute name="rechargeRate" fixed={2} divideBy={1000} unit=" s" />
          </span>
        </CategoryLine>
        <CategoryLine>
          <span>
            Δ <ShipAttribute name="capacitorPeakDelta" fixed={1} unit="GJ/s" /> (
            <ShipAttribute name="capacitorPeakDeltaPercentage" fixed={1} unit="%" />)
          </span>
        </CategoryLine>
      </Category>

      <Category
        headerLabel="Offense"
        headerContent={
          <span>
            <ShipAttribute name="damagePerSecondWithoutReload" fixed={1} unit="dps" />
          </span>
        }
      >
        <CategoryLine>
          <span title="Damage Per Second" className={styles.statistic}>
            <span>
              <Icon name="damage-dps" size={24} />
            </span>
            <span>
              <ShipAttribute name="damagePerSecondWithoutReload" fixed={1} unit="dps" /> (
              <ShipAttribute name="damagePerSecondWithReload" fixed={1} unit="dps" />)
            </span>
          </span>
          <span title="Alpha Strike" className={styles.statistic}>
            <span>
              <Icon name="damage-alpha" size={24} />
            </span>
            <span>
              <ShipAttribute name="damageAlpha" fixed={0} unit="HP" />
            </span>
          </span>
        </CategoryLine>
      </Category>

      <Category
        headerLabel="Defense"
        headerContent={
          <span>
            <ShipAttribute name="ehp" fixed={0} roundDown unit="ehp" />
          </span>
        }
      >
        <CategoryLine>
          <RechargeRate />
          <span style={{ flex: 2 }}>
            <span className={styles.resistanceHeader}>
              <Icon name="em-resistance" size={28} />
            </span>
            <span className={styles.resistanceHeader}>
              <Icon name="thermal-resistance" size={28} />
            </span>
            <span className={styles.resistanceHeader}>
              <Icon name="kinetic-resistance" size={28} />
            </span>
            <span className={styles.resistanceHeader}>
              <Icon name="explosive-resistance" size={28} />
            </span>
          </span>
        </CategoryLine>
        <CategoryLine className={styles.defense}>
          <span className={clsx(styles.statistic, styles.defenseShield)}>
            <span>
              <Icon name="shield-hp" size={24} />
            </span>
            <span>
              <ShipAttribute name="shieldCapacity" fixed={0} roundDown unit="hp" />
              <br />
              <ShipAttribute name="shieldRechargeRate" fixed={0} divideBy={1000} roundDown unit="s" />
              <br />
            </span>
          </span>
          <span style={{ flex: 2 }}>
            <Resistance name="shieldEmDamageResonance" />
            <Resistance name="shieldThermalDamageResonance" />
            <Resistance name="shieldKineticDamageResonance" />
            <Resistance name="shieldExplosiveDamageResonance" />
          </span>
        </CategoryLine>
        <CategoryLine className={styles.defense}>
          <span className={styles.statistic}>
            <span>
              <Icon name="armor-hp" size={24} />
            </span>
            <span>
              <ShipAttribute name="armorHP" fixed={0} roundDown unit="hp" />
            </span>
          </span>
          <span style={{ flex: 2 }}>
            <Resistance name="armorEmDamageResonance" />
            <Resistance name="armorThermalDamageResonance" />
            <Resistance name="armorKineticDamageResonance" />
            <Resistance name="armorExplosiveDamageResonance" />
          </span>
        </CategoryLine>
        <CategoryLine className={styles.defense}>
          <span className={styles.statistic}>
            <span>
              <Icon name="hull-hp" size={24} />
            </span>
            <span>
              <ShipAttribute name="hp" fixed={0} roundDown unit="hp" />
            </span>
          </span>
          <span style={{ flex: 2 }}>
            <Resistance name="emDamageResonance" />
            <Resistance name="thermalDamageResonance" />
            <Resistance name="kineticDamageResonance" />
            <Resistance name="explosiveDamageResonance" />
          </span>
        </CategoryLine>
      </Category>

      <Category
        headerLabel="Targeting"
        headerContent={
          <span>
            <ShipAttribute name="maxTargetRange" fixed={2} divideBy={1000} unit="km" />
          </span>
        }
      >
        <CategoryLine>
          <span title="Scan Strength" className={styles.statistic}>
            <span>
              <Icon name="sensor-strength" size={24} />
            </span>
            <span>
              <ShipAttribute name="scanStrength" fixed={2} unit="points" />
            </span>
          </span>
          <span title="Scan Resolution" className={styles.statistic}>
            <span>
              <Icon name="scan-resolution" size={24} />
            </span>
            <span>
              <ShipAttribute name="scanResolution" fixed={0} unit="mm" />
            </span>
          </span>
        </CategoryLine>
        <CategoryLine>
          <span title="Signature Radius" className={styles.statistic}>
            <span>
              <Icon name="signature-radius" size={24} />
            </span>
            <span>
              <ShipAttribute name="signatureRadius" fixed={0} unit="m" />
            </span>
          </span>
          <span title="Maximum Locked Targets" className={styles.statistic}>
            <span>
              <Icon name="maximum-locked-targets" size={24} />
            </span>
            <span>
              <ShipAttribute name="maxLockedTargets" fixed={0} unit="x" />
            </span>
          </span>
        </CategoryLine>
      </Category>

      {!isStructure && (
        <Category
          headerLabel="Navigation"
          headerContent={
            <span>
              <ShipAttribute name="maxVelocity" fixed={1} unit="m/s" />
            </span>
          }
        >
          <CategoryLine>
            <span title="Mass" className={styles.statistic}>
              <span>
                <Icon name="mass" size={24} />
              </span>
              <span>
                <ShipAttribute name="mass" fixed={2} divideBy={1000} unit="t" />
              </span>
            </span>
            <span title="Inertia Modifier" className={styles.statistic}>
              <span>
                <Icon name="inertia-modifier" size={24} />
              </span>
              <span>
                <ShipAttribute name="agility" fixed={4} unit="x" />
              </span>
            </span>
          </CategoryLine>
          <CategoryLine>
            <span title="Ship Warp Speed" className={styles.statistic}>
              <span>
                <Icon name="warp-speed" size={24} />
              </span>
              <span>
                <ShipAttribute name="warpSpeedMultiplier" fixed={2} unit="AU/s" />
              </span>
            </span>
            <span title="Align Time" className={styles.statistic}>
              <span>
                <Icon name="align-time" size={24} />
              </span>
              <span>
                <ShipAttribute name="alignTime" fixed={2} unit="s" />
              </span>
            </span>
          </CategoryLine>
        </Category>
      )}

      {!isStructure && (
        <Category
          headerLabel="Drones"
          headerContent={
            <span>
              <ShipAttribute name="droneDamagePerSecond" fixed={1} unit="dps" />
            </span>
          }
        >
          <CategoryLine>
            <span title="Drone Bandwidth" className={styles.statistic}>
              <span>
                <Icon name="mass" size={24} />
              </span>
              <span>
                <ShipAttribute name="droneBandwidthLoad" fixed={0} />/
                <ShipAttribute name="droneBandwidth" fixed={0} /> Mbit/sec
              </span>
            </span>
            <span title="Drone Control Range" className={styles.statistic}>
              <span>
                <Icon name="inertia-modifier" size={24} />
              </span>
              <span>
                <CharAttribute name="droneControlDistance" fixed={2} divideBy={1000} unit="km" />
              </span>
            </span>
          </CategoryLine>
          <CategoryLine>
            <span className={styles.statistic}>
              <span>
                <div style={{ width: 24 }}></div>
              </span>
              <span>
                <ShipAttribute name="droneActive" fixed={0} /> Active
              </span>
            </span>
            <span className={styles.statistic}>
              <span></span>
              <span></span>
            </span>
          </CategoryLine>
        </Category>
      )}
    </div>
  );
};
