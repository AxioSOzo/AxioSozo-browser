"""Build the AxioSozo browser mark and app icon from the borrowed 3D symbol.

Run with Blender --background --factory-startup --python create_browser_logo.py.
The three-part A comes unchanged from ../axiosozo-symbol-v1. This script adds a
tilted orbit ring and an app-icon tile.
"""
from pathlib import Path
import json
import math

import bpy
import bmesh
from mathutils import Vector

OUTPUT = Path(__file__).resolve().parent
SYMBOL_BLEND = OUTPUT.parent / "axiosozo-symbol-v1/axiosozo-symbol-v1.blend"
SYMBOL_OBJECTS = ["AxioSozo Symbol", "01 | Crown", "02 | Left leg", "03 | Right leg"]

# Orbit: a circle laid almost flat around the A. The near arc crosses in front of the
# legs and the far arc passes behind the crown, like a ring around a planet.
RING_RADIUS = 0.114
RING_TUBE = 0.0052
RING_TILT = math.radians(17)     # elevation of the ring plane toward the viewer
RING_ROLL = math.radians(-14)    # in-plane slant, rising to the right like the crown's cut
RING_CENTER = (0.0, 0.0, -0.012)

# Icon tile follows the macOS grid: an 824 px squircle on a 1024 px canvas.
TILE = 0.300
TILE_DEPTH = 0.024
TILE_EXPONENT = 5.0
TILE_GAP = 0.136                 # front face distance behind the symbol's centre plane
ICON_CANVAS = 1024
ICON_TILE_PX = 824


def linear(value):
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def material(name, hex_color, metallic, roughness, coat=0.1):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    rgb = [linear(int(hex_color[i:i + 2], 16) / 255) for i in (0, 2, 4)]
    mat.diffuse_color = (*rgb, 1)
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Coat Weight"].default_value = coat
    bsdf.inputs["Coat Roughness"].default_value = 0.22
    return mat


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()


def light(name, location, energy, size, color, collection, target=(0, 0, 0)):
    data = bpy.data.lights.new(name, "AREA")
    data.energy, data.shape, data.size, data.color = energy, 'DISK', size, color
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = location
    point_at(obj, target)
    return obj


def camera(name, location, target, ortho_scale, collection):
    data = bpy.data.cameras.new(name)
    data.type = 'ORTHO'
    data.ortho_scale = ortho_scale
    data.clip_start = 0.001
    data.clip_end = 250
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = location
    point_at(obj, target)
    return obj


def squircle(name, size, exponent, segments=256):
    """Superellipse outline |x|^n + |z|^n = r^n in the XZ plane, facing -Y."""
    half = size / 2
    vertices = []
    for i in range(segments):
        angle = 2 * math.pi * i / segments
        c, s = math.cos(angle), math.sin(angle)
        x = half * math.copysign(abs(c) ** (2 / exponent), c)
        z = half * math.copysign(abs(s) ** (2 / exponent), s)
        vertices.append((x, 0, z))
    mesh = bpy.data.meshes.new(name)
    # Reverse winding so the face normal points at the front camera (-Y).
    mesh.from_pydata(vertices, [], [list(reversed(range(segments)))])
    mesh.update()
    return mesh


def evaluated_checks(objects):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    checks = []
    for obj in objects:
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        bm = bmesh.new()
        bm.from_mesh(mesh)
        bad_edges = sum(not edge.is_manifold for edge in bm.edges)
        volume = bm.calc_volume(signed=True)
        mesh.calc_loop_triangles()
        checks.append({"part": obj.name, "vertices": len(mesh.vertices),
                       "triangles": len(mesh.loop_triangles),
                       "non_manifold_edges": bad_edges, "volume_m3": volume})
        assert bad_edges == 0 and volume > 0, f"Invalid solid: {checks[-1]}"
        bm.free()
        evaluated.to_mesh_clear()
    return checks


def world_bounds(obj):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    points = [evaluated.matrix_world @ v.co for v in mesh.vertices]
    evaluated.to_mesh_clear()
    return ([min(p[i] for p in points) for i in range(3)],
            [max(p[i] for p in points) for i in range(3)])


def render(path, camera_obj, width, height, samples, transparent, hidden):
    for obj in bpy.data.objects:
        obj.hide_render = obj.name in hidden
    scene.camera = camera_obj
    scene.render.resolution_x, scene.render.resolution_y = width, height
    scene.cycles.samples = samples
    scene.render.film_transparent = transparent
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    print("RENDERED", path.name, flush=True)


bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.name = "AxioSozo | Browser mark"
scene.unit_settings.system = 'METRIC'
scene.unit_settings.length_unit = 'MILLIMETERS'
scene.render.engine = 'CYCLES'
scene.cycles.use_denoising = True
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    gpu = [device for device in prefs.devices if device.type == 'METAL']
    for device in prefs.devices:
        device.use = device.type == 'METAL'
    if gpu:
        scene.cycles.device = 'GPU'
    print("RENDER_DEVICE", scene.cycles.device, flush=True)
