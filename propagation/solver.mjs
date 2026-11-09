// Updated from GNN_LSTM_PINN_modular/TRN.py and TRN_3D.py (2026-11-09).
export const columns = 9;
export const rows = 5;
export const ambient = 298.15;
export const triggerTemperature = ambient + 2.8 * 3600 * 3.87 * 3 / (720 * 1.1);
export const eventTemperatureC = 200;
const eventTemperature = eventTemperatureC + 273.15;
const area = 0.013468;
const busbarResistance = 9.8;
const mass = {cell:720, pcm:31.58, fr:3.02};
const resistance = {cell:0.0064686804, pcm:0.041811847, fr:0.010452962};
const contact = 0.004;
const initialReaction = [0.04,0.75,0.15,0.033,1];
const faceArea = {x:0.013468,y:0.002366,z:0.003848};
const axisResistance = {x:0.0064686804,y:0.00501592,z:0.0034855184};
export const sourceProfiles = {"trn6": {"count": 6, "h": 25, "threshold": 300, "vent": 0.08, "environment": [0.5504009256321324, 0.21443266607736228, 0.21443266607736228, 0.21443266607736228, 0.21443266607736228, 0.5504009256321324], "links": [{"a": 0, "b": 1, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 1, "b": 0, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 1, "b": 2, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 2, "b": 1, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 2, "b": 3, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 3, "b": 2, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 3, "b": 4, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 4, "b": 3, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 4, "b": 5, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 5, "b": 4, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}]}, "trn25": {"count": 25, "h": 5, "threshold": 299, "vent": 0.07, "environment": [0.09837868729975437, 0.03106800789484971, 0.03106800789484971, 0.03106800789484971, 0.09837868729975437, 0.09837868729975437, 0.03106800789484971, 0.03106800789484971, 0.03106800789484971, 0.09837868729975437, 0.09837868729975437, 0.03106800789484971, 0.03106800789484971, 0.03106800789484971, 0.09837868729975437, 0.09837868729975437, 0.03106800789484971, 0.03106800789484971, 0.03106800789484971, 0.09837868729975437, 0.09837868729975437, 0.03106800789484971, 0.03106800789484971, 0.03106800789484971, 0.09837868729975437], "links": [{"a": 0, "b": 1, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 0, "b": 2, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 0, "b": 3, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 0, "b": 4, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 0, "b": 5, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 1, "b": 0, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 1, "b": 2, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 1, "b": 3, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 1, "b": 4, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 1, "b": 6, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 2, "b": 0, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 2, "b": 1, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 2, "b": 3, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 2, "b": 4, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 2, "b": 7, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 3, "b": 0, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 3, "b": 1, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 3, "b": 2, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 3, "b": 4, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 3, "b": 8, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 4, "b": 0, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 4, "b": 1, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 4, "b": 2, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 4, "b": 3, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 4, "b": 9, "conductance": 0.2706573341887639, "directed": true, "kind": "source"}, {"a": 5, "b": 0, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 5, "b": 6, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 5, "b": 7, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 5, "b": 8, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 5, "b": 9, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 5, "b": 10, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 6, "b": 1, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 6, "b": 5, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 6, "b": 7, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 6, "b": 8, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 6, "b": 9, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 6, "b": 11, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 7, "b": 2, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 7, "b": 5, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 7, "b": 6, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 7, "b": 8, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 7, "b": 9, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 7, "b": 12, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 8, "b": 3, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 8, "b": 5, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 8, "b": 6, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 8, "b": 7, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 8, "b": 9, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 8, "b": 13, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 9, "b": 4, "conductance": 0.2706573341887639, "directed": true, "kind": "source"}, {"a": 9, "b": 5, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 9, "b": 6, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 9, "b": 7, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 9, "b": 8, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 9, "b": 14, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 10, "b": 5, "conductance": 0.2706573341887639, "directed": true, "kind": "source"}, {"a": 10, "b": 11, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 10, "b": 12, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 10, "b": 13, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 10, "b": 14, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 10, "b": 15, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 11, "b": 6, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 11, "b": 10, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 11, "b": 12, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 11, "b": 13, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 11, "b": 14, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 11, "b": 16, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 12, "b": 7, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 12, "b": 10, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 12, "b": 11, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 12, "b": 13, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 12, "b": 14, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 12, "b": 17, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 13, "b": 8, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 13, "b": 10, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 13, "b": 11, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 13, "b": 12, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 13, "b": 14, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 13, "b": 18, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 14, "b": 9, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 14, "b": 10, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 14, "b": 11, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 14, "b": 12, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 14, "b": 13, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 14, "b": 19, "conductance": 0.2706573341887639, "directed": true, "kind": "source"}, {"a": 15, "b": 10, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 15, "b": 16, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 15, "b": 17, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 15, "b": 18, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 15, "b": 19, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 15, "b": 20, "conductance": 0.2706573341887639, "directed": true, "kind": "source"}, {"a": 16, "b": 11, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 16, "b": 15, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 16, "b": 17, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 16, "b": 18, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 16, "b": 19, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 16, "b": 21, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 17, "b": 12, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 17, "b": 15, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 17, "b": 16, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 17, "b": 18, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 17, "b": 19, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 17, "b": 22, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 18, "b": 13, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 18, "b": 15, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 18, "b": 16, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 18, "b": 17, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 18, "b": 19, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 18, "b": 23, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 19, "b": 14, "conductance": 0.2706573341887639, "directed": true, "kind": "source"}, {"a": 19, "b": 15, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 19, "b": 16, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 19, "b": 17, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 19, "b": 18, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 19, "b": 24, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 20, "b": 15, "conductance": 0.2706573341887639, "directed": true, "kind": "source"}, {"a": 20, "b": 21, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 20, "b": 22, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 20, "b": 23, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 20, "b": 24, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 21, "b": 16, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 21, "b": 20, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 21, "b": 22, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 21, "b": 23, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 21, "b": 24, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 22, "b": 17, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 22, "b": 20, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 22, "b": 21, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 22, "b": 23, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 22, "b": 24, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 23, "b": 18, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 23, "b": 20, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 23, "b": 21, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 23, "b": 22, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 23, "b": 24, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}, {"a": 24, "b": 19, "conductance": 0.16861651786223333, "directed": true, "kind": "source"}, {"a": 24, "b": 20, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 24, "b": 21, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 24, "b": 22, "conductance": 0.1020408163265306, "directed": true, "kind": "source"}, {"a": 24, "b": 23, "conductance": 0.8972060229388854, "directed": true, "kind": "source"}]}};
export function sourceLayout(profile) {
  const count=sourceProfiles[profile]?.count;
  if(!count) throw new Error('Unknown source profile');
  return Array.from({length:count},(_,i)=>({id:i+1,type:'cell',x:(profile==='trn6'?i:i%5)*40,y:(profile==='trn6'?0:Math.floor(i/5))*140,w:40,h:140}));
}
export function sourceMatches(parts,profile) {
  if(!sourceProfiles[profile])return false;
  const reference=sourceLayout(profile);
  return parts.length===reference.length && parts.every((p,i)=>p.type==='cell'&&p.w===40&&p.h===140&&Math.abs(p.x-parts[0].x-reference[i].x)<.01&&Math.abs(p.y-parts[0].y-reference[i].y)<.01);
}
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
      if (type === 'cell' && other === 'cell') r = 2*resistance.cell+contact;
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

