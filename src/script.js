export const MAX_KEY_TIME = 86400;
const MAX_SCRIPT_SIZE = 250000;
const MAX_LINES = 5000;

function estimate(text, legacySpeaker) {
  const words = text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  const breaks = text.match(/[.!?]+(?=\s|$)/g)?.length ?? 0;
  const seconds = words * 60 / (legacySpeaker ? 145 : 190);
  return Math.round(Math.max(legacySpeaker ? 1.2 : 2, seconds + breaks * 0.3) * 10) / 10;
}

export function scriptClock(lines) {
  let elapsed = 0;
  const moments = lines.map((line, index) => {
    const start = elapsed, duration = estimate(line.text, line.speaker);
    elapsed = Math.round((elapsed + duration) * 10) / 10;
    return {...line, start, duration, hue: (155 + index * 137.508) % 360};
  });
  const duration = elapsed || 60;
  return {
    moments, duration, scriptDuration: elapsed,
    byId: new Map(moments.map(moment => [moment.id, moment])),
    at: time => moments.findLast(moment => moment.start <= time),
    snap: time => Math.min(duration, Math.max(0, Math.round(time * 10) / 10)),
  };
}

export function extendScriptClock(clock, keyframes, pendingEnd = 0) {
  let duration = Math.max(clock.duration, pendingEnd);
  for (const keys of Object.values(keyframes)) {
    const last = keys.at(-1);
    if (last) duration = Math.max(duration, Math.ceil(last.time * 10) / 10);
  }
  return duration === clock.duration ? clock : {
    ...clock, duration, snap: time => Math.min(duration, Math.max(0, Math.round(time * 10) / 10)),
  };
}

export function formatTime(seconds) {
  const tenths = Math.max(0, Math.floor(seconds * 10 + 1e-7));
  return `${String(Math.floor(tenths / 600)).padStart(2, '0')}:${String(Math.floor(tenths / 10) % 60).padStart(2, '0')}.${tenths % 10}`;
}

export function parseTime(value) {
  const text=value.trim();
  if(/^\d+(?:\.\d+)?$/.test(text))return Number(text);
  const parts=/^(\d+):([0-5]?\d(?:\.\d+)?)$/.exec(text);
  return parts ? Number(parts[1])*60+Number(parts[2]) : NaN;
}

const entryText = line => line.speaker ? `${line.speaker}: ${line.text}` : line.text;
const nonblankLines = raw => raw.split(/\r\n?|\n/).filter(line=>line.trim());
export const scriptText = lines => lines.map(entryText).join('\n');

export function scriptSourceLines({raw, lines}) {
  const source = nonblankLines(raw);
  return source.length === lines.length ? source : lines.map(entryText);
}

export function parseScript(raw, previous = [], previousRaw = scriptText(previous)) {
  if (typeof raw !== 'string' || raw.length > MAX_SCRIPT_SIZE) throw Error('The script is too large.');
  const source = nonblankLines(raw);
  if (source.length > MAX_LINES) throw Error('Use up to 5,000 script entries.');
  const previousEntries = new Map();
  scriptSourceLines({raw:previousRaw, lines:previous}).forEach((text,index)=>{
    const key = text.trim();
    if (!previousEntries.has(key)) previousEntries.set(key, []);
    previousEntries.get(key).push(previous[index]);
  });
  const usedIds = new Set(previous.map(line => line.id));
  let nextId = 1;
  const lines = source.map(text=>{
    const existing = previousEntries.get(text.trim())?.shift();
    // Keep timing for saved entries that already have legacy speaker metadata.
    if (existing?.speaker) return existing;
    if (existing) return {id:existing.id,text};
    while (usedIds.has(`line-${nextId}`)) nextId++;
    return {id:`line-${nextId++}`,text};
  });
  return {raw, lines};
}

export function validateScript(script) {
  if (typeof script?.raw !== 'string' || script.raw.length > MAX_SCRIPT_SIZE ||
      !Array.isArray(script.lines) || script.lines.length > MAX_LINES) throw Error('Invalid project script.');
  const ids = new Set();
  const lines = script.lines.map(line => {
    if (typeof line?.id !== 'string' || !line.id || ids.has(line.id) ||
        typeof line.text !== 'string' || !line.text.trim() ||
        (line.speaker !== undefined && typeof line.speaker !== 'string')) throw Error('Invalid script entry.');
    ids.add(line.id);
    return line.speaker ? {id: line.id, text: line.text, speaker: line.speaker} : {id: line.id, text: line.text};
  });
  return {raw: script.raw, lines};
}
