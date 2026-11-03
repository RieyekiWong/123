"""Build small local CC0 soundtrack loops from the reviewed source ledger."""
from pathlib import Path
import hashlib,json,subprocess,wave,array,sys,argparse
from urllib.request import urlopen
from urllib.parse import urlsplit

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--cache-dir',default='/tmp/stillwater-audio-v28')
temporary=Path(parser.parse_args().cache_dir);temporary.mkdir(parents=True,exist_ok=True)
destination=Path('assets/audio-v28');destination.mkdir(parents=True,exist_ok=True)
sources=json.loads((destination/'credits.json').read_text())
credits=[]
for source in sources:
    track=source['id'];original=temporary/(track+Path(urlsplit(source['download']).path).suffix)
    if not original.exists():original.write_bytes(urlopen(source['download'],timeout=60).read())
    if hashlib.sha256(original.read_bytes()).hexdigest()!=source['source_sha256']:raise ValueError('Source hash differs: '+track)
    probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',str(original)]))
    duration=float(probe['format']['duration']);master=temporary/(track+'-master.wav')
    limited='atrim=0:96,asetpts=PTS-STARTPTS,' if duration>96 else ''
    arguments=['-af',limited+'aformat=channel_layouts=mono,loudnorm=I=-20:TP=-6:LRA=7,aresample=24000']
    processing='Complete original loop; mono 24 kHz, loudness target -20 LUFS / -6 dBTP.'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(original),*arguments,'-ac','1','-ar','24000',str(master)],check=True)
    if duration>96:
        with wave.open(str(master),'rb') as recording:
            pcm=array.array('h',recording.readframes(recording.getnframes()))
        if sys.byteorder!='little':pcm.byteswap()
        seam=3*24000
        blend=array.array('h',(round(pcm[-seam+i]*(1-i/(seam-1))+pcm[i]*i/(seam-1)) for i in range(seam)))
        pcm=pcm[seam:-seam]+blend
        if sys.byteorder!='little':pcm.byteswap()
        with wave.open(str(master),'wb') as recording:
            recording.setparams((1,2,24000,0,'NONE','not compressed'));recording.writeframes(pcm.tobytes())
        processing='First 96 seconds; 3-second tail/head crossfade rotated into a 93-second loop; mono 24 kHz, loudness target -20 LUFS / -6 dBTP.'
    files={}
    for extension,options in [('mp3',['-c:a','libmp3lame','-b:a','48k']),('ogg',['-c:a','libvorbis','-q:a','1'])]:
        path=destination/(track+'.'+extension)
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(master),'-map_metadata','-1',*options,str(path)],check=True)
        files[extension]={'file':str(path),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    output=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_format','-of','json',files['mp3']['file']]))
    item={k:source[k] for k in ['id','title','author','source','license','license_url','download','source_sha256','source_bytes']}
    item.update(source_duration=round(duration,3),duration=round(float(output['format']['duration']),3),processing=processing,reviewed_page_sha256=source['reviewed_page_sha256'],files=files)
    credits.append(item)
    print(json.dumps({'id':track,'seconds':item['duration'],'bytes':sum(f['bytes'] for f in files.values())}),flush=True)
(destination/'credits.json').write_text(json.dumps(credits,ensure_ascii=False,indent=2)+'\n')
runtime=[{k:item[k] for k in ['id','title','author','source','license','license_url','duration']}|{'mp3':item['files']['mp3']['file'],'ogg':item['files']['ogg']['file']} for item in credits]
Path('case-audio-tracks.js').write_text('/* Reviewed CC0 loops; local files are fetched only after audio opt-in. */\nglobalThis.StillwaterAudioTracks = '+json.dumps(runtime,ensure_ascii=False,indent=2)+';\n')
rows=['# 音乐来源与处理 / Audio sources','','下列八个实际来源页均已核对为 CC0。音频下载到本地后压缩；较长曲目截取并在首尾交叉淡化。曲名、作者、实际下载链接、原文件哈希及各压缩文件哈希见 [credits.json](credits.json)。网页按需加载，不连接外部音乐站。','','| 场景 | 音乐 / 作者 | 来源及许可 |','|---|---|---|']
for item in credits:rows.append(f"| {item['id']} | {item['title']} / {item['author']} | [原始页面]({item['source']}) · [CC0]({item['license_url']}) |")
rows+=['','聊天通知、发送、机位切换、门响和设备按键使用本项目本地合成的短音效；未使用微信官方提示音。既有呼吸声继续使用浏览器合成。','']
(destination/'SOURCES.md').write_text('\n'.join(rows))
