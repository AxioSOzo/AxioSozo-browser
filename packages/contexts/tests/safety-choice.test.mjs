/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ContextsError } from '../src/errors.mjs';
import { FAMILY_DOH_URI, FAMILY_DOH_MODE, SAFETY_STATE_VERSION, SAFETY_PREF_NAMES, SAFETY_GUARD_NAMES,
  DEFAULT_SAFETY_STATE, validateSafetySnapshot, validateSafetyState, safetyOffer, safetyStatus,
  planSafetyChoice, applySafetyChoice } from '../src/safety-choice.mjs';
const NOW=1790000000000;
const copy=value=>JSON.parse(JSON.stringify(value));
const pref=(value,has_user_value=false,locked=false)=>({value,has_user_value,locked});
const snapshot=(prefs={})=>({prefs:{'network.trr.uri':pref(''),'network.trr.mode':pref(0),...prefs},
  guards:Object.fromEntries(SAFETY_GUARD_NAMES.map(key=>[key,false]))});
const bad=fn=>assert.throws(fn,e=>e instanceof ContextsError && e.code==='INVALID_SAFETY');
function fixture(initial=snapshot()){
  let data=copy(initial),fail=false,changeOnRead=null,reads=0;
  const writes=[],defaults={ 'network.trr.uri':initial.prefs['network.trr.uri'].has_user_value?'':initial.prefs['network.trr.uri'].value,
    'network.trr.mode':initial.prefs['network.trr.mode'].has_user_value?0:initial.prefs['network.trr.mode'].value };
  const api={snapshot(){reads++;if(changeOnRead&&reads===changeOnRead.at)data=copy(changeOnRead.next);return copy(data);},
    compareAndApply(expected,mutations){
      if(fail)throw Error('SYNTHETIC_ATOMIC_WRITE_FAILURE');
      if(JSON.stringify(expected)!==JSON.stringify(data))return false;
      const next=copy(data);
      for(const m of mutations){
        assert(SAFETY_PREF_NAMES.includes(m.name));assert(['set','clear'].includes(m.operation));assert.equal(next.prefs[m.name].locked,false);
        if(m.operation==='set')next.prefs[m.name]=pref(m.value,true);else next.prefs[m.name]=pref(defaults[m.name]);
      }
      data=next;writes.push(...copy(mutations));return true;
    }};
  return{api,writes,current:()=>copy(data),edit(fn){fn(data);},fail(){fail=true;},changeOnRead(at,next){changeOnRead={at,next};},reads:()=>reads};
}
const apply=(f,state=DEFAULT_SAFETY_STATE,checked=true,extra={})=>applySafetyChoice({prefs:f.api,state,checked,userConfirmed:true,now:NOW,...extra});

test('first-run state has checked offer, strict frozen v1 data and no pref adapter activity',()=>{
  assert.equal(SAFETY_STATE_VERSION,1);assert.equal(FAMILY_DOH_MODE,3);assert.equal(FAMILY_DOH_URI,'https://family.cloudflare-dns.com/dns-query');
  assert.deepEqual(SAFETY_PREF_NAMES,['network.trr.uri','network.trr.mode']);
  assert.deepEqual(safetyOffer(),{offer:true,checked:true});assert(Object.isFrozen(DEFAULT_SAFETY_STATE));
  assert(Object.isFrozen(validateSafetyState(DEFAULT_SAFETY_STATE)));
  const f=fixture();bad(()=>apply(f,DEFAULT_SAFETY_STATE,true,{userConfirmed:false}));assert.equal(f.reads(),0);assert.deepEqual(f.writes,[]);
  bad(()=>apply(f,DEFAULT_SAFETY_STATE,true,{userConfirmed:undefined}));assert.equal(f.reads(),0);
});

