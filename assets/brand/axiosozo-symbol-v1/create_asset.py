"""Build the selected AxioSozo symbol as editable beveled Blender geometry.

Run with Blender --background --factory-startup --python create_asset.py.
No third-party packages beyond Blender's bundled numpy are required.
"""
from pathlib import Path
from collections import defaultdict
import json
import math

import bpy
import bmesh
import numpy as np
from mathutils import Vector

OUTPUT = Path(__file__).resolve().parent
# Borrowed copy: the AxioSozo repository keeps this PNG at
# public/Logos/concepts-v6/01-selected-symbol.png.
SOURCE = OUTPUT / "source-01-selected-symbol.png"
WIDTH = 0.160
DEPTH = 0.014
BEVEL = 0.00065


def area(points):
    return sum(a[0] * b[1] - b[0] * a[1]
               for a, b in zip(points, points[1:] + points[:1])) / 2


def simplify_open(points, tolerance):
    if len(points) < 3:
        return points
    coords = np.asarray(points, dtype=float)
    start, end = coords[0], coords[-1]
    delta = end - start
    length2 = float(delta @ delta)
    if length2 == 0:
        distances = np.linalg.norm(coords - start, axis=1)
    else:
        t = np.clip(((coords - start) @ delta) / length2, 0, 1)
        distances = np.linalg.norm(coords - start - t[:, None] * delta, axis=1)
    split = int(np.argmax(distances))
    if distances[split] <= tolerance:
        return [points[0], points[-1]]
    return (simplify_open(points[:split + 1], tolerance)[:-1]
            + simplify_open(points[split:], tolerance))


def simplify_closed(points, tolerance=1.5):
    first = min(range(len(points)), key=lambda i: points[i])
    points = points[first:] + points[:first]
    opposite = max(range(len(points)), key=lambda i:
                   (points[i][0] - points[0][0]) ** 2
                   + (points[i][1] - points[0][1]) ** 2)
    return (simplify_open(points[:opposite + 1], tolerance)[:-1]
            + simplify_open(points[opposite:] + points[:1], tolerance)[:-1])


def smooth_outline(points):
    """Fit smooth cubic spans while retaining hard corners and long straight edges."""
    p = np.asarray(points, dtype=float)
    incoming, outgoing = [], []
    for i, current in enumerate(p):
        before = current - p[i - 1]
        after = p[(i + 1) % len(p)] - current
        a, b = np.linalg.norm(before), np.linalg.norm(after)
        u, v = before / a, after / b
        if float(u @ v) < math.cos(math.radians(50)):
            incoming.append(u)
            outgoing.append(v)
            continue
        tangent = u if a > 80 else v if b > 80 else (u + v) / np.linalg.norm(u + v)
        incoming.append(tangent)
        outgoing.append(tangent)
    result = []
    for i, start in enumerate(p):
        j = (i + 1) % len(p)
        end = p[j]
        length = np.linalg.norm(end - start)
        c1 = start + outgoing[i] * length / 3
        c2 = end - incoming[j] * length / 3
        direction = (end - start) / length
        straight = (abs(float(direction @ outgoing[i]) - 1) < 1e-6
                    and abs(float(direction @ incoming[j]) - 1) < 1e-6)
        count = 1 if straight else max(3, math.ceil(length / 4))
        for t in np.linspace(0, 1, count, endpoint=False):
            value = ((1 - t) ** 3 * start + 3 * (1 - t) ** 2 * t * c1
                     + 3 * (1 - t) * t ** 2 * c2 + t ** 3 * end)
            result.append(tuple(value.tolist()))
    return result


def trace_alpha(mask):
    """Trace counterclockwise pixel-cell boundaries, preserving separate islands."""
    padded = np.pad(mask, 1)
    neighbors = [padded[:-2, 1:-1], padded[1:-1, 2:],
                 padded[2:, 1:-1], padded[1:-1, :-2]]
    offsets = [((0, 0), (1, 0)), ((1, 0), (1, 1)),
               ((1, 1), (0, 1)), ((0, 1), (0, 0))]
    outgoing = defaultdict(list)
    for neighbor, (a, b) in zip(neighbors, offsets):
        ys, xs = np.where(mask & ~neighbor)
        for x, y in zip(xs.tolist(), ys.tolist()):
            outgoing[(x + a[0], y + a[1])].append((x + b[0], y + b[1]))
    contours = []
    while outgoing:
        start = next(iter(outgoing))
        point, loop = start, []
        while True:
            loop.append(point)
            next_point = outgoing[point].pop()
            if not outgoing[point]:
                del outgoing[point]
            point = next_point
            if point == start:
                break
        if abs(area(loop)) > 100:
            assert area(loop) > 0, "Unexpected internal hole in the chosen symbol"
            contours.append(simplify_closed(loop))
    return contours


