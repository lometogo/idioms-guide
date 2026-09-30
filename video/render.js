const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const {execSync}=require('child_process');
const fs=require('fs'),path=require('path');
(async()=>{
 const out=process.argv[2]||'idioms-guide.mp4', FPS=30, dir=fs.mkdtempSync(path.join(require('os').tmpdir(),'frames-'));
 const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
 const pg=await b.newPage({viewport:{width:1280,height:720}});
 await pg.goto('file://'+path.resolve(__dirname,'scene.html'));
 const total=await pg.evaluate(()=>TOTAL), n=total*FPS;
 for(let i=0;i<n;i++){await pg.evaluate(t=>render(t),i/FPS);
  await pg.screenshot({path:`${dir}/f${String(i).padStart(5,'0')}.png`});}
 await b.close();
 const ff='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2';
 execSync(`${ff} -y -framerate ${FPS} -i ${dir}/f%05d.png -c:v libx264 -pix_fmt yuv420p -crf 20 ${out}`,{stdio:'inherit'});
 fs.rmSync(dir,{recursive:true});
})();
