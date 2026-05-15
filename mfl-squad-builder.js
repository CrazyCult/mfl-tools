// MFL Squad Builder — https://github.com/TON_USER/mfl-tools
// Injecte un panel en bas de app.playmfl.com/fr/clubs/XXXX/squad
(function(){
var API='https://z519wdyajg.execute-api.us-east-1.amazonaws.com/prod';
var MAX_E=10000;
var TALL={G:1,GK:1,DC:1,CB:1,BU:1,ST:1,DLG:1,LWB:1,DLD:1,RWB:1};

// ── Club ID depuis l'URL ──────────────────────────────────────
var cm=location.href.match(/\/clubs\/(\d+)/);
window._MC=cm?parseInt(cm[1]):null;

// ── Token JWT ────────────────────────────────────────────────
function findTok(){
  var keys=['token','auth_token','access_token','authorization','bearer_token','jwt_token'];
  for(var i=0;i<keys.length;i++){
    var v=localStorage.getItem(keys[i])||sessionStorage.getItem(keys[i]);
    if(v){
      try{var p=JSON.parse(v);var t=(p&&p.data&&p.data.access&&p.data.access.token)||(p&&p.access&&p.access.token)||(p&&p.token);if(t)return t;}catch(e){}
      if(v.length>40&&v.indexOf('eyJ')===0)return v.replace('Bearer ','');
    }
  }
  for(var j=0;j<localStorage.length;j++){
    var val=localStorage.getItem(localStorage.key(j));
    if(!val||val.length<50)continue;
    try{var ff=sjwt(JSON.parse(val),0);if(ff)return ff;}catch(e){}
    var mm=val.match(/eyJ[A-Za-z0-9._-]{40,}/);if(mm)return mm[0];
  }
  return null;
}
function sjwt(o,d){
  if(d>5||!o)return null;
  if(typeof o==='string'&&o.indexOf('eyJ')===0&&o.split('.').length===3)return o;
  if(typeof o==='object'){var vv=Object.values(o);for(var i=0;i<vv.length;i++){var f=sjwt(vv[i],d+1);if(f)return f;}}
  return null;
}
var t0=findTok();
window._MT=t0?('Bearer '+t0):null;

var _of=window.fetch;
window.fetch=function(){
  var url=arguments[0],opts=arguments[1];
  if(typeof url==='string'&&url.indexOf('z519wdyajg')>=0){
    var auth=opts&&opts.headers&&(opts.headers.authorization||opts.headers.Authorization);
    if(auth&&auth.indexOf('Bearer ')===0)window._MT=auth;
  }
  return _of.apply(this,arguments);
};

function getW(){
  if(window._MT){try{var p=JSON.parse(atob(window._MT.replace('Bearer ','').split('.')[1]));if(p.sub)return p.sub;}catch(e){}}
  var ee=performance.getEntriesByType('resource');
  for(var i=0;i<ee.length;i++){var m=ee[i].name.match(/[Ww]alletAddress=(0x[0-9a-f]{16})/i);if(m)return m[1];}
  for(var k in localStorage){var mv=(localStorage.getItem(k)||'').match(/0x[0-9a-f]{16}/i);if(mv)return mv[0];}
  return null;
}

// ── Formations ───────────────────────────────────────────────
var FORM={
  '3-4-2-1':['GK','CB','CB','CB','LM','CM','CM','RM','AT','AT','ST'],
  '3-4-3':['GK','CB','CB','CB','LM','CM','CM','RM','LW','ST','RW'],
  '3-4-3 losange':['GK','CB','CB','CB','LM','CDM','CAM','RM','LW','ST','RW'],
  '3-5-2':['GK','CB','CB','CB','CDM','CM','CM','LM','RM','ST','ST'],
  '3-5-2 B':['GK','CB','CB','CB','RM','CDM','CDM','CAM','RM','ST','ST'],
  '4-1-2-1-2':['GK','LB','CB','CB','RB','CDM','LM','RM','CAM','ST','ST'],
  '4-1-2-1-2 compact':['GK','RB','CB','CB','LB','CDM','CM','CM','ST','CAM','ST'],
  '4-1-3-2':['GK','LB','CB','CB','RB','CDM','LM','CM','RM','ST','ST'],
  '4-1-4-1':['GK','LB','CB','CB','RB','CDM','LM','CM','CM','RM','ST'],
  '4-2-2-2':['GK','LB','CB','CB','RB','CDM','CDM','CAM','CAM','ST','ST'],
  '4-2-3-1':['GK','LB','CB','CB','RB','CDM','CDM','CAM','LM','RM','ST'],
  '4-2-4':['GK','LB','CB','CB','RB','CM','CM','LW','ST','ST','RW'],
  '4-3-1-2':['GK','LB','CB','CB','RB','CM','CM','CM','CAM','ST','ST'],
  '4-3-2-1':['G','DG','DC','DC','DD','MC','MC','MC','AT','AT','BU'],
  '4-3-3':['GK','LB','CB','CB','RB','CM','CM','CM','LW','ST','RW'],
  '4-3-3 att':['GK','LB','CB','CB','RB','CM','CM','CAM','LW','ST','RW'],
  '4-3-3 def':['GK','LB','CB','CB','RB','CDM','CM','CM','LW','ST','RW'],
  '4-3-3 faux 9':['G','DG','DC','DC','DD','MDC','MC','MC','AG','AT','AD'],
  '4-4-1-1':['GK','LB','CB','CB','RB','LM','CM','CM','RM','CAM','ST'],
  '4-4-2':['GK','LB','CB','CB','RB','LM','CM','CM','RM','ST','ST'],
  '4-4-2 B':['GK','LB','CB','CB','RB','LM','CM','CM','RM','ST','ST'],
  '5-2-1-2':['GK','LWB','CB','CB','CB','RWB','CM','CM','CAM','ST','ST'],
  '5-2-2-1':['GK','LWB','CB','CB','CB','RWB','CM','CM','CAM','CAM','ST'],
  '5-3-2':['GK','LWB','CB','CB','CB','RWB','LM','CM','RM','ST','ST'],
  '5-4-1':['GK','LWB','CB','CB','CB','RWB','LM','CDM','RM','CAM','ST']
};

var SLOTS={
  '3-4-2-1':{GK:2,CB:4,LM:2,CM:4,RM:2,AT:3,ST:2},
  '3-4-3':{GK:2,CB:4,LM:2,CM:4,RM:2,LW:2,RW:2,ST:2},
  '3-4-3 losange':{GK:2,CB:4,LM:2,CDM:2,CAM:2,RM:2,LW:2,RW:2,ST:2},
  '3-5-2':{GK:2,CB:4,CDM:2,CM:4,LM:2,RM:2,ST:3},
  '3-5-2 B':{GK:2,CB:4,CDM:3,CAM:2,ST:3},
  '4-1-2-1-2':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CDM:2,LM:2,RM:2,CAM:2,ST:3},
  '4-1-2-1-2 compact':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CDM:2,CM:4,CAM:2,ST:3},
  '4-1-3-2':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CDM:2,LM:2,CM:3,RM:2,ST:3},
  '4-1-4-1':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CDM:2,LM:2,CM:3,RM:2,ST:2},
  '4-2-2-2':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CDM:3,CAM:3,ST:3},
  '4-2-3-1':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CDM:3,LM:2,CAM:2,RM:2,ST:2},
  '4-2-4':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CM:4,LW:2,RW:2,ST:3},
  '4-3-1-2':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CM:5,CAM:2,ST:3},
  '4-3-2-1':{G:2,DC:3,DG:1,DD:1,DGDD:1,MC:5,AT:3,BU:2},
  '4-3-3':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CM:5,LW:2,RW:2,ST:2},
  '4-3-3 att':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CM:4,CAM:2,LW:2,RW:2,ST:2},
  '4-3-3 def':{GK:2,CB:3,LB:1,RB:1,LBRB:1,CDM:2,CM:4,LW:2,RW:2,ST:2},
  '4-3-3 faux 9':{G:2,DC:3,DG:1,DD:1,DGDD:1,MDC:2,MC:4,AG:2,AD:2,AT:2},
  '4-4-1-1':{GK:2,CB:3,LB:1,RB:1,LBRB:1,LM:2,CM:4,RM:2,CAM:2,ST:2},
  '4-4-2':{GK:2,CB:3,LB:1,RB:1,LBRB:1,LM:2,CM:4,RM:2,ST:3},
  '4-4-2 B':{GK:2,CB:3,LB:1,RB:1,LBRB:1,LM:2,CM:4,RM:2,ST:3},
  '5-2-1-2':{GK:2,LWB:2,CB:4,RWB:2,CM:4,CAM:2,ST:3},
  '5-2-2-1':{GK:2,LWB:2,CB:4,RWB:2,CM:4,CAM:3,ST:2},
  '5-3-2':{GK:2,LWB:2,CB:4,RWB:2,LM:2,CM:3,RM:2,ST:3},
  '5-4-1':{GK:2,LWB:2,CB:4,RWB:2,LM:2,CDM:2,RM:2,CAM:2,ST:2}
};

