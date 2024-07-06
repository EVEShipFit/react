import { EsfCargo, EsfDrone, EsfFit, EsfModule } from "@/providers/CurrentFitProvider";
import { useEveData } from "@/providers/EveDataProvider";

import { esiFlagToEsfSlot } from "./EsiFlags";

export function useFetchKillMail() {
  const eveData = useEveData();

  return async (killMailIdHash: string): Promise<EsfFit | null> => {
    if (eveData === null) return null;

    /* The string is in the format "id/hash". */
    const [killmailId, killmailHash] = killMailIdHash.split("/", 2);

    /* Fetch the killmail from ESI. */
    const response = await fetch(`https://esi.evetech.net/v1/killmails/${killmailId}/${killmailHash}/`);
    if (response.status !== 200) return null;

    const killMail = await response.json();

    /* Convert the killmail items to a flatter list (dropped vs destroyed). */
    type KillMailItem = {
      flag: number;
      type_id: number;
      quantity: number;
    };
    const items: KillMailItem[] = killMail.victim.items.map(
      (item: { flag: number; item_type_id: number; quantity_destroyed?: number; quantity_dropped?: number }) => {
        return {
          flag: item.flag,
          type_id: item.item_type_id,
          quantity: (item.quantity_dropped ?? 0) + (item.quantity_destroyed ?? 0),
        };
      },
    );

    /* Find the modules from the item-list. */
    let modules = items
      .map((item): EsfModule | undefined => {
        if (esiFlagToEsfSlot[item.flag] === undefined) return undefined; // Skip anything not modules.

        return {
          slot: esiFlagToEsfSlot[item.flag],
          typeId: item.type_id,
          charge: undefined,
          state: "Active",
        };
      })
      .filter((item): item is EsfModule => item !== undefined);

    /* Find the drones from the item-list. */
    const drones = items
      .map((item): EsfDrone | undefined => {
        if (item.flag !== 87) return undefined; // Skip anything not drones.

        return {
          typeId: item.type_id,
          states: {
            Active: item.quantity,
            Passive: 0,
          },
        };
      })
      .filter((item): item is EsfDrone => item !== undefined);

    /* Find the cargo from the item-list. */
    const cargo = items
      .map((item): EsfCargo | undefined => {
        if (item.flag !== 5) return undefined; // Skip anything not cargo.

        return {
          typeId: item.type_id,
          quantity: item.quantity,
        };
      })
      .filter((item): item is EsfCargo => item !== undefined);

    /* When importing fits, it can be that the ammo is on the same slot as the module, instead as charge. Fix that. */
    modules = modules
      .map((moduleOrCharge) => {
        /* Looks for items that are charges. */
        if (eveData.types[moduleOrCharge.typeId]?.categoryID !== 8) return moduleOrCharge;

        /* Find the module on the same slot. */
        const module = modules.find(
          (itemModule) => itemModule.slot === moduleOrCharge.slot && itemModule.typeId !== moduleOrCharge.typeId,
        );

        if (module !== undefined) {
          /* Assign the charge to the module. */
          module.charge = {
            typeId: moduleOrCharge.typeId,
          };
        }

        /* Remove the charge from the slot. */
        return undefined;
      })
      .filter((item): item is EsfModule => item !== undefined);

    return {
      shipTypeId: killMail.victim.ship_type_id,
      name: `Killmail ${killmailId}`,
      description: "",
      modules,
      drones,
      cargo,
    };
  };
}
