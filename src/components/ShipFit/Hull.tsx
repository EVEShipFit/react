import React from "react";

import { useCurrentFit } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";

import styles from "./ShipFit.module.css";

export interface ShipFitProps {
  radius: number;
}

export const Hull = () => {
  const eveData = useEveData();
  const currentFit = useCurrentFit();

  if (currentFit.currentFit === null || eveData === null) {
    return <></>;
  }

  const shipTypeId = currentFit.currentFit.shipTypeId;
  if (shipTypeId === undefined) {
    return <></>;
  }

  return (
    <div className={styles.hull}>
      <img
        src={`https://images.evetech.net/types/${shipTypeId}/render?size=1024`}
        alt={eveData.types[shipTypeId].name}
      />
    </div>
  );
};
