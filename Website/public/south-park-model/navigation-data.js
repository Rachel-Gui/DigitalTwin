export function planExtent(bounds,padding=1.12){const span=Math.max(bounds.max[0]-bounds.min[0],bounds.max[2]-bounds.min[2])*padding;return {minX:(bounds.min[0]+bounds.max[0]-span)/2,minZ:(bounds.min[2]+bounds.max[2]-span)/2,span};}
export function planPoint(x,z,extent,size=256){const px=(x-extent.minX)/extent.span*size,py=(z-extent.minZ)/extent.span*size;return {x:px,y:py,outside:px<0||px>size||py<0||py>size,displayX:Math.max(10,Math.min(size-10,px)),displayY:Math.max(10,Math.min(size-10,py))};}
export function planWorld(x,y,extent,size=256){return [extent.minX+x/size*extent.span,extent.minZ+y/size*extent.span];}
export function cameraHeading(dx,dz){return Math.atan2(dx,-dz)*180/Math.PI;}
