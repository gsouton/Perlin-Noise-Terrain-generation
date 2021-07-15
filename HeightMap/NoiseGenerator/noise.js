import {
	DataTexture,
	FloatType,
	HalfFloatType,
	LuminanceFormat,
} from "../../vendors/three.js-r130/build/three.module.js";
import { perlin } from "./perlin.js";

function generateNoise(width, height) {
	let noiseMap = new Uint8Array(width * height);
	for (let i = 0; i < width * height; i++) {
		const value = Math.random() * 255;
		noiseMap[i] = value;
	}
	return noiseMap;
}

function generatePerlinNoise(
	width,
	height,
	scale,
	octave,
	persistance,
	lacunarity
) {
	let noiseMap = new Uint8Array(width * height);
    let max = Number.MAX_VALUE, min = Number.MIN_VALUE;

	for (let i = 0; i < width * height; i++) {
		let amplitude = 1;
		let frequency = 1;
		let noiseHeight = 0;

		let y = Math.floor(i / width);
		let x = ((i % width) / scale);

        for(let k = 0; k < octave; k++){
            let sampleX = x /scale * frequency;
            let sampleY = y /scale * frequency;

            let value = perlin(x, y) * 2 - 1;
		    noiseHeight += value * amplitude;
		    amplitude *= persistance;
		    frequency *= lacunarity;
        }
        noiseMap[i] = noiseHeight;
        if(noiseHeight < min){
            min = noiseHeight;
        }
        if(noiseHeight > max){
            max = noiseHeight;
        }
        noiseMap[i] = noiseHeight;
	}

    for(let i = 0; i < width*height; i++){
        noiseMap[i] = ((noiseMap[i] - min) / (max - min)) *255;
    }

	return noiseMap;
}

export function generateRandomTexture(width = 256, height = 256) {
	const noiseMap = generateNoise(width, height);
	return new DataTexture(noiseMap, width, height, LuminanceFormat);
}

export function generatePerlinTexture(width = 256, height = 256, scale = 0.3, ocatves = 4, persistance = .5, lacunarity = 2) {
	const noiseMap = generatePerlinNoise(width, height, scale, ocatves, persistance, lacunarity);
	return new DataTexture(noiseMap, width, height, LuminanceFormat);
}
