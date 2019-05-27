'use strict';

const mongoose = require('mongoose');

const charSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  age: { type: String },
  player: { type: String },
  virtue: { type: String },
  vice: { type: String },
  concept: { type: String },
  chronicle: { type: String },
  faction: { type: String },
  group: { type: String },
  intelligence: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 20
  },
  wits: { type: Number, required: true, default: 1, min: 1, max: 20 },
  resolve: { type: Number, required: true, default: 1, min: 1, max: 20 },
  strength: { type: Number, required: true, default: 1, min: 1, max: 20 },
  dexterity: { type: Number, required: true, default: 1, min: 1, max: 20 },
  stamina: { type: Number, required: true, default: 1, min: 1, max: 20 },
  presence: { type: Number, required: true, default: 1, min: 1, max: 20 },
  manipulation: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 20
  },
  composure: { type: Number, required: true, default: 1, min: 1, max: 20 },
  academics: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  computers: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  crafts: { type: Number, default: 0, required: true, min: 0, max: 20 },
  investigation: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  medicine: { type: Number, default: 0, required: true, min: 0, max: 20 },
  occult: { type: Number, default: 0, required: true, min: 0, max: 20 },
  politics: { type: Number, default: 0, required: true, min: 0, max: 20 },
  science: { type: Number, default: 0, required: true, min: 0, max: 20 },
  athletics: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  brawl: { type: Number, default: 0, required: true, min: 0, max: 20 },
  drive: { type: Number, default: 0, required: true, min: 0, max: 20 },
  firearms: { type: Number, default: 0, required: true, min: 0, max: 20 },
  larceny: { type: Number, default: 0, required: true, min: 0, max: 20 },
  stealth: { type: Number, default: 0, required: true, min: 0, max: 20 },
  survival: { type: Number, default: 0, required: true, min: 0, max: 20 },
  weaponry: { type: Number, default: 0, required: true, min: 0, max: 20 },
  animalKen: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  empathy: { type: Number, default: 0, required: true, min: 0, max: 20 },
  expression: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  intimidation: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  persuasion: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  socialize: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  streetwise: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  subterfuge: {
    type: Number,
    default: 0,
    required: true,
    min: 0,
    max: 20
  },
  merits: [
    {
      name: { type: String },
      rating: { type: Number },
      description: { type: String }
    }
  ],
  size: { type: Number, required: true, default: 5, min: 4, max: 6 },
  armor: { type: Number, default: 0 },
  beats: { type: Number, default: 0, min: 0, max: 4 },
  experience: { type: Number, default: 0, min: 0 },
  health: {
    damage: {
      bashing: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      lethal: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      },
      aggravated: {
        type: Number,
        required: true,
        default: 0,
        min: 0
      }
    }
  },
  willpower: {
    spent: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  integrity: { type: Number, default: 7, min: 1, max: 10 },
  conditions: [{ type: String }],
  aspirations: [{ type: String }]
});

charSchema.virtual('initiativeMod').get(function() {
  return this.composure + this.dexterity;
});

charSchema.virtual('health.max').get(function() {
  return this.size + this.stamina;
});

charSchema.virtual('willpower.max', 'willpower.spent.max').get(function() {
  return this.composure + this.resolve;
});

charSchema.virtual('speed').get(function() {
  return this.size + this.strength + this.dexterity;
});

charSchema.virtual('defense').get(function() {
  let defense;
  if (this.wits < this.dexterity) {
    defense = this.wits + this.athletics;
    return defense;
  } else {
    defense = this.dexterity + this.athletics;
    return defense;
  }
});

charSchema.set('timestamps', true);

charSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Character', charSchema);
