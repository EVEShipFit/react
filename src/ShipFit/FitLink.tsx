import React from "react";

import { useEveShipFitLink } from "../EveShipFitLink";

import styles from "./ShipFit.module.css";

const useIsRemoteViewer = () => {
  const [remote, setRemote] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setRemote(window.location.hostname !== "eveship.fit");
    }
  }, []);

  return remote;
}

export const FitLink = () => {
  const link = useEveShipFitLink();
  const linkText = useIsRemoteViewer() ? "open on eveship.fit" : "link to fit";

  return <div className={styles.fitlink}>
    <svg viewBox="0 0 730 730" xmlns="http://www.w3.org/2000/svg">
      <path
        id="fitlink"
        fill="none"
        d="M18,365 A25,25 0 0,1 712,365" />

      <a href={link} target="_new">
        <text textAnchor="middle">
          <textPath startOffset="50%" href="#fitlink" fill="#cdcdcd">{linkText}</textPath>
        </text>
      </a>
    </svg>
  </div>
}