except Exception as error:
    print("CPU_RENDER_FALLBACK", error, flush=True)
# Khronos PBR Neutral keeps ink, vermilion and cream close to their brand hex
# values while rolling off highlights; AgX shifts the vermilion toward salmon.
scene.view_settings.view_transform = 'Khronos PBR Neutral'
scene.view_settings.look = 'None'
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'

mark_collection = bpy.data.collections.new("01 | MARK — symbol and orbit (GLB)")
icon_collection = bpy.data.collections.new("02 | ICON — app tile")
stage_collection = bpy.data.collections.new("03 | STUDIO — lights and cameras")
for collection in (mark_collection, icon_collection, stage_collection):
    scene.collection.children.link(collection)

# Borrow the editable symbol, keeping its live Solidify/Bevel/Weighted Normal stack.
with bpy.data.libraries.load(str(SYMBOL_BLEND), link=False) as (source, target):
    missing = set(SYMBOL_OBJECTS) - set(source.objects)
    assert not missing, f"Borrowed symbol is missing {missing}"
    target.objects = SYMBOL_OBJECTS
symbol, *parts = target.objects
for obj in target.objects:
    mark_collection.objects.link(obj)
assert all(part.parent == symbol for part in parts)

root = bpy.data.objects.new("AxioSozo Browser Mark", None)
mark_collection.objects.link(root)
root.empty_display_size = 0.03
root["Source"] = "AxioSozo symbol v1 (borrowed) with orbit ring"
symbol.parent = root

vermilion = material("AxioSozo | Satin vermilion", "C73E1D", 0.3, 0.3, coat=0.2)
bpy.ops.mesh.primitive_torus_add(major_radius=RING_RADIUS, minor_radius=RING_TUBE,
                                 major_segments=256, minor_segments=24,
                                 location=RING_CENTER)
ring = bpy.context.object
ring.name = "04 | Orbit"
ring.data.name = "04 | Orbit ring"
for collection in list(ring.users_collection):
    collection.objects.unlink(ring)
mark_collection.objects.link(ring)
ring.parent = root
# Torus lies in XY (flat, facing Z). Tip its far side up so it reads as an ellipse
# from the front, then slant it in the picture plane.
ring.rotation_mode = 'XYZ'
ring.rotation_euler = (RING_TILT, RING_ROLL, 0)
ring.data.materials.append(vermilion)
for face in ring.data.polygons:
    face.use_smooth = True
ring["Radius_mm"] = RING_RADIUS * 1000
ring["Tube_mm"] = RING_TUBE * 1000
ring["Tilt_deg"] = math.degrees(RING_TILT)
ring["Roll_deg"] = math.degrees(RING_ROLL)

cream = material("AxioSozo | Cream tile", "F0E9D7", 0.0, 0.6, coat=0.08)
tile_y = TILE_GAP + TILE_DEPTH / 2
tile = bpy.data.objects.new("05 | App tile", squircle("05 | App tile outline", TILE, TILE_EXPONENT))
icon_collection.objects.link(tile)
tile.location = (0, tile_y, 0)
tile.data.materials.append(cream)
for face in tile.data.polygons:
    face.use_smooth = True
solid = tile.modifiers.new("Depth", 'SOLIDIFY')
solid.thickness, solid.offset = TILE_DEPTH, 0
solid.use_even_offset = True
bevel = tile.modifiers.new("Edge radius", 'BEVEL')
bevel.width, bevel.segments = 0.006, 8
bevel.limit_method = 'ANGLE'
bevel.angle_limit = math.radians(30)
bevel.harden_normals = True
tile.modifiers.new("Face-weighted normals", 'WEIGHTED_NORMAL').keep_sharp = True
tile["Grid"] = f"{ICON_TILE_PX} px squircle on a {ICON_CANVAS} px canvas"

bpy.ops.mesh.primitive_plane_add(size=4, location=(0, tile_y + TILE_DEPTH, 0),
                                 rotation=(math.pi / 2, 0, 0))
catcher = bpy.context.object
catcher.name = "Icon shadow catcher | excluded from GLB"
catcher.is_shadow_catcher = True
for collection in list(catcher.users_collection):
    collection.objects.unlink(catcher)
stage_collection.objects.link(catcher)

bpy.context.view_layer.update()
checks = evaluated_checks(parts + [tile])
lo, hi = world_bounds(ring)
symbol_lo = [min(world_bounds(p)[0][i] for p in parts) for i in range(3)]
symbol_hi = [max(world_bounds(p)[1][i] for p in parts) for i in range(3)]
# The orbit must pass fully in front of and behind the A, never through it, and
# stay inside the tile's front face.
assert hi[1] < tile_y - TILE_DEPTH / 2, "Orbit touches the tile"
assert hi[0] - lo[0] < TILE * 0.86 and hi[2] - lo[2] < TILE * 0.86, "Orbit crowds the tile"
print("GEOMETRY_CHECKS", checks, flush=True)

