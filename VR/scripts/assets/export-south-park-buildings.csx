#r "Grasshopper.dll"

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using GH_IO.Serialization;
using Grasshopper.Kernel;
using Grasshopper.Kernel.Data;
using Grasshopper.Kernel.Types;
using Rhino.Geometry;

var root = @"/Users/paul/Desktop/vr";
var sourcePath = Path.Combine(root, "02_Grasshopper/数据与GIS预处理/from shp to geo.gh");
var outputDir = Path.Combine(root, "webxr/.artifact-runtime/south-park-material-obj");
var reportPath = Path.Combine(root, "webxr/reports/south-park-building-heights.csv");
Directory.CreateDirectory(outputDir);
Directory.CreateDirectory(Path.GetDirectoryName(reportPath));

var archive = new GH_Archive();
if (!archive.ReadFromFile(sourcePath)) throw new Exception("Could not read Grasshopper archive");
var definition = new GH_Document();
if (!archive.ExtractObject(definition, "Definition")) throw new Exception("Could not extract Grasshopper definition");

IGH_Structure PersistentTree(string nickname, int expectedCount) {
  foreach (var obj in definition.Objects.Where(item => item.NickName == nickname)) {
    var tree = obj.GetType().GetProperty("PersistentData")?.GetValue(obj) as IGH_Structure;
    if (tree?.DataCount == expectedCount) return tree;
  }
  throw new Exception($"Could not find {nickname} with {expectedCount} persistent items");
}

List<object> BranchValues(IGH_Structure tree, int branchIndex) {
  return tree.get_Branch(new GH_Path(branchIndex))
    .Cast<object>()
    .Select(item => (item as IGH_Goo)?.ScriptVariable())
    .ToList();
}

void WriteObj(string path, Mesh mesh, string materialName) {
  mesh.Transform(Transform.Scale(Point3d.Origin, 1000.0));
  mesh.Faces.ConvertQuadsToTriangles();
  mesh.Normals.ComputeNormals();
  mesh.Compact();
  using var writer = new StreamWriter(path, false, new UTF8Encoding(false));
  writer.WriteLine("# Real-height South Park buildings restored from Grasshopper persistent GIS data");
  writer.WriteLine($"usemtl {materialName}");
  foreach (var vertex in mesh.Vertices) writer.WriteLine(string.Format(CultureInfo.InvariantCulture, "v {0:R} {1:R} {2:R}", vertex.X, vertex.Y, vertex.Z));
  foreach (var normal in mesh.Normals) writer.WriteLine(string.Format(CultureInfo.InvariantCulture, "vn {0:R} {1:R} {2:R}", normal.X, normal.Y, normal.Z));
  foreach (var face in mesh.Faces) {
    var a = face.A + 1;
    var b = face.B + 1;
    var c = face.C + 1;
    writer.WriteLine($"f {a}//{a} {b}//{b} {c}//{c}");
  }
}

var footprints = PersistentTree("footprint_internalised", 1432).AllData(true)
  .Cast<object>()
  .Select(item => (item as IGH_Goo)?.ScriptVariable() as Brep)
  .ToList();
var attributes = PersistentTree("values_internalised", 21480);
var featureIds = BranchValues(attributes, 0).Select(Convert.ToString).ToList();
var heights = BranchValues(attributes, 2)
  .Select(value => Convert.ToDouble(value, CultureInfo.InvariantCulture))
  .ToList();

if (footprints.Count != heights.Count || heights.Any(height => height <= 0 || double.IsNaN(height))) {
  throw new Exception("Footprints and positive Height values are not a valid one-to-one pair");
}

// This is the one pink-highlighted building in the original uniform-height export.
var pinkCenter = new Point3d(1619.219857069722, -8853.732689085882, 0);
var pinkIndex = Enumerable.Range(0, footprints.Count)
  .OrderBy(index => footprints[index].GetBoundingBox(true).Center.DistanceTo(pinkCenter))
  .First();

