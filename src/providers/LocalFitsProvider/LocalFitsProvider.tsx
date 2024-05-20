import React from "react";

import { useLocalStorage } from "@/hooks/LocalStorage";
import { EsfFit } from "@/providers/CurrentFitProvider";

interface LocalFits {
  fittings: EsfFit[];
  addFit: (fit: EsfFit) => void;
}

const LocalFitsContext = React.createContext<LocalFits>({
  fittings: [],
  addFit: () => {},
});

export const useLocalFits = () => {
  return React.useContext(LocalFitsContext);
};

interface LocalFitsProps {
  /** Children that can use this provider. */
  children: React.ReactNode;
}

/**
 * Keeps track (in local storage) of fits.
 *
 * Use the `useLocalFits` hook to access or change the local fits.
 */
export const LocalFitsProvider = (props: LocalFitsProps) => {
  const [localFitsValue, setLocalFitsValue] = useLocalStorage<EsfFit[]>("fits", []);

  const addFit = React.useCallback(
    (fit: EsfFit) => {
      setLocalFitsValue((oldFits) => {
        const newFits = oldFits.filter((oldFit) => oldFit.name !== fit.name);
        newFits.push(fit);
        return newFits;
      });
    },
    [setLocalFitsValue],
  );

  const contextValue = React.useMemo(() => {
    return {
      fittings: localFitsValue,
      addFit,
    };
  }, [localFitsValue, addFit]);

  return <LocalFitsContext.Provider value={contextValue}>{props.children}</LocalFitsContext.Provider>;
};