test('validators reject unknown keys, malformed state/snapshots and any secret-bearing resolver URI',()=>{
  for(const value of [null,{...DEFAULT_SAFETY_STATE,version:2},{...DEFAULT_SAFETY_STATE,extra:true},
    {...DEFAULT_SAFETY_STATE,checked:false},{...DEFAULT_SAFETY_STATE,first_run_completed:true},
    {...DEFAULT_SAFETY_STATE,confirmed_at:NOW}])bad(()=>validateSafetyState(value));
  for(const edit of [s=>{s.extra=true;},s=>{s.guards.extra=false;},s=>{delete s.guards.ohttp_enabled;},s=>{s.guards.credentials_locked='false';},
    s=>{s.prefs['network.trr.uri'].extra=true;},s=>{s.prefs['network.trr.mode'].value=7;},s=>{s.prefs['network.trr.mode'].locked=0;},
    s=>{s.prefs['network.trr.uri'].value='https://synthetic-user:synthetic-pass@fixture.example/dns-query';},
    s=>{s.prefs['network.trr.uri'].value='https://fixture.example/dns-query?synthetic-key=abc';},
    s=>{s.prefs['network.trr.uri'].value='http://fixture.example/dns-query';}]){
      const s=snapshot();edit(s);bad(()=>validateSafetySnapshot(s));
  }
});

test('unchecked first-run confirmation completes once without changing any DNS preferences',()=>{
  const f=fixture(snapshot({'network.trr.uri':pref('https://custom.fixture.example/dns-query',true),'network.trr.mode':pref(2,true)}));
  const before=f.current(),out=apply(f,DEFAULT_SAFETY_STATE,false);
  assert.equal(out.changed,false);assert.equal(out.state.first_run_completed,true);assert.equal(out.state.checked,false);assert.equal(out.state.confirmed_at,NOW);
  assert.deepEqual(safetyOffer(out.state),{offer:false,checked:false});assert.deepEqual(f.current(),before);assert.deepEqual(f.writes,[]);
});

test('confirmation plans only the family resolver URI and TRR-only mode, then injected atomic adapter applies them',()=>{
  const f=fixture(),p=planSafetyChoice({snapshot:f.current(),checked:true,userConfirmed:true,now:NOW});
  assert.deepEqual(p.mutations,[{name:'network.trr.uri',operation:'set',value:FAMILY_DOH_URI},{name:'network.trr.mode',operation:'set',value:3}]);
  assert(Object.isFrozen(p.expected.prefs));assert(Object.isFrozen(p.mutations));
  const out=apply(f);assert.equal(out.changed,true);assert.equal(out.reason,'APPLIED');assert.equal(out.state.first_run_completed,true);
  assert.deepEqual(safetyStatus(out.state,f.current()),{offer:false,checked:true,active:true,owned:true});
  assert.deepEqual(f.writes,p.mutations);assert.deepEqual(Object.keys(out.state.owned.previous),SAFETY_PREF_NAMES);
});

test('repeat enable keeps original ownership baseline and emits no extra mutation',()=>{
  const f=fixture(),first=apply(f),repeat=apply(f,first.state,true,{now:NOW+1});
  assert.equal(repeat.changed,false);assert.equal(repeat.reason,'UNCHANGED');assert.deepEqual(repeat.state.owned.previous,first.state.owned.previous);
  assert.equal(f.writes.length,2);assert.equal(repeat.state.confirmed_at,NOW+1);
});

test('disabling owned safety restores an existing user resolver/mode and preserves absent user branches',()=>{
  for(const before of [snapshot(),snapshot({'network.trr.uri':pref('https://custom.fixture.example/dns-query',true),'network.trr.mode':pref(2,true)}),
    snapshot({'network.trr.uri':pref('https://custom.fixture.example/dns-query',true),'network.trr.mode':pref(5,true)})]){
    const f=fixture(before),on=apply(f),off=apply(f,on.state,false,{now:NOW+1});
    assert.equal(off.reason,'RESTORED');assert.equal(off.changed,true);assert.equal(off.state.owned,null);assert.equal(off.state.checked,false);
    assert.deepEqual(f.current(),before);
  }
});

