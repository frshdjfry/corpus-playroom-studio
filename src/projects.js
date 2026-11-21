import {cloneDefault, emptyModel, validate} from './model.js';
import {detachScriptCues, emptyRehearsal, sampleRehearsal, validateRehearsal} from './rehearsal.js';
import {extendScriptClock, parseScript, scriptClock, scriptText, validateScript} from './script.js';
import {SCRIPT_LINES} from './sample-script.js';
import sampleProjectData from './sample-project.js';

export const LIBRARY_KEY = 'corpus-playroom-projects-v1';
export const SAMPLE_PROJECT_ID = 'sample-project';
// Bump when publishing a revised bundled sample for returning visitors.
export const SAMPLE_PROJECT_REVISION = 2;
const LEGACY_KEY = 'lola-stage-study-v1';
const PROJECT_FORMAT = 'corpus-playroom-project';
export const PROJECT_TITLE_LIMIT = 80;
const projectId = () => globalThis.crypto?.randomUUID?.() ?? `show-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function cleanTitle(title) {
  if (typeof title !== 'string' || !title.trim()) throw Error('Enter a project name.');
  return title.trim().slice(0, PROJECT_TITLE_LIMIT);
}

export function createProject(title) {
  return {
    id: projectId(), title: cleanTitle(title), model: emptyModel(),
    script: {raw: '', lines: []}, rehearsal: emptyRehearsal(), views: [],
  };
}

function savedViews(raw) {
  const isPoint = point => Array.isArray(point) && point.length === 3 && point.every(Number.isFinite);
  return Array.isArray(raw) ? raw.filter(view => view && typeof view.name === 'string' && isPoint(view.p) && isPoint(view.t)) : [];
}

export function projectClock(project) {
  const retainedGoEnd=project.rehearsal.lightingCues?.findLast(cue=>cue.kept&&!cue.removed)?.time;
  return extendScriptClock(scriptClock(project.script.lines), project.rehearsal.keyframes, retainedGoEnd);
}

function lolaProject(raw, views) {
  const model = raw ? validate(raw) : cloneDefault();
  const lines = structuredClone(SCRIPT_LINES);
  const rehearsal = raw?.rehearsal ? validateRehearsal(raw.rehearsal, model, scriptClock(lines))
    : model.sails.length === 4 ? sampleRehearsal(model) : emptyRehearsal();
  return {
    id: 'lola', title: 'LOLA', model, script: {raw: scriptText(lines), lines},
    rehearsal, views: savedViews(views), example: 'lola',
  };
}

function validateProject(raw, id) {
  if (!raw || !id || typeof id !== 'string') throw Error('Invalid project.');
  const title = cleanTitle(raw.title);
  const model = validate(raw.model);
  const script = validateScript(raw.script);
  const rehearsal = validateRehearsal(raw.rehearsal, model, scriptClock(script.lines));
  return {
    id, title, model, script, rehearsal, views: savedViews(raw.views),
    ...(raw.example === 'lola' ? {example: 'lola'} : {}),
    ...(id === SAMPLE_PROJECT_ID && Number.isInteger(raw.sampleRevision) && raw.sampleRevision >= 0
      ? {sampleRevision: raw.sampleRevision} : {}),
  };
}

export function createSampleProject() {
  return {...validateProject(structuredClone(sampleProjectData), SAMPLE_PROJECT_ID), sampleRevision: SAMPLE_PROJECT_REVISION};
}

export function exportProject(project) {
  const {id, sampleRevision, ...data} = project;
  return {format: PROJECT_FORMAT, version: 1, ...data};
}

function updateBundledSample(projects) {
  const previous = projects.find(project => project.id === SAMPLE_PROJECT_ID);
  if (!previous || previous.sampleRevision >= SAMPLE_PROJECT_REVISION) return projects;
  const latest = createSampleProject();
  const updated = projects.map(project => project === previous ? latest : project);
  // Preserve every differing saved sample, including edits made before versioning.
  // Revisions are omitted from exports, so an already-current design needs no copy.
  if (JSON.stringify(exportProject(previous)) !== JSON.stringify(exportProject(latest))) {
    const {sampleRevision, ...saved} = previous;
    const suffix = ' (saved copy)';
    updated.push({...saved, id: projectId(), title: previous.title.slice(0, PROJECT_TITLE_LIMIT - suffix.length) + suffix});
  }
  return updated;
}

export function importProject(raw) {
  const id = projectId();
  if (raw?.format === PROJECT_FORMAT && raw.version === 1) return validateProject(raw, id);
  if (raw?.version === 1 && Array.isArray(raw.sails)) return {...lolaProject(raw), id};
  throw Error('Choose a Corpus Playroom project file.');
}

export function loadLibrary(storage) {
  const read = key => {
    try { return JSON.parse(storage.getItem(key)); } catch { return null; }
  };
  const existing = read(LIBRARY_KEY);
  if (existing?.version === 1 && Array.isArray(existing.projects) && existing.projects.length) {
    const projects = updateBundledSample(existing.projects.map(project => validateProject(project, project.id)));
    const activeId = projects.some(project => project.id === existing.activeId) ? existing.activeId : projects[0].id;
    return {version: 1, projects, activeId};
  }
  const raw = read(LEGACY_KEY), views = read(LEGACY_KEY + '-views');
  if (!raw && !views) return {version: 1, projects: [createSampleProject()], activeId: SAMPLE_PROJECT_ID};
  let project;
  try { project = lolaProject(raw, views); }
  catch {
    try { project = lolaProject(raw ? {...raw, rehearsal: undefined} : null, views); }
    catch { project = lolaProject(null, views); }
  }
  return {version: 1, projects: [project], activeId: project.id};
}

export function replaceProjectScript(project, raw, reattach = {}) {
  if (raw === project.script.raw) return project;
  const script = parseScript(raw, project.script.lines, project.script.raw);
  const retained = new Set(script.lines.map(line => line.id));
  const rehearsal = detachScriptCues(project.model, project.rehearsal, projectClock(project));
  const used = new Set(rehearsal.scenes.filter(marker=>retained.has(marker.moment)).map(marker=>marker.moment));
  rehearsal.scenes = rehearsal.scenes.flatMap(marker=>{
    if(retained.has(marker.moment))return [marker];
    const target=Object.hasOwn(reattach,marker.moment) ? reattach[marker.moment] : null;
    if(!target)return [];
    if(!retained.has(target)||used.has(target))throw Error('Choose a different line for each scene.');
    used.add(target);
    return [{...marker,moment:target}];
  });
  return {...project, script, rehearsal};
}

export function copyProjectScript(project, source) {
  const rehearsal = detachScriptCues(project.model, project.rehearsal, projectClock(project));
  return {
    ...project,
    script: structuredClone(source.script),
    rehearsal: {...rehearsal, scenes: structuredClone(source.rehearsal.scenes)},
  };
}