// ── Poids par poste ──────────────────────────────────────────
var W={
  G:{PAC:0,SHO:0,PAS:0,DRI:0,DEF:0,PHY:0,GK:1},
  GK:{PAC:0,SHO:0,PAS:0,DRI:0,DEF:0,PHY:0,GK:1},
  DC:{PAC:.02,SHO:0,PAS:.05,DRI:.09,DEF:.64,PHY:.20,GK:0},
  CB:{PAC:.02,SHO:0,PAS:.05,DRI:.09,DEF:.64,PHY:.20,GK:0},
  DG:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  LB:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  DD:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  RB:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  DLG:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  LWB:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  DLD:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  RWB:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  MDC:{PAC:0,SHO:0,PAS:.28,DRI:.17,DEF:.40,PHY:.15,GK:0},
  CDM:{PAC:0,SHO:0,PAS:.28,DRI:.17,DEF:.40,PHY:.15,GK:0},
  MC:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  CM:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  MG:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  LM:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  MD:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  RM:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  MOC:{PAC:.07,SHO:.21,PAS:.34,DRI:.38,DEF:0,PHY:0,GK:0},
  CAM:{PAC:.07,SHO:.21,PAS:.34,DRI:.38,DEF:0,PHY:0,GK:0},
  AT:{PAC:.07,SHO:.21,PAS:.34,DRI:.38,DEF:0,PHY:0,GK:0},
  AG:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0},
  LW:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0},
  AD:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0},
  RW:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0},
  BU:{PAC:.10,SHO:.46,PAS:.10,DRI:.29,DEF:0,PHY:.05,GK:0},
  ST:{PAC:.10,SHO:.46,PAS:.10,DRI:.29,DEF:0,PHY:.05,GK:0},
  CF:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0}
};