test('manual Settings edit to either preference releases the whole owned pair without overwriting user choices',()=>{
  for(const edit of [s=>{s.prefs['network.trr.uri']=pref('https://changed.fixture.example/dns-query',true);},
    s=>{s.prefs['network.trr.mode']=pref(5,true);},s=>{s.prefs['network.trr.mode'].locked=true;}]){
    const f=fixture(),on=apply(f);f.edit(edit);const changed=f.current(),count=f.writes.length;
    const off=apply(f,on.state,false,{now:NOW+1});assert.equal(off.reason,'PREFS_CHANGED');assert.equal(off.changed,false);assert.equal(off.state.owned,null);
    assert.deepEqual(f.current(),changed);assert.equal(f.writes.length,count);assert.equal(off.state.checked,false);
  }
});

test('explicit re-enable after a Settings edit takes the new user configuration as its restoration baseline',()=>{
  const f=fixture(),first=apply(f);f.edit(s=>{s.prefs['network.trr.uri']=pref('https://later.fixture.example/dns-query',true);});
  const newer=f.current(),again=apply(f,first.state,true,{now:NOW+1});assert.equal(again.changed,true);
  const off=apply(f,again.state,false,{now:NOW+2});assert.equal(off.changed,true);assert.deepEqual(f.current(),newer);
});

test('preexisting family configuration is not claimed as owned and an opt-out does not overwrite it',()=>{
  const initial=snapshot({'network.trr.uri':pref(FAMILY_DOH_URI,true),'network.trr.mode':pref(3,true)}),f=fixture(initial),on=apply(f);
  assert.equal(on.changed,false);assert.equal(on.state.owned,null);assert.equal(safetyStatus(on.state,f.current()).owned,false);
  const off=apply(f,on.state,false,{now:NOW+1});assert.equal(off.changed,false);assert.deepEqual(f.current(),initial);
  assert.equal(safetyStatus(off.state,f.current()).active,true);assert.equal(off.state.checked,false);
});

test('locked prefs and credential/bootstrap/OHTTP guard metadata refuse enabling without reads of secret values or writes',()=>{
  for(const key of SAFETY_GUARD_NAMES){
    const s=snapshot();s.guards[key]=true;const f=fixture(s),out=apply(f);
    assert.equal(out.reason,'EXTERNAL_DOH_CONFIGURATION');assert.deepEqual(out.state,DEFAULT_SAFETY_STATE);assert.deepEqual(f.writes,[]);
  }
  for(const name of SAFETY_PREF_NAMES){const s=snapshot();s.prefs[name].locked=true;const f=fixture(s),out=apply(f);
    assert.equal(out.reason,'PREF_LOCKED');assert.deepEqual(f.writes,[]);}
  // The only captured values are URI/mode. Credential strings are absent from
  // the adapter snapshot contract; booleans describe their user/policy presence.
  assert(!JSON.stringify(snapshot()).includes('network.trr.credentials'));
});

test('racing user/policy edits and failed atomic writes preserve old state and do not claim ownership',()=>{
  const f=fixture(),changed=snapshot({'network.trr.mode':pref(5,true)});f.changeOnRead(2,changed);
  const race=apply(f);assert.equal(race.reason,'PREFS_CHANGED');assert.deepEqual(race.state,DEFAULT_SAFETY_STATE);assert.deepEqual(f.writes,[]);
  const g=fixture();g.fail();const failure=apply(g);assert.equal(failure.reason,'PREF_WRITE_FAILED');assert.deepEqual(failure.state,DEFAULT_SAFETY_STATE);
  assert.deepEqual(g.current(),snapshot());assert.deepEqual(g.writes,[]);
  const h=fixture();h.api.compareAndApply=()=>false;assert.equal(apply(h).reason,'PREFS_CHANGED');
});

test('passed clock and state validation happen before any authorized write',()=>{
  const f=fixture();bad(()=>apply(f,DEFAULT_SAFETY_STATE,true,{now:undefined}));assert.deepEqual(f.writes,[]);
  const on=apply(f);bad(()=>apply(f,on.state,false,{now:NOW-1}));assert.equal(f.writes.length,2);
  bad(()=>applySafetyChoice({state:DEFAULT_SAFETY_STATE,checked:true,userConfirmed:true,now:NOW,prefs:{}}));
});

