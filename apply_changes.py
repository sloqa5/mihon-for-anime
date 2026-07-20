#!/usr/bin/env python3
import shutil

filepath = '/home/user/mihon-for-anime/index.html'
outpath = '/home/user/mihon-for-anime/index.html'
copypath = '/home/user/mihon-for-anime/ironsky.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

original_len = len(content)
print(f"Loaded file: {original_len} bytes")

changes = []

# ─── CHANGE 1: Split rawIPS from baseIPS, add buildingIncome ───
old1 = """function baseIPS(){
  return ACD.reduce((s,a)=>{
    const cnt=S.owned[a.id]||0;if(!cnt)return s;
    let localIPS=a.ips*cnt;
    if((a.id==='f22'||a.id==='f35')&&(S.cmdLvl['eagle']||S.cmdLvl['raptor']))localIPS*=eliteBonus();
    return s+localIPS;
  },0);
}
function ips(){return baseIPS()*calcMods().income;}
function fleet(){return Object.values(S.owned).reduce((a,b)=>a+b,0);}
function warPower(){return Math.floor(baseIPS()*12*calcMods().income*calcMods().war);}"""

new1 = """function rawIPS(){
  return ACD.reduce((s,a)=>{
    const cnt=S.owned[a.id]||0;if(!cnt)return s;
    let localIPS=a.ips*cnt;
    if((a.id==='f22'||a.id==='f35')&&(S.cmdLvl['eagle']||S.cmdLvl['raptor']))localIPS*=eliteBonus();
    return s+localIPS;
  },0);
}
const BLDG_INCOME={apron:15,tower:30,hangar3:60,radar:120,ops:200,runway2:300,e2:600,satcom:1000,superbase:5000};
function buildingIncome(){let b=0;BLDG.forEach(bd=>{if(S.buildings[bd.id]&&BLDG_INCOME[bd.id])b+=BLDG_INCOME[bd.id];});return b*calcMods().income;}
function baseIPS(){return rawIPS()*0.08;}
function ips(){return baseIPS()*calcMods().income+buildingIncome();}
function fleet(){return Object.values(S.owned).reduce((a,b)=>a+b,0);}
function warPower(){return Math.floor(rawIPS()*12*calcMods().income*calcMods().war);}"""

new_content = content.replace(old1, new1, 1)
if new_content != content:
    content = new_content
    print("Applied: CHANGE 1 — Split rawIPS from baseIPS, add buildingIncome")
    changes.append("CHANGE 1")
else:
    print("FAILED: CHANGE 1 — Split rawIPS from baseIPS, add buildingIncome")

# ─── CHANGE 2: Add sortieEarned to defState ───
old2 = """    prestigeStars:0,prestigeMult:1,medals:0,ribbons:0,
    eventActive:null,savedAt:Date.now()};"""

new2 = """    prestigeStars:0,prestigeMult:1,medals:0,ribbons:0,
    sortieEarned:0,eventActive:null,savedAt:Date.now()};"""

new_content = content.replace(old2, new2, 1)
if new_content != content:
    content = new_content
    print("Applied: CHANGE 2 — Add sortieEarned to defState")
    changes.append("CHANGE 2")
else:
    print("FAILED: CHANGE 2 — Add sortieEarned to defState")

# ─── CHANGE 3: Boost mission rewards in game tick + scale by fleet count ───
old3 = """    if(now>=ms.endTime){
      const reward=Math.floor(md.base*m.reward);
      ms.active=false;ms.progress=0;S.credits+=reward;S.totalEarned+=reward;S.missionsComplete++;
      toast(`${md.name} +$${fmtN(reward)}`,'var(--g)');onMissionComplete(md.id);upd=true;
    }"""

new3 = """    if(now>=ms.endTime){
      const owned=S.owned[md.ac]||0;
      const ownedBonus=1+0.45*Math.sqrt(owned);
      const reward=Math.floor(md.base*m.reward*4*ownedBonus);
      ms.active=false;ms.progress=0;S.credits+=reward;S.totalEarned+=reward;S.missionsComplete++;
      S.sortieEarned=(S.sortieEarned||0)+reward;
      toast(`${md.name} +$${fmtN(reward)}`,'var(--g)');onMissionComplete(md.id);upd=true;
    }"""

