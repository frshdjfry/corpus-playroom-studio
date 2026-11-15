import {MAX_KEY_TIME} from './script.js';
import {sailName} from './model.js';
import {characterName, CHARACTER_FIELDS, interpolatePose, validatePose} from './characters.js';

const MAX_TRANSITION = 30;
export const MAX_SCENE_TITLE = 80;
const EDITABLE_TRACKS = ['set', 'lighting'];
export const sailChannel = id => `sail:${id}:raise`;
export const fixtureChannel = (id, property) => `light:${id}:${property}`;
export const characterChannel = (id, property) => `character:${id}:${property}`;
export const THEATRE_CHANNEL = 'lighting:mix';
export const AMBIENT_CHANNEL = 'lighting:ambient';

export function isLightingCueNumber(number) {
  if (typeof number !== 'number') return false;
  const hundredths = Math.round(number * 100);
  return hundredths >= 1 && hundredths <= 999999 && number === hundredths / 100;
}

export function setKeyframe(keys, time, value) {
  const previous = keys.find(key=>key.time===time);
  return [...keys.filter(key=>key.time!==time), {...previous,time,value,curve:previous?.curve??'linear'}]
    .sort((a,b)=>a.time-b.time);
}

function captureLighting(lighting) {
  return {
    mode: lighting.mode,
    ambient: lighting.ambient,
    fixtures: Object.fromEntries(lighting.fixtures.map(f => [f.id, {level: f.enabled ? f.intensity : 0, color: f.color}])),
  };
}

export const emptyRehearsal = () => ({version: 1, scenes: [], keyframes: {}, tracks: {set: [], lighting: []}});

export function sampleRehearsal(model) {
  const baseline = captureLighting(model.lighting);
  const light = (moment, label, duration, ambient, dimmer, color) => ({
    moment, label, duration,
    target: {
      mode: 'theatre', ambient,
      fixtures: Object.fromEntries(Object.entries(baseline.fixtures).map(([id, f]) => [
        id, {level: f.level * dimmer, color: color ?? f.color},
      ])),
    },
  });
  return {
    version: 1,
    scenes: [],
    keyframes: {},
    tracks: {
      set: [
        {moment: 'room', label: 'Sails down', duration: 0, target: [0, 0, 0, 0]},
        {moment: 'lift', label: 'Raise the far sails', duration: 5, target: [1, 1, 0, 0]},
      ],
      lighting: [
        {moment: 'room', label: 'Opening light', duration: 0, target: baseline},
        light('passage', 'Cool the room', 3, 0.11, 0.65, '#91aeff'),
        light('end', 'Fade to black', 4, 0, 0),
      ],
    },
  };
}

const inRange = (value, max) => Number.isFinite(value) && value >= 0 && value <= max;
const validColour = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const lerp = (a, b, t) => a + (b - a) * t;
const wrapAngle = angle => ((angle + 540) % 360) - 180;
const positionOf = ({x, y}) => ({x, y});

function characterNumber(property, value) {
  const [min, max] = CHARACTER_FIELDS[property];
  if (!Number.isFinite(value) || value < min || value > max) throw Error('Invalid character keyframe value.');
  return value;
}

const characterProperties = {
  position: {
    label:'Position', read:positionOf,
    parse:value=>({x:characterNumber('x', value?.x), y:characterNumber('y', value?.y)}),
    mix:(a, b, t)=>({x:lerp(a.x,b.x,t), y:lerp(a.y,b.y,t)}),
  },
  direction: {
    label:'Facing', read:character=>character.direction, parse:value=>characterNumber('direction', value),
    mix:(a, b, t)=>wrapAngle(a + wrapAngle(b - a) * t),
  },
  elevation: {
    label:'Elevation', read:character=>character.elevation, parse:value=>characterNumber('elevation', value), mix:lerp,
  },
  pose: {label:'Pose', read:character=>character.pose, parse:validatePose, mix:interpolatePose},
};

export const BLOCKING_PROPERTIES = Object.entries(characterProperties).map(([id,{label}]) => ({id,label}));