// Conversion code MFL → code matrice
var TOM={G:'GK',GK:'GK',DC:'CB',CB:'CB',DG:'LB',LB:'LB',LWB:'LB',DLG:'LB',DD:'RB',RB:'RB',RWB:'RB',DLD:'RB',MDC:'CDM',CDM:'CDM',MC:'CM',CM:'CM',MG:'LM',LM:'LM',MD:'RM',RM:'RM',MOC:'CAM',CAM:'CAM',AG:'LW',LW:'LW',AD:'RW',RW:'RW',BU:'ST',ST:'ST',AT:'CF',CF:'CF'};

// Matrice familiarité (codes matrice uniquement)
var FAM={
  GK:{GK:'P'},
  CB:{CB:'P',LB:'FF',RB:'FF',CDM:'FF'},
  LB:{LB:'P',LWB:'S',CB:'FF',LM:'FF',RB:'SF'},
  RB:{RB:'P',RWB:'S',CB:'FF',RM:'FF',LB:'SF'},
  LWB:{LWB:'P',LB:'S',LM:'FF',LW:'FF'},
  RWB:{RWB:'P',RB:'S',RM:'FF',RW:'FF'},
  CDM:{CDM:'P',CM:'FF',CB:'FF'},
  CM:{CM:'P',CDM:'FF',CAM:'FF',LM:'FF',RM:'FF'},
  LM:{LM:'P',CM:'FF',LW:'FF',LB:'FF',LWB:'FF'},
  RM:{RM:'P',CM:'FF',RW:'FF',RB:'FF',RWB:'FF'},
  CAM:{CAM:'P',CM:'FF',CF:'FF',LW:'SF',RW:'SF'},
  LW:{LW:'P',LM:'FF',CF:'FF',ST:'SF',CAM:'SF'},
  RW:{RW:'P',RM:'FF',CF:'FF',ST:'SF',CAM:'SF'},
  CF:{CF:'P',ST:'S',CAM:'FF',LW:'FF',RW:'FF'},
  ST:{ST:'P',CF:'S',LW:'SF',RW:'SF'}
};
var PEN={P:0,S:-1,FF:-5,SF:-8,UF:-20};
var RANK={P:4,S:3,FF:2,SF:1,UF:0};

// Score d'un joueur à l'un de ses postes natifs
function scoreAtPos(pl,nativePos){
  var m=pl.metadata||{},w=W[nativePos];
  if(!w)return 0;
  var positions=m.positions||[];
  var pm0=TOM[positions[0]]||positions[0];
  var pmt=TOM[nativePos]||nativePos;
  var fam='UF';
  if(pm0===pmt)fam='P';
  else{
    var allPm=positions.map(function(p){return TOM[p]||p;});
    if(allPm.indexOf(pmt)>=0)fam='S';
    else{var ff=FAM[pm0];if(ff&&ff[pmt])fam=ff[pmt];}
  }
  var pen=PEN[fam];if(pen===undefined)pen=-20;
  var adj=function(s){return Math.max(0,(s||0)+pen);};
  var raw=adj(m.pace)*w.PAC+adj(m.shooting)*w.SHO+adj(m.passing)*w.PAS+
          adj(m.dribbling)*w.DRI+adj(m.defense)*w.DEF+adj(m.physical)*w.PHY+
          adj(m.goalkeeping)*w.GK;
  return Math.max(10,Math.min(99,Math.round(raw*Math.max(0.7,(pl.energy||MAX_E)/MAX_E))));
}

