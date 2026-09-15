"""Package the tested interactive component, assets, Blender master and integration notes."""
from pathlib import Path
import shutil,json,hashlib,zipfile,subprocess,struct
R=Path(__file__).resolve().parent.parent;D=R/'deliverable/doclasse-fv-mannequin'
if D.exists():shutil.rmtree(D)
D.mkdir(parents=True)
def copy(source,dest=None):
 p=R/source;q=D/(dest or source);q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,q)
for name in ['mannequin.js','hero.css','cycles-mannequin.webp','cycles-dressform.glb','ribbon-normal.jpg','THREE-LICENSE']:
 copy('public/mannequin/'+name)
for p in (R/'public/mannequin/draco').iterdir():
 if p.is_file():copy(str(p.relative_to(R)))
for folder in ['integration','src','tests']:
 for p in (R/folder).rglob('*'):
  if p.is_file() and p.name!='mannequin-webgl.js':copy(str(p.relative_to(R)))
for name in ['CODEX_HANDOFF.md','MOTION_SOURCE.md','README.md','package.json','package-lock.json','vite.config.js','blender/doclasse-cycles-final.blend','tools/export_interactive.py','tools/render_from_master.py','tools/serve.mjs']:
 copy(name)
for name in ['cycles-mannequin.png','cycles-detail.png']:copy('public/mannequin/'+name,'renders/'+name)
# GLB references the local Draco decoder and contains material textures.
b=(D/'public/mannequin/cycles-dressform.glb').read_bytes();length=struct.unpack_from('<I',b,12)[0];gltf=json.loads(b[20:20+length]);assert 'KHR_draco_mesh_compression' in gltf['extensionsUsed'];assert len(gltf['meshes'])>=70
assert (D/'integration/hero.css').read_bytes()==(D/'public/mannequin/hero.css').read_bytes()
assert (D/'src/mannequin.js').read_bytes()==(D/'integration/mannequin.js').read_bytes()
subprocess.run(['node','--check',str(D/'integration/mannequin.js')],check=True)
manifest={'version':'1.1.0','entrypoint':'CODEX_HANDOFF.md','purpose':'Replace only the existing FV mannequin, retaining deployed pointer/scroll/3D motion','rendering':'Interactive Blender GLB; Cycles-baked linen; PBR wood/brass/satin; source-matched perspective camera and ribbon','files':[]}
for p in sorted(D.rglob('*')):
 if p.is_file():manifest['files'].append({'path':str(p.relative_to(D)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(D/'ASSET_MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
zpath=R/'doclasse-fv-mannequin.zip'
with zipfile.ZipFile(zpath,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(D.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(D.parent))
with zipfile.ZipFile(zpath) as z:assert z.testzip() is None
print(json.dumps({'zip_bytes':zpath.stat().st_size,'files':len(manifest['files'])+1,'model_bytes':len(b),'meshes':len(gltf['meshes'])}))
