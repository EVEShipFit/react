import React from "react";

export type State = "Passive" | "Online" | "Active" | "Overload";

export interface EsfFit {
  name: string;
  description: string;
  ship_type_id: number;
  items: {
    type_id: number;
    quantity: number;
    flag: number;
    charge?: {
      type_id: number;
    };
    /* State defaults to "Active" if not set. */
    state?: State | string;
  }[];
}

interface CurrentFit {
  fit: EsfFit | null;
  setFit: React.Dispatch<React.SetStateAction<EsfFit | null>>;
}

const CurrentFitContext = React.createContext<CurrentFit>({
  fit: null,
  setFit: () => {},
});

export const useCurrentFit = () => {
  return React.useContext(CurrentFitContext);
};

interface CurrentFitProps {
  /** The initial fit to use. Changing this value after first render has no effect. */
  initialFit?: EsfFit | null;

  /** Children that can use this provider. */
  children: React.ReactNode;
}

/**
 * Keeps track of the current fit.
 *
 * This provider should be added as early as possible in the component tree. Many
 * other components use it.
 *
 * Use the `useCurrentFit` hook to access or change the current fit.
 */
export const CurrentFitProvider = (props: CurrentFitProps) => {
  const [currentFit, setCurrentFit] = React.useState<EsfFit | null>(props.initialFit ?? null);

  const contextValue = React.useMemo(() => {
    return {
      fit: currentFit,
      setFit: setCurrentFit,
    };
  }, [currentFit, setCurrentFit]);

  return <CurrentFitContext.Provider value={contextValue}>{props.children}</CurrentFitContext.Provider>;
};