// Meilleur score d'un joueur pour un slot :
// parcourt ses postes natifs, garde le meilleur compatible avec le slot
function bestScore(pl,slotPos){
  var positions=pl.metadata&&pl.metadata.positions||[];
  if(!positions.length)return{sc:0,pos:slotPos,fam:'UF'};
  var tm=TOM[slotPos]||slotPos;
  var best={sc:-1,pos:positions[0],fam:'UF'};
  for(var i=0;i<positions.length;i++){
    var nPos=positions[i];
    var pm=TOM[nPos]||nPos;
    // Familiarité de ce poste natif avec le slot
    var fam='UF';
    if(pm===tm){
      fam=(i===0)?'P':'S'; // 1er poste = primary, autres = secondary
    } else {
      var famRow=FAM[pm];
      if(famRow&&famRow[tm])fam=famRow[tm];
    }
    if(fam==='UF')continue; // incompatible → skip
    var sc=scoreAtPos(pl,nPos);
    // Compare: d'abord familiarité, puis score
    if((RANK[fam]||0)+(sc/1000)>(RANK[best.fam]||0)+(best.sc/1000)){
      best={sc:sc,pos:nPos,fam:fam};
    }
  }
  if(best.sc===-1)return{sc:0,pos:positions[0],fam:'UF'};
  return best;
}

function sk(pl,slotPos,young){
  var b=bestScore(pl,slotPos);
  if(b.sc===0)return 0;
  var m=pl.metadata||{},age=m.age||25,h=m.height||175;
  return b.sc*10000+(young?(40-age):age)*10+(TALL[slotPos]?Math.round(h/10):0);
}

function doAssign(players,positions){
  var keys=positions.map(function(slotPos){
    return players.map(function(p,pi){return{pi:pi,k:sk(p,slotPos,true)};}).sort(function(a,b){return b.k-a.k;});
  });
  var asgn=new Array(positions.length).fill(-1),used=new Set();
  var order=positions.map(function(_,si){var s=keys[si];return{si:si,r:(s[0]?s[0].k:0)-(s[1]?s[1].k:0)};}).sort(function(a,b){return b.r-a.r;});
  order.forEach(function(o){keys[o.si].some(function(kk){if(!used.has(kk.pi)){asgn[o.si]=kk.pi;used.add(kk.pi);return true;}return false;});});
  return asgn.map(function(pi,si){
    if(pi===-1)return null;
    var p=players[pi],slotPos=positions[si];
    var b=bestScore(p,slotPos);
    return{player:p,pos:b.pos,slotPos:slotPos,sc:b.sc,fam:b.fam};
  });
}

function doBackups(players,usedIds,starters,formation){
  var slots=SLOTS[formation]||{},frmPos=FORM[formation]||[];
  var remaining=players.filter(function(p){return!usedIds.has(p.id);});
  var result={},lu=new Set();
  var saByPos={};
  starters.filter(Boolean).forEach(function(s){if(!saByPos[s.slotPos])saByPos[s.slotPos]=[];saByPos[s.slotPos].push(s.player.metadata&&s.player.metadata.age||25);});
  var polyKey=Object.keys(slots).filter(function(k){return k==='DGDD'||k==='LBRB';})[0];
  if(polyKey){
    var p1=polyKey==='DGDD'?'DG':'LB',p2=polyKey==='DGDD'?'DD':'RB';
    var best=remaining.filter(function(p){return!lu.has(p.id);}).sort(function(a,b){
      var dA=bestScore(a,p1).sc+bestScore(a,p2).sc,dB=bestScore(b,p1).sc+bestScore(b,p2).sc;
      return dA!==dB?dB-dA:((b.metadata&&b.metadata.age||0)-(a.metadata&&a.metadata.age||0));
    })[0];
    if(best){
      var b1=bestScore(best,p1),b2=bestScore(best,p2);
      result[polyKey]=[{player:best,pos:b1.sc>=b2.sc?b1.pos:b2.pos,slotPos:p1+'/'+p2,sc:Math.round((b1.sc+b2.sc)/2),fam:'poly',posKey:p1}];
      lu.add(best.id);
    }
  }
  Object.keys(slots).forEach(function(posKey){
    if(posKey==='DGDD'||posKey==='LBRB')return;
    var total=slots[posKey],titCount=frmPos.filter(function(p){return p===posKey;}).length,bc=total-titCount;
    if(bc<=0)return;
    var sa=saByPos[posKey]||[];
    var sorted=remaining.filter(function(p){return!lu.has(p.id);}).sort(function(a,b){return sk(b,posKey,false)-sk(a,posKey,false);});
    var cands=[],fb=[];
    sorted.forEach(function(p){var age=p.metadata&&p.metadata.age||25;(sa.some(function(s){return Math.abs(s-age)<3;})?fb:cands).push(p);});
    while(cands.length<bc&&fb.length)cands.push(fb.shift());
    var picked=cands.slice(0,bc);
    if(picked.length){
      result[posKey]=picked.map(function(p){var b=bestScore(p,posKey);return{player:p,pos:b.pos,slotPos:posKey,sc:b.sc,fam:b.fam};});
      picked.forEach(function(c){lu.add(c.id);});
    }
  });
  return result;
}