def linear(value):
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def material(name, hex_color, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    rgb = [linear(int(hex_color[i:i + 2], 16) / 255) for i in (0, 2, 4)]
    mat.diffuse_color = (*rgb, 1)
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Coat Weight"].default_value = 0.18
    bsdf.inputs["Coat Roughness"].default_value = 0.24
    return mat


def point_at(obj, target):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()


def place_in(obj, collection):
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    collection.objects.link(obj)


def light(name, location, energy, size, color, collection):
    data = bpy.data.lights.new(name, "AREA")
    data.energy, data.shape, data.size, data.color = energy, 'DISK', size, color
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = location
    point_at(obj, (0, 0, 0))
    return obj


def rasterize(polygons, height, width):
    """Independent scanline check of the simplified front silhouette."""
    result = np.zeros((height, width), dtype=bool)
    for poly in polygons:
        for row in range(max(0, int(min(y for x, y in poly))),
                         min(height, int(max(y for x, y in poly)) + 1)):
            y = row + 0.5
            cuts = []
            for a, b in zip(poly, poly[1:] + poly[:1]):
                if (a[1] <= y < b[1]) or (b[1] <= y < a[1]):
                    cuts.append(a[0] + (y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]))
            cuts.sort()
            for x1, x2 in zip(cuts[::2], cuts[1::2]):
                left = max(0, math.ceil(x1 - 0.5))
                right = min(width, math.ceil(x2 - 0.5))
                result[row, left:right] = True
    return result


bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.name = "AxioSozo | Composition symbol"
scene.unit_settings.system = 'METRIC'
scene.unit_settings.length_unit = 'MILLIMETERS'
scene.render.engine = 'CYCLES'
scene.cycles.samples = 96
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
scene.view_settings.view_transform = 'AgX'
scene.render.resolution_x = 1600
scene.render.resolution_y = 1600
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.film_transparent = False
scene.render.fps = 30

img = bpy.data.images.load(str(SOURCE), check_existing=True)
img.name = "REFERENCE | Selected symbol 01"
pixels = np.empty(len(img.pixels), dtype=np.float32)
img.pixels.foreach_get(pixels)
image_width, image_height = img.size
rgba = pixels.reshape(image_height, image_width, 4)
mask = rgba[:, :, 3] >= 0.5
polygons = [smooth_outline(p) for p in trace_alpha(mask)]
assert len(polygons) == 3, f"Expected three logo components, found {len(polygons)}"
traced_mask = rasterize(polygons, image_height, image_width)
iou = float(np.count_nonzero(mask & traced_mask) / np.count_nonzero(mask | traced_mask))
assert iou > 0.99, f"Trace fidelity unexpectedly low: {iou}"
print("TRACE", {"components": len(polygons), "silhouette_iou": iou,
                 "outline_vertices": [len(p) for p in polygons]}, flush=True)
img.use_fake_user = True
img.pack()

points = np.asarray([point for poly in polygons for point in poly])
minimum, maximum = points.min(axis=0), points.max(axis=0)
center = (minimum + maximum) / 2
scale = WIDTH / (maximum[0] - minimum[0])
height = float((maximum[1] - minimum[1]) * scale)

asset_collection = bpy.data.collections.new("01 | LOGO — export geometry")
stage_collection = bpy.data.collections.new("02 | STUDIO — lights and cameras")
scene.collection.children.link(asset_collection)
scene.collection.children.link(stage_collection)
parent = bpy.data.objects.new("AxioSozo Symbol", None)
asset_collection.objects.link(parent)
parent.empty_display_size = 0.02
parent["Source"] = "Selected symbol 01, concepts-v6; no wordmark"
parent["Width_mm"] = WIDTH * 1000
parent["Depth_mm"] = DEPTH * 1000
parent["Bevel_mm"] = BEVEL * 1000
parent["Silhouette_IoU"] = iou
graphite = material("AxioSozo | Satin graphite", "1C1A16", 0.28, 0.36)
graphite.node_tree.nodes.get("Principled BSDF").inputs["Coat Weight"].default_value = 0.08
parts = []
polygons.sort(key=lambda p: (-sum(y for x, y in p) / len(p),
                             sum(x for x, y in p) / len(p)))
