const UNDO_LIMIT = 100;

export function sameProject(a, b) {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

export function recordProjectEdit(history, before, after, group) {
  const previous = history?.present === before ? history : null;
  const past = previous?.past ?? [];
  const grouped = group && group === previous?.group;
  if (grouped && sameProject(past.at(-1), after)) {
    return {past: past.slice(0, -1), present: after, future: []};
  }
  return {
    past: grouped ? past : [...past.slice(1 - UNDO_LIMIT), before],
    present: after,
    future: [],
    group,
  };
}

export function stepProjectHistory(history, project, redo) {
  if (history?.present !== project) return null;
  const {past, present, future} = history;
  if (redo && future.length) {
    return {past: [...past, present], present: future.at(-1), future: future.slice(0, -1)};
  }
  if (!redo && past.length) {
    return {past: past.slice(0, -1), present: past.at(-1), future: [...future, present]};
  }
  return null;
}