function oc(v){if(v>=95)return'#FFF';if(v>=85)return'#fa53ff';if(v>=75)return'#169fed';if(v>=65)return'#3af24b';if(v>=55)return'#FFCC00';return'#9f9f9f';}

function gP(){
  var rev=Math.round(parseFloat(document.getElementById('mfl-rev').value||0)*100);
  var ns=parseInt(document.getElementById('mfl-seasons').value)||1;
  var ar=document.getElementById('mfl-autorenew').checked;
  var exp=parseInt(document.getElementById('mfl-expiry').value)||3;
  var cl=[];
  if(document.getElementById('mfl-clause-mpt').checked)
    cl.push({type:'MINIMUM_PLAYING_TIME',nbMatches:parseInt(document.getElementById('mfl-mpt-matches').value)||10,revenueSharePenalty:Math.round(parseFloat(document.getElementById('mfl-mpt-penalty').value||0)*100)});
  return{revenueShare:rev,nbSeasons:ns,autoRenewByDefault:ar,clauses:cl,expirationDelay:exp};
}

// ── Styles ───────────────────────────────────────────────────
document.getElementById('mfl-st2')&&document.getElementById('mfl-st2').remove();
var st=document.createElement('style');st.id='mfl-st2';
st.textContent=[
  '#mflsb{position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#0b0b18;border-top:2px solid #e2b714;font-family:Segoe UI,sans-serif;font-size:12px;display:flex;flex-direction:column;max-height:52vh}',
  '#mflsb-w{display:flex;flex:1;overflow:hidden}',
  '#mfl-cfg{background:#0d0d1a;border-right:1px solid #1c1c32;padding:10px 12px;width:246px;flex-shrink:0;overflow-y:auto;display:flex;flex-direction:column;gap:7px}',
  '.cfg-t{color:#e2b714;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}',
  '.cr{display:flex;align-items:center;gap:6px;font-size:11px;color:#888}',
  '.cr label{white-space:nowrap;min-width:85px;color:#777}',
  '.cr input[type=number],.cr select{background:#0b0b18;border:1px solid #1c1c32;color:#ccc;border-radius:5px;padding:2px 6px;font-size:11px;width:56px}',
  '.cr input[type=checkbox]{accent-color:#e2b714;width:14px;height:14px;cursor:pointer}',
  '.cbox{background:#111128;border:1px solid #1c1c32;border-radius:6px;padding:7px 9px;display:flex;flex-direction:column;gap:5px}',
  '.cbox-h{display:flex;align-items:center;gap:6px;font-size:11px;color:#aaa;font-weight:600}',
  '.cbox-d{padding-left:20px;display:flex;flex-direction:column;gap:4px}',
  '#mfl-main{flex:1;display:flex;flex-direction:column;overflow:hidden}',
  '#mfl-bar{background:#0f0f22;padding:7px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #1c1c32;flex-shrink:0;flex-wrap:wrap}',
  '#mfl-bar h2{color:#e2b714;font-size:13px;font-weight:700;margin-right:auto}',
  '.ms{background:#0d0d1a;border:1px solid #1c1c32;color:#ccc;border-radius:5px;padding:3px 6px;font-size:11px;max-width:140px}',
  '.mn{background:#0d0d1a;border:1px solid #1c1c32;color:#ccc;border-radius:5px;padding:3px 6px;font-size:11px;width:46px}',
  '#mfl-st{padding:3px 12px;font-size:10px;color:#555;border-bottom:1px solid #0d0d1a;flex-shrink:0}',
  '#mfl-bd{overflow-y:auto;flex:1;scrollbar-width:thin;scrollbar-color:#1c1c32 transparent}',
  '.mg{padding:3px 12px 0}',
  '.mg-t{font-size:9px;color:#444;text-transform:uppercase;letter-spacing:.6px;padding:3px 0 2px;border-bottom:1px solid #131325}',
  '.pr{display:grid;grid-template-columns:36px 30px 1fr 22px 28px 26px 26px 96px;gap:4px;padding:2px 12px;align-items:center;border-bottom:1px solid #0d0d1a}',
  '.pr:hover{background:#0d0d1f}',
  '.pp{font-size:9px;font-weight:700;color:#555;background:#1a1a2a;border-radius:3px;padding:1px 3px;text-align:center}',
  '.pp.P{color:#3af24b;background:#0d1f0d}.pp.S{color:#FFCC00;background:#1a1800}.pp.FF{color:#ff9900;background:#1a0f00}.pp.SF{color:#ff5500;background:#200800}.pp.UF{color:#666;background:#111}',
  '.pslot{font-size:8px;color:#333;text-align:center;overflow:hidden;text-overflow:ellipsis}',
  '.pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ccc}',
  '.pa{text-align:center;font-size:10px;font-weight:600}.ph{text-align:center;font-size:9px;color:#555}',
  '.po{font-weight:700;text-align:right}.psc{font-size:10px;text-align:right}',
  '.pac{display:flex;gap:3px;justify-content:flex-end;align-items:center}',
  '.btn{border:none;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap}',
  '.bs{background:#e2b714;color:#0b0b18}.bs:hover{background:#f0c830}',
  '.bok{background:#1a3a1a;color:#3af24b;cursor:default;pointer-events:none}',
  '.bw{background:#333;color:#666;cursor:wait}.be{background:#3a0d0d;color:#ff5555}',
  '.bbl{background:#169fed;color:#fff}.bbl:hover{background:#1ab0ff}',
  '.bgr{background:#3af24b;color:#0b0b18}.bgr:hover{background:#4fff5a}',
  '.bgy{background:#1a1a2a;color:#888}.bgy:hover{color:#ccc}'
].join('');
document.head.appendChild(st);