export function animationChannels(model) {
  const channels = new Map([
    [THEATRE_CHANNEL, {group: 'lighting', label: 'Theatre blend', max: 1, read: look => look.mix}],
    [AMBIENT_CHANNEL, {group: 'lighting', label: 'Ambient fill', max: 0.3, read: look => look.ambient}],
  ]);
  for (const [index, sail] of model.sails.entries()) {
    channels.set(sailChannel(sail.id), {group: 'set', label: `${sailName(sail)} · Raise`, max: 1, read: look => look[index]});
  }
  for (const fixture of model.lighting.fixtures) {
    for (const [property, label, max] of [['level', 'Dimmer', 100], ['color', 'Colour', null]]) {
      channels.set(fixtureChannel(fixture.id, property), {
        group: 'lighting', label: `${fixture.name || `L${fixture.id}`} · ${label}`, max,
        read: look => look.fixtures[fixture.id][property],
      });
    }
  }
  for (const character of model.characters) {
    for (const [property, {label, read, parse, mix}] of Object.entries(characterProperties)) {
      channels.set(characterChannel(character.id, property), {
        group:'blocking', label:`${characterName(character)} · ${label}`, base:read(character), parse, mix,
      });
    }
  }
  return channels;
}

function validateKeyframes(raw = {}, model) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Invalid keyframes.');
  const keyframes = {};
  for (const [id, channel] of animationChannels(model)) {
    if (!Object.hasOwn(raw, id)) continue;
    const keys = raw[id], seen = new Set();
    if (!Array.isArray(keys) || keys.length > 2000) throw Error('Invalid keyframe track.');
    const validValue = channel.max === null ? validColour : value => inRange(value, channel.max);
    const parse = channel.parse ?? (value => {
      if (!validValue(value)) throw Error('Invalid property keyframe.');
      return value;
    });
    keyframes[id] = keys.map(key => {
      if (!inRange(key?.time, MAX_KEY_TIME) || seen.has(key.time) || !['linear', 'hold'].includes(key.curve)) {
        throw Error('Invalid property keyframe.');
      }
      seen.add(key.time);
      const result = {time:key.time, value:parse(key.value), curve:key.curve};
      if (key.before !== undefined) result.before = parse(key.before);
      return result;
    }).sort((a, b) => a.time - b.time);
  }
  return keyframes;
}

function validateScenes(scenes, {moments, byId}) {
  if (!Array.isArray(scenes) || scenes.length > moments.length) throw Error('Invalid scene markers.');
  const anchors = new Set();
  return scenes.map(marker => {
    const {moment, title} = marker ?? {};
    if (!byId.has(moment) || anchors.has(moment) ||
        typeof title !== 'string' || !title.trim()) throw Error('Invalid scene marker.');
    anchors.add(moment);
    return {moment, title: title.trim().slice(0, MAX_SCENE_TITLE)};
  });
}

