import json,wave,sys,os
from piper import PiperVoice
model=sys.argv[1]; out=sys.argv[2]; os.makedirs(out,exist_ok=True)
v=PiperVoice.load(model); n=json.load(open('narration.json')); dur={}
for k,t in n.items():
    p=f'{out}/{k}.wav'
    with wave.open(p,'wb') as w: v.synthesize_wav(t,w)
    with wave.open(p) as w: dur[k]=w.getnframes()/w.getframerate()
json.dump(dur,open(f'{out}/dur.json','w'),indent=1); print(dur)