function cellConvection(exposed, h) {
  return Object.keys(faceArea).reduce((sum, direction) => {
    const exposedFaces = Math.max(0, exposed[direction]);
    return sum + exposedFaces / (axisResistance[direction] + 1 / (h * faceArea[direction]));
  }, 0);
}

function sourceConvection(profile, i, h) {
  // Exposed-face masks from the original Python preset geometries.
  const lastColumn = profile === 'trn6' ? 5 : 4;
  const column = profile === 'trn6' ? i : i % 5;
  return cellConvection({x: Number(column === 0 || column === lastColumn), y: profile === 'trn6' ? 2 : 1, z: 1}, h);
}

// Freeform plan geometry uses reference units, not physical millimetres.
// 40 x 140 is the UI reference footprint for the supplied 720 g cell.
export function buildGeometryNetwork(parts, h = sourceProfiles.trn25.h) {
  const reference = {cell: 40 * 140, pcm: 16 * 140, fr: 8 * 140};
  const nodes = parts.map(p => ({...p, slot: p.id, scale: p.w * p.h / reference[p.type]}));
  const links = [];
  const exposed = nodes.map(p=>({x:2,y:2,z:1}));
  for (let a = 0; a < nodes.length; a++) for (let b = a + 1; b < nodes.length; b++) {
    const p = nodes[a], q = nodes[b];
    const dx = Math.min(p.x+p.w,q.x+q.w)-Math.max(p.x,q.x);
    const dy = Math.min(p.y+p.h,q.y+q.h)-Math.max(p.y,q.y);
    if (dx > 0.01 && dy > 0.01) throw new Error('Components overlap. Move them apart before calculating.');
    const vertical = Math.abs(p.x+p.w-q.x)<0.01 || Math.abs(q.x+q.w-p.x)<0.01;
    const horizontal = Math.abs(p.y+p.h-q.y)<0.01 || Math.abs(q.y+q.h-p.y)<0.01;
    const length = vertical && dy>0.01 ? dy : horizontal && dx>0.01 ? dx : 0;
    if (!length) continue;
    const axis=vertical?'x':'y';
    exposed[a][axis]-=length/(vertical?p.h:p.w);exposed[b][axis]-=length/(vertical?q.h:q.w);
    const depth = n => n.type === 'cell' ? 1 : (vertical ? n.w : n.h)/(n.type === 'pcm' ? 16 : 8);
    const half=n=>n.type==='cell'?axisResistance[axis]*(vertical?n.w/40:n.h/140):resistance[n.type]*depth(n);
    let r = half(p)+half(q);
    if(p.type==='cell'||q.type==='cell') r+=contact;
    links.push({a,b,conductance: faceArea[axis] * length / (vertical?140:40) / r, kind:'contact'});
  }
  nodes.forEach((node, i) => {
    if (node.type === 'cell') {
      node.environment = cellConvection(exposed[i], h) * node.scale;
    } else {
      node.environment = h * 0.012428 * node.scale;
    }
  });
  return {nodes,links};
}

