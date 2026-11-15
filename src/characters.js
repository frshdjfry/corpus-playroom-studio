export const MAX_CHARACTERS = 24;
export const DEFAULT_CHARACTER_COLORS = Object.freeze({bodyColor:'#c29461', jointColor:'#a77448'});
export const CHARACTER_FIELDS = {
  x: [-10000, 10000], y: [-10000, 10000], direction: [-180, 180],
  height: [300, 3000], elevation: [0, 5000],
};

const UP = [0, 1, 0];
const add = (a, b) => a.map((value, i) => value + b[i]);
const subtract = (a, b) => a.map((value, i) => value - b[i]);
const scale = (vector, amount) => vector.map(value => value * amount);
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const length = vector => Math.hypot(...vector);
const unit = (vector, fallback = UP) => length(vector) > 1e-8 ? scale(vector, 1 / length(vector)) : fallback;
const cross = ([ax, ay, az], [bx, by, bz]) => [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
const at = (point, direction, distance) => add(point, scale(direction, distance));
const middle = (a, b) => scale(add(a, b), 0.5);

const TORSO = 0.263, HEAD = 0.111;
const SIDES = [['left', 1], ['right', -1]];
const ARM = {root: 'shoulder', hinge: 'elbow', end: 'wrist', upper: 'upperArm', lower: 'forearm', lengths: [0.155, 0.133], bend: [0, 0, -1]};
const LEG = {root: 'hip', hinge: 'knee', end: 'ankle', upper: 'thigh', lower: 'shin', lengths: [0.23, 0.223], bend: [0, 0, 1]};
const CHAINS = [ARM, LEG];
const key = (side, part) => `${side}-${part}`;

export const TURNED_PROFILES = {
  spindle: [[0,-1],[0.48,-0.92],[0.76,-0.74],[0.96,-0.36],[1,-0.10],[0.9,0.35],[0.7,0.76],[0.42,0.93],[0,1]],
  torso: [[0,-1],[0.37,-0.98],[0.46,-0.77],[0.56,-0.41],[0.75,0],[0.96,0.43],[1,0.65],[0.87,0.83],[0.51,0.97],[0,1]],
};

export function neutralPose() {
  const pose = {torso: [...UP], head: [...UP]};
  for (const [side, sign] of SIDES) {
    pose[key(side, 'upperArm')] = unit([sign * 0.23, -1, -0.035]);
    pose[key(side, 'forearm')] = unit([sign * 0.11, -1, 0.10]);
    pose[key(side, 'thigh')] = unit([sign * 0.105, -1, 0.045]);
    pose[key(side, 'shin')] = unit([sign * 0.055, -1, -0.045]);
  }
  return pose;
}

function preset(id, label, directions = {}) {
  const pose = neutralPose();
  for (const [bone, direction] of Object.entries(directions)) pose[bone] = unit(direction);
  return {id, label, pose};
}

export const POSE_PRESETS = [
  preset('standing', 'Standing'),
  preset('walking', 'Walking', {
    torso: [0, 1, 0.10],
    'left-thigh': [0.06, -1, 0.44], 'left-shin': [0.02, -1, 0.12],
    'right-thigh': [-0.05, -1, -0.39], 'right-shin': [-0.02, -1, -0.49],
    'left-upperArm': [0.12, -1, -0.40], 'left-forearm': [0.08, -1, -0.24],
    'right-upperArm': [-0.15, -1, 0.38], 'right-forearm': [-0.07, -0.8, 0.61],
  }),
  preset('seated', 'Seated', {
    torso: [0, 1, 0.07],
    'left-thigh': [0.14, -0.07, 1], 'right-thigh': [-0.14, -0.07, 1],
    'left-shin': [0, -1, -0.10], 'right-shin': [0, -1, -0.10],
    'left-upperArm': [0.07, -1, 0.13], 'right-upperArm': [-0.07, -1, 0.13],
    'left-forearm': [-0.10, -0.53, 1], 'right-forearm': [0.10, -0.53, 1],
  }),
  preset('kneeling', 'Kneeling', {
    'left-thigh': [0.09, -1, 0.15], 'right-thigh': [-0.09, -1, 0.15],
    'left-shin': [0.03, 0.02, -1], 'right-shin': [-0.03, 0.02, -1],
    'left-upperArm': [0.10, -1, 0.20], 'right-upperArm': [-0.10, -1, 0.20],
    'left-forearm': [-0.12, -0.88, 0.49], 'right-forearm': [0.12, -0.88, 0.49],
  }),
  preset('crouching', 'Crouching', {
    torso: [0, 0.83, 0.56],
    'left-thigh': [0.28, -0.64, 0.77], 'right-thigh': [-0.28, -0.64, 0.77],
    'left-shin': [0.03, -0.84, -0.54], 'right-shin': [-0.03, -0.84, -0.54],
    'left-upperArm': [0.13, -0.75, 0.65], 'right-upperArm': [-0.13, -0.75, 0.65],
    'left-forearm': [-0.10, -0.16, 1], 'right-forearm': [0.10, -0.16, 1],
  }),
  preset('reaching', 'Reaching up', {
    torso: [-0.13, 1, 0.13], head: [-0.10, 1, -0.16],
    'right-upperArm': [-0.28, 1, 0.27], 'right-forearm': [0.12, 1, 0.13],
  }),
  preset('pointing', 'Pointing forward', {
    torso: [0, 1, 0.13],
    'right-upperArm': [-0.14, 0.03, 1], 'right-forearm': [0.04, 0.12, 1],
  }),
  preset('bowing', 'Bowing', {
    torso: [0, 0.68, 0.73], head: [0, 0.66, 0.75],
    'left-upperArm': [0.17, -1, 0.08], 'right-upperArm': [-0.17, -1, 0.08],
    'left-forearm': [0.08, -1, 0.12], 'right-forearm': [-0.08, -1, 0.12],
  }),
];

export function characterName(character) {
  return character.name?.trim() || `Character ${character.id}`;
}

export function newCharacter(characters) {
  const used = new Set(characters.map(character => character.id));
  let id = 1;
  while (used.has(id)) id++;
  const slots = [[2080, 1800], [1530, 1800], [2630, 1800], [2080, 2500]];
  for (let y = 900; y <= 3900; y += 600) {
    for (let x = 850; x <= 3450; x += 520) slots.push([x, y]);
  }
  const [x, y] = slots.find(([x, y]) => characters.every(character => Math.hypot(character.x - x, character.y - y) > 360)) ?? slots[0];
  return {id, name: `Character ${id}`, x, y, height: 1750, direction: 0, elevation: 0,
    ...DEFAULT_CHARACTER_COLORS, pose: neutralPose()};
}

export function validatePose(raw) {
  const pose = neutralPose();
  for (const bone of Object.keys(pose)) {
    const direction = raw?.[bone];
    const magnitude = Array.isArray(direction) && direction.length === 3 && direction.every(Number.isFinite) && length(direction);
    if (!magnitude || !Number.isFinite(magnitude) || magnitude < 1e-8) throw Error('Invalid character pose.');
    pose[bone] = Math.abs(magnitude - 1) < 1e-8 ? direction.slice() : unit(direction);
  }
  return pose;
}

export function interpolatePose(from, to, amount) {
  return Object.fromEntries(Object.entries(from).map(([bone, a]) => {
    const b = to[bone], alignment = Math.max(-1, Math.min(1, dot(a, b)));
    if (alignment > 0.9995) return [bone, unit(add(scale(a, 1 - amount), scale(b, amount)))];
    const angle = Math.acos(alignment) * amount;
    const fallback = unit(cross(a, Math.abs(a[0]) < 0.9 ? [1, 0, 0] : UP));
    const tangent = unit(subtract(b, scale(a, alignment)), fallback);
    return [bone, unit(add(scale(a, Math.cos(angle)), scale(tangent, Math.sin(angle))))];
  }));
}

export function validateCharacters(raw = []) {
  if (!Array.isArray(raw) || raw.length > MAX_CHARACTERS) throw Error('Invalid character list.');
  const ids = new Set();
  return raw.map(character => {
    const id = character?.id;
    if (!Number.isSafeInteger(id) || id < 1 || ids.has(id)) throw Error('Invalid character ID.');
    ids.add(id);
    const fields = Object.fromEntries(Object.entries(CHARACTER_FIELDS).map(([name, [min, max]]) => {
      const value = character[name];
      if (!Number.isFinite(value) || value < min || value > max) throw Error(`Invalid character ${name}.`);
      return [name, value];
    }));
    const pose = character.pose === undefined ? neutralPose() : validatePose(character.pose);
    const name = typeof character.name === 'string' ? character.name.trim().slice(0, 60) : '';
    const colors = Object.fromEntries(Object.entries(DEFAULT_CHARACTER_COLORS).map(([field, fallback]) => {
      const color = character[field] === undefined ? fallback : character[field];
      if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) throw Error('Invalid character colour.');
      return [field, color.toLowerCase()];
    }));
    return {id, name: name || `Character ${id}`, ...fields, ...colors, pose};
  });
}