new_content = content.replace(old3, new3, 1)
if new_content != content:
    content = new_content
    print("Applied: CHANGE 3 — Boost mission rewards in game tick + scale by fleet count")
    changes.append("CHANGE 3")
else:
    print("FAILED: CHANGE 3 — Boost mission rewards in game tick + scale by fleet count")

# ─── CHANGE 4: Add CSS for new sortie production rows ───
old4 = """.pw{height:4px;background:#ffffff0a;border-radius:2px;margin-top:5px;overflow:hidden}"""

new4 = """.pw{height:4px;background:#ffffff0a;border-radius:2px;margin-top:5px;overflow:hidden}
.sortie-row{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;transition:border-color 0.2s}.sortie-row.active{border-color:var(--b)44;background:var(--card2)}.sortie-row.locked{opacity:0.4}.sr-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}.sr-ac{font-weight:700;font-size:13px}.sr-count{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:1px 7px;font-size:10px;color:var(--g);font-weight:700}.sr-reward{font-family:'Orbitron',sans-serif;font-size:12px;color:var(--a);font-weight:700}.sr-bot{display:flex;justify-content:space-between;align-items:center;margin-top:5px}.sr-bar{height:10px;background:#ffffff0a;border-radius:5px;overflow:hidden;flex:1;margin:0 8px}.sr-fill{height:100%;border-radius:5px;background:linear-gradient(90deg,var(--b),var(--g));transition:width 0.2s linear}.sr-info{font-size:9px;color:var(--muted)}.base-income-row{display:flex;justify-content:space-between;align-items:center;padding:7px 10px;border-radius:6px;background:var(--bg3);margin-bottom:4px;font-size:11px}"""

new_content = content.replace(old4, new4, 1)
if new_content != content:
    content = new_content
    print("Applied: CHANGE 4 — Add CSS for new sortie production rows")
    changes.append("CHANGE 4")
else:
    print("FAILED: CHANGE 4 — Add CSS for new sortie production rows")

# ─── CHANGE 5: Complete replacement of renderMissions function ───
old5 = """// ═══ RENDER — MISSIONS ═══
function renderMissions(){
  const m=calcMods();const now=Date.now();
  document.getElementById('view-missions').innerHTML=
    `<div class="sh">Operations <span>${S.missionsComplete} complete</span></div>`+
    MID.map(md=>{
      const ac=ACD.find(a=>a.id===md.ac);const ms=S.missions[md.id];const owned=S.owned[md.ac]||0;
      const dur=Math.max(3,Math.round(md.dur*m.speed));const reward=Math.floor(md.base*m.reward);
      const autoUpg=UPG.find(u=>u.effect==='auto'&&u.ac===md.ac);const isAuto=autoUpg&&(S.upgLvl[autoUpg.id]||0)>0;
      const canLaunch=owned>0&&!ms.active;let timerTxt='';let pct=0;
      if(ms.active){const rem=Math.max(0,Math.ceil((ms.endTime-now)/1000));timerTxt=`${rem}s`;pct=Math.min(100,ms.progress*100);}
      const rewardColor=ms.active?'var(--g)':'var(--a)';
      return`<div class="mc${ms.active?' run':''}${isAuto?' auto':''}">
        <div class="mh"><div><div class="mt">${md.name}</div>
        <div class="ms">${ac.name.split(' ')[0]} · ${dur}s · ${isAuto?'<span style="color:var(--g)">⚡ AUTO</span>':'Manual'}</div></div>
        <div class="bdg" style="background:#ffffff11;color:${rewardColor};border:1px solid ${rewardColor}44">$${fmtN(reward)}</div></div>
        <div style="font-size:10px;color:var(--muted);margin-bottom:4px">${md.desc}</div>
        ${ms.active
          ?`<div class="pw" style="height:6px"><div class="pf b" id="p${md.id}" style="width:${pct.toFixed(1)}%;transition:width 0.18s linear"></div></div>
            <div class="mf"><span style="font-size:10px;color:var(--b)">⏱ ${timerTxt} remaining</span><span class="bdg bdg-b">In Progress</span></div>`
          :`<button class="btn ${canLaunch?'bb':'bm'}" ${!canLaunch?'disabled':''} onclick="launch('${md.id}')">
              ${owned===0?`<span style="color:var(--muted)">Need ${ac.name.split(' ')[0]}</span>`:'▶ Launch Mission'}
            </button>`}
      </div>`;
    }).join('');
}
// ═══ RENDER — UPGRADES + COMMANDERS ═══"""

