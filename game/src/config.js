// Ember Duel — the card pool and the table constants.
// Every card belongs to one of four ember houses, told apart by colour
// AND by shape, never by text alone: Ember ◆ red, Cinder ● orange,
// Ash ■ grey, Spark ▲ gold. Creatures fight on the board; spells
// resolve the moment they are played.
export const START_HP = 20;
export const MAX_MANA = 10;
export const HAND_LIMIT = 7;
export const DECK_SIZE = 30;
export const BOARD_LIMIT = 6;

export const HOUSE = {
  EMBER: { name: 'Ember', shape: '◆', color: '#e5484d' },
  CINDER: { name: 'Cinder', shape: '●', color: '#f76b15' },
  ASH: { name: 'Ash', shape: '■', color: '#8b8d98' },
  SPARK: { name: 'Spark', shape: '▲', color: '#f5d90a' },
};

// id, name, house, cost, kind, attack, health, text
export const CARDS = [
  { id: 'imp', name: 'Ember Imp', house: 'EMBER', cost: 1, kind: 'creature', attack: 2, health: 1, text: 'Small, quick, and always first to the fire.' },
  { id: 'fox', name: 'Spark Fox', house: 'SPARK', cost: 2, kind: 'creature', attack: 3, health: 1, text: 'Strikes twice as fast as the eye can follow.' },
  { id: 'wolf', name: 'Cinder Wolf', house: 'CINDER', cost: 2, kind: 'creature', attack: 3, health: 2, text: 'Hunts in the smoke between the flames.' },
  { id: 'moth', name: 'Ash Moth', house: 'ASH', cost: 1, kind: 'creature', attack: 1, health: 2, text: 'Drifts through the coals, impossible to catch.' },
  { id: 'golem', name: 'Ash Golem', house: 'ASH', cost: 3, kind: 'creature', attack: 2, health: 5, text: 'Guard — your foes must break it before they reach you.', guard: true },
  { id: 'hawk', name: 'Ember Hawk', house: 'EMBER', cost: 3, kind: 'creature', attack: 4, health: 3, text: 'Dives out of the sun with burning wings.' },
  { id: 'wisp', name: 'Cinder Wisp', house: 'CINDER', cost: 2, kind: 'creature', attack: 2, health: 3, text: 'A lost flame that still remembers how to bite.' },
  { id: 'stag', name: 'Spark Stag', house: 'SPARK', cost: 4, kind: 'creature', attack: 5, health: 4, text: 'Its antlers carry the light of the first fire.' },
  { id: 'fireball', name: 'Fireball', house: 'EMBER', cost: 2, kind: 'spell', text: 'Deal 3 damage to the enemy hero.', damage: 3 },
  { id: 'mend', name: 'Coal Mend', house: 'ASH', cost: 2, kind: 'spell', text: 'Restore 4 life to your hero.', heal: 4 },
  { id: 'stoke', name: 'Stoke the Fire', house: 'SPARK', cost: 1, kind: 'spell', text: 'Draw 2 cards.', draw: 2 },
  { id: 'nova', name: 'Ember Nova', house: 'CINDER', cost: 4, kind: 'spell', text: 'Deal 2 damage to every enemy creature.', sweep: 2 },
];

export const AI_NAME = 'Cinder, the Ash Warden';
export const HERO_NAME = 'You, the Ember Keeper';