export function characterJoints(pose) {
  const pelvis = [0, 0, 0];
  const chest = scale(pose.torso, TORSO);
  const across = unit(cross(pose.torso, [0, 0, 1]), [1, 0, 0]);
  const joints = {pelvis, chest, head: at(chest, pose.head, HEAD)};
  for (const [side, sign] of SIDES) {
    joints[key(side, 'shoulder')] = at(chest, across, sign * 0.108);
    joints[key(side, 'hip')] = [sign * 0.066, 0, 0];
    for (const chain of CHAINS) {
      const root = joints[key(side, chain.root)];
      const hinge = at(root, pose[key(side, chain.upper)], chain.lengths[0]);
      joints[key(side, chain.hinge)] = hinge;
      joints[key(side, chain.end)] = at(hinge, pose[key(side, chain.lower)], chain.lengths[1]);
    }
  }
  return joints;
}

export const POSE_HANDLES = [
  {id: 'chest', label: 'Torso'},
  {id: 'head', label: 'Head'},
  ...SIDES.flatMap(([side]) => ['elbow', 'wrist', 'knee', 'ankle'].map(part => ({
    id: key(side, part), label: `${side === 'left' ? 'Left' : 'Right'} ${part}`,
  }))),
];

function solveLimb(root, hinge, target, [upper, lower], bend) {
  const delta = subtract(target, root);
  const axis = unit(delta, unit(subtract(hinge, root)));
  const reach = Math.max(Math.abs(upper - lower) + 0.0001, Math.min(upper + lower - 0.0001, length(delta)));
  const along = (upper ** 2 - lower ** 2 + reach ** 2) / (2 * reach);
  const across = Math.sqrt(Math.max(0, upper ** 2 - along ** 2));
  const perpendicular = vector => subtract(vector, scale(axis, dot(vector, axis)));
  const pole = unit(perpendicular(subtract(hinge, root)), unit(perpendicular(bend), unit(perpendicular([1, 0, 0]))));
  const joint = add(scale(axis, along), scale(pole, across));
  return [unit(joint), unit(subtract(scale(axis, reach), joint))];
}

