"""Transfer the approved Cycles master to a genuinely interactive, textured GLB.
The linen includes Cycles-baked diffuse illumination; the remaining materials retain PBR.
"""
import bpy, math, time
from pathlib import Path
R=Path(__file__).resolve().parent.parent;OUT=R/'public/mannequin';TEX=R/'renders/interactive-bakes';TEX.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(R/'blender/doclasse-cycles-final.blend'))
s=bpy.context.scene;s.cycles.device='CPU';s.cycles.samples=32;s.cycles.use_denoising=True
s.render.engine='CYCLES';s.render.bake.margin=12;s.render.bake.use_clear=True;s.render.bake.use_selected_to_active=False
model=[o for o in s.objects if o.type in {'MESH','CURVE','FONT'} and not o.name.startswith(('Studio /','Ribbon /')) and not o.hide_render]
# Turn exactly the approved stitching/fibres into exportable geometry.
bpy.ops.object.select_all(action='DESELECT')
for o in model:o.select_set(True)
bpy.context.view_layer.objects.active=model[0]
for o in model:
 for m in o.modifiers:
  if m.type=='SUBSURF':m.levels=min(m.render_levels,1);m.render_levels=m.levels
bpy.ops.object.convert(target='MESH')
model=[o for o in s.objects if o.select_get()]

def bake_object(ob,size,kind):
 started=time.monotonic();bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
 source=ob.data.materials[0].copy();ob.data.materials[0]=source;nt=source.node_tree
 p=next(n for n in nt.nodes if n.type=='BSDF_PRINCIPLED');out=next(n for n in nt.nodes if n.type=='OUTPUT_MATERIAL')
 old_uv=ob.data.uv_layers.active.name if ob.data.uv_layers.active else None
 if old_uv:
  explicit=nt.nodes.new('ShaderNodeUVMap');explicit.uv_map=old_uv
  for coord in list(nt.nodes):
   if coord.type=='TEX_COORD':
    for link in list(coord.outputs['UV'].links):nt.links.new(explicit.outputs['UV'],link.to_socket)
 ob.data.uv_layers.new(name='BakeUV');ob.data.uv_layers.active_index=len(ob.data.uv_layers)-1
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.009,area_weight=.15);bpy.ops.object.mode_set(mode='OBJECT')
 result={}
 channels=['diffuse','normal'] if kind=='linen' else ['color','roughness','normal']
 original_surface=out.inputs['Surface'].links[0].from_socket
 for channel in channels:
  name=f'{kind}-{ob.name.replace("/","-")}-{channel}'
  image=bpy.data.images.new(name,width=size,height=size,alpha=False)
  if channel in ['normal','roughness']:image.colorspace_settings.name='Non-Color'
  target=nt.nodes.new('ShaderNodeTexImage');target.image=image;target.select=True;nt.nodes.active=target
  if channel in ['color','roughness']:
   emit=nt.nodes.new('ShaderNodeEmission');value=p.inputs['Base Color' if channel=='color' else 'Roughness']
   if value.is_linked:nt.links.new(value.links[0].from_socket,emit.inputs['Color'])
   else:
    v=value.default_value;emit.inputs['Color'].default_value=v if channel=='color' else (v,v,v,1)
   nt.links.new(emit.outputs[0],out.inputs['Surface']);s.cycles.samples=1
   bpy.ops.object.bake(type='EMIT',uv_layer='BakeUV')
   nt.links.new(original_surface,out.inputs['Surface']);nt.nodes.remove(emit)
  elif channel=='diffuse':
   s.cycles.samples=32;s.render.bake.use_pass_direct=True;s.render.bake.use_pass_indirect=True;s.render.bake.use_pass_color=True
   bpy.ops.object.bake(type='DIFFUSE',uv_layer='BakeUV')
  else:
   s.cycles.samples=1;bpy.ops.object.bake(type='NORMAL',uv_layer='BakeUV',normal_space='TANGENT')
  image.filepath_raw=str(TEX/(name+'.png'));image.file_format='PNG';image.save();image.pack();result[channel]=image
  nt.nodes.remove(target)
 mat=bpy.data.materials.new(('Cycles baked linen' if kind=='linen' else 'Baked walnut')+' / '+ob.name);mat.use_nodes=True
 new=mat.node_tree;pr=new.nodes.get('Principled BSDF')
 for key in ['Metallic','Roughness','Coat Weight','Coat Roughness','Sheen Weight','Sheen Roughness','Specular IOR Level']:
  pr.inputs[key].default_value=p.inputs[key].default_value
 for channel,im in result.items():
  tx=new.nodes.new('ShaderNodeTexImage');tx.image=im
  if channel in ['diffuse','color']:new.links.new(tx.outputs['Color'],pr.inputs['Base Color'])
  elif channel=='roughness':new.links.new(tx.outputs['Color'],pr.inputs['Roughness'])
  else:
   nm=new.nodes.new('ShaderNodeNormalMap');new.links.new(tx.outputs['Color'],nm.inputs['Color']);new.links.new(nm.outputs['Normal'],pr.inputs['Normal'])
 ob.data.materials[0]=mat
 # Only the non-overlapping export UV is needed after all procedural maps are baked.
 for layer in list(ob.data.uv_layers):
  if layer.name!='BakeUV':ob.data.uv_layers.remove(layer)
 ob.data.uv_layers.active_index=0
 print('BAKED',ob.name,round(time.monotonic()-started,1),flush=True)

for ob in model:
 if not ob.data.materials:continue
 name=ob.data.materials[0].name
 if name.startswith('Ivory /'):bake_object(ob,4096,'linen')
 elif name.startswith('Walnut /'):bake_object(ob,1024,'wood')
# Microscopic metal brushing becomes the same measured average material, not an unexported node graph.
brass=bpy.data.materials.get('Brass / brushed antique');nt=brass.node_tree;p=next(n for n in nt.nodes if n.type=='BSDF_PRINCIPLED')
for name,value in [('Base Color',(.455,.27,.10,1)),('Roughness',.29)]:
 for link in list(p.inputs[name].links):nt.links.remove(link)
 p.inputs[name].default_value=value
for link in list(p.inputs['Normal'].links):nt.links.remove(link)
bpy.ops.object.select_all(action='DESELECT')
for ob in model:ob.select_set(True)
bpy.context.view_layer.objects.active=model[0]
bpy.ops.export_scene.gltf(filepath=str(OUT/'cycles-dressform.glb'),export_format='GLB',use_selection=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False,export_image_format='WEBP',export_image_quality=94,export_tangents=True,export_materials='EXPORT',export_draco_mesh_compression_enable=True,export_draco_mesh_compression_level=7,export_draco_position_quantization=18,export_draco_normal_quantization=12,export_draco_texcoord_quantization=14)
print('INTERACTIVE GLB COMPLETE', (OUT/'cycles-dressform.glb').stat().st_size,flush=True)
