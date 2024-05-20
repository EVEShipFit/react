import React from "react";

export type EsfState = "Passive" | "Online" | "Active" | "Overload";
export type EsfSlotType = "High" | "Medium" | "Low" | "Rig" | "SubSystem";

export interface EsfCharge {
  typeId: number;
}

export interface EsfSlot {
  type: EsfSlotType;
  index: number;
}

export interface EsfModule {
  typeId: number;
  slot: EsfSlot;
  state: EsfState;
  charge?: EsfCharge;
}

export interface EsfDrone {
  typeId: number;
  states: {
    Passive: number;
    Active: number;
  };
}

export interface EsfCargo {
  typeId: number;
  quantity: number;
}

export interface EsfFit {
  name: string;
  description: string;
  shipTypeId: number;
  modules: EsfModule[];
  drones: EsfDrone[];
  cargo: EsfCargo[];
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
