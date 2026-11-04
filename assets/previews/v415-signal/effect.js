/* Standalone visual preview. It does not read, write, or advance any game save. */
globalThis.StillwaterSignalPreview = (() => {
  const duration = 7;
  const cues = [{at:1.1,face:false},{at:4.25,face:true}];
  let canvas, ctx, base, face, raf=0, started=0, audio=null;
  const noise=document.createElement('canvas');noise.width=320;noise.height=180;
  const n=noise.getContext('2d');
  function drawAt(seconds) {
    ctx.imageSmoothingEnabled=false;ctx.fillStyle='#000';ctx.fillRect(0,0,960,540);
    ctx.drawImage(base,140,-40,680,510);
    ctx.textAlign='center';
    ctx.font='14px monospace';ctx.fillStyle='#929a9b';
    for(const [text,x]of [['ROOM',340],['GUEST',480],['EMPLOYEE',620]])ctx.fillText(text,x,458);
    ctx.strokeStyle='#384245';ctx.beginPath();ctx.moveTo(318,470);ctx.lineTo(362,470);ctx.stroke();

    const cue=cues.find(c=>seconds>=c.at&&seconds<c.at+.88);
    if(!cue)return;
    const p=seconds-cue.at, tick=Math.floor(seconds*24);
    let seed=2107+tick*1709;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    // One short interference envelope. It tears the picture, never strobes white.
    const envelope=Math.sin(Math.PI*Math.min(1,p/.88));
    ctx.fillStyle=`rgba(2,8,12,${.28*envelope})`;ctx.fillRect(0,0,960,540);
    if(cue.face&&p>=.22&&p<.51){
      ctx.globalAlpha=.89*Math.min(1,(p-.22)/.025,(.51-p)/.035);
      ctx.drawImage(face,0,0,960,540);ctx.globalAlpha=1;
      for(let i=0;i<9;i++){
        const y=Math.floor(random()*500),h=8+Math.floor(random()*23),shift=(random()-.5)*75;
        ctx.drawImage(face,0,y*face.height/540,face.width,h*face.height/540,shift,y,960,h);
      }
    }
    for(let i=0;i<7;i++){
      const y=Math.floor(random()*530),h=3+Math.floor(random()*15),shift=(random()-.5)*44;
      ctx.drawImage(canvas,0,y,960,h,shift,y,960,h);
    }
    const data=n.createImageData(320,180);
    for(let i=0;i<data.data.length;i+=4){const value=random()*135;data.data[i]=value*.72;data.data[i+1]=value*.93;data.data[i+2]=value;data.data[i+3]=random()*140*envelope;}
    n.putImageData(data,0,0);ctx.drawImage(noise,0,0,960,540);
    for(let i=0;i<26;i++){
      const y=Math.floor(random()*540);ctx.fillStyle=i%4===0?'#76252e77':'#365d6c77';
      ctx.fillRect((random()-.2)*960,y,960,1+Math.floor(random()*3));
    }
    const roll=(p/.88*730-100);
    const wave=ctx.createLinearGradient(0,roll-55,0,roll+55);
    wave.addColorStop(0,'#17405200');wave.addColorStop(.43,'#5a9cab15');wave.addColorStop(.49,'#bdcadb40');wave.addColorStop(.53,'#7c1c3538');wave.addColorStop(1,'#0b253300');
    ctx.fillStyle=wave;ctx.fillRect(0,roll-55,960,110);
    ctx.fillStyle='#000';ctx.globalAlpha=p>.73?(p-.73)/.15*.42:.1;ctx.fillRect(0,0,960,540);ctx.globalAlpha=1;
  }
  async function init(target) {
    canvas=target;ctx=canvas.getContext('2d');base=new Image();face=new Image();
    base.src='terminal.png';face.src='apparition.png';await Promise.all([base.decode(),face.decode()]);drawAt(0);
  }
  function stop(){cancelAnimationFrame(raf);raf=0;if(audio){audio.close();audio=null;}}
  function soundTrack(){
    const a=new AudioContext(),out=a.createMediaStreamDestination(),gain=a.createGain();gain.gain.value=1;gain.connect(out);gain.connect(a.destination);
    for(const cue of cues){
      const b=a.createBuffer(1,Math.floor(a.sampleRate*.92),a.sampleRate),d=b.getChannelData(0);let seed=17;
      for(let i=0;i<d.length;i++){seed=(seed*16807)%2147483647;d[i]=(seed/1073741824-1)*.5;}
      const source=a.createBufferSource(),filter=a.createBiquadFilter(),volume=a.createGain();source.buffer=b;filter.type='bandpass';filter.frequency.value=2800;filter.Q.value=.45;
      const at=a.currentTime+cue.at;volume.gain.setValueAtTime(0,at);volume.gain.linearRampToValueAtTime(.25,at+.08);volume.gain.linearRampToValueAtTime(.15,at+.6);volume.gain.linearRampToValueAtTime(0,at+.9);
      source.connect(filter).connect(volume).connect(gain);source.start(at);source.stop(at+.92);
    }
    audio=a;return out.stream;
  }
  async function record(){
    stop();const audioStream=soundTrack(),stream=canvas.captureStream(30);audioStream.getAudioTracks().forEach(track=>stream.addTrack(track));
    const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9,opus',videoBitsPerSecond:2500000});const chunks=[];
    const done=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>resolve(new Blob(chunks,{type:'video/webm'}));});
    recorder.start();started=performance.now();
    const step=now=>{const seconds=(now-started)/1000;drawAt(Math.min(duration,seconds));if(seconds<duration)raf=requestAnimationFrame(step);else{recorder.stop();stop();}};raf=requestAnimationFrame(step);
    const blob=await done;return await new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(blob);});
  }
  return {init,drawAt,record,stop,duration,cues};
})();