function heatCapacity(type, temperature) {
  if (type === 'cell') return mass.cell * 1.1;
  if (type === 'fr') return mass.fr * 0.00004197;
  if (temperature <= 316.65) return mass.pcm * 2.180;
  if (temperature >= 321.35) return mass.pcm * 2.390;
  const latent = 187.21 * (2.35 - Math.abs(temperature - 319)) / 2.35 ** 2;
  return mass.pcm * (2.180 + latent);
}

// Frozen-temperature reaction increments, adaptively refined by step doubling.
function react(t, state, offset, dt, next, config, triggered) {
  const [c,a,se,z,soc]=state.slice(offset,offset+5);
  const active=t>=config.threshold;
  const rc=active?4e13/60*Math.exp(-2.03e-19/(1.38e-23*t)):0;
  const ra=active?1e14/60*Math.exp(-2.24e-19/(1.38e-23*t)):0;
  const rs=active?1e15/60*Math.exp(-z/.033-2.24e-19/(1.38e-23*t)):0;
  const nc=c>0&&c<1?1/(1+(1/c-1)*Math.exp(-rc*dt)):c;
  const na=a*Math.exp(-ra*dt), ns=se*Math.exp(-rs*dt);
  const nz=z+(se-ns)*.1;
  const nsoc=Math.max(0,soc-(t>=433.15?1e12/60*(1-c)*a*Math.exp(-1.4e-19/(1.38e-23*t))*dt:0));
  next.set([nc,na,ns,nz,nsoc],offset);
  return .29*3.14e5*(nc-c)+.13*1.714e6*(a-na)+.13*2.57e5*(se-ns)+351000*(1-config.vent-(triggered?.1:0))*(soc-nsoc);
}
function solveLinear(matrix,rhs,n) {
  // Diagonally dominant implicit heat operator; supports the source's directed links.
  for(let k=0;k<n;k++)for(let i=k+1;i<n;i++){
    const f=matrix[i*n+k]/matrix[k*n+k];
    if(!f)continue;
    for(let j=k+1;j<n;j++)matrix[i*n+j]-=f*matrix[k*n+j];
    rhs[i]-=f*rhs[k];
  }
  for(let i=n-1;i>=0;i--){for(let j=i+1;j<n;j++)rhs[i]-=matrix[i*n+j]*rhs[j];rhs[i]/=matrix[i*n+i];}
}