// Drag in one orthographic plane while retaining the joint's depth on the hidden axis.
export function movePoseJoint(pose, id, view, horizontal, vertical) {
  const joints = characterJoints(pose), target = joints[id].slice();
  target[view === 'side' ? 2 : 0] = horizontal;
  target[1] = vertical;
  if (id === 'chest') return {...pose, torso: unit([target[0], Math.max(0.035, target[1]), target[2]], pose.torso)};
  if (id === 'head') return {...pose, head: unit(subtract(target, joints.chest), pose.head)};
  const [side, part] = id.split('-');
  const chain = part === 'elbow' || part === 'wrist' ? ARM : LEG;
  const root = joints[key(side, chain.root)], upperKey = key(side, chain.upper);
  if (part === chain.hinge) return {...pose, [upperKey]: unit(subtract(target, root), pose[upperKey])};
  const [upper, lower] = solveLimb(root, joints[key(side, chain.hinge)], target, chain.lengths, chain.bend);
  return {...pose, [upperKey]: upper, [key(side, chain.lower)]: lower};
}

function ellipsoid(center, axis, radii, tone = 'wood') {
  return {shape: 'oval', center, axis, radii, tone};
}

function spindle(from, to, width, depth, shape = 'spindle') {
  const axis = unit(subtract(to, from));
  return {shape, center: middle(from, to), axis, radii: [width, length(subtract(to, from)) / 2, depth], tone: 'wood'};
}

