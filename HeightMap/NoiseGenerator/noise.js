import {
	DataTexture,
	FloatType,
	HalfFloatType,
	LuminanceFormat,
    RGBFormat,
    RGBM16Encoding,
} from "../../vendors/three.js-r130/build/three.module.js";
import {perlin, improvedPerlin } from "./perlin.js";

function generateNoise(width, height) {
	let noiseMap = new Uint8Array(width * height);
	for (let i = 0; i < width * height; i++) {
		const value = Math.random()*255;
		noiseMap[i] = value;
	}
	return noiseMap;
}


function generatePerlinNoise(width, height, scale, interpolationType, octaves, persitance){
    if(scale <= 0)
        scale = 0.0001;
    
    let noiseMap = new Uint8Array(width*height);
    
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            let sampleX = (x /width) /scale;
            let sampleY = (y /width) /scale;
            //let perlinValue = perlin(sampleX, sampleY, interpolationType);
            let perlinValue = octavePerlin(sampleX, sampleY, interpolationType, octaves, persitance);
            noiseMap[(width)*y+x] = perlinValue *255;
        }
    }
    return noiseMap;
}

function octavePerlin(x, y, interpolationType, octaves, persistance){
    let total = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    let maxValue = 0;
    for(let i = 0; i < octaves; i++){
        total += perlin(x*frequency, y*frequency, interpolationType) * amplitude;
        maxValue += amplitude;
        amplitude *= persistance;
        frequency *= 2;
    }
    return total/maxValue;
}


function generateImprovedPerlinNoise(width, height, scale, octaves, persistance, lacunarity){
    let noiseMap = new Uint8Array(width*height);
    
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            let sampleX = x /scale;
            let sampleY = y /scale;
            let perlinValue = improvedOctavePerlin(sampleX, sampleY, octaves, persistance, lacunarity);
           
           // console.log(perlinValue);
            noiseMap[(width)*y+x] = perlinValue *255;
        }
    }
    return noiseMap;
}

function improvedOctavePerlin(x, y, octaves, persistance, lacunarity){
    let total = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    let maxValue = 0;
    for(let i = 0; i < octaves; i++){
        total += improvedPerlin(x*frequency, y*frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistance;
        frequency *= lacunarity;
    }
    return total/maxValue;
}




export function generateRandomTexture(width = 256, height = 256) {
	const noiseMap = generateNoise(width, height);
	return new DataTexture(noiseMap, width, height, LuminanceFormat);
}

export function generatePerlinTexture(width = 256, height = 256, scale = 0.3, interpolationType="linear", octaves = 4, persitance = .5) {
	const noiseMap = generatePerlinNoise(width, height, scale, interpolationType, octaves, persitance);
	return new DataTexture(noiseMap, width, height, LuminanceFormat);
}

export function generateImprovedPerlinTexture(width = 256, height = 256, scale =0.3, octaves = 4, persistance = .5, lacunarity = 1){
    const noiseMap = generateImprovedPerlinNoise(width, height, scale, octaves, persistance, lacunarity);
    return new DataTexture(noiseMap, width, height, LuminanceFormat);
}





