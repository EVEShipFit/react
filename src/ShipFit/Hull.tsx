import React from "react";

import { ShipSnapshotContext } from '../ShipSnapshotProvider';

import styles from "./ShipFit.module.css";

export interface ShipFitProps {
  radius: number;
}

export const Hull = () => {
  const shipSnapshot = React.useContext(ShipSnapshotContext);

  const hull = shipSnapshot?.fit?.ship_type_id;
  if (hull === undefined) {
    return <></>
  }

  return <div className={styles.hull}>
    <div className={styles.hullInner}>
      <img src={`https://images.evetech.net/types/${hull}/render?size=1024`} />
    </div>
  </div>
}