# Symbol intersection test: sample the orbit centre line against each evaluated part.
depsgraph = bpy.context.evaluated_depsgraph_get()
clearance = math.inf
for part in parts:
    evaluated = part.evaluated_get(depsgraph)
    inverse = evaluated.matrix_world.inverted()
    for i in range(720):
        angle = 2 * math.pi * i / 720
        local = Vector((RING_RADIUS * math.cos(angle), RING_RADIUS * math.sin(angle), 0))
        world = ring.matrix_world @ local
        hit, closest, _normal, _index = evaluated.closest_point_on_mesh(inverse @ world)
        if hit:
            clearance = min(clearance, ((evaluated.matrix_world @ closest) - world).length)
clearance_mm = (clearance - RING_TUBE) * 1000
assert clearance_mm > 2, f"Orbit clearance too small: {clearance_mm:.2f} mm"
print("ORBIT_CLEARANCE_MM", round(clearance_mm, 2), flush=True)

scene.world.use_nodes = True
world_bg = scene.world.node_tree.nodes.get("Background")
world_bg.inputs["Color"].default_value = (0.78, 0.76, 0.72, 1)
world_bg.inputs["Strength"].default_value = 0.22
light("Key | broad softbox", (-0.28, -0.36, 0.40), 8, 0.30, (1.0, 0.93, 0.82), stage_collection)
light("Edge | tall softbox", (0.30, 0.10, 0.30), 7, 0.30, (0.82, 0.90, 1.0), stage_collection)
light("Fill | front", (0.16, -0.50, 0.04), 1.6, 0.30, (1.0, 0.97, 0.91), stage_collection)

floor_mat = material("Studio | Warm cream floor", "F2EAD8", 0, 0.68, coat=0)
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, symbol_lo[2] - 0.0004))
floor = bpy.context.object
floor.name = "Studio ground | excluded from GLB"
for collection in list(floor.users_collection):
    collection.objects.unlink(floor)
stage_collection.objects.link(floor)
floor.data.materials.append(floor_mat)

hero = camera("Camera | three-quarter studio", (0.21, -0.66, 0.20), (0, 0, -0.004), 0.300, stage_collection)
front = camera("Camera | front orthographic", (0, -0.9, 0), (0, 0, 0), 0.270, stage_collection)
icon = camera("Camera | app icon", (0, -0.9, 0), (0, 0, 0),
              TILE * ICON_CANVAS / ICON_TILE_PX, stage_collection)

bpy.ops.object.select_all(action='DESELECT')
for obj in [root, symbol, ring, *parts]:
    obj.select_set(True)
bpy.context.view_layer.objects.active = ring
bpy.ops.export_scene.gltf(filepath=str(OUTPUT / "axiosozo-browser-mark-v1.glb"),
                          export_format='GLB', use_selection=True,
                          export_apply=True, export_yup=True,
                          export_cameras=False, export_lights=False)
scene.camera = hero
scene["Asset notes"] = ("Mark = borrowed AxioSozo symbol + orbit ring (GLB). "
                        "Icon = mark on cream squircle tile, front orthographic.")
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT / "axiosozo-browser-logo-v1.blend"))
(OUTPUT / "validation.json").write_text(json.dumps({
    "symbol_source": "../axiosozo-symbol-v1/axiosozo-symbol-v1.blend",
    "mark_width_mm": round((max(hi[0], symbol_hi[0]) - min(lo[0], symbol_lo[0])) * 1000, 2),
    "mark_height_mm": round((max(hi[2], symbol_hi[2]) - min(lo[2], symbol_lo[2])) * 1000, 2),
    "orbit": {"radius_mm": RING_RADIUS * 1000, "tube_mm": RING_TUBE * 1000,
              "tilt_deg": math.degrees(RING_TILT), "roll_deg": math.degrees(RING_ROLL),
              "min_clearance_to_symbol_mm": round(clearance_mm, 2)},
    "tile": {"size_mm": TILE * 1000, "depth_mm": TILE_DEPTH * 1000,
             "superellipse_exponent": TILE_EXPONENT,
             "grid": f"{ICON_TILE_PX}/{ICON_CANVAS} px"},
    "components": checks, "blender_version": bpy.app.version_string,
}, indent=2) + "\n")
print("ASSET_SAVED", str(OUTPUT), flush=True)

studio_only = {floor.name}
icon_only = {tile.name, catcher.name}
render(OUTPUT / "axiosozo-browser-mark-v1-preview.png", hero, 1600, 1600, 128, False, icon_only)
render(OUTPUT / "axiosozo-browser-mark-v1-front.png", front, 1600, 1600, 96, True, icon_only | studio_only)
render(OUTPUT / "axiosozo-browser-icon-v1-1024.png", icon, ICON_CANVAS, ICON_CANVAS, 160, True, studio_only)
print("RENDERS_COMPLETE", flush=True)
