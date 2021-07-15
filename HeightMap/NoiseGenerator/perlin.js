import {Vector2} from "../../vendors/three.js-r130/build/three.module.js";

//Table used by Ken Perlin in his original implementation 
const perlin_permutation_table = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 
    103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 
    26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 
    87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 
    46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 
    187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 
    198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 
    255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 
    170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 
    172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 
    104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 
    241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 
    157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 
    93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];


function randomGradientVector2(){
    return new Vector2(Math.random(), Math.random());
}

function dotProductGradientandDistanceVector(ix, iy, x, y){
    let gradient = randomGradientVector2();

    // distance vector from corner to a point
    let dx = x - ix;
    let dy = y - iy;

    return gradient.x*dx + gradient.y*dy;
}

function fade(t){
    return ((6*t -15)*t + 10)*t*t*t;
}

function interpolate(p0, p1, t){
    //return (1-t) *p0 + t*p1;
    return p1 + t*(p1-p0);
}

export function perlin(x, y){
    // grid cell coordinates
    /**
     *      (x0,y0)------------------(x1, y0)
     *         |                         |
     *         |            (x,y)        |
     *         |                         |
     *         |                         |
     *         |                         |
     *      (x0, y1)-----------------(x1, y1)
     */
    let x0 = Math.floor(x);
    let y0 = Math.floor(y);
    let x1 = x0 + 1;
    let y1 = y0 + 1;

    // weight for interpolation
    let tx = x - x0;
    let ty = y - y0;
    let u = fade(tx);
    let v = fade(ty);
    
    let dotLeftCorner = dotProductGradientandDistanceVector(x0, y0, x, y); // top left corner
    let dotRightCorner = dotProductGradientandDistanceVector(x1, y0, x, y); // top right corner
    let interpolation1 = interpolate(dotLeftCorner, dotRightCorner, v);

    dotLeftCorner = dotProductGradientandDistanceVector(x0, y1, x, y);
    dotRightCorner = dotProductGradientandDistanceVector(x1, y1, x, y);
    let interpolation2 = interpolate(dotLeftCorner, dotRightCorner, u);

    
    return interpolate(u, interpolation1, interpolation2);

    //return interpolate(interpolation1, interpolation2, ty)
}

export function improvedPerlin(x, y){
    // grid cell coordinates
    /**
     *      (x0,y0)------------------(x1, y0)
     *         |                         |
     *         |            (x,y)        |
     *         |                         |
     *         |                         |
     *         |                         |
     *      (x0, y1)-----------------(x1, y1)
     */
    let X = Math.floor(x) & 255;
    let Y = Math.floor(y) & 255;

    let xf = x-Math.floor(x);
    let yf = y-Math.floor(y);
    
    let u = fade(xf);
    let v = fade(yf);

    let topRight = new Vector2(xf - 1.0, yf -1.0);
    let topLeft = new Vector2(xf, yf-1.0);
    let bottomRight = new Vector2(xf -1.0, yf);
    let bottomLeft = new Vector2(xf, yf);

    let valueTopRight = perlin_permutation_table[perlin_permutation_table[X+1]+Y+1];
    let valueTopLeft = perlin_permutation_table[perlin_permutation_table[X] +Y+1];
    let valueBottomRight = perlin_permutation_table[perlin_permutation_table[X+1]+Y];
    let valueBottomLeft = perlin_permutation_table[perlin_permutation_table[X]+Y];

    let dotTopRight = topRight.dot(constantVector(valueTopRight));
    let dotTopLeft = topLeft.dot(constantVector(valueTopLeft));
	let dotBottomRight = bottomRight.dot(constantVector(valueBottomRight));
	let dotBottomLeft = bottomLeft.dot(constantVector(valueBottomLeft));

    

    return interpolate(u, interpolate(v, dotBottomLeft, dotTopLeft), interpolate(v, dotBottomRight, dotTopRight));
}

function constantVector(value){
    let h = value & 3;
	if(h == 0)
		return new Vector2(1.0, 1.0);
	else if(h == 1)
		return new Vector2(-1.0, 1.0);
	else if(h == 2)
		return new Vector2(-1.0, -1.0);
	else
		return new Vector2(1.0, -1.0);
}