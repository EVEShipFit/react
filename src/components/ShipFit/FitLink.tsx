import React from "react";

import { useClipboard } from "@/hooks/Clipboard";
import { useExportEveShipFit } from "@/hooks/ExportEveShipFit";

import styles from "./ShipFit.module.css";

export const FitLink = (props: { isPreview?: boolean }) => {
  const link = useExportEveShipFit();
  const { copy, copied } = useClipboard();

  const isRemote = typeof window !== "undefined";

  const linkText = props.isPreview ? "generated by eveship.fit" : isRemote ? "open on eveship.fit" : "share fit";
  const linkPropsClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault();

      if (link === null) return;
      copy(link);
    },
    [copy, link],
  );
  const linkProps = {
    onClick: props.isPreview || isRemote ? undefined : linkPropsClick,
  };

  if (link === null) return <></>;

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
