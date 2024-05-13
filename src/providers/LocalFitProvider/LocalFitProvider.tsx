import React from "react";

import { useLocalStorage } from "@/hooks/LocalStorage";
import { EsiFit } from "@/providers/ShipSnapshotProvider";

export interface LocalFit {
  loaded?: boolean;
  fittings: EsiFit[];
  addFit: (fit: EsiFit) => void;
}

export const LocalFitContext = React.createContext<LocalFit>({
  loaded: undefined,
  fittings: [],
  addFit: () => {},
});

export interface LocalFitProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

/**
 * Keeps track (in local storage) of fits.
 */
export const LocalFitProvider = (props: LocalFitProps) => {
  const [localFit, setLocalFit] = React.useState<LocalFit>({
    loaded: undefined,
    fittings: [],
    addFit: () => {},
  });

  const [localFitValue, setLocalFitValue] = useLocalStorage<EsiFit[]>("fits", []);

  const addFit = React.useCallback(
    (fit: EsiFit) => {
      setLocalFitValue((oldFits) => {
        const newFits = oldFits.filter((oldFit) => oldFit.name !== fit.name);
        newFits.push(fit);
        return newFits;
      });
    },
    [setLocalFitValue],
  );

  React.useEffect(() => {
    setLocalFit({
      loaded: true,
      fittings: localFitValue,
      addFit,
    });
  }, [localFitValue, addFit]);

  return <LocalFitContext.Provider value={localFit}>{props.children}</LocalFitContext.Provider>;
};
