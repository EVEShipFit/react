export interface CalculationItemAttributeEffect {
  operator: string;
  penalty: boolean;
  source: "Ship" | "Char" | "Structure" | "Target" | { Item?: number; Charge?: number; Skill?: number };
  source_category: string;
  source_attribute_id: number;
}

export interface CalculationItemAttribute {
  base_value: number;
  value: number;
  effects: CalculationItemAttributeEffect[];
}

export type CalculationSlotType = "High" | "Medium" | "Low" | "Rig" | "SubSystem" | "DroneBay" | "Charge";

export interface CalculationSlot {
  type: CalculationSlotType;
  index: number | undefined;
}

export type CalculationState = "Passive" | "Online" | "Active" | "Overload" | "Target" | "Area" | "Dungeon" | "System";

export interface CalculationItem {
  type_id: number;
  slot: CalculationSlot;
  charge: CalculationItem | undefined;
  state: CalculationState;
  max_state: CalculationState;
  attributes: Map<number, CalculationItemAttribute>;
  effects: number[];
}

export interface Calculation {
  hull: CalculationItem;
  items: CalculationItem[];
  skills: CalculationItem[];
  char: CalculationItem;
  structure: CalculationItem;
  target: CalculationItem;
}
