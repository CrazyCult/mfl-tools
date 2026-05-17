// MFL Squad Builder v2 — github.com/TON_USER/mfl-tools
(function(){
'use strict';
var API='https://z519wdyajg.execute-api.us-east-1.amazonaws.com/prod';
var MAX_E=10000;
var TALL_POS={GK:1,G:1,CB:1,DC:1,ST:1,BU:1,LWB:1,DLG:1,RWB:1,DLD:1};


// Club ID depuis URL
var cm=location.href.match(/\/clubs\/(\d+)/);
window._MC=cm?parseInt(cm[1]):null;

// ── Token JWT ────────────────────────────────────────────────
function findTok(){
  var keys=['token','auth_token','access_token','authorization','bearer_token','jwt_token'];
  for(var i=0;i<keys.length;i++){
    var v=localStorage.getItem(keys[i])||sessionStorage.getItem(keys[i]);
    if(v){try{var p=JSON.parse(v);var t=(p&&p.data&&p.data.access&&p.data.access.token)||(p&&p.access&&p.access.token)||(p&&p.token);if(t)return t;}catch(e){}if(v.length>40&&v.indexOf('eyJ')===0)return v.replace('Bearer ','');}
  }
  for(var j=0;j<localStorage.length;j++){var val=localStorage.getItem(localStorage.key(j));if(!val||val.length<50)continue;try{var ff=_sjwt(JSON.parse(val),0);if(ff)return ff;}catch(e){}var mm=val.match(/eyJ[A-Za-z0-9._-]{40,}/);if(mm)return mm[0];}
  return null;
}
function _sjwt(o,d){if(d>5||!o)return null;if(typeof o==='string'&&o.indexOf('eyJ')===0&&o.split('.').length===3)return o;if(typeof o==='object'){var vv=Object.values(o);for(var i=0;i<vv.length;i++){var f=_sjwt(vv[i],d+1);if(f)return f;}}return null;}
var t0=findTok(); window._MT=t0?('Bearer '+t0):null;
var _of=window.fetch;
window.fetch=function(){var url=arguments[0],opts=arguments[1];if(typeof url==='string'&&url.indexOf('z519wdyajg')>=0){var auth=opts&&opts.headers&&(opts.headers.authorization||opts.headers.Authorization);if(auth&&auth.indexOf('Bearer ')===0)window._MT=auth;}return _of.apply(this,arguments);};
function getW(){if(window._MT){try{var p=JSON.parse(atob(window._MT.replace('Bearer ','').split('.')[1]));if(p.sub)return p.sub;}catch(e){}}var ee=performance.getEntriesByType('resource');for(var i=0;i<ee.length;i++){var m=ee[i].name.match(/[Ww]alletAddress=(0x[0-9a-f]{16})/i);if(m)return m[1];}for(var k in localStorage){var mv=(localStorage.getItem(k)||'').match(/0x[0-9a-f]{16}/i);if(mv)return mv[0];}return null;}

// Pagination: l'API MFL limite à ~400 joueurs/appel. On pagine via beforePlayerId
// (cursor = id du dernier joueur de la page précédente)
function fetchAllPlayers(wallet){
  return new Promise(function(resolve){
    var all=[],lastId=null,calls=0;
    function next(){
      calls++;
      if(calls>15){console.warn('[MFL] Pagination stop à 15 appels');resolve(all);return;}
      var url=API+'/players?ownerWalletAddress='+wallet+'&limit=400';
      if(lastId)url+='&beforePlayerId='+lastId;
      _of(url).then(function(r){return r.json();}).then(function(d){
        var batch=Array.isArray(d)?d:(d.items||[]);
        if(batch.length===0){resolve(all);return;}
        var ids={};all.forEach(function(p){ids[p.id]=1;});
        var newOnes=batch.filter(function(p){return!ids[p.id];});
        if(newOnes.length===0){resolve(all);return;}
        all=all.concat(newOnes);
        // Le dernier id de la page (le plus petit) sert de cursor pour la suite
        lastId=batch[batch.length-1].id;
        console.log('[MFL] Pagination: '+all.length+' joueurs chargés (appel #'+calls+')');
        if(newOnes.length<400){resolve(all);return;}
        next();
      }).catch(function(e){console.warn('[MFL] Pagination err:',e);resolve(all);});
    }
    next();
  });
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

// ── Calcul rating — IDENTIQUE à players.js ───────────────────
var W={
  G:{PAC:0,SHO:0,PAS:0,DRI:0,DEF:0,PHY:0,GK:1},GK:{PAC:0,SHO:0,PAS:0,DRI:0,DEF:0,PHY:0,GK:1},
  DC:{PAC:.02,SHO:0,PAS:.05,DRI:.09,DEF:.64,PHY:.20,GK:0},CB:{PAC:.02,SHO:0,PAS:.05,DRI:.09,DEF:.64,PHY:.20,GK:0},
  DG:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},LB:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  DD:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},RB:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  DLG:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},LWB:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  DLD:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},RWB:{PAC:.10,SHO:0,PAS:.19,DRI:.17,DEF:.44,PHY:.10,GK:0},
  MDC:{PAC:0,SHO:0,PAS:.28,DRI:.17,DEF:.40,PHY:.15,GK:0},CDM:{PAC:0,SHO:0,PAS:.28,DRI:.17,DEF:.40,PHY:.15,GK:0},
  MC:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},CM:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  MG:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},LM:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  MD:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},RM:{PAC:0,SHO:.12,PAS:.43,DRI:.29,DEF:.10,PHY:.06,GK:0},
  MOC:{PAC:.07,SHO:.21,PAS:.34,DRI:.38,DEF:0,PHY:0,GK:0},CAM:{PAC:.07,SHO:.21,PAS:.34,DRI:.38,DEF:0,PHY:0,GK:0},AT:{PAC:.07,SHO:.21,PAS:.34,DRI:.38,DEF:0,PHY:0,GK:0},
  AG:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0},LW:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0},
  AD:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0},RW:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0},
  BU:{PAC:.10,SHO:.46,PAS:.10,DRI:.29,DEF:0,PHY:.05,GK:0},ST:{PAC:.10,SHO:.46,PAS:.10,DRI:.29,DEF:0,PHY:.05,GK:0},
  CF:{PAC:.13,SHO:.23,PAS:.24,DRI:.40,DEF:0,PHY:0,GK:0}
};
// convertApiPositionToMatrix de players.js
var TOM={G:'GK',GK:'GK',DC:'CB',CB:'CB',DG:'LB',LB:'LB',LWB:'LB',DLG:'LB',DD:'RB',RB:'RB',RWB:'RB',DLD:'RB',MDC:'CDM',CDM:'CDM',MC:'CM',CM:'CM',MG:'LM',LM:'LM',MD:'RM',RM:'RM',MOC:'CAM',CAM:'CAM',AG:'LW',LW:'LW',AD:'RW',RW:'RW',BU:'ST',ST:'ST',AT:'CF',CF:'CF'};
// POSITION_FAMILIARITY de constants.js
var FAM={
  GK:{GK:'PRIMARY'},
  CB:{CB:'PRIMARY',LB:'FAIRLY_FAMILIAR',RB:'FAIRLY_FAMILIAR',CDM:'FAIRLY_FAMILIAR'},
  LB:{LB:'PRIMARY',LWB:'SECONDARY',CB:'FAIRLY_FAMILIAR',LM:'FAIRLY_FAMILIAR',RB:'SOMEWHAT_FAMILIAR'},
  RB:{RB:'PRIMARY',RWB:'SECONDARY',CB:'FAIRLY_FAMILIAR',RM:'FAIRLY_FAMILIAR',LB:'SOMEWHAT_FAMILIAR'},
  LWB:{LWB:'PRIMARY',LB:'SECONDARY',LM:'FAIRLY_FAMILIAR',LW:'FAIRLY_FAMILIAR'},
  RWB:{RWB:'PRIMARY',RB:'SECONDARY',RM:'FAIRLY_FAMILIAR',RW:'FAIRLY_FAMILIAR'},
  CDM:{CDM:'PRIMARY',CM:'FAIRLY_FAMILIAR',CB:'FAIRLY_FAMILIAR'},
  CM:{CM:'PRIMARY',CDM:'FAIRLY_FAMILIAR',CAM:'FAIRLY_FAMILIAR',LM:'FAIRLY_FAMILIAR',RM:'FAIRLY_FAMILIAR'},
  LM:{LM:'PRIMARY',CM:'FAIRLY_FAMILIAR',LW:'FAIRLY_FAMILIAR',LB:'FAIRLY_FAMILIAR',LWB:'FAIRLY_FAMILIAR'},
  RM:{RM:'PRIMARY',CM:'FAIRLY_FAMILIAR',RW:'FAIRLY_FAMILIAR',RB:'FAIRLY_FAMILIAR',RWB:'FAIRLY_FAMILIAR'},
  CAM:{CAM:'PRIMARY',CM:'FAIRLY_FAMILIAR',CF:'FAIRLY_FAMILIAR',LW:'SOMEWHAT_FAMILIAR',RW:'SOMEWHAT_FAMILIAR'},
  LW:{LW:'PRIMARY',LM:'FAIRLY_FAMILIAR',CF:'FAIRLY_FAMILIAR',ST:'SOMEWHAT_FAMILIAR',CAM:'SOMEWHAT_FAMILIAR'},
  RW:{RW:'PRIMARY',RM:'FAIRLY_FAMILIAR',CF:'FAIRLY_FAMILIAR',ST:'SOMEWHAT_FAMILIAR',CAM:'SOMEWHAT_FAMILIAR'},
  CF:{CF:'PRIMARY',ST:'SECONDARY',CAM:'FAIRLY_FAMILIAR',LW:'FAIRLY_FAMILIAR',RW:'FAIRLY_FAMILIAR'},
  ST:{ST:'PRIMARY',CF:'SECONDARY',LW:'SOMEWHAT_FAMILIAR',RW:'SOMEWHAT_FAMILIAR'}
};
// FAMILIARITY_PENALTIES de constants.js
var PEN={PRIMARY:0,SECONDARY:-1,FAIRLY_FAMILIAR:-5,SOMEWHAT_FAMILIAR:-8,UNFAMILIAR:-20};
var FR={PRIMARY:4,SECONDARY:3,FAIRLY_FAMILIAR:2,SOMEWHAT_FAMILIAR:1,UNFAMILIAR:0};

