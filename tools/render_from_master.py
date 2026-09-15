"""Render the packed final Blender master, then its eight neighbouring camera angles."""
import bpy, math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parent.parent
bpy.ops.wm.open_mainfile(filepath=str(root/'blender/doclasse-cycles-final.blend'))
scene=bpy.context.scene;scene.cycles.device='CPU';scene.render.resolution_percentage=100
out=root/'renders';out.mkdir(exist_ok=True)
scene.render.filepath=str(out/'cycles-mannequin.png')
bpy.ops.render.render(write_still=True)
base=scene.camera.location.copy();target=Vector((0,0,.88))
scene.render.resolution_x=1050;scene.render.resolution_y=1500;scene.cycles.samples=56
scene.render.use_persistent_data=True
for i in range(9):
 a=math.radians((i-4)*1.5)
 scene.camera.location=(base.x*math.cos(a)-base.y*math.sin(a),base.x*math.sin(a)+base.y*math.cos(a),base.z)
 scene.camera.rotation_euler=(target-scene.camera.location).to_track_quat('-Z','Y').to_euler()
 scene.render.filepath=str(out/f'view-{i:02d}.png');bpy.ops.render.render(write_still=True)