new5 = """// ═══ RENDER — MISSIONS ═══
function renderMissions(){
  const m=calcMods();const now=Date.now();
  const activeSorties=MID.filter(md=>S.missions[md.id]&&S.missions[md.id].active).length;
  const sortieRate=MID.reduce((sum,md)=>{
    const ms=S.missions[md.id];if(!ms||!ms.active)return sum;
    const dur=Math.max(3,md.dur*m.speed);
    const owned=S.owned[md.ac]||0;
    return sum+(md.base*m.reward*4*(1+0.45*Math.sqrt(owned)))/dur;
  },0);
  const el=document.getElementById('view-missions');
  el.innerHTML=`<div class="sh">Sortie Operations <span>${activeSorties} active · $${fmtN(Math.floor(sortieRate))}/s</span></div>
  <div style="display:flex;gap:8px;margin-bottom:10px">
    <div style="flex:1;background:var(--bg3);border-radius:8px;padding:7px 10px;text-align:center">
      <div style="font-size:9px;color:var(--muted)">SORTIES FLOWN</div>
      <div style="font-family:'Orbitron',sans-serif;font-size:14px;color:var(--g)">${S.missionsComplete}</div>
    </div>
    <div style="flex:1;background:var(--bg3);border-radius:8px;padding:7px 10px;text-align:center">
      <div style="font-size:9px;color:var(--muted)">SORTIE INCOME</div>
      <div style="font-family:'Orbitron',sans-serif;font-size:14px;color:var(--a)">$${fmtN(S.sortieEarned||0)}</div>
    </div>
    <div style="flex:1;background:var(--bg3);border-radius:8px;padding:7px 10px;text-align:center">
      <div style="font-size:9px;color:var(--muted)">BASE INCOME</div>
      <div style="font-family:'Orbitron',sans-serif;font-size:14px;color:var(--c)">$${fmtN(Math.floor(buildingIncome()))}/s</div>
    </div>
  </div>`+
  ACD.map(ac=>{
    const owned=S.owned[ac.id]||0;
    const fl=fleet();
    if(!owned&&fl<ac.unlockF)return'';
    const acMissions=MID.filter(md=>md.ac===ac.id);
    const autoUpg=UPG.find(u=>u.effect==='auto'&&u.ac===ac.id);
    const isAuto=autoUpg&&(S.upgLvl[autoUpg.id]||0)>0;
    const activeMission=acMissions.find(md=>S.missions[md.id]&&S.missions[md.id].active);
    const nextMission=acMissions.find(md=>!S.missions[md.id].active);
    const curMission=activeMission||nextMission;
    if(!curMission)return'';
    const md=curMission;const ms=S.missions[md.id];
    const dur=Math.max(3,Math.round(md.dur*m.speed));
    const ownedBonus=1+0.45*Math.sqrt(owned||1);
    const reward=Math.floor(md.base*m.reward*4*ownedBonus);
    const ratePerHr=Math.floor(reward/dur*3600);
    const pct=ms&&ms.active?Math.min(100,ms.progress*100):0;
    const rem=ms&&ms.active?Math.max(0,Math.ceil((ms.endTime-now)/1000)):0;
    const canLaunch=owned>0&&ms&&!ms.active;
    return`<div class="sortie-row${ms&&ms.active?' active':''}${!owned?' locked':''}">
      <div class="sr-top">
        <div style="display:flex;align-items:center;gap:7px">
          <div style="width:10px;height:10px;border-radius:50%;background:${ac.col};flex-shrink:0"></div>
          <span class="sr-ac">${ac.name.split(' ')[0]}</span>
          <span class="sr-count">${owned?'×'+owned:'NONE'}</span>
          ${isAuto?'<span style="font-size:9px;color:var(--g);font-weight:700">⚡ AUTO</span>':''}
        </div>
        <span class="sr-reward">${owned?'$'+fmtN(reward):ac.unlockF+' needed'}</span>
      </div>
      ${owned?`<div style="display:flex;align-items:center;gap:0;margin:6px 0">
        <div style="font-size:8px;color:var(--muted);white-space:nowrap;width:65px">${md.name.split(' ').slice(1,3).join(' ')}</div>
        <div class="sr-bar"><div class="sr-fill" id="p${md.id}" style="width:${pct.toFixed(1)}%"></div></div>
        <div style="font-size:9px;color:var(--b);white-space:nowrap;width:28px;text-align:right">${ms&&ms.active?rem+'s':dur+'s'}</div>
      </div>
      <div class="sr-bot">
        <div class="sr-info">$${fmtN(ratePerHr)}/hr · ${isAuto?'cycling':'manual'}</div>
        ${ms&&ms.active?'<div style="font-size:9px;color:var(--b)">In flight</div>'
          :`<button class="btn bb" style="padding:3px 12px;font-size:10px;margin:0" onclick="launch('${md.id}')">▶ LAUNCH</button>`}
      </div>`:
      `<div style="font-size:10px;color:var(--muted);padding:4px 0">Buy aircraft to run sorties (${ac.unlockF} fleet needed)</div>`}
    </div>`;
  }).filter(Boolean).join('');
}
// ═══ RENDER — UPGRADES + COMMANDERS ═══"""

