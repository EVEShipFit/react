import React from "react";

import { useEveShipFitLink } from "../EveShipFitLink";
import { useClipboard } from "../Helpers/Clipboard";

import styles from "./ShipFit.module.css";

const useIsRemoteViewer = () => {
  const [remote, setRemote] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setRemote(window.location.hostname !== "eveship.fit");
    }
  }, []);

  return remote;
};

export const FitLink = () => {
  const link = useEveShipFitLink();
  const isRemoteViewer = useIsRemoteViewer();
  const { copy, copied } = useClipboard();

  const linkText = isRemoteViewer ? "open on eveship.fit" : "share fit";
  const linkPropsClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();
      copy(link);
    },
    [copy, link],
  );
  const linkProps = {
    onClick: isRemoteViewer ? undefined : linkPropsClick,
  };

  return (
    <div className={styles.fitLink}>
      <svg viewBox="0 0 730 730" xmlns="http://www.w3.org/2000/svg">
        <path id="fitlink" fill="none" d="M18,365 A25,25 0 0,1 712,365" />

        <a href={link} target="_new" {...linkProps}>
          <text textAnchor="middle">
            <textPath startOffset="50%" href="#fitlink" fill="#cdcdcd">
              {copied ? "copied to clipboard" : linkText}
            </textPath>
          </text>
        </a>
      </svg>
    </div>
  );
};
