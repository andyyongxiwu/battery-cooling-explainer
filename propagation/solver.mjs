// Physical parameters from TRN_busbar_NAIL reliufenxi_12module.py.
export const columns = 9;
export const rows = 5;
export const ambient = 298.15;
export const triggerTemperature = ambient + 0.223 * 3600 * 3.6 * 3 / (0.4286 * 1301);
export const eventTemperatureC = 200;
const eventTemperature = eventTemperatureC + 273.15;
const area = 0.027997964;
const convection = 20 * 0.002;
const busbarResistance = 0.736434109 + 2 * 4.400380258;
const mass = {cell: 428, pcm: 31.58170339, fr: 3.023780112};
const resistance = {cell: 0.00371134, pcm: 0.041811847, fr: 0.010452962};
const contact = 0.00952381;
const initialReaction = [0.15, 0.75, 0.04, 0.999, 0.999];
const reactions = [
  [2.57e5, 610.4, 1.667e15, 135080, 363.15],
  [1.714e6, 610.4, 2.5e13, 135080, 393.15],
  [3.14e5, 1438, 6.667e13, 139600, 473.15],
  [1.55e5, 406.9, 5.14e25, 274000, 503.15],
  [9.03e8, 1, 3.37e12, 95150, 330],
];

export function buildNetwork(tiles, busbars) {
  const nodes = [], indices = new Map(), links = [];
  tiles.forEach((type, slot) => {
    if (Object.hasOwn(mass, type)) {
      indices.set(slot, nodes.length);
      nodes.push({type, slot});
    }
  });
  for (const [a, node] of nodes.entries()) {
    const {slot, type} = node;
    const column = slot % columns;
    const adjacent = [column + 1 < columns ? slot + 1 : -1, slot + columns];
    for (const next of adjacent) {
      const b = indices.get(next);
      if (b === undefined) continue;
      const other = nodes[b].type;
      let r = resistance[type] + resistance[other];
      if (type === 'cell' && other === 'cell') r = resistance.cell;
      else if (type === 'cell' || other === 'cell') r += contact;
      links.push({a, b, conductance: area / r, kind: 'contact'});
    }
    if (busbars && type === 'cell') {
      for (let offset = 1; column + offset < columns; offset++) {
        const b = indices.get(slot + offset);
        if (b === undefined) break;
        if (nodes[b].type !== 'cell') continue;
        links.push({a, b, conductance: 1 / busbarResistance, kind: 'busbar'});
        break;
      }
    }
  }
  return {nodes, links};
}

// Freeform plan geometry uses reference units, not physical millimetres.
// The source model face area and masses are reference values for an 80 x 140 cell.
export function buildGeometryNetwork(parts) {
  const reference = {cell: 80 * 140, pcm: 16 * 140, fr: 8 * 140};
  const nodes = parts.map(p => ({...p, slot: p.id, scale: p.w * p.h / reference[p.type]}));
  const links = [];
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
    const p = nodes[a], q = nodes[b];
    const dx = Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x);
    const dy = Math.min(p.y+p.h,q.y+q.h)-Math.max(p.y,q.y);
    if (dx > 0.01 && dy > 0.01) throw new Error('Components overlap. Move them apart before calculating.');
    const vertical = Math.abs(p.x+p.w-q.x)<0.01 || Math.abs(q.x+q.w-p.x)<0.01;
    const horizontal = Math.abs(p.y+p.h-q.y)<0.01 || Math.abs(q.y+q.h-p.y)<0.01;
    const length = vertical && dy>0.01 ? dy : horizontal && dx>0.01 ? dx : 0;
    if (!length) continue;
    const depth = n => n.type === 'cell' ? 1 : (vertical ? n.w : n.h)/(n.type === 'pcm' ? 16 : 8);
    let r = resistance[p.type]*depth(p)+resistance[q.type]*depth(q);
    if (p.type==='cell' && q.type==='cell') r=resistance.cell;
    else if(p.type==='cell'||q.type==='cell') r+=contact;
    links.push({a,b,conductance: area * length / 140 / r, kind:'contact'});
  }
  return {nodes,links};
}

function heatCapacity(type, temperature) {
  if (type === 'cell') return mass.cell * 1.301;
  if (type === 'fr') return mass.fr * 0.00004197;
  if (temperature <= 316.65) return mass.pcm * 2.180;
  if (temperature >= 321.35) return mass.pcm * 2.390;
  const latent = 187.21 * (2.35 - Math.abs(temperature - 319)) / 2.35 ** 2;
  return mass.pcm * (2.180 + latent);
}