part_names = ["01 | Crown", "02 | Left leg", "03 | Right leg"]
# The two lower parts are identified by their centroids, independent of height.
polygons[1:] = sorted(polygons[1:], key=lambda p: sum(x for x, y in p) / len(p))
for name, polygon in zip(part_names, polygons):
    vertices = [((x - center[0]) * scale, (y - center[1]) * scale, 0)
                for x, y in polygon]
    mesh = bpy.data.meshes.new(name + " | traced outline")
    mesh.from_pydata(vertices, [], [list(range(len(vertices)))])
    mesh.update()
    for face in mesh.polygons:
        face.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    asset_collection.objects.link(obj)
    obj.parent = parent
    obj.rotation_euler.x = math.pi / 2
    obj.data.materials.append(graphite)
    solid = obj.modifiers.new("Depth | 14 mm", 'SOLIDIFY')
    solid.thickness, solid.offset = DEPTH, 0
    solid.use_even_offset = True
    solid.use_quality_normals = True
    bevel = obj.modifiers.new("Edge radius | 0.65 mm", 'BEVEL')
    bevel.width, bevel.segments = BEVEL, 4
    bevel.limit_method = 'ANGLE'
    bevel.angle_limit = math.radians(25)
    bevel.use_clamp_overlap = True
    bevel.harden_normals = True
    normals = obj.modifiers.new("Face-weighted normals", 'WEIGHTED_NORMAL')
    normals.keep_sharp = True
    normals.weight = 50
    obj["Outline_source"] = "PNG alpha silhouette, 1.5 px simplification with smooth cubic spans"
    parts.append(obj)

bpy.context.view_layer.update()
checks = []
depsgraph = bpy.context.evaluated_depsgraph_get()
for obj in parts:
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
    assert bad_edges == 0 and volume > 0, f"Invalid solid: {obj.name}, {checks[-1]}"
    bm.free()
    evaluated.to_mesh_clear()
print("GEOMETRY_CHECKS", checks, flush=True)

cream = material("Studio | Warm cream", "F2EAD8", 0, 0.68)
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, -height / 2 - 0.0004))
floor = bpy.context.object
floor.name = "Studio ground | excluded from GLB"
place_in(floor, stage_collection)
floor.data.materials.append(cream)
scene.world.use_nodes = True
world_bg = scene.world.node_tree.nodes.get("Background")
world_bg.inputs["Color"].default_value = (0.68, 0.72, 0.80, 1)
world_bg.inputs["Strength"].default_value = 0.24
light("Key | broad softbox", (-0.25, -0.3, 0.38), 4, 0.24, (1.0, 0.93, 0.82), stage_collection)
light("Edge | tall softbox", (0.25, 0.08, 0.27), 7, 0.24, (0.82, 0.9, 1.0), stage_collection)
light("Fill | front", (0.14, -0.42, 0.06), 0.65, 0.22, (1.0, 0.97, 0.91), stage_collection)

camera_data = bpy.data.cameras.new("Camera | three-quarter studio")
camera = bpy.data.objects.new(camera_data.name, camera_data)
stage_collection.objects.link(camera)
camera.location = (0.19, -0.66, 0.19)
point_at(camera, (0, 0, -0.002))
camera_data.type = 'ORTHO'
camera_data.ortho_scale = 0.226
camera_data.lens = 70
camera_data.clip_start = 0.001
camera_data.clip_end = 250
scene.camera = camera

front_data = bpy.data.cameras.new("Camera | front orthographic")
front = bpy.data.objects.new(front_data.name, front_data)
stage_collection.objects.link(front)
front.location = (0, -0.66, 0)
point_at(front, (0, 0, 0))
front_data.type = 'ORTHO'
front_data.ortho_scale = 0.205
front_data.clip_start = 0.001

bpy.ops.object.select_all(action='DESELECT')
parent.select_set(True)
for obj in parts:
    obj.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.export_scene.gltf(filepath=str(OUTPUT / "axiosozo-symbol-v1.glb"),
                          export_format='GLB', use_selection=True,
                          export_apply=True, export_yup=True,
                          export_cameras=False, export_lights=False)
scene.render.filepath = str(OUTPUT / "axiosozo-symbol-v1-preview.png")
for screen in bpy.data.screens:
    for region in screen.areas:
        if region.type == 'VIEW_3D':
            region.spaces.active.region_3d.view_perspective = 'CAMERA'
            region.spaces.active.clip_start = 0.001
            region.spaces.active.shading.type = 'MATERIAL'
scene["Asset notes"] = "Three editable meshes with live Solidify, Bevel and Weighted Normal modifiers. GLB includes the logo only."
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT / "axiosozo-symbol-v1.blend"))
(OUTPUT / "validation.json").write_text(json.dumps({
    "source": str(SOURCE), "silhouette_iou_before_bevel": iou,
    "width_mm": WIDTH * 1000, "height_mm": height * 1000,
    "depth_mm": DEPTH * 1000, "requested_bevel_mm": BEVEL * 1000,
    "components": checks, "blender_version": bpy.app.version_string,
}, indent=2) + "\n")
print("ASSET_SAVED", str(OUTPUT), flush=True)
bpy.ops.render.render(write_still=True)
scene.camera = front
floor.hide_render = True
scene.render.film_transparent = True
scene.render.filepath = str(OUTPUT / "axiosozo-symbol-v1-front.png")
bpy.ops.render.render(write_still=True)
print("RENDERS_COMPLETE", flush=True)