export function validateRehearsal(raw, model, clock) {
  if (raw === undefined) return emptyRehearsal();
  const {moments, byId, scriptDuration} = clock;
  if (raw?.version !== 1) throw Error('Invalid rehearsal timeline.');
  const tracks = {};
  for (const key of EDITABLE_TRACKS) {
    const markers = raw.tracks?.[key], seen = new Set();
    if (!Array.isArray(markers) || markers.length > moments.length) throw Error('Invalid rehearsal track.');
    tracks[key] = markers.map(marker => {
      const anchor = byId.get(marker?.moment);
      if (!anchor || seen.has(marker.moment) || typeof marker.label !== 'string' ||
          !inRange(marker.duration, Math.min(MAX_TRANSITION, Math.round((scriptDuration - anchor.start) * 10) / 10))) {
        throw Error('Invalid rehearsal marker.');
      }
      seen.add(marker.moment);
      const {moment, label, duration, target} = marker;
      if (key === 'set') {
        if (!Array.isArray(target) || target.length !== model.sails.length ||
            !target.every(value => inRange(value, 1))) throw Error('Invalid sail targets.');
        return {moment, label: label.slice(0, 60), duration, target};
      }
      if (!['neutral', 'theatre'].includes(target?.mode) || !inRange(target.ambient, 0.3) ||
          !target.fixtures || Array.isArray(target.fixtures) || typeof target.fixtures !== 'object') {
        throw Error('Invalid lighting targets.');
      }
      const fixtures = {};
      for (const {id} of model.lighting.fixtures) {
        const fixture = target.fixtures[id];
        if (fixture === undefined) continue;
        if (!inRange(fixture?.level, 100) || typeof fixture.color !== 'string' ||
            !validColour(fixture.color)) throw Error('Invalid fixture target.');
        fixtures[id] = {level: fixture.level, color: fixture.color};
      }
      return {moment, label: label.slice(0, 60), duration, target: {mode: target.mode, ambient: target.ambient, fixtures}};
    });
  }
  const result = {version: 1, scenes: validateScenes(raw.scenes ?? [], clock), tracks, keyframes: validateKeyframes(raw.keyframes, model)};
  if (raw.lightingCues !== undefined) {
    const times = new Set();
    if (!Array.isArray(raw.lightingCues) || raw.lightingCues.length > 9999) throw Error('Invalid lighting cues.');
    result.lightingCues = raw.lightingCues.map(cue => {
      if (!inRange(cue?.time, MAX_KEY_TIME) || times.has(cue.time) || typeof cue.label !== 'string') throw Error('Invalid lighting cue.');
      times.add(cue.time);
      return {time: cue.time, label: cue.label.slice(0, 60),
        ...(cue.kept===true?{kept:true}:{}), ...(cue.dimmer===true?{dimmer:true}:{}), ...(cue.removed===true?{removed:true}:{})};
    }).sort((a,b) => a.time-b.time);
  }
  if (raw.lightingPatch !== undefined) {
    if (!raw.lightingPatch || typeof raw.lightingPatch !== 'object' || Array.isArray(raw.lightingPatch)) throw Error('Invalid lighting patch.');
    result.lightingPatch = {};
    for (const fixture of model.lighting.fixtures) {
      const entry = raw.lightingPatch[fixture.id];
      if (entry === undefined) continue;
      const {channel,address} = entry ?? {};
      if (!Number.isInteger(channel) || channel < 1 || channel > 9999 ||
          !Number.isInteger(address) || address < 1 || address > 512) throw Error('Invalid lighting patch.');
      result.lightingPatch[fixture.id] = {channel,address};
    }
  }
  if (raw.lightingCueNumbers !== undefined) {
    const numbers = raw.lightingCueNumbers;
    if (!numbers || typeof numbers !== 'object' || Array.isArray(numbers)) throw Error('Invalid lighting cue numbers.');
    result.lightingCueNumbers = Object.fromEntries(Object.entries(numbers).map(([id, number]) => {
      const time = Number(id.slice(3));
      if ((id !== 'opening' && (id !== `go:${time}` || !inRange(time, MAX_KEY_TIME))) || !isLightingCueNumber(number)) {
        throw Error('Invalid lighting cue number.');
      }
      return [id, number];
    }));
  }
  return result;
}

const mixSails = (a, b, t) => a.map((value, index) => lerp(value, b[index], t));

function mixColor(a, b, t) {
  if (a === b) return a;
  const from = parseInt(a.slice(1), 16), to = parseInt(b.slice(1), 16);
  const channels = [16, 8, 0].map(shift => Math.round(lerp((from >> shift) & 255, (to >> shift) & 255, t)));
  return '#' + channels.map(channel => channel.toString(16).padStart(2, '0')).join('');
}

function mixLights(a, b, t) {
  const fixtures = Object.fromEntries(Object.entries(a.fixtures).map(([id, from]) => {
    const to = b.fixtures[id];
    return [id, {level: lerp(from.level, to.level, t), color: mixColor(from.color, to.color, t)}];
  }));
  return {mix: lerp(a.mix, b.mix, t), ambient: lerp(a.ambient, b.ambient, t), fixtures};
}

