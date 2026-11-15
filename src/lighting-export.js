import {FIXTURE_TYPES} from './lighting.js';
import {fixtureChannel} from './rehearsal.js';
import {formatTime} from './script.js';

// Corpus Playroom technical specification, Standard DMX Patch.
export const PLAYROOM_LED_PATCH = {spotjr:[51,57,63,69],par:[75,80]};
const sameTime = (a,b) => Math.abs(a-b)<1e-7;
const levelByte = level => Math.round(level*255/100);

function channelMoves(track, channel, fixture, isDimmer) {
  const moves = [];
  let previous;
  let level = track.value(channel,0);
  for (const key of track.keys(channel)) {
    if (key.time === 0) { previous = key; continue; }
    const fading = previous && key.curve === 'linear';
    const incoming = fading ? (key.before ?? key.value) : level;
    if (incoming !== level) {
      moves.push({channel,fixture,isDimmer,start:previous.time,end:key.time,from:level,to:incoming});
    }
    if (incoming !== key.value) {
      moves.push({channel,fixture,isDimmer,start:key.time,end:key.time,from:incoming,to:key.value});
    }
    previous = key;
    level = key.value;
  }
  return moves;
}

export function lightingChanges(fixtures, track) {
  const byChannel = new Map(fixtures.flatMap(fixture=>['level','color'].map(property=>[fixtureChannel(fixture.id,property),fixture])));
  return [...track.channels].flatMap(([id,{group}])=>{
    if (group !== 'lighting') return [];
    const fixture = byChannel.get(id);
    if (fixture && !fixture.enabled) return [];
    return channelMoves(track,id,fixture,Boolean(fixture && id===fixtureChannel(fixture.id,'level')));
  }).sort((a,b)=>a.start-b.start || a.end-b.end);
}

export function preserveLightingGos(markers, cues, changes, channel, time) {
  const starts = new Set(changes.filter(change=>change.channel===channel&&(change.start===time||change.end===time)).map(change=>change.start));
  const result = new Map(markers.map(marker=>[marker.time,marker]));
  for (const cue of cues) {
    if (starts.has(cue.time)) result.set(cue.time,{time:cue.time,label:cue.label,kept:true,...(cue.number?{dimmer:true}:{})});
  }
  return [...result.values()].sort((a,b)=>a.time-b.time);
}

export function planLightingExport(fixtures, track, markers, suggestedLabels = new Map(), changes = lightingChanges(fixtures,track), savedNumbers) {
  const opening = Object.fromEntries(fixtures.map(({id,enabled}) => [id,enabled ? track.value(fixtureChannel(id,'level'),0) : 0]));
  const removed = new Set(markers.filter(marker=>marker.removed).map(marker=>marker.time));
  const moves = changes.filter(move=>move.isDimmer && move.fixture.enabled && levelByte(move.from)!==levelByte(move.to));
  const labels = new Map(markers.map(marker => [marker.time,marker.label]));
  const kept = markers.filter(marker=>marker.kept&&marker.dimmer&&!marker.removed);
  const times = [...new Set([...moves.filter(move=>!removed.has(move.start)).map(move=>move.start),...kept.map(marker=>marker.time)])].sort((a,b)=>a-b);
  const openingCue = {id:'opening',time:0,label:suggestedLabels.get(0) || 'Opening look',levels:opening,up:0,down:0,issues:[]};
  const levels = {...opening};
  const lastSkipped = new Map();
  let index = 0;
  const cues = [openingCue,...times.map((time,order) => {
    const next = times[order+1] ?? Infinity;
    const issues = new Set();
    const durations = {up:[],down:[]};
    const touched = new Set();
    while (index < moves.length && moves[index].start < next) {
      const {fixture,start,end,from:programmedFrom,to} = moves[index++];
      if (removed.has(start)) {
        lastSkipped.set(fixture.id,start);
        continue;
      }
      const name = fixture.name.trim() || `L${fixture.id}`;
      if (end > next && !sameTime(end,next)) issues.add(`${name} is still fading at the next GO (${formatTime(next)}).`);
      if (touched.has(fixture.id)) issues.add(`${name} changes more than once after this GO.`);
      touched.add(fixture.id);
      const from=levels[fixture.id];
      if (end > start && lastSkipped.has(fixture.id) && levelByte(from)!==levelByte(programmedFrom)) {
        const skipped = formatTime(lastSkipped.get(fixture.id));
        issues.add(`${name} starts this fade at ${Math.round(from)}% in the export and ${Math.round(programmedFrom)}% in the timeline. Restore the GO at ${skipped} or revise the fade.`);
      }
      lastSkipped.delete(fixture.id);
      if (levelByte(from)!==levelByte(to)) durations[to>from?'up':'down'].push({name,duration:end-start});
      levels[fixture.id] = to;
    }
    const structuralConflict = issues.size>0;
    const sharedFadeChoices = {};
    const fade = (direction) => {
      const values = durations[direction];
      const choices=[...new Set(values.map(({duration})=>Math.round(duration*10)/10))].sort((a,b)=>a-b);
      if (choices.length>1) {
        const detail=values.map(({name,duration})=>`${name} ${Math.round(duration*10)/10} s`).join(', ');
        issues.add(`Lights fading ${direction} have different fade times (${detail}).`);
        if(!structuralConflict)sharedFadeChoices[direction]=choices;
      }
      return choices.at(-1)??0;
    };
    const up = fade('up'), down = fade('down');
    return {id:`go:${time}`,time,label:labels.get(time)||suggestedLabels.get(time)||'Lighting change',
      levels:{...levels},up,down,issues:[...issues],sharedFadeChoices};
  })];
  return numberLightingCues(cues,savedNumbers);
}