// Codes synonymes API/anglais. RWB et RB sont DIFFÉRENTS (postes distincts dans MFL).
// Seuls les codes ci-dessous sont des synonymes (même poste, codage différent).
var SYNO={
  G:'GK',GK:'GK',
  DC:'CB',CB:'CB',
  DG:'LB',LB:'LB',
  DD:'RB',RB:'RB',
  DLG:'LWB',LWB:'LWB',
  DLD:'RWB',RWB:'RWB',
  MDC:'CDM',CDM:'CDM',
  MC:'CM',CM:'CM',
  MG:'LM',LM:'LM',
  MD:'RM',RM:'RM',
  MOC:'CAM',CAM:'CAM',
  AG:'LW',LW:'LW',
  AD:'RW',RW:'RW',
  BU:'ST',ST:'ST',
  AT:'CF',CF:'CF'
};

// isNative: TRUE si le slot est explicitement dans positions[] du joueur
// (via codes synonymes API↔anglais). C'est le SEUL critère pour qu'un joueur
// soit candidat à un slot.
function isNative(pl,slot){
  var pos=pl.metadata&&pl.metadata.positions||[];
  var slotN=SYNO[slot]||slot;
  for(var i=0;i<pos.length;i++){
    if((SYNO[pos[i]]||pos[i])===slotN)return true;
  }
  return false;
}

