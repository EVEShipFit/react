import React from "react";

import { ShipAttribute } from '../ShipAttribute';

import { Category, CategoryLine } from "./Category";
import { RechargeRate } from "./RechargeRate";
import { Resistance } from "./Resistance";

import styles from "./ShipStatistics.module.css";

/**
 * Render ship statistics similar to how it is done in-game.
 */
export const ShipStatistics = () => {
  return <div>
    <Category headerLabel="Capacitor" headerContent={
      <span>Stable</span>
    }>
      <CategoryLine>
        <span>
          <ShipAttribute name="capacity" fixed={0} /> GJ / ? s
        </span>
      </CategoryLine>
      <CategoryLine>
        <span>
          ? GJ/s (100.0%)
        </span>
      </CategoryLine>
    </Category>

    <Category headerLabel="Offense" headerContent={
      <span>? dps</span>
    }>
      <CategoryLine>
        <span>
          ? dps
        </span>
        <span>
          ? HP
        </span>
      </CategoryLine>
    </Category>

    <Category headerLabel="Defense" headerContent={
      <span><ShipAttribute name="ehp" fixed={0} /> ehp</span>
    }>
      <CategoryLine>
        <RechargeRate />
        <span style={{flex: 2}}>
          <span className={styles.resistanceHeader}>E</span>
          <span className={styles.resistanceHeader}>T</span>
          <span className={styles.resistanceHeader}>K</span>
          <span className={styles.resistanceHeader}>X</span>
        </span>
      </CategoryLine>
      <CategoryLine className={styles.defense}>
        <span className={styles.defenseShield}>
          <span>
            S
          </span>
          <span>
            <ShipAttribute name="shieldCapacity" fixed={0} /> hp<br/>
            <ShipAttribute name="shieldRechargeRate" fixed={0} divideBy={1000} /> s<br/>
          </span>
        </span>
        <span style={{flex: 2}}>
          <Resistance name="shieldEmDamageResonance" />
          <Resistance name="shieldThermalDamageResonance" />
          <Resistance name="shieldKineticDamageResonance" />
          <Resistance name="shieldExplosiveDamageResonance" />
        </span>
      </CategoryLine>
      <CategoryLine className={styles.defense}>
        <span>
          A
          <ShipAttribute name="armorHP" fixed={0} /> hp
        </span>
        <span style={{flex: 2}}>
          <Resistance name="armorEmDamageResonance" />
          <Resistance name="armorThermalDamageResonance" />
          <Resistance name="armorKineticDamageResonance" />
          <Resistance name="armorExplosiveDamageResonance" />
        </span>
      </CategoryLine>
      <CategoryLine className={styles.defense}>
        <span>
          S
          <ShipAttribute name="hp" fixed={0} /> hp
        </span>
        <span style={{flex: 2}}>
          <Resistance name="emDamageResonance" />
          <Resistance name="thermalDamageResonance" />
          <Resistance name="kineticDamageResonance" />
          <Resistance name="explosiveDamageResonance" />
        </span>
      </CategoryLine>
    </Category>

    <Category headerLabel="Targeting" headerContent={
      <span><ShipAttribute name="maxTargetRange" fixed={2} divideBy={1000} /> km</span>
    }>
      <CategoryLine>
        <span title="Scan Strength">
          <ShipAttribute name="scanStrength" fixed={2} /> points
        </span>
        <span title="Scan Resolution">
          <ShipAttribute name="scanResolution" fixed={0} /> mm
        </span>
      </CategoryLine>
      <CategoryLine>
        <span title="Signature Radius">
          <ShipAttribute name="signatureRadius" fixed={0} /> m
        </span>
        <span title="Maximum Locked Targets">
          <ShipAttribute name="maxLockedTargets" fixed={0} />x
        </span>
      </CategoryLine>
    </Category>

    <Category headerLabel="Navigation" headerContent={
      <span><ShipAttribute name="maxVelocity" fixed={1} /> m/s</span>
    }>
      <CategoryLine>
        <span title="Mass">
          <ShipAttribute name="mass" fixed={2} /> t
        </span>
        <span title="Inertia Modifier">
          <ShipAttribute name="agility" fixed={4} />x
        </span>
      </CategoryLine>
      <CategoryLine>
        <span title="Ship Warp Speed">
          <ShipAttribute name="warpSpeedMultiplier" fixed={2} /> AU/s
        </span>
        <span title="Align Time">
          <ShipAttribute name="alignTime" fixed={2} />s
        </span>
      </CategoryLine>
    </Category>
  </div>
};
