// Ember Duel — a small seeded random source, so a ?seed=N game and a
// screenshot staged from it always play out the same way.
export function createRandom(seed) {
  let state = (seed >>> 0) || 1;
  function next() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  }
  function intBelow(n) {
    return Math.floor(next() * n);
  }
  function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = intBelow(i + 1);
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }
  function pick(list) {
    return list[intBelow(list.length)];
  }
  return { next, intBelow, shuffle, pick };
}