function sampleSegment(segment, time, mix) {
  if (!segment.duration || time >= segment.start + segment.duration) return segment.to;
  if (time <= segment.start) return segment.from;
  return mix(segment.from, segment.to, (time - segment.start) / segment.duration);
}

function compileSegments(markers, initial, resolve, mix, byId) {
  const ordered = markers.slice().sort((a, b) => byId.get(a.moment).start - byId.get(b.moment).start);
  const segments = [];
  for (const marker of ordered) {
    const start = byId.get(marker.moment).start, previous = segments.at(-1);
    const from = previous ? sampleSegment(previous, start, mix) : initial;
    segments.push({start, duration: marker.duration, from, to: resolve(marker.target)});
  }
  return segments;
}

function projectKeys(segments, channel, mix, durationLimit) {
  const keys = [];
  function push(time, value, curve) {
    const previous = keys.at(-1);
    if (previous?.time !== time) keys.push({time, value, curve});
    else if (previous.value !== value) {
      // A cut can interrupt a fade. Keep the fade's incoming value and the
      // post-cut value at the same instant so an imported cut stays sharp.
      keys[keys.length - 1] = {...previous, value, before: previous.before ?? previous.value};
    }
  }
  for (const [index, segment] of segments.entries()) {
    const {start, duration} = segment;
    const from = channel.read(segment.from), to = channel.read(segment.to);
    if (!duration || from === to) {
      if (keys.at(-1)?.value !== to) push(start, to, 'hold');
      continue;
    }
    const end = Math.min(start + duration, segments[index + 1]?.start ?? durationLimit);
    push(start, from, 'hold');
    push(end, channel.read(sampleSegment(segment, end, mix)), 'linear');
  }
  return keys;
}

function sampleKeys(keys, time, fallback, mix) {
  const index = keys.findLastIndex(key => key.time <= time);
  const current = keys[index];
  if (!current) return fallback;
  const next = keys[index + 1];
  if (!next || next.curve === 'hold' || time === current.time) return current.value;
  return mix(current.value, next.before ?? next.value, (time - current.time) / (next.time - current.time));
}

export function compileRehearsal(model, {tracks, keyframes = {}}, clock) {
  const base = captureLighting(model.lighting);
  const hasMutedFixtures = model.lighting.fixtures.some(fixture => !fixture.enabled);
  const resolveLights = target => ({
    mix: target.mode === 'theatre' ? 1 : 0, ambient: target.ambient,
    fixtures: {...base.fixtures, ...target.fixtures},
  });
  const channels = animationChannels(model);
  const editedGroups = new Set(Object.keys(keyframes).map(id => channels.get(id)?.group));
  const groups = {
    set: {initial: model.sails.map(sail => sail.closed), mix: mixSails, resolve: target => target},
    lighting: {initial: resolveLights(base), mix: mixLights, resolve: resolveLights},
  };
  for (const [group, spec] of Object.entries(groups)) {
    spec.segments = compileSegments(tracks[group], spec.initial, spec.resolve, spec.mix, clock.byId);
  }
  function lookAt(group, time) {
    const {segments, mix, initial} = groups[group];
    const segment = segments.findLast(item => item.start <= time);
    return segment ? sampleSegment(segment, time, mix) : initial;
  }
  function valueAt(id, look, time, draft) {
    const channel = channels.get(id);
    if (draft?.has(id)) return draft.get(id);
    if (!Object.hasOwn(keyframes, id)) return channel.read(look);
    return sampleKeys(keyframes[id], time, channel.read(groups[channel.group].initial), channel.max === null ? mixColor : lerp);
  }
  function blockingValue(id, time, draft) {
    const channel = channels.get(id);
    if (draft?.has(id)) return draft.get(id);
    return sampleKeys(keyframes[id] ?? [], time, channel.base, channel.mix);
  }
  const projected = new Map();
  return {
    channels,
    keys(id) {
      if (Object.hasOwn(keyframes, id)) return keyframes[id];
      const channel = channels.get(id);
      if (!channel || channel.group === 'blocking') return [];
      if (!projected.has(id)) {
        const {segments, mix} = groups[channel.group];
        projected.set(id, projectKeys(segments, channel, mix, clock.duration));
      }
      return projected.get(id);
    },
    value(id, time, draft) {
      const channel = channels.get(id);
      if (channel.group === 'blocking') return blockingValue(id, time, draft);
      return valueAt(id, lookAt(channel.group, time), time, draft);
    },
    set(time, draft) {
      const look = lookAt('set', time);
      if (!editedGroups.has('set') && !draft?.size) return look;
      return model.sails.map(({id}) => valueAt(sailChannel(id), look, time, draft));
    },
    lighting(time, draft) {
      const look = lookAt('lighting', time);
      if (!hasMutedFixtures && !editedGroups.has('lighting') && !draft?.size) return look;
      return {
        mix: valueAt(THEATRE_CHANNEL, look, time, draft),
        ambient: valueAt(AMBIENT_CHANNEL, look, time, draft),
        fixtures: Object.fromEntries(model.lighting.fixtures.map(({id,enabled}) => [id, {
          level: enabled ? valueAt(fixtureChannel(id, 'level'), look, time, draft) : 0,
          color: valueAt(fixtureChannel(id, 'color'), look, time, draft),
        }])),
      };
    },
    blocking(time, draft) {
      if (!editedGroups.has('blocking') && !draft?.size) return model.characters;
      return model.characters.map(character => {
        const read = property => blockingValue(characterChannel(character.id, property), time, draft);
        return {...character, ...read('position'), direction:read('direction'), elevation:read('elevation'), pose:read('pose')};
      });
    },
  };
}

