import React from "react";

import { EsiFit } from "../ShipSnapshotProvider";

import { useLocalStorage } from "../Helpers/LocalStorage";

export interface LocalFit {
  loaded?: boolean;
  fittings: EsiFit[];
}

export const LocalFitContext = React.createContext<LocalFit>({
  loaded: undefined,
  fittings: [],
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
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [localFitValue, setLocalFitValue] = useLocalStorage<EsiFit[]>("fits", []);

  React.useEffect(() => {
    setLocalFit({
      loaded: true,
      fittings: localFitValue,
    });
  }, [localFitValue]);

  return <LocalFitContext.Provider value={localFit}>
    {props.children}
  </LocalFitContext.Provider>
};