// ── Panel HTML ───────────────────────────────────────────────
document.getElementById('mflsb')&&document.getElementById('mflsb').remove();
var pnl=document.createElement('div');pnl.id='mflsb';
pnl.innerHTML=
  '<div id="mflsb-w">'+
  '<div id="mfl-cfg">'+
    '<div class="cfg-t">📋 Termes du contrat</div>'+
    '<div class="cr"><label>Part revenus</label><input type="number" id="mfl-rev" value="5" min="0" max="20" step="0.5"> %</div>'+
    '<div class="cr"><label>Saisons</label><select id="mfl-seasons"><option value="1">1 saison</option><option value="2">2 saisons</option><option value="3">3 saisons</option></select></div>'+
    '<div class="cr"><label>Auto-renouvellement</label><input type="checkbox" id="mfl-autorenew"></div>'+
    '<div class="cr"><label>Expiration</label><select id="mfl-expiry"><option value="1">1 jour</option><option value="3" selected>3 jours</option><option value="7">7 jours</option></select></div>'+
    '<div class="cbox"><div class="cbox-h"><input type="checkbox" id="mfl-clause-mpt" onchange="document.getElementById(\'mfl-mpt-d\').style.display=this.checked?\'flex\':\'none\'"><label for="mfl-clause-mpt">⏱ Temps de jeu min.</label></div>'+
    '<div class="cbox-d" id="mfl-mpt-d" style="display:none">'+
      '<div class="cr"><label style="min-width:60px">Matchs min</label><input type="number" id="mfl-mpt-matches" value="10" min="1" max="26"></div>'+
      '<div class="cr"><label style="min-width:60px">Pénalité</label><input type="number" id="mfl-mpt-penalty" value="2" min="0" max="10" step="0.5"> %</div>'+
    '</div></div>'+
  '</div>'+
  '<div id="mfl-main">'+
    '<div id="mfl-bar"><h2>🏋️ MFL Squad Builder</h2>'+
      '<select class="ms" id="mfl-form">'+
        '<option>3-4-2-1</option><option>3-4-3</option><option>3-4-3 losange</option><option>3-5-2</option><option>3-5-2 B</option>'+
        '<option>4-1-2-1-2</option><option>4-1-2-1-2 compact</option><option>4-1-3-2</option><option>4-1-4-1</option><option>4-2-2-2</option>'+
        '<option>4-2-3-1</option><option>4-2-4</option><option>4-3-1-2</option><option value="4-3-2-1">4-3-2-1</option>'+
        '<option>4-3-3</option><option>4-3-3 att</option><option>4-3-3 def</option><option>4-3-3 faux 9</option>'+
        '<option>4-4-1-1</option><option>4-4-2</option><option>4-4-2 B</option>'+
        '<option>5-2-1-2</option><option>5-2-2-1</option><option>5-3-2</option><option>5-4-1</option>'+
      '</select>'+
      '<input class="mn" id="mfl-omin" type="number" value="1" min="1" max="99" placeholder="min">'+
      '<span style="color:#444">—</span>'+
      '<input class="mn" id="mfl-omax" type="number" value="99" min="1" max="99" placeholder="max">'+
      '<button class="btn bbl" onclick="mflGen()">▶ Générer</button>'+
      '<button class="btn bgr" id="mfl-all-btn" style="display:none" onclick="mflSignAll()">✅ Signer tout</button>'+
      '<button class="btn bgy" onclick="document.getElementById(\'mflsb\').remove()">✕</button>'+
    '</div>'+
    '<div id="mfl-st">Initialisation...</div>'+
    '<div id="mfl-bd"><div class="pr" style="font-size:9px;color:#333;padding-top:4px"><span>Poste</span><span>Slot</span><span>Joueur</span><span>Age</span><span>Tail.</span><span>OVR</span><span>Sc.</span><span></span></div></div>'+
  '</div></div>';
document.body.appendChild(pnl);

