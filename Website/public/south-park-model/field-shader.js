export const AIR_FIELD_GLSL = `
uniform vec3 uSize;uniform vec2 uSensors[4];uniform float uValues[4];uniform int uSensorCount;uniform float uScaleMin,uScaleMax;
float field(vec3 p){float sum=0.0,wSum=0.0;vec2 point=p.xz*uSize.xz;for(int j=0;j<4;j++){if(j>=uSensorCount)break;float d=length(point-uSensors[j]);if(d<.001)return uValues[j];float w=1.0/pow(max(d,20.0),2.0);sum+=w*uValues[j];wSum+=w;}return sum/max(wSum,.000000001);}
vec3 palette(float t){vec3 a=vec3(.13,.65,.96),b=vec3(.18,.88,.72),c=vec3(.95,.88,.25),d=vec3(1.,.42,.15),e=vec3(.87,.2,.61);vec3 color=t<.25?mix(a,b,t*4.):t<.5?mix(b,c,(t-.25)*4.):t<.75?mix(c,d,(t-.5)*4.):mix(d,e,(t-.75)*4.);return pow(color,vec3(2.2));}
`;
