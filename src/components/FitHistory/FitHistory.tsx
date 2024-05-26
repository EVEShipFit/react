import clsx from "clsx";
import React from "react";

import { Icon } from "@/components/Icon";
import { useCurrentFit } from "@/providers/CurrentFitProvider";

import styles from "./FitHistory.module.css";

export interface FitHistoryProps {
  /** Amount of entries to keep in history. */
  historySize: number;
}

export const FitHistory = (props: FitHistoryProps) => {
  const currentFit = useCurrentFit();
  const setFit = currentFit.setFit;

  const [history, setHistory] = React.useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = React.useState<number>(-1);
  const [oddOffset, setOddOffset] = React.useState<number>(1);

  const historyRef = React.useRef(history);
  historyRef.current = history;
  const currentIndexRef = React.useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const historySizeRef = React.useRef(props.historySize);
  historySizeRef.current = props.historySize;

  React.useEffect(() => {
    const fit = currentFit.currentFit;
    if (fit === null || currentFit.isPreview) return;
    /* Store the fit as a JSON string, to ensure that any modifications
     * to the current doesn't impact the history. */
    const fitString = JSON.stringify(fit);
    /* Do not store fits in the history that have no changes. */
    if (currentIndexRef.current !== -1 && historyRef.current[currentIndexRef.current] === fitString) return;
    if (historyRef.current.length > 0 && historyRef.current[historyRef.current.length - 1] === fitString) return;

    setHistory((prev) => {
      if (prev.length >= historySizeRef.current) {
        setOddOffset((offset) => (offset + 1) % 2);
        return [...prev.slice(1), fitString];
      }
      return [...prev, fitString];
    });
    setCurrentIndex(-1);
  }, [currentFit.currentFit, currentFit.isPreview]);

  React.useEffect(() => {
    if (currentIndex === -1) return;

    const fit = historyRef.current[currentIndex];
    setFit(JSON.parse(fit));
  }, [currentIndex, setFit]);

  const moveBack = React.useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === -1) return historyRef.current.length - 2;
      if (prev > 1) return prev - 1;
      return 0;
    });
  }, []);

  const moveForward = React.useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === -1) return -1;
      if (prev >= historyRef.current.length - 2) return historyRef.current.length - 1;
      return prev + 1;
    });
  }, []);

  const moveTo = React.useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div className={styles.fitHistory} style={{ width: props.historySize * 12 + 3 + 16 + 16 }}>
      <div className={styles.title}>Simulation History</div>
      <div className={styles.history}>
        <Icon
          name="arrow-left"
          size={16}
          className={clsx({ [styles.inactive]: history.length <= 1 || currentIndex === 0 })}
          onClick={moveBack}
        />
        <div className={styles.holder}>
          {history.map((fit, i) => (
            <div
              key={i}
              className={clsx(styles.entry, {
                [styles.odd]: (i + oddOffset) % 2 === 0,
                [styles.active]: (currentIndex === -1 && history.length - 1 === i) || i === currentIndex,
              })}
              onClick={() => moveTo(i)}
            >
              &nbsp;
            </div>
          ))}
        </div>
        <Icon
          name="arrow-right"
          size={16}
          className={clsx({ [styles.inactive]: history.length - 1 === currentIndex || currentIndex === -1 })}
          onClick={moveForward}
        />
      </div>
    </div>
  );
};
