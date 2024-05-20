import React from "react";

import { useLocalStorage } from "@/hooks/LocalStorage";
import { EsfFit } from "@/providers/CurrentFitProvider";

import { ConvertV2 } from "./ConvertV2";

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
  const [firstLoad, setFirstLoad] = React.useState(true);

  if (firstLoad) {
    setFirstLoad(false);

    let hasOldFits = false;
    for (const index in localFitsValue) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldFit = localFitsValue[index] as any;

      /* If the fit has the field "ship_type_id", it is an old fit. Convert it to the new format. */
      if (oldFit.ship_type_id !== undefined) {
        localFitsValue[index] = ConvertV2(oldFit);
        hasOldFits = true;
      }
    }

    if (hasOldFits) {
      setLocalFitsValue(localFitsValue);
    }
  }

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