export function removeCharacterKeys(rehearsal, id) {
  const prefix = characterChannel(id, '');
  const keyframes = Object.fromEntries(Object.entries(rehearsal.keyframes).filter(([channel]) => !channel.startsWith(prefix)));
  return {...rehearsal, keyframes};
}

export function removeFixtureTargets(rehearsal, ids) {
  const lighting = rehearsal.tracks.lighting.map(marker => ({
    ...marker,
    target: {
      ...marker.target,
      fixtures: Object.fromEntries(Object.entries(marker.target.fixtures).filter(([id]) => ids.has(Number(id)))),
    },
  }));
  const keyframes = Object.fromEntries(Object.entries(rehearsal.keyframes).filter(([id]) => {
    const [kind, fixture] = id.split(':');
    return kind !== 'light' || ids.has(Number(fixture));
  }));
  const next = {...rehearsal, keyframes, tracks: {...rehearsal.tracks, lighting}};
  if (next.lightingPatch) next.lightingPatch = Object.fromEntries(Object.entries(next.lightingPatch).filter(([id]) => ids.has(Number(id))));
  return next;
}

// Freeze cues tied to the previous text before replacing its clock.
export function detachScriptCues(model, rehearsal, clock) {
  const compiled = compileRehearsal(model, rehearsal, clock);
  const keyframes = {...rehearsal.keyframes};
  for (const [id] of compiled.channels) {
    const keys = compiled.keys(id);
    if (keys.length) keyframes[id] = keys;
  }
  return {...rehearsal, keyframes, tracks: {set: [], lighting: []}};
}

export function editSailTracks(rehearsal, previous, sails) {
  const indexes = new Map(previous.map((sail, index) => [sail.id, index]));
  const channels = new Set(sails.map(sail => sailChannel(sail.id)));
  const set = rehearsal.tracks.set.map(marker => ({
    ...marker, target: sails.map(sail => marker.target[indexes.get(sail.id)] ?? sail.closed),
  }));
  const keyframes = Object.fromEntries(Object.entries(rehearsal.keyframes).filter(([id]) =>
    !id.startsWith('sail:') || channels.has(id)));
  return {...rehearsal, keyframes, tracks: {...rehearsal.tracks, set}};
}