// Integrate each reaction exactly at the temperature and SEI state at step entry.
function react(t, state, offset, dt, next) {
  let energy = 0;
  const seiFactor = Math.exp(-(0.033 + 0.15 - state[offset + 1]) / 0.033);
  for (let j = 0; j < reactions.length; j++) {
    const [heat, weight, frequency, activation, threshold] = reactions[j];
    const initial = state[offset + j];
    let updated = initial;
    if (1.249 * t >= threshold && initial > 1e-6 && initial < 0.9999) {
      const rate = frequency * Math.exp(-activation / (8.314 * t));
      if (j === 2) {
        updated = Math.min(0.9999, 1 / (1 + (1 / initial - 1) * Math.exp(-rate * dt)));
      } else {
        updated = Math.max(1e-6, initial * Math.exp(-rate * dt * (j === 1 ? seiFactor : 1)));
      }
    }
    next[offset + j] = updated;
    energy += heat * weight * Math.abs(updated - initial) * 0.000201585;
  }
  return energy;
}

function solveSymmetric(matrix, rhs, n) {
  // In-place Cholesky factorization and forward/back substitution.
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let value = matrix[i * n + j];
      for (let k = 0; k < j; k++) value -= matrix[i * n + k] * matrix[j * n + k];
      matrix[i * n + j] = i === j ? Math.sqrt(value) : value / matrix[j * n + j];
    }
    for (let j = 0; j < i; j++) rhs[i] -= matrix[i * n + j] * rhs[j];
    rhs[i] /= matrix[i * n + i];
  }
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) rhs[i] -= matrix[j * n + i] * rhs[j];
    rhs[i] /= matrix[i * n + i];
  }
}

export function simulate({tiles, parts, ignition, busbars, duration = 200, tolerance = 0.05}, onProgress = () => {}) {
  const {nodes, links} = parts ? buildGeometryNetwork(parts) : buildNetwork(tiles, busbars);
  const n = nodes.length;
  const ignitionNode = nodes.findIndex(node => node.slot === ignition && node.type === 'cell');
  if (ignitionNode < 0) throw new Error('Choose an installed battery cell to trigger.');
  const cellNodes = nodes.flatMap((node, i) => node.type === 'cell' ? [i] : []);
  const offsets = new Map(cellNodes.map((i, j) => [i, n + j * 5]));
  const size = n + 5 * cellNodes.length;
  const matrix = new Float64Array(n * n);
  const rhs = new Float64Array(n);
  const conductance = new Float64Array(n * n);
  for (const {a, b, conductance: g} of links) {
    conductance[a * n + a] += g;
    conductance[b * n + b] += g;
    conductance[a * n + b] -= g;
    conductance[b * n + a] -= g;
  }
  function advance(state, dt, out) {
    for (let i = 0; i < matrix.length; i++) matrix[i] = dt * conductance[i];
    for (const [i, node] of nodes.entries()) {
      const scale = node.scale ?? 1;
      const cp = heatCapacity(node.type, state[i]) * scale;
      const energy = node.type === 'cell' ? react(state[i], state, offsets.get(i), dt, out) * scale : 0;
      matrix[i * n + i] += cp + dt * convection * scale;
      rhs[i] = cp * state[i] + energy + dt * convection * scale * ambient;
    }
    solveSymmetric(matrix, rhs, n);
    out.set(rhs);
  }
  let current = new Float64Array(size);
  current.fill(ambient, 0, n);
  current[ignitionNode] = triggerTemperature;
  for (const offset of offsets.values()) current.set(initialReaction, offset);
  const full = new Float64Array(size), half = new Float64Array(size);
  let next = new Float64Array(size);
  const events = Array(n).fill(null);
  const times = [0], frames = [Array.from(current.subarray(0, n))];
  let t = 0, dt = 0.05, steps = 0, reached = 0;
  const interval = 0.25;
  while (t < duration - 1e-8) {
    const target = Math.min(duration, times.length * interval);
    while (t < target - 1e-8) {
      if (++steps > 180000) throw new Error('Solver step limit reached. Try a smaller layout or a shorter run.');
      const h = Math.min(dt, target - t);
      advance(current, h, full);
      advance(current, h / 2, half);
      advance(half, h / 2, next);
      let error = 0;
      for (let i = 0; i < size; i++) error = Math.max(error, Math.abs(next[i] - full[i]) * (i < n ? 1 : 100));
      if (!Number.isFinite(error)) throw new Error('Solver produced a non-finite state.');
      if (error > tolerance) {
        if (h < 1e-8) throw new Error('Solver could not resolve the reaction onset.');
        dt = h * Math.max(0.15, 0.8 * Math.sqrt(tolerance / error));
        continue;
      }
      for (const i of cellNodes) {
        if (events[i] === null && next[i] >= eventTemperature) {
          events[i] = t + h * (eventTemperature - current[i]) / (next[i] - current[i]);
          reached++;
        }
      }
      [current, next] = [next, current];
      t += h;
      dt = Math.min(0.25, h * Math.min(2, 0.9 * Math.sqrt(tolerance / Math.max(error, 1e-12))));
      if (reached === cellNodes.length) break;
    }
    times.push(t);
    frames.push(Array.from(current.subarray(0, n)));
    if (times.length % 40 === 0) onProgress(t);
    if (reached === cellNodes.length) break;
  }
  return {nodes, links, events, times, frames, ignitionNode, cellCount: cellNodes.length};
}