function numberLightingCues(cues, savedNumbers = {}) {
  let previous = 0;
  let nextSaved = -1;
  return cues.map((cue,index) => {
    if (savedNumbers[cue.id] !== undefined) {
      previous = Math.round(savedNumbers[cue.id] * 100);
    } else {
      if (nextSaved < index) {
        nextSaved = cues.findIndex((candidate,position)=>position>index && savedNumbers[candidate.id] !== undefined);
        if (nextSaved < 0) nextSaved = cues.length;
      }
      const limit = nextSaved === cues.length ? 1000000 : Math.round(savedNumbers[cues[nextSaved].id] * 100);
      const remaining = nextSaved - index;
      // Prefer whole numbers, leaving room for smaller steps before a saved cue.
      const nextWhole = (Math.floor(previous / 100) + 1) * 100;
      previous = nextWhole <= limit - remaining ? nextWhole : previous + 1;
    }
    return {...cue,number:previous/100};
  });
}

export function lightingTimelineCues(changes, markers, exportPlan, suggestedLabels) {
  const saved = new Map(markers.map(marker=>[marker.time,marker]));
  const cues = new Map();
  for (const {start} of changes) {
    if (saved.get(start)?.removed || cues.has(start)) continue;
    cues.set(start,{time:start,label:saved.get(start)?.label||suggestedLabels.get(start)||'Lighting change',issues:[]});
  }
  for (const marker of markers) {
    if (marker.kept&&!marker.removed&&!cues.has(marker.time)) cues.set(marker.time,{...marker,issues:[]});
  }
  exportPlan.slice(1).forEach(cue=>cues.set(cue.time,cue));
  return [...cues.values()].sort((a,b)=>a.time-b.time);
}

const asciiLabel = label => label.normalize('NFKD').replace(/\p{M}/gu,'')
  .replace(/[^A-Za-z0-9 ._()'&+-]/g,' ').replace(/\s+/g,' ').trim().slice(0,60);
const hex = value => `H${value.toString(16).padStart(2,'0').toUpperCase()}`;

export function writeLightingAscii(cues, patch, fixtures) {
  const entries = Object.entries(patch).sort(([,a],[,b])=>a.channel-b.channel);
  const fixturesById = new Map(fixtures.map(fixture=>[String(fixture.id),fixture]));
  const ledNotes = [];
  const patchLine = entries.map(([id,{channel,address}])=>{
    const fixture = fixturesById.get(id);
    if (!PLAYROOM_LED_PATCH[fixture?.type]) return `${channel}<${address}@HFF`;
    // Generic ASCII has no fixture profiles. Space the temporary slots apart
    // so Phantom can swap each placeholder before applying its real address.
    const temporary = 401+ledNotes.length*8;
    const type = asciiLabel(FIXTURE_TYPES[fixture.type].label);
    ledNotes.push(`! Desk ${channel}: ${asciiLabel(fixture.name)||`L${id}`}, ${type}, venue DMX ${address} instead of temporary ${temporary}.`);
    return `${channel}<${temporary}@HFF`;
  }).join(' ');
  const header = ['Ident 3:0','Manufacturer Corpus Playroom','Console Show Designer',
    `Set Channels ${entries.at(-1)[1].channel}`,`Set Dimmers ${ledNotes.length?512:12}`,`Patch 1 ${patchLine}`];
  if (ledNotes.length) header.push('! Import offline in Phantom ZerOS. Swap these placeholders to the venue fixture profiles and addresses before live use.',...ledNotes);
  const records = cues.flatMap(({number,label,up,down,levels}) => {
    const cueLabel = asciiLabel(label);
    const channels = entries.map(([id,{channel}])=>`${channel} @ ${hex(levelByte(levels[id]))}`);
    const lines = [];
    for (let index=0;index<channels.length;index+=6) lines.push(`Chan ${channels.slice(index,index+6).join(' ')}`);
    return ['',`Cue ${number}`,...(cueLabel ? [`Text ${cueLabel}`] : []),`Up ${up}`,`Down ${down}`,...lines];
  });
  return [...header,...records,'','Enddata',''].join('\r\n');
}
