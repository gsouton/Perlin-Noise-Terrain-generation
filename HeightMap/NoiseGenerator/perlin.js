import { MathUtils, Vector2 } from "../../vendors/three.js-r130/build/three.module.js";

//Table used by Ken Perlin in his original implementation
const permutationTable = new Uint8Array([
	151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
	36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
	234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
	88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
	134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
	230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
	1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
	116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
	124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
	47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
	154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
	108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
	242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
	239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
	50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
	141, 128, 195, 78, 66, 215, 61, 156, 180,
]);

let p = new Uint8Array(512);
let isTableInit = false;
initPermutationTable(p);

const vectors = [new Vector2(1.0, 0.0), new Vector2(-1.0, 0), new Vector2(0.0, 1.0), new Vector2(0.0, -1.0)];

function initPermutationTable(p){
	let size = p.length/2;
	for(let i = 0; i < size; i++){
		p[size+i] = p[i] = permutationTable[i];
		
	}
	isTableInit = true;
}



function randomGradientVector2(ix, iy) {
	let random = 2920.0 * Math.sin(ix * 21942.0 + iy * 171324.0 + 8912.0) * Math.cos(ix * 23157.0 * iy * 217832.0 + 9758.0);
	
	let randGrad = new Vector2(Math.cos(random), Math.sin(random));
	return randGrad;

}

function dotProductGradientandDistanceVector(ix, iy, x, y) {
	let gradient = randomGradientVector2(ix, iy);

	// distance vector from corner to a point
	let dist = new Vector2(x -ix, y -iy);
	return gradient.dot(dist);
}

function interpolate(x, y, t, type="linear"){
	if(type === "smoothstep")
		return (y - x) * (3.0 - t *2.0) * t * t + x;
	else if(type === "smootherstep")
		return (y - x) * ((t *(t*6.0 -15.0)+ 10.0) * t * t * t) +x;
	else
		return MathUtils.lerp(x, y, t);

}

export function perlin(x, y, interpolation="linear") {
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
	

	let dotLeftCorner = dotProductGradientandDistanceVector(x0, y0, x, y); // top left corner
	let dotRightCorner = dotProductGradientandDistanceVector(x1, y0, x, y); // top right corner
	let interpolation1 = interpolate(dotLeftCorner, dotRightCorner, tx, interpolation);

	dotLeftCorner = dotProductGradientandDistanceVector(x0, y1, x, y);
	dotRightCorner = dotProductGradientandDistanceVector(x1, y1, x, y);
	let interpolation2 = interpolate(dotLeftCorner, dotRightCorner, tx, interpolation);

	return interpolate(interpolation1, interpolation2, ty, interpolation);

}

export function improvedPerlin(x, y){
	if(isTableInit === false){
		initPermutationTable(p);
	}
	let X = Math.floor(x) & 255;
	let Y = Math.floor(y) & 255;

	x = x - Math.floor(x);
	y = y - Math.floor(y);

	//let u = MathUtils.smootherstep(x, Number.MIN_VALUE, Number.MAX_VALUE);
	//let v = MathUtils.smootherstep(y, Number.MIN_VALUE, Number.MAX_VALUE);
	let u = fade(x);
	let v = fade(y);

	let bottomLeftCorner = p[p[X]+Y];
	let bottomRightCorner = p[p[X+1]+Y];

	let topLeftCorner = p[p[X]+Y+1];
	let topRightCorner = p[p[X+1]+Y+1];

	
	let bottomLeft = new Vector2(x, y);
	let topLeft = new Vector2(x, y-1);
	let bottomRight = new Vector2(x-1, y);
	let topRight = new Vector2(x-1, y-1);

	let x1 = interpolate(bottomLeft.dot(grad(bottomLeftCorner)), bottomRight.dot(grad(bottomRightCorner)), u);
	let x2 = interpolate(topLeft.dot(grad(topLeftCorner)), topRight.dot(grad(topRightCorner)), u);
	return interpolate(x1, x2, v);
	
	

}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }


function grad(hash, x, y){
	return vectors[hash & 3];
	/*const h = hash & 3;
	if (h === 0)
		return x;
	else if (h === 1)
		return -x;
	else if (h === 2)
		return y;
	else 
		return -y;
		*/
}





