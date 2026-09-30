// usage: node render.js out.mp4 [audioDir]   (audioDir holds <scene>.wav + dur.json from voice.py)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {execSync}=require('child_process');
const fs=require('fs'),path=require('path');
const FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
(async()=>{
 const out=process.argv[2]||'idioms-guide.mp4', audio=process.argv[3], FPS=30;
 const dir=fs.mkdtempSync(path.join(require('os').tmpdir(),'frames-'));
 const ids=['s0','s1','c0','c1','c2','c3','s6'], min={s0:3.5,s6:4};
 let tl=null,total=null,starts={};
 if(audio){ // scene length = narration + 0.6s lead-in + 1s tail
  const dur=JSON.parse(fs.readFileSync(path.join(audio,'dur.json'))); let t=0; tl=[];
  for(const id of ids){const len=Math.max(min[id]||0,dur[id]+1.6);tl.push([id,t,t+len]);starts[id]=t;t+=len;} total=t;}
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const pg=await b.newPage({viewport:{width:1280,height:720}});
 await pg.goto('file://'+path.resolve(__dirname,'scene.html'));
 if(tl) await pg.evaluate(([t,n])=>setTimeline(t,n),[tl,total]);
 const n=Math.round((await pg.evaluate(()=>TOTAL))*FPS);
 for(let i=0;i<n;i++){await pg.evaluate(t=>render(t),i/FPS);
  await pg.screenshot({path:`${dir}/f${String(i).padStart(5,'0')}.png`});}
 await b.close();
 let cmd=`${FF} -y -framerate ${FPS} -i ${dir}/f%05d.png`;
 if(audio){ // start each clip 0.6s after its scene begins
  ids.forEach(id=>cmd+=` -i ${audio}/${id}.wav`);
  const f=ids.map((id,i)=>`[${i+1}:a]adelay=${Math.round((starts[id]+0.6)*1000)}:all=1[a${i}]`).join(';');
  cmd+=` -filter_complex "${f};${ids.map((_,i)=>`[a${i}]`).join('')}amix=inputs=${ids.length}:normalize=0[a]" -map 0:v -map "[a]" -c:a aac -b:a 128k -t ${n/FPS}`;
 }
 cmd+=` -c:v libx264 -pix_fmt yuv420p -crf 20 ${out}`;
 execSync(cmd,{stdio:'inherit'}); fs.rmSync(dir,{recursive:true});
})();
