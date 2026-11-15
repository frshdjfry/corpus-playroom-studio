import React, {useRef, useState} from 'react';
import {InspectorSection} from './inspector.jsx';
import {PROJECT_TITLE_LIMIT, SAMPLE_PROJECT_ID} from './projects.js';

export function ProjectControls({project, projects, onSelect, onCreate, onRename, onImport, onExport, onCopyScript}) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const file = useRef(null);

  function start(action) {
    setError('');
    setForm({action, title: action === 'rename' ? project.title : ''});
  }

  function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    const action = form.action === 'rename' ? onRename : onCreate;
    action(form.title.trim());
    setForm(null);
  }

  const scriptSources = projects.filter(item => item.id !== project.id && item.script.lines.length);
  const scriptSource = scriptSources.find(item => item.id === form?.sourceId);

  async function load(event) {
    const input = event.currentTarget;
    const selected = input.files[0];
    if (!selected) return;
    try {
      onImport(JSON.parse(await selected.text()));
      setError('');
    } catch (err) {
      setError(err instanceof SyntaxError ? 'This file is not valid project JSON.' : err.message);
    } finally {
      input.value = '';
    }
  }

  return <InspectorSection title="Projects" meta={projects.length}>
    <label className="select-field">Open project
      <select value={project.id} onChange={event => onSelect(event.target.value)}>
        {projects.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
    </label>
    <div className="project-actions">
      <button className="primary" onClick={() => start('new')}>New project</button>
      <button onClick={() => start('rename')}>Rename</button>
      {scriptSources.length > 0 && <button onClick={() => {setError('');setForm({action:'script',sourceId:''});}}>Copy script and scenes…</button>}
      {!projects.some(item => item.id === SAMPLE_PROJECT_ID) && <button onClick={() => onSelect(SAMPLE_PROJECT_ID)}>Open Sample Project</button>}
    </div>
    {form?.action === 'script' && <form className="project-form" onSubmit={event => {
      event.preventDefault();
      if (!scriptSource) return;
      const menu = event.currentTarget.closest('details');
      onCopyScript(scriptSource);
      setForm(null);
      menu.open = false;
    }}>
      <label>Copy script from<select value={form.sourceId} autoFocus onChange={event => setForm({...form,sourceId:event.target.value})}>
        <option value="" disabled>Choose a project</option>
        {scriptSources.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select></label>
      <p className="small-note">Replaces the script and scene markers in {project.title}. Existing design keyframes keep their times.</p>
      <div className="project-actions">
        <button type="submit" className="primary" disabled={!scriptSource}>Replace script and scenes</button>
        <button type="button" onClick={() => setForm(null)}>Cancel</button>
      </div>
    </form>}
    {form && form.action !== 'script' && <form className="project-form" onSubmit={submit}>
      <label>Project name<input value={form.title} maxLength={PROJECT_TITLE_LIMIT} autoFocus
        onChange={event => setForm({...form, title: event.target.value})}/></label>
      <div className="project-actions">
        <button type="submit" className="primary" disabled={!form.title.trim()}>{form.action === 'new' ? 'Create' : 'Save name'}</button>
        <button type="button" onClick={() => setForm(null)}>Cancel</button>
      </div>
    </form>}
    <div className="project-actions project-files">
      <button onClick={() => file.current.click()}>Import project…</button>
      <button onClick={onExport}>Export project (.json)</button>
      <input ref={file} type="file" accept=".json,application/json" hidden onChange={load}/>
    </div>
    <p className="small-note">Shows are stored in this browser. Export a project to keep a file copy.</p>
    {error && <p className="support-error" role="alert">{error}</p>}
  </InspectorSection>;
}
