import {
	DataTexture,
	FloatType,
	HalfFloatType,
	LuminanceFormat,
} from "../../vendors/three.js-r130/build/three.module.js";
import { improvedPerlin, perlin } from "./perlin.js";

function generateNoise(width, height) {
	let noiseMap = new Uint8Array(width * height);
	for (let i = 0; i < width * height; i++) {
		const value = Math.random() * 255;
		noiseMap[i] = value;
	}
	return noiseMap;
}


function generateOriginalPerlinNoise(width, height, scale){
    if(scale <= 0)
        scale = 0.1;
    
    let noiseMap = new Uint8Array(width*height);
    for(let i = 0 ; i < width*height; i++){
        noiseMap[i] = 650;
    }
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            let sampleX = x / scale;
            let sampleY = y / scale;
            let perlinValue = perlin(sampleX, sampleY);
            //console.log("x:", x, ", y:", y, "Samples: {",sampleX, ", ", sampleY, "}" );
            //console.log("i: ", (width)*y+x);
            //console.log("perlinValue: ",perlinValue, "to 255: ", perlinValue*255);
            
            noiseMap[(width)*y+x] = perlinValue *255;
        }
    }
    //console.log(noiseMap);
    return noiseMap;
}

function generateImprovedPerlinNoise(width, height, scale){
    if(scale <= 0)
        scale = 0.1;
    
    let noiseMap = new Uint8Array(width*height);
    for(let i = 0 ; i < width*height; i++){
        noiseMap[i] = 650;
    }
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            let sampleX = x / scale;
            let sampleY = y / scale;
            let perlinValue = improvedPerlin(sampleX, sampleY);
            //console.log("x:", x, ", y:", y, "Samples: {",sampleX, ", ", sampleY, "}" );
            //console.log("i: ", (width)*y+x);
            //console.log("perlinValue: ",perlinValue, "to 255: ", perlinValue*255);
            
            noiseMap[(width)*y+x] = perlinValue *255;
        }
    }
    //console.log(noiseMap);
    return noiseMap;
}


export function generateRandomTexture(width = 256, height = 256) {
	const noiseMap = generateNoise(width, height);
	return new DataTexture(noiseMap, width, height, LuminanceFormat);
}

export function generateOrignalPerlinTexture(width = 256, height = 256, scale = 0.3, ocatves = 4, persistance = .5, lacunarity = 2) {
	const noiseMap = generateOriginalPerlinNoise(width, height, scale, ocatves, persistance, lacunarity);
	return new DataTexture(noiseMap, width, height, LuminanceFormat);
}

export function generateImprovedPerlinTexture(width = 256, height = 256, scale =0.3){
    const noiseMap = generateImprovedPerlinNoise(width, height, scale);
    return new DataTexture(noiseMap, width, height, LuminanceFormat);
}

