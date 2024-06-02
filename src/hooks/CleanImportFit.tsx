import { EsfFit } from "@/providers/CurrentFitProvider";

/**
 * Clean a fit from any issues, like duplicated cargo etc.
 */
export function useCleanImportFit() {
  return (fit: EsfFit) => {
    /* Accumulate any duplicated drones. */
    fit.drones = fit.drones.reduce(
      (acc, drone) => {
        const existing = acc.find((d) => d.typeId === drone.typeId);

        if (existing) {
          existing.states.Active += drone.states.Active;
          existing.states.Passive += drone.states.Passive;
        } else {
          acc.push(drone);
        }

        return acc;
      },
      [] as EsfFit["drones"],
    );

    /* Accumulate any duplicated cargo. */
    fit.cargo = fit.cargo.reduce(
      (acc, cargo) => {
        const existing = acc.find((c) => c.typeId === cargo.typeId);

        if (existing) {
          existing.quantity += cargo.quantity;
        } else {
          acc.push(cargo);
        }

        return acc;
      },
      [] as EsfFit["cargo"],
    );

    return fit;
  };
}
