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
  state: EsfState | "Preview";
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
  /** The current fit to render. */
  fit: EsfFit | null;
  /** The current fit, regardless of preview state. */
  currentFit: EsfFit | null;
  /** Whether the fit is a preview. */
  isPreview: boolean;
  /** Set the current fit. */
  setFit: React.Dispatch<React.SetStateAction<EsfFit | null>>;
  /** Set a (temporary) preview fit, for the over-over effect on modules. */
  setPreview: React.Dispatch<React.SetStateAction<EsfFit | null>>;
}

const CurrentFitContext = React.createContext<CurrentFit>({
  fit: null,
  currentFit: null,
  isPreview: false,
  setFit: () => {},
  setPreview: () => {},
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
  const [previewFit, setPreviewFit] = React.useState<EsfFit | null>(null);

  const contextValue = React.useMemo(() => {
    return {
      fit: previewFit ?? currentFit,
      currentFit: currentFit,
      isPreview: previewFit !== null,
      setFit: setCurrentFit,
      setPreview: setPreviewFit,
    };
  }, [previewFit, currentFit]);

  return <CurrentFitContext.Provider value={contextValue}>{props.children}</CurrentFitContext.Provider>;
};