test('staged source is DOM-free, deterministic and has no network, DNS, timers or ambient pref access',async()=>{
  const source=await readFile(new URL('../src/safety-choice.mjs',import.meta.url),'utf8');
  for(const re of [/['"]node:/u,/\bBuffer\b/u,/\b(?:fetch|setTimeout|setInterval)\s*\(/u,/\bDate\s*\.\s*now/u,/\bnew\s+Date\b/u,
    /\b(?:Services|ChromeUtils|document|window|process|IOUtils)\s*[.[]/u,/\bglobalThis\b/u,/\bMath\s*\.\s*random/u])assert(!re.test(source),re.toString());
  for(const m of source.matchAll(/\bfrom\s*['"]([^'"]+)['"]/gu))assert.match(m[1],/^\.\/[a-z-]+\.mjs$/u);
});


test('unowned decline is state-only even when current DNS preferences cannot be read or validated',()=>{
  const prefs={snapshot:()=>assert.fail('decline must not read preferences'),compareAndApply:()=>assert.fail('decline must not mutate')};
  const out=applySafetyChoice({state:DEFAULT_SAFETY_STATE,checked:false,userConfirmed:true,now:NOW,prefs});
  assert.equal(out.state.first_run_completed,true);assert.equal(out.state.checked,false);assert.equal(out.changed,false);
  const plan=planSafetyChoice({snapshot:'unsupported input is irrelevant to a decline',checked:false,userConfirmed:true,now:NOW});
  assert.equal(plan.expected,null);assert.deepEqual(plan.mutations,[]);
});

test('observed guard/lock drift releases ownership even when the attempted re-enable is refused',()=>{
  for(const edit of [s=>{s.prefs['network.trr.uri']=pref('https://later.fixture.example/dns-query',true);s.prefs['network.trr.mode'].locked=true;},
    s=>{s.guards.credentials_user_value=true;}]){
    const f=fixture(),on=apply(f);f.edit(edit);
    const refused=apply(f,on.state,true,{now:NOW+1});assert.equal(refused.changed,false);assert.equal(refused.state.owned,null);
    // A later independent user choice returning to family must not resurrect
    // this feature's former baseline or allow it to overwrite that choice.
    f.edit(s=>{s.prefs['network.trr.uri']=pref(FAMILY_DOH_URI,true);s.prefs['network.trr.mode']=pref(3,true);s.guards.credentials_user_value=false;});
    const current=f.current(),count=f.writes.length;
    const off=apply(f,refused.state,false,{now:NOW+2});assert.equal(off.changed,false);assert.deepEqual(f.current(),current);assert.equal(f.writes.length,count);
  }
});

test('racing rollback and failed rollback release ownership after newly observed preference drift',()=>{
  for(const mode of ['race','false','throw']){
    const f=fixture(),on=apply(f),changed=snapshot({'network.trr.uri':pref('https://later.fixture.example/dns-query',true),'network.trr.mode':pref(3,true)});
    if(mode==='race')f.changeOnRead(f.reads()+2,changed);
    else f.api.compareAndApply=()=>{f.edit(s=>{s.prefs=copy(changed.prefs);});if(mode==='throw')throw Error('SYNTHETIC_FAILURE');return false;};
    const failed=apply(f,on.state,false,{now:NOW+1});assert.equal(failed.changed,false);assert.equal(failed.state.owned,null);
    f.edit(s=>{s.prefs['network.trr.uri']=pref(FAMILY_DOH_URI,true);});const current=f.current();
    assert.equal(apply(f,failed.state,false,{now:NOW+2}).changed,false);assert.deepEqual(f.current(),current);
  }
});


test('unsupported or unavailable current preferences cannot keep a previous ownership baseline alive',()=>{
  for(const failure of ['template','unreadable']){
    const f=fixture(),on=apply(f);
    if(failure==='template')f.edit(s=>{s.prefs['network.trr.uri']=pref('https://resolver.fixture.example/dns-query{?dns}',true);});
    else f.api.snapshot=()=>{throw Error('SYNTHETIC_READ_FAILURE');};
    const refused=apply(f,on.state,true,{now:NOW+1});assert.equal(refused.reason,'PREF_READ_FAILED');assert.equal(refused.state.owned,null);
    assert.equal(refused.changed,false);assert.equal(f.writes.length,2);
  }
});