export function simulate({tiles, parts, ignition, busbars, duration = parts ? 4000 : 200, tolerance = 0.001, profile = null, convectionCoefficient}, onProgress = () => {}) {
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Enter a positive observation duration.');
  const config = sourceProfiles[profile] ?? (parts ? sourceProfiles.trn25 : sourceProfiles.trn6);
  if(profile && !sourceMatches(parts,profile))throw new Error('Source layout changed. Select custom layout physics.');
  const h = convectionCoefficient ?? config.h;
  if (!Number.isFinite(h) || h < 0 || h > 10000) {
    throw new Error('Enter a convection coefficient from 0 to 10000 W/(m²·K).');
  }
  const {nodes, links} = profile ? {
    nodes: parts.map((part, i) => ({
      ...part,
      slot: part.id,
      scale: 1,
      environment: h === config.h ? config.environment[i] : sourceConvection(profile, i, h),
    })),
    links: config.links,
  } : parts ? buildGeometryNetwork(parts, h) : buildNetwork(tiles, busbars);
  const n = nodes.length;
  const ignitionNode = nodes.findIndex(node => node.slot === ignition && node.type === 'cell');
  if (ignitionNode < 0) throw new Error('Choose an installed battery cell to trigger.');
  const cellNodes = nodes.flatMap((node, i) => node.type === 'cell' ? [i] : []);
  const offsets = new Map(cellNodes.map((i, j) => [i, n + j * 5]));
  const size = n + 5 * cellNodes.length;
  const matrix = new Float64Array(n * n);
  const rhs = new Float64Array(n);
  const conductance = new Float64Array(n * n);
  for (const {a, b, conductance: g, directed} of links) {
    conductance[a * n + a] += g;
    if(!directed)conductance[b * n + b] += g;
    conductance[a * n + b] -= g;
    if(!directed)conductance[b * n + a] -= g;
  }
  function advance(state, dt, out) {
    for (let i = 0; i < matrix.length; i++) matrix[i] = dt * conductance[i];
    for (const [i, node] of nodes.entries()) {
      const scale = node.scale ?? 1;
      const cp = heatCapacity(node.type, state[i]) * scale;
      const energy = node.type === 'cell' ? react(state[i], state, offsets.get(i), dt, out,config,i===ignitionNode) * scale : 0;
      const convection = node.environment ?? h * 0.012428 * scale;
      matrix[i * n + i] += cp + dt * convection;
      rhs[i] = cp * state[i] + energy + dt * convection * ambient;
    }
    solveLinear(matrix, rhs, n);
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
  let t = 0, dt = 0.05, steps = 0;
  const interval = Math.max(0.25,duration/8000);
  while (t < duration - 1e-8) {
    const target = Math.min(duration, times.length * interval);
    while (t < target - 1e-8) {
      if (++steps > 1000000) throw new Error('Solver step limit reached. Try a smaller layout or a shorter run.');
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
        }
      }
      [current, next] = [next, current];
      t += h;
      dt = Math.min(0.25, h * Math.min(2, 0.9 * Math.sqrt(tolerance / Math.max(error, 1e-12))));
    }
    times.push(t);
    frames.push(Array.from(current.subarray(0, n)));
    if (times.length % 40 === 0) onProgress(t);
  }
  return {nodes, links, events, times, frames, ignitionNode, cellCount: cellNodes.length};
}
