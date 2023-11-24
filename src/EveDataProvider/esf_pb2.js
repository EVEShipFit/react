/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $Reader from "./protobuf.js";

const $root = {};
const emptyArray = Object.freeze ? Object.freeze([]) : [];
const emptyObject = Object.freeze ? Object.freeze({}) : {};

export const esf = $root.esf = (() => {

    const esf = {};

    esf.TypeDogma = (function() {

        function TypeDogma(p) {
            this.entries = {};
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        TypeDogma.prototype.entries = emptyObject;

        TypeDogma.decode = async function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.TypeDogma(), k, value;
            while (r.pos < c) {
                if (r.need_data()) {
                    await r.fetch_data();
                }
                if (r.is_eof()) break;

                var t = r.uint32();
                switch (t >>> 3) {
                case 1: {
                        if (m.entries === emptyObject)
                            m.entries = {};
                        var c2 = r.uint32() + r.pos;
                        k = 0;
                        value = null;
                        while (r.pos < c2) {
                            var tag2 = r.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                k = r.int32();
                                break;
                            case 2:
                                value = $root.esf.TypeDogma.TypeDogmaEntry.decode(r, r.uint32());
                                break;
                            default:
                                r.skipType(tag2 & 7);
                                break;
                            }
                        }
                        m.entries[k] = value;
                        break;
                    }
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        TypeDogma.TypeDogmaEntry = (function() {

            function TypeDogmaEntry(p) {
                this.dogmaAttributes = [];
                this.dogmaEffects = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            TypeDogmaEntry.prototype.dogmaAttributes = emptyArray;
            TypeDogmaEntry.prototype.dogmaEffects = emptyArray;

            TypeDogmaEntry.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.TypeDogma.TypeDogmaEntry();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            if (!(m.dogmaAttributes && m.dogmaAttributes.length))
                                m.dogmaAttributes = [];
                            m.dogmaAttributes.push($root.esf.TypeDogma.TypeDogmaEntry.DogmaAttributes.decode(r, r.uint32()));
                            break;
                        }
                    case 2: {
                            if (!(m.dogmaEffects && m.dogmaEffects.length))
                                m.dogmaEffects = [];
                            m.dogmaEffects.push($root.esf.TypeDogma.TypeDogmaEntry.DogmaEffects.decode(r, r.uint32()));
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                return m;
            };

            TypeDogmaEntry.DogmaAttributes = (function() {

                function DogmaAttributes(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }

                DogmaAttributes.prototype.attributeID = 0;
                DogmaAttributes.prototype.value = 0;

                DogmaAttributes.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.TypeDogma.TypeDogmaEntry.DogmaAttributes();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                        case 1: {
                                m.attributeID = r.int32();
                                break;
                            }
                        case 2: {
                                m.value = r.float();
                                break;
                            }
                        default:
                            r.skipType(t & 7);
                            break;
                        }
                    }
                    if (!m.hasOwnProperty("attributeID"))
                        throw Error("missing required 'attributeID'", { instance: m });
                    if (!m.hasOwnProperty("value"))
                        throw Error("missing required 'value'", { instance: m });
                    return m;
                };

                return DogmaAttributes;
            })();

            TypeDogmaEntry.DogmaEffects = (function() {

                function DogmaEffects(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }

                DogmaEffects.prototype.effectID = 0;
                DogmaEffects.prototype.isDefault = false;

                DogmaEffects.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.TypeDogma.TypeDogmaEntry.DogmaEffects();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                        case 1: {
                                m.effectID = r.int32();
                                break;
                            }
                        case 2: {
                                m.isDefault = r.bool();
                                break;
                            }
                        default:
                            r.skipType(t & 7);
                            break;
                        }
                    }
                    if (!m.hasOwnProperty("effectID"))
                        throw Error("missing required 'effectID'", { instance: m });
                    if (!m.hasOwnProperty("isDefault"))
                        throw Error("missing required 'isDefault'", { instance: m });
                    return m;
                };

                return DogmaEffects;
            })();

            return TypeDogmaEntry;
        })();

        return TypeDogma;
    })();

    esf.TypeIDs = (function() {

        function TypeIDs(p) {
            this.entries = {};
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        TypeIDs.prototype.entries = emptyObject;

        TypeIDs.decode = async function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.TypeIDs(), k, value;
            while (r.pos < c) {
                if (r.need_data()) {
                    await r.fetch_data();
                }
                if (r.is_eof()) break;

                var t = r.uint32();
                switch (t >>> 3) {
                case 1: {
                        if (m.entries === emptyObject)
                            m.entries = {};
                        var c2 = r.uint32() + r.pos;
                        k = 0;
                        value = null;
                        while (r.pos < c2) {
                            var tag2 = r.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                k = r.int32();
                                break;
                            case 2:
                                value = $root.esf.TypeIDs.TypeID.decode(r, r.uint32());
                                break;
                            default:
                                r.skipType(tag2 & 7);
                                break;
                            }
                        }
                        m.entries[k] = value;
                        break;
                    }
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        TypeIDs.TypeID = (function() {

            function TypeID(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            TypeID.prototype.name = "";
            TypeID.prototype.groupID = 0;
            TypeID.prototype.categoryID = 0;
            TypeID.prototype.published = false;
            TypeID.prototype.marketGroupID = 0;
            TypeID.prototype.capacity = 0;
            TypeID.prototype.mass = 0;
            TypeID.prototype.radius = 0;
            TypeID.prototype.volume = 0;

            TypeID.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.TypeIDs.TypeID();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.name = r.string();
                            break;
                        }
                    case 2: {
                            m.groupID = r.int32();
                            break;
                        }
                    case 3: {
                            m.categoryID = r.int32();
                            break;
                        }
                    case 4: {
                            m.published = r.bool();
                            break;
                        }
                    case 5: {
                            m.marketGroupID = r.int32();
                            break;
                        }
                    case 6: {
                            m.capacity = r.float();
                            break;
                        }
                    case 7: {
                            m.mass = r.float();
                            break;
                        }
                    case 8: {
                            m.radius = r.float();
                            break;
                        }
                    case 9: {
                            m.volume = r.float();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                if (!m.hasOwnProperty("name"))
                    throw Error("missing required 'name'", { instance: m });
                if (!m.hasOwnProperty("groupID"))
                    throw Error("missing required 'groupID'", { instance: m });
                if (!m.hasOwnProperty("categoryID"))
                    throw Error("missing required 'categoryID'", { instance: m });
                if (!m.hasOwnProperty("published"))
                    throw Error("missing required 'published'", { instance: m });
                return m;
            };

            return TypeID;
        })();

        return TypeIDs;
    })();

    esf.DogmaAttributes = (function() {

        function DogmaAttributes(p) {
            this.entries = {};
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        DogmaAttributes.prototype.entries = emptyObject;

        DogmaAttributes.decode = async function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.DogmaAttributes(), k, value;
            while (r.pos < c) {
                if (r.need_data()) {
                    await r.fetch_data();
                }
                if (r.is_eof()) break;

                var t = r.uint32();
                switch (t >>> 3) {
                case 1: {
                        if (m.entries === emptyObject)
                            m.entries = {};
                        var c2 = r.uint32() + r.pos;
                        k = 0;
                        value = null;
                        while (r.pos < c2) {
                            var tag2 = r.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                k = r.int32();
                                break;
                            case 2:
                                value = $root.esf.DogmaAttributes.DogmaAttribute.decode(r, r.uint32());
                                break;
                            default:
                                r.skipType(tag2 & 7);
                                break;
                            }
                        }
                        m.entries[k] = value;
                        break;
                    }
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        DogmaAttributes.DogmaAttribute = (function() {

            function DogmaAttribute(p) {
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            DogmaAttribute.prototype.name = "";
            DogmaAttribute.prototype.published = false;
            DogmaAttribute.prototype.defaultValue = 0;
            DogmaAttribute.prototype.highIsGood = false;
            DogmaAttribute.prototype.stackable = false;

            DogmaAttribute.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.DogmaAttributes.DogmaAttribute();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.name = r.string();
                            break;
                        }
                    case 2: {
                            m.published = r.bool();
                            break;
                        }
                    case 3: {
                            m.defaultValue = r.float();
                            break;
                        }
                    case 4: {
                            m.highIsGood = r.bool();
                            break;
                        }
                    case 5: {
                            m.stackable = r.bool();
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                if (!m.hasOwnProperty("name"))
                    throw Error("missing required 'name'", { instance: m });
                if (!m.hasOwnProperty("published"))
                    throw Error("missing required 'published'", { instance: m });
                if (!m.hasOwnProperty("defaultValue"))
                    throw Error("missing required 'defaultValue'", { instance: m });
                if (!m.hasOwnProperty("highIsGood"))
                    throw Error("missing required 'highIsGood'", { instance: m });
                if (!m.hasOwnProperty("stackable"))
                    throw Error("missing required 'stackable'", { instance: m });
                return m;
            };

            return DogmaAttribute;
        })();

        return DogmaAttributes;
    })();

    esf.DogmaEffects = (function() {

        function DogmaEffects(p) {
            this.entries = {};
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        DogmaEffects.prototype.entries = emptyObject;

        DogmaEffects.decode = async function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.DogmaEffects(), k, value;
            while (r.pos < c) {
                if (r.need_data()) {
                    await r.fetch_data();
                }
                if (r.is_eof()) break;

                var t = r.uint32();
                switch (t >>> 3) {
                case 1: {
                        if (m.entries === emptyObject)
                            m.entries = {};
                        var c2 = r.uint32() + r.pos;
                        k = 0;
                        value = null;
                        while (r.pos < c2) {
                            var tag2 = r.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                k = r.int32();
                                break;
                            case 2:
                                value = $root.esf.DogmaEffects.DogmaEffect.decode(r, r.uint32());
                                break;
                            default:
                                r.skipType(tag2 & 7);
                                break;
                            }
                        }
                        m.entries[k] = value;
                        break;
                    }
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        DogmaEffects.DogmaEffect = (function() {

            function DogmaEffect(p) {
                this.modifierInfo = [];
                if (p)
                    for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                        if (p[ks[i]] != null)
                            this[ks[i]] = p[ks[i]];
            }

            DogmaEffect.prototype.name = "";
            DogmaEffect.prototype.effectCategory = 0;
            DogmaEffect.prototype.electronicChance = false;
            DogmaEffect.prototype.isAssistance = false;
            DogmaEffect.prototype.isOffensive = false;
            DogmaEffect.prototype.isWarpSafe = false;
            DogmaEffect.prototype.propulsionChance = false;
            DogmaEffect.prototype.rangeChance = false;
            DogmaEffect.prototype.dischargeAttributeID = 0;
            DogmaEffect.prototype.durationAttributeID = 0;
            DogmaEffect.prototype.rangeAttributeID = 0;
            DogmaEffect.prototype.falloffAttributeID = 0;
            DogmaEffect.prototype.trackingSpeedAttributeID = 0;
            DogmaEffect.prototype.fittingUsageChanceAttributeID = 0;
            DogmaEffect.prototype.resistanceAttributeID = 0;
            DogmaEffect.prototype.modifierInfo = emptyArray;

            DogmaEffect.decode = function decode(r, l) {
                if (!(r instanceof $Reader))
                    r = $Reader.create(r);
                var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.DogmaEffects.DogmaEffect();
                while (r.pos < c) {
                    var t = r.uint32();
                    switch (t >>> 3) {
                    case 1: {
                            m.name = r.string();
                            break;
                        }
                    case 2: {
                            m.effectCategory = r.int32();
                            break;
                        }
                    case 3: {
                            m.electronicChance = r.bool();
                            break;
                        }
                    case 4: {
                            m.isAssistance = r.bool();
                            break;
                        }
                    case 5: {
                            m.isOffensive = r.bool();
                            break;
                        }
                    case 6: {
                            m.isWarpSafe = r.bool();
                            break;
                        }
                    case 7: {
                            m.propulsionChance = r.bool();
                            break;
                        }
                    case 8: {
                            m.rangeChance = r.bool();
                            break;
                        }
                    case 9: {
                            m.dischargeAttributeID = r.int32();
                            break;
                        }
                    case 10: {
                            m.durationAttributeID = r.int32();
                            break;
                        }
                    case 11: {
                            m.rangeAttributeID = r.int32();
                            break;
                        }
                    case 12: {
                            m.falloffAttributeID = r.int32();
                            break;
                        }
                    case 13: {
                            m.trackingSpeedAttributeID = r.int32();
                            break;
                        }
                    case 14: {
                            m.fittingUsageChanceAttributeID = r.int32();
                            break;
                        }
                    case 15: {
                            m.resistanceAttributeID = r.int32();
                            break;
                        }
                    case 16: {
                            if (!(m.modifierInfo && m.modifierInfo.length))
                                m.modifierInfo = [];
                            m.modifierInfo.push($root.esf.DogmaEffects.DogmaEffect.ModifierInfo.decode(r, r.uint32()));
                            break;
                        }
                    default:
                        r.skipType(t & 7);
                        break;
                    }
                }
                if (!m.hasOwnProperty("name"))
                    throw Error("missing required 'name'", { instance: m });
                if (!m.hasOwnProperty("effectCategory"))
                    throw Error("missing required 'effectCategory'", { instance: m });
                if (!m.hasOwnProperty("electronicChance"))
                    throw Error("missing required 'electronicChance'", { instance: m });
                if (!m.hasOwnProperty("isAssistance"))
                    throw Error("missing required 'isAssistance'", { instance: m });
                if (!m.hasOwnProperty("isOffensive"))
                    throw Error("missing required 'isOffensive'", { instance: m });
                if (!m.hasOwnProperty("isWarpSafe"))
                    throw Error("missing required 'isWarpSafe'", { instance: m });
                if (!m.hasOwnProperty("propulsionChance"))
                    throw Error("missing required 'propulsionChance'", { instance: m });
                if (!m.hasOwnProperty("rangeChance"))
                    throw Error("missing required 'rangeChance'", { instance: m });
                return m;
            };

            DogmaEffect.ModifierInfo = (function() {

                function ModifierInfo(p) {
                    if (p)
                        for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                            if (p[ks[i]] != null)
                                this[ks[i]] = p[ks[i]];
                }

                ModifierInfo.prototype.domain = 0;
                ModifierInfo.prototype.func = 0;
                ModifierInfo.prototype.modifiedAttributeID = 0;
                ModifierInfo.prototype.modifyingAttributeID = 0;
                ModifierInfo.prototype.operation = 0;
                ModifierInfo.prototype.groupID = 0;
                ModifierInfo.prototype.skillTypeID = 0;

                ModifierInfo.decode = function decode(r, l) {
                    if (!(r instanceof $Reader))
                        r = $Reader.create(r);
                    var c = l === undefined ? r.len : r.pos + l, m = new $root.esf.DogmaEffects.DogmaEffect.ModifierInfo();
                    while (r.pos < c) {
                        var t = r.uint32();
                        switch (t >>> 3) {
                        case 1: {
                                m.domain = r.int32();
                                break;
                            }
                        case 2: {
                                m.func = r.int32();
                                break;
                            }
                        case 3: {
                                m.modifiedAttributeID = r.int32();
                                break;
                            }
                        case 4: {
                                m.modifyingAttributeID = r.int32();
                                break;
                            }
                        case 5: {
                                m.operation = r.int32();
                                break;
                            }
                        case 6: {
                                m.groupID = r.int32();
                                break;
                            }
                        case 7: {
                                m.skillTypeID = r.int32();
                                break;
                            }
                        default:
                            r.skipType(t & 7);
                            break;
                        }
                    }
                    if (!m.hasOwnProperty("domain"))
                        throw Error("missing required 'domain'", { instance: m });
                    if (!m.hasOwnProperty("func"))
                        throw Error("missing required 'func'", { instance: m });
                    return m;
                };

                ModifierInfo.Domain = (function() {
                    const valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "itemID"] = 0;
                    values[valuesById[1] = "shipID"] = 1;
                    values[valuesById[2] = "charID"] = 2;
                    values[valuesById[3] = "otherID"] = 3;
                    values[valuesById[4] = "structureID"] = 4;
                    values[valuesById[5] = "target"] = 5;
                    values[valuesById[6] = "targetID"] = 6;
                    return values;
                })();

                ModifierInfo.Func = (function() {
                    const valuesById = {}, values = Object.create(valuesById);
                    values[valuesById[0] = "ItemModifier"] = 0;
                    values[valuesById[1] = "LocationGroupModifier"] = 1;
                    values[valuesById[2] = "LocationModifier"] = 2;
                    values[valuesById[3] = "LocationRequiredSkillModifier"] = 3;
                    values[valuesById[4] = "OwnerRequiredSkillModifier"] = 4;
                    values[valuesById[5] = "EffectStopper"] = 5;
                    return values;
                })();

                return ModifierInfo;
            })();

            return DogmaEffect;
        })();

        return DogmaEffects;
    })();

    return esf;
})();

export { $root as default };
