import clsx from "clsx";
import React from "react";

import { IconName, Icon } from "@/components/Icon";
import { ShipAttribute, useAttribute } from "@/components/ShipAttribute";

import styles from "./ShipStatistics.module.css";

export const RechargeRateItem = (props: { name: string; icon: IconName }) => {
  const { value } = useAttribute("Ship", {
    name: props.name,
    fixed: 1,
  });

  if (value == "0.0") {
    return (
      <span className={styles.statistic}>
        <span>
          <Icon name={props.icon} size={24} />
        </span>
        <span>No Module</span>
      </span>
    );
  }

  return (
    <span className={styles.statistic}>
      <span>
        <Icon name={props.icon} size={24} />
      </span>
      <ShipAttribute name={props.name} fixed={1} unit="hp/s" />
    </span>
  );
};

export const RechargeRate = () => {
  const [moduleType, setModuleType] = React.useState("passiveShieldRechargeRate");
  const [showDropdown, setShowDropdown] = React.useState(false);

  return (
    <span className={styles.rechargeRate}>
      <div className={styles.rechargeRateDropdown} onClick={() => setShowDropdown((current) => !current)}>
        ^
      </div>
      {showDropdown && (
        <div className={styles.rechargeRateDropdownContent}>
          <div
            onClick={() => {
              setModuleType("armorRepairRate");
              setShowDropdown(false);
            }}
            className={clsx({ [styles.rechargeRateDropdownContentSelected]: moduleType == "armorRepairRate" })}
          >
            Armor repair rate
          </div>
          <div
            onClick={() => {
              setModuleType("hullRepairRate");
              setShowDropdown(false);
            }}
            className={clsx({ [styles.rechargeRateDropdownContentSelected]: moduleType == "hullRepairRate" })}
          >
            Hull repair rate
          </div>
          <div
            onClick={() => {
              setModuleType("passiveShieldRechargeRate");
              setShowDropdown(false);
            }}
            className={clsx({
              [styles.rechargeRateDropdownContentSelected]: moduleType == "passiveShieldRechargeRate",
            })}
          >
            Passive shield recharge
          </div>
          <div
            onClick={() => {
              setModuleType("shieldBoostRate");
              setShowDropdown(false);
            }}
            className={clsx({ [styles.rechargeRateDropdownContentSelected]: moduleType == "shieldBoostRate" })}
          >
            Shield boost rate
          </div>
        </div>
      )}
      <div onClick={() => setShowDropdown((current) => !current)}>
        {moduleType == "armorRepairRate" && <RechargeRateItem name="armorRepairRate" icon="armor-repair-rate" />}
        {moduleType == "hullRepairRate" && <RechargeRateItem name="hullRepairRate" icon="hull-repair-rate" />}
        {moduleType == "passiveShieldRechargeRate" && (
          <RechargeRateItem name="passiveShieldRechargeRate" icon="passive-shield-recharge" />
        )}
        {moduleType == "shieldBoostRate" && <RechargeRateItem name="shieldBoostRate" icon="shield-boost-rate" />}
      </div>
    </span>
  );
};
