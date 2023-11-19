import React from "react";

import { useShipAttribute } from '../ShipAttribute';

import styles from "./ShipStatistics.module.css";
import clsx from "clsx";

export const RechargeRateItem = (props: {name: string, icon: React.ReactNode}) => {
  const stringValue = useShipAttribute({
    name: props.name,
    fixed: 1,
  });

  if (stringValue == "0.0") {
    return <span>
        {props.icon} No Module
    </span>
  }

  return <span>
    {props.icon} {stringValue} hp/s
  </span>
}

export const RechargeRate = () => {
  const [moduleType, setModuleType] = React.useState("passiveShieldRecharge");
  const [showDropdown, setShowDropdown] = React.useState(false);

  return <span className={styles.rechargeRate}>
    <div className={styles.rechargeRateDropdown} onClick={() => setShowDropdown((current) => !current)}>
      ^
    </div>
    { showDropdown && <div className={styles.rechargeRateDropdownContent}>
      <div onClick={() => { setModuleType("armorRepairRate"); setShowDropdown(false); }} className={clsx({[styles.rechargeRateDropdownContentSelected]: moduleType == "armorRepairRate"})}>Armor repair rate</div>
      <div onClick={() => { setModuleType("hullRepairRate"); setShowDropdown(false); }} className={clsx({[styles.rechargeRateDropdownContentSelected]: moduleType == "hullRepairRate"})}>Hull repair rate</div>
      <div onClick={() => { setModuleType("passiveShieldRecharge"); setShowDropdown(false); }} className={clsx({[styles.rechargeRateDropdownContentSelected]: moduleType == "passiveShieldRecharge"})}>Passive shield recharge</div>
      <div onClick={() => { setModuleType("shieldBoostRate"); setShowDropdown(false); }} className={clsx({[styles.rechargeRateDropdownContentSelected]: moduleType == "shieldBoostRate"})}>Shield boost rate</div>
    </div> }
    <div onClick={() => setShowDropdown((current) => !current)}>
      { moduleType == "armorRepairRate" && <RechargeRateItem name="armorRepairRate" icon={<>A</>} /> }
      { moduleType == "hullRepairRate" && <RechargeRateItem name="hullRepairRate" icon={<>H</>} /> }
      { moduleType == "passiveShieldRecharge" && <RechargeRateItem name="passiveShieldRecharge" icon={<>P</>} /> }
      { moduleType == "shieldBoostRate" && <RechargeRateItem name="shieldBoostRate" icon={<>S</>} /> }
    </div>
  </span>
}