// getFam: retourne la familiarité pour AFFICHAGE et CALCUL DE SCORE.
// Indique la pénalité MFL même pour les positions non-natives (info indicative).
function getFam(pl,slot){
  var pos=pl.metadata&&pl.metadata.positions||[];
  if(pos.length===0)return'UNFAMILIAR';
  var slotN=SYNO[slot]||slot;
  // PRIMARY: position[0] correspond au slot
  if((SYNO[pos[0]]||pos[0])===slotN)return'PRIMARY';
  // SECONDARY: position[1..] correspond au slot
  for(var i=1;i<pos.length;i++){
    if((SYNO[pos[i]]||pos[i])===slotN)return'SECONDARY';
  }
  // Non natif → matrice MFL pour la pénalité (FF/SF/UF)
  var f=FAM[SYNO[pos[0]]||pos[0]];
  if(f&&f[slotN])return f[slotN];
  return'UNFAMILIAR';
}

// calculatePositionRating — identique à players.js
function calcScore(pl,slot){
  var m=pl.metadata||{},w=W[slot];
  if(!w)return m.overall||50;
  var pen=PEN[getFam(pl,slot)];if(pen===undefined)pen=-20;
  var adj=function(s){return Math.max(0,(s||0)+pen);};
  var raw=adj(m.pace)*w.PAC+adj(m.shooting)*w.SHO+adj(m.passing)*w.PAS+
          adj(m.dribbling)*w.DRI+adj(m.defense)*w.DEF+adj(m.physical)*w.PHY+
          adj(m.goalkeeping||0)*w.GK;
  return Math.max(10,Math.min(99,Math.round(raw*Math.max(0.7,(pl.energy||MAX_E)/MAX_E))));
}

// Clé de tri: score (prioritaire) → familiarité → âge → taille
function sortKey(pl,slot,young){
  var sc=calcScore(pl,slot);
  var fr=FR[getFam(pl,slot)]||0;
  var m=pl.metadata||{},age=m.age||25,h=m.height||175;
  return sc*100000+fr*1000+((young?(40-age):age)*10)+(TALL_POS[slot]?Math.round(h/10):0);
}

// ── Algorithme d'assignation ─────────────────────────────────
// LOGIQUE:
// Pour chaque joueur, on calcule son score sur CHACUN de ses postes natifs (positions[]).
// On choisit gloutonnement la paire (joueur, slot) ayant le score le PLUS ÉLEVÉ.
// Ainsi Yates (MDC/MC/DC) ira en DC si son score y est plus haut qu'en MDC.
function doAssign(players,positions){
  var n=positions.length,m=players.length;
  var asgn=new Array(n).fill(-1),used=new Set(),done=new Array(n).fill(false);

  // Construit toutes les paires possibles (player, slot) où slot est dans positions[] du joueur
  // avec leur score calculé
  function allPairs(){
    var pairs=[];
    for(var pi=0;pi<m;pi++){
      if(used.has(pi))continue;
      for(var si=0;si<n;si++){
        if(done[si])continue;
        if(!isNative(players[pi],positions[si]))continue;
        pairs.push({pi:pi,si:si,sc:calcScore(players[pi],positions[si])});
      }
    }
    pairs.sort(function(a,b){return b.sc-a.sc;});
    return pairs;
  }

  // Boucle: prend la meilleure paire (score le plus haut),
  // assigne, puis recommence avec les joueurs et slots restants
  while(true){
    var pairs=allPairs();
    if(pairs.length===0)break;
    var best=pairs[0];
    asgn[best.si]=best.pi;
    used.add(best.pi);
    done[best.si]=true;
  }

  return asgn.map(function(pi,si){
    if(pi===-1)return null;
    var p=players[pi],slotPos=positions[si];
    var pos=p.metadata&&p.metadata.positions||[];
    return{player:p,pos:pos[0]||slotPos,slotPos:slotPos,sc:calcScore(p,slotPos),fam:getFam(p,slotPos)};
  });
}

// ── Suggestion de formation ──────────────────────────────────
// Compte les joueurs par poste natif principal, puis trouve la formation
// qui maximise la couverture native (PRIMARY/SECONDARY uniquement)
function suggestFormation(players){
  var best={name:null,score:-1,filled:0};
  Object.keys(FORM).forEach(function(fname){
    var positions=FORM[fname];
    var assignment=doAssign(players,positions);
    var filled=assignment.filter(function(x){return x!==null;}).length;
    // Score total: somme des scores des joueurs assignés
    var totalScore=assignment.reduce(function(acc,x){return acc+(x?x.sc:0);},0);
    // Critère: d'abord nb de slots remplis, puis score total
    if(filled>best.filled||(filled===best.filled&&totalScore>best.score)){
      best={name:fname,score:totalScore,filled:filled};
    }
  });
  return best;
}

