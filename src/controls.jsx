import React,{useState,useEffect,useId,useRef} from 'react';

const displayNumber=value=>String(Math.round(value*100)/100);
export function ControlIcon({kind}) {
 const paths={play:'M4 2l9 6-9 6z',pause:'M5 3v10m6-10v10',previous:'M4 3v10m8-10L6 8l6 5z',next:'M12 3v10M4 3l6 5-6 5z',
  chevron:'M5 3l5 5-5 5',more:'M3 8h.1m4.9 0h.1m4.9 0h.1',
  fullscreen:'M2 6V2h4m4 0h4v4m0 4v4h-4m-4 0H2v-4',exitFullscreen:'M2 6h4V2m4 0v4h4m0 4h-4v4m-4 0v-4H2'};
 return <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d={paths[kind]}
  fill={kind==='play'?'currentColor':'none'} stroke="currentColor" strokeWidth={kind==='more'?2.1:1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function NumberField({label,value,onChange,min,max,step=10,suffix='mm',disabled=false,format=displayNumber,parse=Number}){
 const formatted=format(value);
 const [draft,setDraft]=useState(formatted);
 const [error,setError]=useState('');
 const errorId=useId();
 const cancelBlur=useRef(false);
 const isNumber=parse===Number;
 useEffect(()=>{setDraft(formatted);setError('');},[formatted]);

 function commit(){
  if(cancelBlur.current){cancelBlur.current=false;return;}
  if(disabled)return;
  const next=parse(draft);
  if(!draft.trim() || !Number.isFinite(next)){
   setError(isNumber?'Enter a number.':'Enter a time as minutes:seconds or seconds.');
  }else if(next<min || next>max){
   setError(`Use ${format(min)} to ${format(max)}${suffix ? ` ${suffix}` : ''}.`);
  }else{
   const problem=next===parse(formatted) ? null : onChange(next);
   setError(typeof problem==='string' ? problem : '');
   if(typeof problem!=='string')setDraft(format(next));
  }
 }

 return <label className="number-field"><span>{label}</span><div>
  <input aria-label={label} type={isNumber?'number':'text'} min={min} max={max} step={step} value={draft} disabled={disabled}
   aria-invalid={Boolean(error)} aria-describedby={error?errorId:undefined}
   onChange={e=>{setDraft(e.target.value);setError('');}} onBlur={commit} onKeyDown={e=>{
    if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur();}
    if(e.key==='Escape'){
     e.stopPropagation();cancelBlur.current=true;setDraft(formatted);setError('');e.currentTarget.blur();
    }
   }}/><span>{suffix}</span></div>
  {error&&<span id={errorId} className="field-error" role="alert">{error}</span>}
 </label>;
}
export function RangeField({label,value,onChange,min,max,step=1,suffix='',digits=0,disabled=false}){
 return <label className="range-field"><span>{label}<output>{value.toFixed(digits)}{suffix}</output></span><input aria-label={label} type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={e=>onChange(Number(e.target.value))}/></label>;
}
export function KeyframeField({label, animation, children}) {
 return <div className="keyframe-field" data-focused={animation.focused} data-opening={animation.opening||undefined}>
  <div>{children}</div>
  {!animation.opening&&<button type="button" className="keyframe-toggle" data-keyed={animation.atKey} data-pending={animation.pending}
   aria-label={`${animation.pending?'Save':animation.atKey ? 'Update' : 'Add'} ${label} keyframe`}
   title={animation.pending ? 'Save preview value as a keyframe'
    : animation.atKey ? 'Update keyframe at the playhead' : 'Add keyframe at the playhead'}
   disabled={animation.disabled} onClick={animation.save}><i/></button>}
  {animation.pending&&<div className="pending-property"><span>Unsaved keyframe</span><div>
   <button type="button" onClick={animation.save}>Save keyframe</button>
   <button type="button" className="quiet" onClick={animation.discard}>Discard</button></div>
  </div>}
 </div>;
}
