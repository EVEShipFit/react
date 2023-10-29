
export interface TypeDogmaAttribute {
  attributeID: number,
  value: number,
}

export interface TypeDogmaEffect {
  effectID: number,
  isDefault: boolean,
}

export interface TypeDogma {
  dogmaAttributes: TypeDogmaAttribute[],
  dogmaEffects: TypeDogmaEffect[],
}

export interface TypeID {
  name: string,
  groupID: number,
  categoryID: number,
  published: boolean,
  marketGroupID?: number,
  capacity?: number,
  mass?: number,
  radius?: number,
  volume?: number,
}

export interface DogmaAttribute {
  name: string
  published: boolean,
  defaultValue: number,
  highIsGood: boolean,
  stackable: boolean,
}

export interface DogmaEffect {
  name: string,
  effectCategory: number,
  electronicChance: boolean,
  isAssistance: boolean,
  isOffensive: boolean,
  isWarpSafe: boolean,
  propulsionChance: boolean,
  rangeChance: boolean,
  dischargeAttributeID?: number,
  durationAttributeID?: number,
  rangeAttributeID?: number,
  falloffAttributeID?: number,
  trackingSpeedAttributeID?: number,
  fittingUsageChanceAttributeID?: number,
  resistanceAttributeID?: number,
  modifierInfo: {
    domain: number,
    func: number,
    modifiedAttributeID?: number,
    modifyingAttributeID?: number,
    operation?: number,
    groupID?: number,
    skillTypeID?: number,
  }[],
}