// ── Fonctions globales ───────────────────────────────────────
window.mflGen=function(){
  var clubId=window._MC;
  if(!clubId){document.getElementById('mfl-st').textContent='Erreur: lance depuis /clubs/XXXX/squad';return;}
  var formation=document.getElementById('mfl-form').value;
  if(!FORM[formation]){document.getElementById('mfl-st').textContent='Formation inconnue: '+formation;return;}
  var ovrMin=parseInt(document.getElementById('mfl-omin').value)||1;
  var ovrMax=parseInt(document.getElementById('mfl-omax').value)||99;
  var bd=document.getElementById('mfl-bd');
  bd.innerHTML='<div class="pr" style="font-size:9px;color:#333;padding-top:4px"><span>Poste</span><span>Slot</span><span>Joueur</span><span>Age</span><span>Tail.</span><span>OVR</span><span>Sc.</span><span></span></div>';
  document.getElementById('mfl-all-btn').style.display='none';
  var wallet=getW();
  if(!wallet){document.getElementById('mfl-st').textContent='Wallet introuvable';return;}
  document.getElementById('mfl-st').textContent='Chargement...';
  Promise.all([
    _of(API+'/players?ownerWalletAddress='+wallet+'&limit=500'),
    _of(API+'/contracts?period=currentSeason&clubId='+clubId)
  ]).then(function(rr){return Promise.all(rr.map(function(r){return r.json();}));})
  .then(function(dd){
    var allP=Array.isArray(dd[0])?dd[0]:dd[0].items||[];
    var existing=dd[1].items||dd[1]||[];
    var signedIds=new Set(existing.map(function(c){return typeof c.player==='object'?c.player&&c.player.id:c.player;}));
    var avail=allP.filter(function(p){
      var o=p.metadata&&p.metadata.overall||0;
      return o>=ovrMin&&o<=ovrMax&&!p.activeContract&&!signedIds.has(p.id)&&!(p.metadata&&p.metadata.retirementYears<=1);
    });
    document.getElementById('mfl-st').textContent=allP.length+' joueurs / '+avail.length+' disponibles / '+signedIds.size+' signés / Club '+clubId+(window._MT?' / 🔑 Token OK':' / ⚠️ Pas de token');
    if(avail.length<11){bd.innerHTML='<div style="padding:10px 12px;color:#ff5555">Seulement '+avail.length+' joueurs dispo — élargis OVR</div>';return;}
    var positions=FORM[formation];
    var starters=doAssign(avail,positions);
    var usedIds=new Set(starters.filter(Boolean).map(function(s){return s.player.id;}));
    var bups=doBackups(avail,usedIds,starters,formation);
    var PO=['G','GK','DC','CB','DG','LB','DD','RB','DLG','LWB','DLD','RWB','MDC','CDM','MC','CM','MG','LM','MD','RM','MOC','CAM','AT','AG','LW','AD','RW','BU','ST','CF'];
    function grpOf(pos){
      if(['G','GK'].indexOf(pos)>=0)return'🥅 Gardiens';
      if(['DC','CB','DG','LB','DD','RB','DLG','LWB','DLD','RWB'].indexOf(pos)>=0)return'🛡️ Défenseurs';
      if(['MDC','CDM','MC','CM','MG','LM','MD','RM'].indexOf(pos)>=0)return'⚙️ Milieux';
      if(['MOC','CAM','AT','AG','LW','AD','RW'].indexOf(pos)>=0)return'🎯 Offensifs';
      return'⚡ Attaquants';
    }
    var allSlots=[];
    starters.filter(Boolean).sort(function(a,b){return PO.indexOf(a.slotPos)-PO.indexOf(b.slotPos);}).forEach(function(s){allSlots.push(Object.assign({},s,{role:'Tit.'}));});
    Object.values(bups).forEach(function(bb){bb.forEach(function(b){allSlots.push(Object.assign({},b,{role:'Rem.'}));});});
    var groups={};
    allSlots.forEach(function(s){var sp=s.posKey||s.slotPos;if(sp&&sp.indexOf('/')>=0)sp=sp.split('/')[0];var g=grpOf(sp||s.pos);if(!groups[g])groups[g]=[];groups[g].push(s);});
    var p=gP();
    var cs=p.clauses.length?' / min '+p.clauses[0].nbMatches+'m pén.'+p.clauses[0].revenueSharePenalty/100+'%':'';
    var html='<div class="pr" style="font-size:9px;color:#333;padding-top:4px"><span>Poste</span><span>Slot</span><span>Joueur</span><span>Age</span><span>Tail.</span><span>OVR</span><span>Sc.</span><span></span></div>';
    html+='<div style="padding:3px 12px 5px;font-size:10px;color:#555;border-bottom:1px solid #131325">'+p.revenueShare/100+'% rev / '+p.nbSeasons+' saison(s) / exp.'+p.expirationDelay+'j'+(p.autoRenewByDefault?' / ♻️':'')+cs+'</div>';
    Object.keys(groups).forEach(function(grp){
      html+='<div class="mg"><div class="mg-t">'+grp+'</div></div>';
      groups[grp].forEach(function(sl){
        var m=sl.player.metadata||{},ovr=m.overall||0;
        var nm=(m.firstName&&m.firstName[0]||'')+'. '+(m.lastName||'?');
        var age=m.age||'?',h=m.height||'?';
        var cls=sl.fam==='poly'?'':sl.fam||'';
        var allPos=(m.positions||[]).join('/');
        var ageC=sl.role==='Tit.'?(age<23?'#3af24b':age>30?'#ff9900':'#888'):(age>32?'#ff9900':'#888');
        var signed=signedIds.has(sl.player.id);
        html+='<div class="pr">'+
          '<span class="pp '+cls+'" title="'+sl.pos+' (slot '+sl.slotPos+') fam:'+sl.fam+'">'+sl.pos+'</span>'+
          '<span class="pslot">'+sl.slotPos+'</span>'+
          '<span class="pn" title="'+allPos+'">'+nm+' <span style="color:#2a2a3a;font-size:9px">'+allPos+'</span></span>'+
          '<span class="pa" style="color:'+ageC+'">'+age+'</span>'+
          '<span class="ph">'+h+'</span>'+
          '<span class="po" style="color:'+oc(ovr)+'">'+ovr+'</span>'+
          '<span class="psc" style="color:'+oc(sl.sc)+'">'+sl.sc+'</span>'+
          '<span class="pac">'+
            '<span style="color:'+(sl.role==='Tit.'?'#e2b714':'#555')+';font-size:9px;font-weight:700">'+sl.role+'</span> '+
            (signed?'<span class="btn bok">✅</span>':'<button class="btn bs" data-pid="'+sl.player.id+'" onclick="mflSign('+sl.player.id+',this)">Signer</button>')+
          '</span>'+
        '</div>';
      });
    });
    var ain=allP.filter(function(p){return signedIds.has(p.id);});
    if(ain.length){
      html+='<div class="mg" style="margin-top:5px"><div class="mg-t" style="color:#2a4a2a">✅ Déjà dans le club ('+ain.length+')</div></div>';
      ain.forEach(function(p){var m=p.metadata||{};html+='<div class="pr" style="opacity:.3"><span class="pp P">'+(m.positions||['?'])[0]+'</span><span></span><span class="pn">'+(m.firstName&&m.firstName[0]||'')+'. '+(m.lastName||'?')+'</span><span class="pa">'+(m.age||'?')+'</span><span class="ph">'+(m.height||'?')+'</span><span class="po" style="color:'+oc(m.overall||0)+'">'+(m.overall||'?')+'</span><span></span><span class="pac"><span class="btn bok">✅</span></span></div>';});
    }
    bd.innerHTML=html;
    document.getElementById('mfl-all-btn').style.display='';
  }).catch(function(e){document.getElementById('mfl-st').textContent='Erreur: '+e.message;console.error('[MFL]',e);});
};