new_content = content.replace(old5, new5, 1)
if new_content != content:
    content = new_content
    print("Applied: CHANGE 5 — Complete replacement of renderMissions function")
    changes.append("CHANGE 5")
else:
    print("FAILED: CHANGE 5 — Complete replacement of renderMissions function")

# ─── CHANGE 6: Update renderBase to show building income contribution ───
old6 = """      return`<div class="bc${built?' built':''}"><div class="bh"><div class="bi">${b.icon}</div><div style="flex:1"><div class="bn">${b.name}</div><div class="bd">${b.desc}</div><div class="be">${b.effect}</div></div>${built?'<div class="bdg bdg-g">Built</div>':''}</div>
      ${built?'':`<button class="btn ${canAfford?'bg':'bm'}" ${!canAfford?'disabled':''} onclick="build('${b.id}')">${!reqBuilt?'Requires: '+reqName:'Build — $'+fmtN(b.cost)}</button>`}</div>`;"""

new6 = """      const bInc=BLDG_INCOME[b.id]?`<span style="color:var(--c);font-weight:700"> +$${BLDG_INCOME[b.id]}/s base</span>`:'';
      return`<div class="bc${built?' built':''}"><div class="bh"><div class="bi">${b.icon}</div><div style="flex:1"><div class="bn">${b.name}</div><div class="bd">${b.desc}</div><div class="be">${b.effect}${bInc}</div></div>${built?'<div class="bdg bdg-g">Built</div>':''}</div>
      ${built?'':`<button class="btn ${canAfford?'bg':'bm'}" ${!canAfford?'disabled':''} onclick="build('${b.id}')">${!reqBuilt?'Requires: '+reqName:'Build — $'+fmtN(b.cost)}</button>`}</div>`;"""

new_content = content.replace(old6, new6, 1)
if new_content != content:
    content = new_content
    print("Applied: CHANGE 6 — Update renderBase to show building income contribution")
    changes.append("CHANGE 6")
else:
    print("FAILED: CHANGE 6 — Update renderBase to show building income contribution")

# ─── CHANGE 7: Update renderBase header to show base income ───
old7 = """  document.getElementById('view-base').innerHTML=
    `<div class="sh">Base Infrastructure <span>$${fmtN(ips())}/sec</span></div>`+"""

new7 = """  const bInc=buildingIncome();
  document.getElementById('view-base').innerHTML=
    `<div class="sh">Base Infrastructure <span style="color:var(--c)">+$${fmtN(Math.floor(bInc))}/s from base</span></div>
    ${bInc>0?`<div style="background:var(--bg3);border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:var(--c)">🏗️ Your base generates <b>$${fmtN(Math.floor(bInc))}/s</b> passively. Build more to increase this.</div>`:'<div style="background:var(--bg3);border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:11px;color:var(--muted)">🏗️ Buildings generate passive income. Build the Aircraft Apron to start.</div>'}`+"""

new_content = content.replace(old7, new7, 1)
if new_content != content:
    content = new_content
    print("Applied: CHANGE 7 — Update renderBase header to show base income")
    changes.append("CHANGE 7")
else:
    print("FAILED: CHANGE 7 — Update renderBase header to show base income")

# ─── Write output ───
print(f"\nSuccessfully applied {len(changes)}/7 changes: {', '.join(changes)}")

with open(outpath, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"Written: {outpath} ({len(content)} bytes)")

shutil.copy2(outpath, copypath)
print(f"Copied to: {copypath}")