var plaster = new Mesh();
var pink = new Mesh();
using (var report = new StreamWriter(reportPath, false, new UTF8Encoding(false))) {
  report.WriteLine("source_index,feature_id,height_m,center_x_m,center_y_m,min_x_m,min_y_m,max_x_m,max_y_m,highlighted");
  for (var index = 0; index < footprints.Count; index++) {
    var footprint = footprints[index] ?? throw new Exception($"Footprint {index} is null");
    var height = heights[index];
    var path = new LineCurve(Point3d.Origin, new Point3d(0, 0, height));
    var solid = footprint.Faces[0].CreateExtrusion(path, true);
    if (solid == null || !solid.IsSolid) throw new Exception($"Could not create solid building {index}");
    var pieces = Mesh.CreateFromBrep(solid, MeshingParameters.QualityRenderMesh);
    if (pieces == null || pieces.Length == 0) throw new Exception($"Could not mesh building {index}");
    var destination = index == pinkIndex ? pink : plaster;
    foreach (var piece in pieces) destination.Append(piece);
    var bounds = footprint.GetBoundingBox(true);
    report.WriteLine(string.Join(",", new [] {
      index.ToString(CultureInfo.InvariantCulture),
      featureIds[index],
      height.ToString("0.########", CultureInfo.InvariantCulture),
      bounds.Center.X.ToString("0.########", CultureInfo.InvariantCulture),
      bounds.Center.Y.ToString("0.########", CultureInfo.InvariantCulture),
      bounds.Min.X.ToString("0.########", CultureInfo.InvariantCulture),
      bounds.Min.Y.ToString("0.########", CultureInfo.InvariantCulture),
      bounds.Max.X.ToString("0.########", CultureInfo.InvariantCulture),
      bounds.Max.Y.ToString("0.########", CultureInfo.InvariantCulture),
      index == pinkIndex ? "true" : "false",
    }));
  }
}

var plasterPath = Path.Combine(outputDir, "south_park_buildings__Plaster.obj");
var pinkPath = Path.Combine(outputDir, "south_park_buildings__Plaster_pink.obj");
WriteObj(plasterPath, plaster, "Plaster");
WriteObj(pinkPath, pink, "Plaster_pink");

var sortedHeights = heights.OrderBy(value => value).ToList();
var median = (sortedHeights[(sortedHeights.Count - 1) / 2] + sortedHeights[sortedHeights.Count / 2]) / 2.0;
var metadataPath = Path.Combine(outputDir, "south_park_buildings__metadata.json");
File.WriteAllText(metadataPath,
  "{\n" +
  "  \"source\": \"from shp to geo.gh / footprint_internalised + Height\",\n" +
  $"  \"buildingCount\": {heights.Count},\n" +
  $"  \"heightMeters\": {{ \"min\": {sortedHeights.First().ToString(CultureInfo.InvariantCulture)}, \"max\": {sortedHeights.Last().ToString(CultureInfo.InvariantCulture)}, \"mean\": {heights.Average().ToString(CultureInfo.InvariantCulture)}, \"median\": {median.ToString(CultureInfo.InvariantCulture)}, \"distinct\": {heights.Distinct().Count()} }},\n" +
  $"  \"highlightedFeatureId\": \"{featureIds[pinkIndex]}\"\n" +
  "}\n",
  new UTF8Encoding(false));

Console.WriteLine($"Buildings: {heights.Count}; height {sortedHeights.First():0.##}-{sortedHeights.Last():0.##} m; mean {heights.Average():0.##} m; median {median:0.##} m");
Console.WriteLine($"Pink building: index {pinkIndex}; feature {featureIds[pinkIndex]}; height {heights[pinkIndex]:0.##} m");
Console.WriteLine($"OBJ: {plasterPath} ({plaster.Vertices.Count} vertices), {pinkPath} ({pink.Vertices.Count} vertices)");
Console.WriteLine($"Report: {reportPath}");
