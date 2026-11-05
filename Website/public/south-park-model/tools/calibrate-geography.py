"""Recover local model registration using matching original Seattle FEATURE_IDs.
Uses retained public ArcGIS downloads in /tmp and the original exported model CSV.
This establishes source-data alignment, not independent survey accuracy.
"""
import csv,json,math
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[4]
page=Path(__file__).resolve().parents[1]
features=[]
for name in ['sp-buildings.geojson','sp-buildings-2.geojson','sp-buildings-3.geojson']:
    features+=json.loads((Path('/tmp')/name).read_text())['features']
by_id={str(f['properties'].get('FEATURE_ID')):f for f in features}
controls=[]
for row in csv.DictReader((root/'VR/reports/south-park-building-heights.csv').open()):
    feature=by_id.get(row['feature_id'])
    if not feature:continue
    polygons=feature['geometry']['coordinates'] if feature['geometry']['type']=='MultiPolygon' else [feature['geometry']['coordinates']]
    pts=[p for poly in polygons for ring in poly for p in ring]
    xs=[6378137*math.radians(p[0]) for p in pts]
    ys=[6378137*math.log(math.tan(math.pi/4+math.radians(p[1])/2)) for p in pts]
    controls.append({'feature_id':row['feature_id'],'mercator':[(min(xs)+max(xs))/2,(min(ys)+max(ys))/2], 'model_xz':[float(row['center_x_m'])-1009.5,-(float(row['center_y_m'])+8371.5)]})
a=np.array([[c['mercator'][0]+13617400,c['mercator'][1]-6029200,1] for c in controls]);b=np.array([c['model_xz'] for c in controls])
train=np.arange(len(a))%5!=0; mask=train.copy()
for _ in range(5):
    coeff=np.linalg.lstsq(a[mask],b[mask],rcond=None)[0]
    errors=np.linalg.norm(a@coeff-b,axis=1);mask=train&(errors<3)
holdout=errors[~train]
assert len(controls)>1000 and np.quantile(holdout,.95)<.5
result={'method':'Robust affine fit: matching Seattle 2015 FEATURE_ID bounding-box centers to original Rhino GIS bounding-box centers','source':'https://services.arcgis.com/ZOyb2t4B0UYuYNYH/arcgis/rest/services/Building_Outline_2015/FeatureServer/0','source_date':'2015 imagery; retrieved 2026-11-05','origin_mercator':[-13617400,6029200],'coefficients':coeff.tolist(),'matched_controls':len(controls),'training_inliers':int(sum(mask)),'holdout_count':int(sum(~train)),'holdout_median_m':float(np.median(holdout)),'holdout_p95_m':float(np.quantile(holdout,.95)),'holdout_max_m':float(max(holdout)),'all_controls_within_3m':int(sum(errors<3)),'excluded_mismatches':int(sum(errors>=3)),'limitation':'Source-data registration only, not surveyed accuracy; mismatched/changed footprints excluded from training. 95th percentile is unfiltered held-out data. No sensor altitude measurement.'}
(page/'data/georegistration.json').write_text(json.dumps(result,indent=2))
(page/'data/registration-controls.json').write_text(json.dumps(controls,separators=(',',':')))
print(json.dumps(result,indent=2))
