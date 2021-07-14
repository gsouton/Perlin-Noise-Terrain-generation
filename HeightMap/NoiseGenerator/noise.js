import {DataTexture}  from "../../vendors/three.js-r130/build/three.module.js" 
import { FloatType } from "../../vendors/three.js-r130/build/three.module.js";

export function generateNoise(width, height){
    noiseMap = new Float32Array(width*height);
    for(let i = 0; i < width*height; i++)
        noiseMap[i] = Math.random();
    return noiseMap;
}

export function generateTexture(width = 256, height = 256){
    noiseMap = generateNoise(width, height);
    return DataTexture(noiseMap, width, height, FloatType);

}