// ── Remplaçants ──────────────────────────────────────────────
// 1 remplaçant par SLOT UNIQUE de la formation (pour faire des rotations)
// Même algorithme que doAssign: meilleure paire (joueur, slot) globale
// où le slot est dans positions[] du joueur ET le slot existe dans la formation
function doBackups(players,usedIds,starters,formation){
  var positions=FORM[formation]||[];
  // Slots uniques de la formation
  var uniqueSlots=[];
  positions.forEach(function(s){if(uniqueSlots.indexOf(s)<0)uniqueSlots.push(s);});

  var remaining=players.filter(function(p){return!usedIds.has(p.id);});
  var n=uniqueSlots.length,m=remaining.length;
  var asgn=new Array(n).fill(-1),used=new Set(),done=new Array(n).fill(false);

  function allPairs(){
    var pairs=[];
    for(var pi=0;pi<m;pi++){
      if(used.has(pi))continue;
      for(var si=0;si<n;si++){
        if(done[si])continue;
        if(!isNative(remaining[pi],uniqueSlots[si]))continue;
        pairs.push({pi:pi,si:si,sc:calcScore(remaining[pi],uniqueSlots[si])});
      }
    }
    pairs.sort(function(a,b){return b.sc-a.sc;});
    return pairs;
  }

  while(true){
    var pairs=allPairs();
    if(pairs.length===0)break;
    var best=pairs[0];
    asgn[best.si]=best.pi;
    used.add(best.pi);
    done[best.si]=true;
  }

  var result={};
  asgn.forEach(function(pi,si){
    if(pi===-1)return;
    var p=remaining[pi],slot=uniqueSlots[si];
    var pos=p.metadata&&p.metadata.positions||[];
    result[slot]=[{player:p,pos:pos[0]||slot,slotPos:slot,sc:calcScore(p,slot),fam:getFam(p,slot)}];
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
  '.pr{display:grid;grid-template-columns:38px 28px 1fr 22px 22px 22px 22px 22px 22px 24px 28px 28px 90px;gap:3px;padding:2px 12px;align-items:center;border-bottom:1px solid #0d0d1a}',
  '.pr:hover{background:#0d0d1f}',
  '.pp{font-size:9px;font-weight:700;background:#1a1a2a;border-radius:3px;padding:1px 3px;text-align:center;color:#555}',
  '.pp.PRIMARY{color:#3af24b;background:#0d1f0d}',
  '.pp.SECONDARY{color:#FFCC00;background:#1a1800}',
  '.pp.FAIRLY_FAMILIAR{color:#ff9900;background:#1a0f00}',
  '.pp.SOMEWHAT_FAMILIAR{color:#ff5500;background:#200800}',
  '.pp.UNFAMILIAR{color:#666;background:#111}',
  '.pslot{font-size:8px;color:#333;text-align:center}',
  '.pn{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#ccc}',
  '.pa{text-align:center;font-size:10px;font-weight:600}',
  '.ph{text-align:center;font-size:9px;color:#555}',
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

// ── Panel ────────────────────────────────────────────────────
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
  '<div class="cbox"><div class="cbox-h"><input type="checkbox" id="mfl-clause-mpt" onchange="document.getElementById(\'mfl-mpt-d\').style.display=this.checked?\'flex\':\'none\'"><label>⏱ Temps de jeu min.</label></div>'+
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
  '<label style="display:flex;align-items:center;gap:4px;font-size:10px;color:#888;cursor:pointer"><input type="checkbox" id="mfl-excl-ret" style="accent-color:#e2b714"> ⚠️ret</label>'+
  '<label style="display:flex;align-items:center;gap:4px;font-size:10px;color:#888;cursor:pointer"><input type="checkbox" id="mfl-excl-con" checked style="accent-color:#e2b714"> 📋contrat</label>'+
  '<button class="btn bbl" onclick="mflGen()">▶ Générer</button>'+
  '<button class="btn bbl" onclick="mflSuggest()" title="Trouve la meilleure formation pour ce wallet">🎯 Suggérer</button>'+
  '<button class="btn bgr" id="mfl-all-btn" style="display:none" onclick="mflSignAll()">✅ Signer tout</button>'+
  '<button class="btn bgy" onclick="document.getElementById(\'mflsb\').remove()">✕</button>'+
  '</div>'+
  '<div id="mfl-st">Initialisation...</div>'+
  '<div id="mfl-bd"></div>'+
'</div></div>';
document.body.appendChild(pnl);

// ── Génération ───────────────────────────────────────────────
window.mflGen=function(){
  var clubId=window._MC;
  if(!clubId){document.getElementById('mfl-st').textContent='Erreur: lance depuis /clubs/XXXX/squad';return;}
  var formation=document.getElementById('mfl-form').value;
  if(!FORM[formation]){document.getElementById('mfl-st').textContent='Formation inconnue';return;}
  var ovrMin=parseInt(document.getElementById('mfl-omin').value)||1;
  var ovrMax=parseInt(document.getElementById('mfl-omax').value)||99;
  var exclRet=document.getElementById('mfl-excl-ret').checked;
  var exclCon=document.getElementById('mfl-excl-con').checked;
  var bd=document.getElementById('mfl-bd');
  bd.innerHTML='<div style="padding:10px 12px;color:#444">⏳ Chargement...</div>';
  document.getElementById('mfl-all-btn').style.display='none';
  var wallet=getW();
  if(!wallet){document.getElementById('mfl-st').textContent='Wallet introuvable';return;}
  document.getElementById('mfl-st').textContent='Chargement...';

  Promise.all([
    fetchAllPlayers(wallet),
    _of(API+'/contracts?period=currentSeason&clubId='+clubId).then(function(r){return r.json();})
  ]).then(function(dd){
    var allP=dd[0]||[];
    var existing=dd[1].items||dd[1]||[];
    var signedIds=new Set(existing.map(function(c){return typeof c.player==='object'?c.player&&c.player.id:c.player;}));
    var avail=allP.filter(function(p){
      var o=p.metadata&&p.metadata.overall||0;
      if(o<ovrMin||o>ovrMax)return false;
      // Toujours exclure les vraiment retraités (retirementYears=0)
      if(p.metadata&&p.metadata.retirementYears===0)return false;
      // Contrat: exclure uniquement si sous contrat avec UN AUTRE club
      if(exclCon&&p.activeContract&&p.activeContract.club&&p.activeContract.club.id!==clubId)return false;
      // Filtre retraite optionnel: case cochée = exclure aussi les 1 saison restante
      if(exclRet&&p.metadata&&p.metadata.retirementYears!==undefined&&p.metadata.retirementYears<=1)return false;
      return true;
    });
    // Debug: comptage par poste natif principal
    var byPos={},excluded={ovr:0,con:0,ret:0,retraite:0,kept:0},excludedPlayers={con:[],ret:[],retraite:[]};
    allP.forEach(function(p){
      var m=p.metadata||{},o=m.overall||0;
      var nm=(m.firstName&&m.firstName[0]||'?')+'.'+(m.lastName||'?')+' OVR'+o+' '+(m.positions||['?']).join('/');
      if(o<ovrMin||o>ovrMax){excluded.ovr++;return;}
      if(m.retirementYears===0){excluded.retraite++;excludedPlayers.retraite.push(nm);return;}
      if(exclCon&&p.activeContract&&p.activeContract.club&&p.activeContract.club.id!==clubId){
        excluded.con++;excludedPlayers.con.push(nm+' (club#'+p.activeContract.club.id+')');return;
      }
      if(exclRet&&m.retirementYears!==undefined&&m.retirementYears<=1){
        excluded.ret++;excludedPlayers.ret.push(nm+' (ret:'+m.retirementYears+')');return;
      }
      excluded.kept++;
      var pos0=(m.positions||['?'])[0];
      byPos[pos0]=(byPos[pos0]||0)+1;
    });
    console.log('[MFL] === Joueurs disponibles après filtres ===');
    console.log('[MFL] Par poste principal:',byPos);
    console.log('[MFL] Exclus:',excluded,'/ Filtres: OVR='+ovrMin+'-'+ovrMax+' exclRet='+exclRet+' exclCon='+exclCon+' clubId='+clubId);
    if(excludedPlayers.con.length)console.log('[MFL] Exclus par CONTRAT:',excludedPlayers.con);
    if(excludedPlayers.ret.length)console.log('[MFL] Exclus par RETRAITE:',excludedPlayers.ret);
    var baseStatus=allP.length+' joueurs / '+avail.length+' dispo / '+signedIds.size+' signés / Club '+clubId+(window._MT?' / 🔑 Token OK':' / ⚠️ Pas de token');
    document.getElementById('mfl-st').textContent=window._mflSuggestMsg||baseStatus;
    window._mflSuggestMsg=null;
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
    var GROUP_SLOTS={
      '🥅 Gardiens':['GK','G'],
      '🛡️ Défenseurs':['CB','DC','LB','DG','RB','DD','LWB','DLG','RWB','DLD'],
      '⚙️ Milieux':['CDM','MDC','CM','MC','LM','MG','RM','MD'],
      '🎯 Offensifs':['MOC','CAM','AT','AG','LW','AD','RW'],
      '⚡ Attaquants':['ST','BU','CF']
    };

    // Stocke l'état global pour les interactions (dropdowns, ajout +)
    window._mflState={
      avail:avail,
      signedIds:signedIds,
      formation:formation,
      starters:starters,
      bups:bups,
      extras:window._mflState&&window._mflState.extras||{} // ajouts manuels
    };

    // Construit la liste avec les VIDES inclus, dans l'ordre de la formation
    var allSlots=[];
    starters.forEach(function(s,i){
      if(s){
        allSlots.push(Object.assign({},s,{role:'Tit.',_order:PO.indexOf(s.slotPos)}));
      }else{
        allSlots.push({_empty:true,slotPos:positions[i],_order:PO.indexOf(positions[i])});
      }
    });
    allSlots.sort(function(a,b){return a._order-b._order;});
    Object.values(bups).forEach(function(bb){bb.forEach(function(b){allSlots.push(Object.assign({},b,{role:'Rem.'}));});});
    // Ajoute les extras manuels
    Object.keys(window._mflState.extras).forEach(function(grp){
      window._mflState.extras[grp].forEach(function(pid){
        var p=avail.find(function(x){return x.id===pid;});
        if(p){
          var pos0=(p.metadata.positions||['?'])[0];
          allSlots.push({player:p,pos:pos0,slotPos:pos0,sc:calcScore(p,pos0),fam:'PRIMARY',role:'Rem.',_extra:true,_extraGrp:grp});
        }
      });
    });

    var groups={};
    allSlots.forEach(function(s){
      var sp=s._empty?s.slotPos:(s.posKey||s.slotPos.split('/')[0]);
      var g=s._extraGrp||grpOf(sp);
      if(!groups[g])groups[g]=[];
      groups[g].push(s);
    });

    var p=gP();
    var cs=p.clauses.length?' / min '+p.clauses[0].nbMatches+'m pén.'+p.clauses[0].revenueSharePenalty/100+'%':'';
    var emptyCount=allSlots.filter(function(s){return s._empty;}).length;
    var html='<div class="pr" style="font-size:9px;color:#333;padding-top:4px;grid-template-columns:38px 28px 1fr 18px 18px 18px 18px 18px 18px 22px 26px 26px 90px"><span>Poste</span><span>Slot</span><span>Joueur</span><span title="Pace">PAC</span><span title="Shooting">SHO</span><span title="Passing">PAS</span><span title="Dribbling">DRI</span><span title="Defense">DEF</span><span title="Physical">PHY</span><span>Âge</span><span>OVR</span><span>Sc.</span><span></span></div>';
    html+='<div style="padding:3px 12px 5px;font-size:10px;color:#555;border-bottom:1px solid #131325">'+p.revenueShare/100+'% rev / '+p.nbSeasons+' saison(s) / exp.'+p.expirationDelay+'j'+(p.autoRenewByDefault?' / ♻️':'')+cs+(emptyCount>0?' / ⚠️ '+emptyCount+' slot(s) vide(s) - pas de joueur natif':'')+'</div>';

    // IDs des joueurs déjà utilisés dans la compo (pour exclure du dropdown)
    var usedPlayerIds=new Set();
    allSlots.forEach(function(s){if(s.player)usedPlayerIds.add(s.player.id);});

    Object.keys(groups).forEach(function(grp){
      html+='<div class="mg"><div class="mg-t">'+grp+'  <span style="cursor:pointer;color:#3af24b;font-weight:700;margin-left:8px" onclick="mflAddExtra(\''+grp.replace(/'/g,"\\'")+'\')" title="Ajouter un remplaçant">+</span></div></div>';
      groups[grp].forEach(function(sl,slIdx){
        // Slot vide
        if(sl._empty){
          // Dropdown vide aussi pour permettre d'ajouter manuellement
          var natives=avail.filter(function(p){return!usedPlayerIds.has(p.id)&&isNative(p,sl.slotPos);});
          natives.sort(function(a,b){return calcScore(b,sl.slotPos)-calcScore(a,sl.slotPos);});
          var dropOpts='<option value="">— vide —</option>';
          natives.forEach(function(p){
            var mm=p.metadata||{};
            dropOpts+='<option value="'+p.id+'">'+(mm.firstName&&mm.firstName[0]||'')+'.'+(mm.lastName||'?')+' ('+(mm.positions||[]).join('/')+', OVR'+mm.overall+', sc:'+calcScore(p,sl.slotPos)+')</option>';
          });
          html+='<div class="pr" style="opacity:.6;background:#1a0a0a;grid-template-columns:38px 28px 1fr 18px 18px 18px 18px 18px 18px 22px 26px 26px 90px">'+
            '<span class="pp UNFAMILIAR">—</span>'+
            '<span class="pslot">'+sl.slotPos+'</span>'+
            '<select style="background:#0d0d1a;border:1px solid #1c1c32;color:#ff9966;font-size:11px;padding:1px 3px;width:100%" onchange="mflPickPlayer(this,\''+sl.slotPos+'\')">'+dropOpts+'</select>'+
            '<span></span><span></span><span></span><span></span><span></span><span></span>'+
            '<span></span><span></span><span></span><span></span>'+
            '</div>';
          return;
        }

        var m=sl.player.metadata||{},ovr=m.overall||0;
        var nm=(m.firstName&&m.firstName[0]||'')+'.'+(m.lastName||'?');
        var age=m.age||'?';
        var allPos=(m.positions||[]).join('/');
        var ry=m.retirementYears;
        var retBadge='';
        if(ry===1)retBadge=' <span style="color:#ff3333;font-weight:700" title="1 saison restante">⏳1</span>';
        else if(ry===2)retBadge=' <span style="color:#ff9900;font-weight:700" title="2 saisons restantes">⏳2</span>';
        else if(ry===3)retBadge=' <span style="color:#e2b714;font-weight:700" title="3 saisons restantes">⏳3</span>';
        var ageC=sl.role==='Tit.'?(age<23?'#3af24b':age>30?'#ff9900':'#888'):(age>32?'#ff9900':'#888');
        var signed=signedIds.has(sl.player.id);
        var famCls=sl.fam==='poly'?'':sl.fam||'UNFAMILIAR';

        // Alternatives pour ce slot (natifs au slot, pas déjà utilisés)
        var slotTarget=sl.slotPos;
        var alts=avail.filter(function(p){return p.id!==sl.player.id&&!usedPlayerIds.has(p.id)&&isNative(p,slotTarget);});
        alts.sort(function(a,b){return calcScore(b,slotTarget)-calcScore(a,slotTarget);});
        // Limite à 10 alternatives
        alts=alts.slice(0,10);
        var dropdown='';
        if(alts.length>0){
          dropdown='<option value="">'+nm+' ✓</option>';
          alts.forEach(function(p){
            var mm=p.metadata||{};
            dropdown+='<option value="'+p.id+'">'+(mm.firstName&&mm.firstName[0]||'')+'.'+(mm.lastName||'?')+' ('+(mm.positions||[]).join('/')+', OVR'+mm.overall+', sc:'+calcScore(p,slotTarget)+')</option>';
          });
        }

        var playerCell=alts.length>0
          ? '<select style="background:#0d0d1a;border:1px solid #1c1c32;color:#ccc;font-size:11px;padding:1px 3px;max-width:200px" onchange="mflSwap(this,'+sl.player.id+',\''+slotTarget+'\')">'+dropdown+'</select>'+retBadge+' <span style="color:#2a2a3a;font-size:9px">'+allPos+'</span>'
          : '<span class="pn" title="'+allPos+'">'+nm+retBadge+' <span style="color:#2a2a3a;font-size:9px">'+allPos+'</span></span>';

        html+='<div class="pr" style="grid-template-columns:38px 28px 1fr 18px 18px 18px 18px 18px 18px 22px 26px 26px 90px">'+
          '<span class="pp '+famCls+'" title="'+sl.pos+' → '+sl.slotPos+' ('+sl.fam+')">'+sl.pos+'</span>'+
          '<span class="pslot">'+sl.slotPos+'</span>'+
          playerCell+
          '<span class="pa" style="color:'+oc(m.pace||0)+'">'+(m.pace||0)+'</span>'+
          '<span class="pa" style="color:'+oc(m.shooting||0)+'">'+(m.shooting||0)+'</span>'+
          '<span class="pa" style="color:'+oc(m.passing||0)+'">'+(m.passing||0)+'</span>'+
          '<span class="pa" style="color:'+oc(m.dribbling||0)+'">'+(m.dribbling||0)+'</span>'+
          '<span class="pa" style="color:'+oc(m.defense||0)+'">'+(m.defense||0)+'</span>'+
          '<span class="pa" style="color:'+oc(m.physical||0)+'">'+(m.physical||0)+'</span>'+
          '<span class="pa" style="color:'+ageC+'">'+age+'</span>'+
          '<span class="po" style="color:'+oc(ovr)+'">'+ovr+'</span>'+
          '<span class="psc" style="color:'+oc(sl.sc)+'">'+sl.sc+'</span>'+
          '<span class="pac"><span style="color:'+(sl.role==='Tit.'?'#e2b714':'#555')+';font-size:9px;font-weight:700">'+sl.role+'</span> '+
          (signed?'<span class="btn bok">✅</span>':'<button class="btn bs" data-pid="'+sl.player.id+'" onclick="mflSign('+sl.player.id+',this)">Signer</button>')+
          '</span></div>';
      });
    });

    var ain=allP.filter(function(p){return signedIds.has(p.id);});
    if(ain.length){
      html+='<div class="mg" style="margin-top:5px"><div class="mg-t" style="color:#2a4a2a">✅ Déjà dans le club ('+ain.length+')</div></div>';
      ain.forEach(function(p){var m=p.metadata||{};html+='<div class="pr" style="opacity:.3"><span class="pp PRIMARY">'+(m.positions||['?'])[0]+'</span><span></span><span class="pn">'+(m.firstName&&m.firstName[0]||'')+'. '+(m.lastName||'?')+'</span><span class="pa">'+(m.pace||0)+'</span><span class="pa">'+(m.shooting||0)+'</span><span class="pa">'+(m.passing||0)+'</span><span class="pa">'+(m.dribbling||0)+'</span><span class="pa">'+(m.defense||0)+'</span><span class="pa">'+(m.physical||0)+'</span><span class="pa">'+(m.age||'?')+'</span><span class="po" style="color:'+oc(m.overall||0)+'">'+(m.overall||'?')+'</span><span></span><span class="pac"><span class="btn bok">✅</span></span></div>';});
    }
    bd.innerHTML=html;
    document.getElementById('mfl-all-btn').style.display='';
  }).catch(function(e){document.getElementById('mfl-st').textContent='Erreur: '+e.message;console.error('[MFL]',e);});
};

// Suggère la meilleure formation pour le wallet actuel
window.mflSuggest=function(){
  var ovrMin=parseInt(document.getElementById('mfl-omin').value)||1;
  var ovrMax=parseInt(document.getElementById('mfl-omax').value)||99;
  var exclRet=document.getElementById('mfl-excl-ret').checked;
  var exclCon=document.getElementById('mfl-excl-con').checked;
  var wallet=getW();
  if(!wallet){document.getElementById('mfl-st').textContent='Wallet introuvable';return;}
  var clubId=window._MC;
  document.getElementById('mfl-st').textContent='🎯 Recherche meilleure formation...';
  Promise.all([
    fetchAllPlayers(wallet),
    clubId?_of(API+'/contracts?period=currentSeason&clubId='+clubId).then(function(r){return r.json();}):Promise.resolve([])
  ]).then(function(dd){
    var allP=dd[0]||[];
    var existing=dd[1].items||dd[1]||[];
    var signedIds=new Set(existing.map(function(c){return typeof c.player==='object'?c.player&&c.player.id:c.player;}));
    var avail=allP.filter(function(p){
      var o=p.metadata&&p.metadata.overall||0;
      if(o<ovrMin||o>ovrMax)return false;
      if(p.metadata&&p.metadata.retirementYears===0)return false;
      if(exclCon&&p.activeContract&&p.activeContract.club&&p.activeContract.club.id!==clubId)return false;
      if(exclRet&&p.metadata&&p.metadata.retirementYears!==undefined&&p.metadata.retirementYears<=1)return false;
      return true;
    });
    // Teste toutes les formations
    var results=[];
    Object.keys(FORM).forEach(function(fname){
      var assignment=doAssign(avail,FORM[fname]);
      var filled=assignment.filter(function(x){return x!==null;}).length;
      var total=assignment.reduce(function(acc,x){return acc+(x?x.sc:0);},0);
      var avg=filled>0?Math.round(total/filled):0;
      results.push({name:fname,filled:filled,total:total,avg:avg});
    });
    results.sort(function(a,b){
      if(b.filled!==a.filled)return b.filled-a.filled;
      return b.total-a.total;
    });
    var top5=results.slice(0,5);
    var best=top5[0];
    // Sélectionne la meilleure dans le dropdown et flash-highlight
    var sel=document.getElementById('mfl-form');
    for(var i=0;i<sel.options.length;i++){
      if(sel.options[i].value===best.name||sel.options[i].text===best.name){
        sel.selectedIndex=i;break;
      }
    }
    // Mémorise le message pour qu'il survive à mflGen
    var msg='🎯 Choisi: '+best.name+' ('+best.filled+'/11 natifs, sc~'+best.avg+') | Top5: '+
      top5.slice(1).map(function(r){return r.name+'('+r.filled+'/'+r.avg+')';}).join(' / ');
    window._mflSuggestMsg=msg;
    // Flash visuel sur le select
    sel.style.boxShadow='0 0 8px #e2b714';sel.style.borderColor='#e2b714';
    setTimeout(function(){sel.style.boxShadow='';sel.style.borderColor='';},1500);
    document.getElementById('mfl-st').textContent=msg;
    window.mflGen();
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
    if(res.ok){res.json().then(function(d){btn.className='btn bok';btn.textContent='✅ Signé';console.log('[MFL] #'+d.contractOfferId);});}
    else{res.text().then(function(e){btn.className='btn be';btn.textContent='Erreur';console.error('[MFL]',res.status,e);});}
  }).catch(function(e){btn.className='btn be';btn.textContent='!';console.error(e);});
};

window.mflSignAll=function(){
  var btns=[].slice.call(document.querySelectorAll('.bs'));
  var ab=document.getElementById('mfl-all-btn');ab.disabled=true;
  var i=0;
  function next(){if(i>=btns.length){ab.textContent='✅ Tous signés';ab.disabled=false;return;}ab.textContent=i+'/'+btns.length;var pid=parseInt(btns[i].getAttribute('data-pid'));if(!isNaN(pid))window.mflSign(pid,btns[i]);i++;setTimeout(next,500);}
  next();
};

// Échange un joueur pour un slot donné (dropdown)
window.mflSwap=function(sel,oldPlayerId,slot){
  var newPid=parseInt(sel.value);
  if(!newPid){sel.value='';return;} // user a remis l'option par défaut, on ne change rien
  var st=window._mflState;if(!st)return;
  // Remplace dans starters
  for(var i=0;i<st.starters.length;i++){
    if(st.starters[i]&&st.starters[i].player.id===oldPlayerId&&st.starters[i].slotPos===slot){
      var newP=st.avail.find(function(p){return p.id===newPid;});
      if(newP){
        var pos=newP.metadata.positions||[];
        st.starters[i]={player:newP,pos:pos[0]||slot,slotPos:slot,sc:calcScore(newP,slot),fam:getFam(newP,slot)};
        // Force regen
        window.mflGen();
      }
      return;
    }
  }
  // Si pas trouvé dans starters, on regarde les remplaçants
  Object.keys(st.bups).forEach(function(slotKey){
    st.bups[slotKey]=st.bups[slotKey].filter(function(b){
      if(b.player.id!==oldPlayerId)return true;
      var newP=st.avail.find(function(p){return p.id===newPid;});
      if(newP){
        var pos=newP.metadata.positions||[];
        st.bups[slotKey].push({player:newP,pos:pos[0]||slot,slotPos:slot,sc:calcScore(newP,slot),fam:getFam(newP,slot)});
      }
      return false;
    });
  });
  window.mflGen();
};

// Choisit un joueur pour un slot vide
window.mflPickPlayer=function(sel,slot){
  var pid=parseInt(sel.value);if(!pid)return;
  var st=window._mflState;if(!st)return;
  var newP=st.avail.find(function(p){return p.id===pid;});
  if(!newP)return;
  // Trouve le slot vide dans starters et le remplit
  for(var i=0;i<st.starters.length;i++){
    if(!st.starters[i]&&FORM[st.formation][i]===slot){
      var pos=newP.metadata.positions||[];
      st.starters[i]={player:newP,pos:pos[0]||slot,slotPos:slot,sc:calcScore(newP,slot),fam:getFam(newP,slot)};
      window.mflGen();
      return;
    }
  }
};

// Affiche une dropdown pour ajouter un joueur extra à un groupe
window.mflAddExtra=function(grp){
  var st=window._mflState;if(!st)return;
  var GROUP_NATIVES={
    '🥅 Gardiens':['GK','G'],
    '🛡️ Défenseurs':['CB','DC','LB','DG','RB','DD','LWB','DLG','RWB','DLD'],
    '⚙️ Milieux':['CDM','MDC','CM','MC','LM','MG','RM','MD'],
    '🎯 Offensifs':['MOC','CAM','AT','AG','LW','AD','RW'],
    '⚡ Attaquants':['ST','BU','CF']
  };
  var slots=GROUP_NATIVES[grp]||[];
  // Joueurs natifs dans ce groupe et non utilisés
  var usedIds=new Set();
  st.starters.forEach(function(s){if(s)usedIds.add(s.player.id);});
  Object.values(st.bups).forEach(function(bb){bb.forEach(function(b){usedIds.add(b.player.id);});});
  Object.keys(st.extras).forEach(function(g){st.extras[g].forEach(function(id){usedIds.add(id);});});
  var cands=st.avail.filter(function(p){
    if(usedIds.has(p.id))return false;
    return slots.some(function(s){return isNative(p,s);});
  });
  if(cands.length===0){alert('Aucun joueur natif disponible pour '+grp);return;}
  // Trie par meilleur score sur le meilleur poste du groupe
  cands.sort(function(a,b){
    var sa=slots.reduce(function(m,s){return isNative(a,s)?Math.max(m,calcScore(a,s)):m;},0);
    var sb=slots.reduce(function(m,s){return isNative(b,s)?Math.max(m,calcScore(b,s)):m;},0);
    return sb-sa;
  });
  // Crée une dropdown modale rapide via prompt-like
  var msg='Choisis le joueur à ajouter en remplaçant pour '+grp+':\n\n';
  cands.slice(0,20).forEach(function(p,i){
    var m=p.metadata;
    msg+=(i+1)+'. '+(m.firstName||'')+' '+(m.lastName||'')+' ('+(m.positions||[]).join('/')+', OVR'+m.overall+', âge '+m.age+')\n';
  });
  msg+='\nTape le numéro (1-'+Math.min(20,cands.length)+') ou annule:';
  var ans=prompt(msg);
  if(!ans)return;
  var idx=parseInt(ans)-1;
  if(idx<0||idx>=cands.length||isNaN(idx)){alert('Choix invalide');return;}
  if(!st.extras[grp])st.extras[grp]=[];
  st.extras[grp].push(cands[idx].id);
  window.mflGen();
};

document.getElementById('mfl-st').textContent=
  'Club '+(window._MC||'❌ introuvable')+
  (window._MT?' / 🔑 Token OK':' / ⚠️ Token absent')+
  ' / Wallet '+(getW()||'?').slice(0,10)+'...'+
  ' / Configure le contrat puis clique Générer';
})();
