import React, {useLayoutEffect, useRef, useState} from 'react';
import {ControlIcon} from './controls.jsx';
import './inspector.css';

export function TabList({className, tabs, active, onChange, prefix, label, controls}) {
  const tabList = useRef(null);

  function navigate(event, index) {
    const nextIndex = {
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    if (nextIndex === undefined) return;

    event.preventDefault();
    onChange(tabs[nextIndex].id);
    tabList.current.children[nextIndex].focus();
  }

  return <div className={className} role="tablist" aria-label={label} ref={tabList}>
    {tabs.map(({id, label, off}, index) => <button
      key={id}
      type="button"
      role="tab"
      id={`${prefix}-tab-${id}`}
      aria-controls={controls(id)}
      aria-selected={active === id}
      title={label}
      data-off={off||undefined} aria-label={off?`${label} · Off`:undefined}
      tabIndex={active === id ? 0 : -1}
      onClick={() => onChange(id)}
      onKeyDown={event => navigate(event, index)}
    >{label}</button>)}
  </div>;
}

export function EntityPicker({tabs, active, onChange, prefix, label, panel, children}) {
  const picker = useRef(null);
  const [overflow,setOverflow]=useState(false);
  useLayoutEffect(() => {
    const strip=picker.current.querySelector('.entity-tabs');
    if(!strip){setOverflow(false);return;}
    function measure(){
      setOverflow(strip.scrollWidth>strip.clientWidth);
      const tab=strip.querySelector('[aria-selected="true"]');
      if(!tab)return;
      const {left,right}=tab.getBoundingClientRect(), bounds=strip.getBoundingClientRect();
      if(left<bounds.left)strip.scrollLeft+=left-bounds.left;
      else if(right>bounds.right)strip.scrollLeft+=right-bounds.right;
    }
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(strip);
    return ()=>observer.disconnect();
  }, [active,tabs]);

  return <div className="entity-picker" ref={picker}>
    {tabs.length > 0 && <TabList className="entity-tabs" tabs={tabs} active={active} onChange={onChange}
      prefix={prefix} label={label} controls={typeof panel==='function'?panel:()=>panel}/>}
    <div className="entity-picker-actions">
      {(overflow||tabs.some(tab=>tab.label.length>16))&&<select className="entity-overflow" aria-label={`All entities · ${label}`} value=""
        onChange={event=>{const tab=tabs.find(tab=>String(tab.id)===event.target.value);if(tab)onChange(tab.id);}}>
        <option value="" disabled>All {tabs.length}</option>
        {tabs.map(tab=><option key={tab.id} value={tab.id}>{tab.label}</option>)}
      </select>}
      {children}
    </div>
  </div>;
}

export function EntityActions({label,onDuplicate,onRemove,disabled}) {
  return <details className="entity-actions"><summary aria-label={`Actions for ${label}`}><ControlIcon kind="more"/></summary><div>
    {onDuplicate&&<button type="button" disabled={disabled} onClick={event=>{
      event.currentTarget.closest('details').open=false;onDuplicate();
    }}>Duplicate</button>}
    <button type="button" className="danger" onClick={event=>{
      event.currentTarget.closest('details').open=false;onRemove();
    }}>Remove {label}</button>
  </div></details>;
}

export function Inspector({department, active, onChange, panels, entities, warnings, onWarning, onStage, standalone, headerAction}) {
  const {id: dept, label, tabs} = department;
  const panelId = id => `inspector-panel-${dept}-${id}`;
  const showingStandalone=active===standalone?.id;

  return <aside className="inspector" id="department-inspector" data-department={dept}
    role="tabpanel" aria-labelledby={`department-tab-${dept}`}>
    <div className="inspector-header">
      <h2 id="department-heading">{label}</h2>
      <div className="inspector-heading-actions">
        {headerAction}
        {warnings.length>0&&<details className="warning-menu"><summary className="inspector-warnings">
          {warnings.length} {warnings.length===1?'warning':'warnings'}
        </summary><div>{warnings.map(issue=><button key={`${issue.id}:${issue.message}`} onClick={event=>{
          event.currentTarget.closest('details').open=false;onWarning(issue);
        }}>{issue.message}</button>)}</div></details>}
        <button type="button" className="stage-return" onClick={onStage}>Back to stage</button>
      </div>
    </div>
    {entities&&<div className="inspector-entities">{entities}</div>}
    {tabs.length>1&&!showingStandalone&&<TabList className="inspector-tabs" tabs={tabs} active={active} onChange={onChange}
      prefix={`inspector-${dept}`} label={`${label} settings`} controls={panelId}/>}
    {tabs.map(({id}) => <div
      key={panelId(id)}
      className="inspector-panel"
      id={panelId(id)}
      role="tabpanel"
      aria-labelledby={tabs.length>1?`inspector-${dept}-tab-${id}`:'department-heading'}
      tabIndex={0}
      hidden={active !== id}
    >{panels[id]}</div>)}
    {standalone&&<div className="inspector-panel" id={panelId(standalone.id)} role="tabpanel"
      aria-labelledby={standalone.tabId} tabIndex={0} hidden={!showingStandalone}>{panels[standalone.id]}</div>}
  </aside>;
}

const globalTabs = [
  {id: 'script', label: 'Script'},
  {id: 'view', label: 'View'},
  {id: 'rigging', label: 'Rigging'},
];

export function GlobalPanel({active, onChange, panels}) {
  const panelId = id => `global-panel-${id}`;
  return <aside className="inspector global-panel" aria-label="Script and global settings">
    <TabList className="inspector-tabs" tabs={globalTabs} active={active} onChange={onChange}
      prefix="global" label="Global workspace" controls={panelId}/>
    {globalTabs.map(({id}) => <div key={id} className="inspector-panel" id={panelId(id)}
      role="tabpanel" aria-labelledby={`global-tab-${id}`} tabIndex={0} hidden={active !== id}>
      {panels[id]}
    </div>)}
  </aside>;
}

export function InspectorSection({title, meta, children,id}) {
  return <section className="inspector-section" id={id}>
    <div className="section-title"><h2>{title}</h2>{meta != null && <span>{meta}</span>}</div>
    {children}
  </section>;
}
