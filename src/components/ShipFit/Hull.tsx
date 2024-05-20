import React from "react";

import { useCurrentFit } from "@/providers/CurrentFitProvider";

import styles from "./ShipFit.module.css";

export interface ShipFitProps {
  radius: number;
}

export const Hull = () => {
  const currentFit = useCurrentFit();
  if (currentFit.fit === null) {
    return <></>;
  }

  const shipTypeId = currentFit.fit.shipTypeId;
  if (shipTypeId === undefined) {
    return <></>;
  }

  return (
    <div className={styles.hull}>
      <img src={`https://images.evetech.net/types/${shipTypeId}/render?size=1024`} />
    </div>
  );
};