function verticalBounds({center, axis, radii: [width, height, depth], shape}) {
  const side = Math.hypot(width * axis[0], depth * axis[2]);
  const rise = axis[1] * height, y = center[1];
  if (shape === 'oval') {
    const radius = Math.hypot(side, rise);
    return [y - radius, y + radius];
  }
  const profile = TURNED_PROFILES[shape];
  return [
    y + Math.min(...profile.map(([radius, offset]) => offset * rise - radius * side)),
    y + Math.max(...profile.map(([radius, offset]) => offset * rise + radius * side)),
  ];
}

// The stage figure and pose views use the same skeleton and body shapes.
export function characterLayout(pose) {
  const joints = characterJoints(pose);
  const {pelvis, chest, head} = joints;
  const parts = [
    ellipsoid(at(pelvis, UP, 0.025), UP, [0.098, 0.058, 0.064]),
    spindle(at(pelvis, pose.torso, 0.047), at(chest, pose.torso, 0.017), 0.117, 0.068, 'torso'),
    ellipsoid(at(pelvis, pose.torso, 0.078), pose.torso, [0.060, 0.032, 0.050], 'joint'),
    spindle(chest, at(chest, pose.head, 0.058), 0.028, 0.026),
    ellipsoid(head, pose.head, [0.055, 0.079, 0.056]),
  ];
  for (const [side] of SIDES) {
    const first = parts.length;
    const get = part => joints[key(side, part)];
    for (const [part, radius] of [['shoulder', 0.039], ['elbow', 0.025], ['wrist', 0.019], ['hip', 0.041], ['knee', 0.034], ['ankle', 0.024]]) {
      parts.push(ellipsoid(get(part), UP, [radius, radius, radius], 'joint'));
    }
    parts.push(
      spindle(get('shoulder'), get('elbow'), 0.036, 0.034),
      spindle(get('elbow'), get('wrist'), 0.027, 0.026),
      ellipsoid(at(get('wrist'), pose[key(side, 'forearm')], 0.035), pose[key(side, 'forearm')], [0.024, 0.042, 0.017]),
      spindle(get('hip'), get('knee'), 0.047, 0.046),
      spindle(get('knee'), get('ankle'), 0.035, 0.034),
      ellipsoid(add(get('ankle'), [0, -0.020, 0.027]), [0, 0, 1], [0.033, 0.061, 0.022]),
    );
    for (let index = first; index < parts.length; index++) parts[index].side = side;
  }
  const bounds = parts.map(verticalBounds);
  const floor = Math.min(...bounds.map(range => range[0]));
  const top = Math.max(...bounds.map(range => range[1]));
  return {joints, parts, floor, top};
}

const standing = characterLayout(neutralPose());
export const STANDING_SPAN = standing.top - standing.floor;