window.mflSign=function(playerId,btn){
  var clubId=window._MC;
  if(!window._MT){var t=findTok();if(t)window._MT='Bearer '+t;}
  if(!window._MT){btn.className='btn be';btn.textContent='Token?';return;}
  btn.className='btn bw';btn.textContent='...';
  var params=gP();
  _of(API+'/contracts/offers',{
    method:'POST',
    headers:{authorization:window._MT,'content-type':'application/json'},
    body:JSON.stringify(Object.assign({from:'CLUB',kind:'CONTRACT',playerId:playerId,clubId:clubId},params))
  }).then(function(res){
    if(res.ok){res.json().then(function(d){btn.className='btn bok';btn.textContent='✅ Signé';console.log('[MFL] Contrat #'+d.contractOfferId);});}
    else{res.text().then(function(e){btn.className='btn be';btn.textContent='Erreur';console.error('[MFL]',res.status,e);});}
  }).catch(function(e){btn.className='btn be';btn.textContent='!';console.error(e);});
};

window.mflSignAll=function(){
  var btns=[].slice.call(document.querySelectorAll('.bs'));
  var ab=document.getElementById('mfl-all-btn');ab.disabled=true;
  var i=0;
  function next(){
    if(i>=btns.length){ab.textContent='✅ Tous signés';ab.disabled=false;return;}
    ab.textContent=i+'/'+btns.length;
    var pid=parseInt(btns[i].getAttribute('data-pid'));
    if(!isNaN(pid))window.mflSign(pid,btns[i]);
    i++;setTimeout(next,500);
  }
  next();
};

document.getElementById('mfl-st').textContent=
  'Club '+(window._MC||'❌ introuvable')+
  (window._MT?' / 🔑 Token OK':' / ⚠️ Token absent')+
  ' / Wallet '+(getW()||'?').slice(0,10)+'...'+
  ' / Configure le contrat puis clique Générer';
})();
