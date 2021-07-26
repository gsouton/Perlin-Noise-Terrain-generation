import {
	DataTexture,
	LuminanceFormat,
    MathUtils,
    Vector2,
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
            let perlinValue = octavePerlin(sampleX, sampleY, interpolationType, octaves, persitance);
            perlinValue += 1.0;
            perlinValue /= 2.0;
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


function generateImprovedPerlinNoise(width, height, scale, octaves, persistance, lacunarity, seed, offset){
    let noiseMap = new Uint8Array(width*height);
    let octaveOffset = generateOctaveOffset(octaves, seed, offset);
    let halfWidth = width/2;
    let halfHeight = height/2;
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            let sampleX = (x - halfWidth) /scale;
            let sampleY = (y - halfHeight) /scale;
            let perlinValue = improvedOctavePerlin(sampleX, sampleY, octaves, persistance, lacunarity, octaveOffset);
           
           // console.log(perlinValue);
            noiseMap[(width)*y+x] = perlinValue *255;
        }
    }
    return noiseMap;
}

function generateOctaveOffset(octaves, seed, offset){
    let octaveOffset = [];
    for(let i = 0; i < octaves; i++){
        let random = MathUtils.seededRandom(seed);
        octaveOffset.push(new Vector2(random + offset.x, random + offset.y ));
    }
    return octaveOffset;
}

function improvedOctavePerlin(x, y, octaves, persistance, lacunarity, octaveOffset){
    let total = 0;
    let frequency = 1.0;
    let amplitude = 1.0;
    let maxValue = 0;
    for(let i = 0; i < octaves; i++){
        
        total += improvedPerlin(x*frequency + octaveOffset[i].x, y*frequency + octaveOffset[i].y) * amplitude;
        maxValue += amplitude;
        amplitude *= persistance;
        frequency *= lacunarity;
    }
    //console.log(total, maxValue);
    //return total/maxValue;
    return total;
}






export function generateRandomMaps(width = 256, height = 256, regionMap) {
	const noiseMap = generateNoise(width, height);
    const colorMap = generateColorMap(noiseMap, width, height, regionMap);
	return {noiseMap:noiseMap, colorMap: colorMap};
}

export function generatePerlinMaps(width = 256, height = 256, scale = 0.3, interpolationType="linear", octaves = 4, persitance = .5, regionMap) {
	const noiseMap = generatePerlinNoise(width, height, scale, interpolationType, octaves, persitance);
    const colorMap = generateColorMap(noiseMap, width, height, regionMap)
	return {noiseMap:noiseMap, colorMap: colorMap};
}

export function generateImprovedPerlinTexture(width = 256, height = 256, scale =0.3, octaves = 4, persistance = .5, lacunarity = 1, seed = 1, offset = new Vector2(0, 0)){
    const noiseMap = generateImprovedPerlinNoise(width, height, scale, octaves, persistance, lacunarity, seed, offset);
    return new DataTexture(noiseMap, width, height, LuminanceFormat);
}


export function generateImprovedPerlinMaps(width = 256, height = 256, scale =0.3, octaves = 4, persistance = .5, lacunarity = 1, seed = 1, offset = new Vector2(0, 0), regionMap){
    return mapsImprovedPerlin(width, height, scale, octaves, persistance, lacunarity, seed, offset, regionMap);

}




function mapsImprovedPerlin(width, height, scale, octaves, persistance, lacunarity, seed, offset, regionMap){
    let noiseMap = new Float32Array(width*height);
    let intNoiseMap = new Uint8Array(width*height);
    let colorMap = new Uint8Array(width*height*3);
    let octaveOffset = generateOctaveOffset(octaves, seed, offset);
    let halfWidth = width/2;
    let halfHeight = height/2;

    let maxNoise = Number.MIN_VALUE;
    let minNoise = Number.MAX_VALUE;

    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            let sampleX = (x - halfWidth) /scale;
            let sampleY = (y - halfHeight) /scale;

            let amplitude = 1;
            let frequency = 1;
            let noiseHeight = 0;
            for(let i = 0 ; i < octaves; i++){
                let perlinValue = improvedPerlin(sampleX * frequency + octaveOffset[i].x, sampleY * frequency +octaveOffset[i].y);
                noiseHeight += perlinValue * amplitude;
                amplitude *= persistance;
                frequency *= lacunarity;
            }
            if(noiseHeight > maxNoise){
                maxNoise = noiseHeight;
            }else if(noiseHeight < minNoise){
                minNoise = noiseHeight;
            }

            noiseMap[(width) * y +x] = noiseHeight;
        }
    }
    for(let i = 0; i < width*height; i++){
        noiseMap[i] = MathUtils.inverseLerp(minNoise, maxNoise, noiseMap[i]);
        intNoiseMap[i] = noiseMap[i] *255;
        fillColorMap(colorMap, i, noiseMap[i], regionMap);
    }
    return {noiseMap: intNoiseMap, colorMap: colorMap};
}

function fillColorMap(colorMap, index, value, regionMap){
    let stride = index *3;
    for(let i = 0; i < regionMap.length; i++){
        if(value < regionMap[i]._height){
            colorMap[stride] = regionMap[i]._color.r * 255;
            colorMap[stride+1] = regionMap[i]._color.g * 255;
            colorMap[stride+2] = regionMap[i]._color.b * 255;
            return;
        }
    }
}


function generateColorMap(noiseMap, width, height, regionMap){
    let colorMap = new Uint8Array(width*height*3);
    for(let y = 0; y < height; y++){
        for(let x = 0; x < width; x++){
            let index = width* y + x;
            let stride = index*3;
            for(let i = 0; i < regionMap.length; i++){
                if(noiseMap[index]/255 < regionMap[i]._height){
                    colorMap[stride] = regionMap[i]._color.r *255
                    colorMap[stride+1] = regionMap[i]._color.g *255
                    colorMap[stride+2] = regionMap[i]._color.b *255
                    break;
                }
            }
        }
    }
    return colorMap;
}

