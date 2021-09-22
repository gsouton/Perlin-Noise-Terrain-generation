import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DataTexture,
	DoubleSide,
	DynamicDrawUsage,
	LuminanceFormat,
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	RGBFormat,
	Scene,
	Vector2,
	WebGLRenderer,
} from "../vendors/three.js-r130/build/three.module.js";
import { generateImprovedPerlinMaps } from "../src/NoiseGenerator/noise.js";
import { Region } from "../src/region.js";
import { generateMeshData } from "../src/mesh.js";


// Camera Settings
let fov = 45;
let aspect = width / height;
let near = 50;
let far = 500;

let camera, scene, renderer;
let object;

// regions for color
let deepWater = new Region(0.2, new Color("RoyalBlue"));
let water = new Region(0.4, new Color("RoyalBlue"));
let sand = new Region(0.49, new Color("PapayaWhip"));
let grass = new Region(0.7, new Color("Green"));
let mountain = new Region(0.9, new Color("SaddleBrown"));
let snowy = new Region(1.1, new Color("White"));

let regions = [deepWater, water, sand, grass, mountain, snowy];
let src = { map: [], width: 0, height: 0 };
let textures = { noiseTexture: undefined, colorTexture: undefined };

const resolution = 64;

let pause = true;
let seed = MathUtils.randInt(0, Number.MAX_VALUE);

const canvas = document.getElementById("mesh");

let positionAttribute;
let vertices_buffer;
let index = 0;
let end = resolution*resolution-1;
let start = undefined;


init();





function init() {
	//------- Initialize renderer -------------------
	renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setSize(width, height);
	//renderer.setAnimationLoop(render);
	renderer.setPixelRatio(window.devicePixelRatio);

	//------- create a camera ---------
	camera = new PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0 * resolution, .85 * resolution, .98 * resolution);
	camera.rotateX(-Math.PI / 4);
	//camera.rotateX(-Math.PI/2);

	camera.updateProjectionMatrix();

	// ------ create a scene ----------
	scene = new Scene();
	scene.background = new Color(0xffaaaa);
	//------------ Manage the resize window ------------
	window.addEventListener("resize", onWindowResize);
	renderer.domElement.addEventListener("click", rendererSwitchAnimationLoop);

	// Initialize maps and heighmap
	initMaps(resolution, resolution);

	//------ make a plane ----
	createTerrain();

	

	const observer = new IntersectionObserver(
		function (entries) {
			if (entries[0].isIntersecting === true)
				restartRendering();
			else pauseRendering();
		},
		{ threshold: [0] }
	);
	observer.observe(canvas);

	render();
}
function pauseRendering(){
	if(!pause){
		renderer.setAnimationLoop();
		pause = true;
	}
}

function restartRendering(){
	if(pause){
		renderer.setAnimationLoop(render);
		pause = false;
	}
}

function flattenTerrain(){
	for(let i = 0; i < src.height*src.width; i++){
		let stride = i *3;
		vertices_buffer[stride+1] = 0;
	}
}

function elevateMesh(index, end){
	vertices_buffer[index*3+1] = evaluateHeight(src.map[index]/255, 1.5);
	vertices_buffer[end*3 + 1] = evaluateHeight(src.map[end]/255, 1.5);
	positionAttribute.needsUpdate = true;
}

function rendererSwitchAnimationLoop() {
	if(isAnimationOver()){
		index = 0;
		end = resolution*resolution-1;	
		flattenTerrain();
		restartRendering();
		return;
	}
	pause = !pause;
	if (pause) renderer.setAnimationLoop();
	else renderer.setAnimationLoop(render);
}

function initMaps(width, height) {
	const maps = generateImprovedPerlinMaps(
		width,
		height,
		20,
		4,
		0.5,
		2,
		seed,
		new Vector2(0, 0),
		regions
	);
	updateTextureAndsrc(maps);
}

function createTerrain() {
	const meshData = generateMeshData(src, 1.5);
	vertices_buffer = meshData.vertices;
	flattenTerrain();
	const bufferGeometry = new BufferGeometry();

	positionAttribute = new BufferAttribute(meshData.vertices, 3); 
	positionAttribute.setUsage(DynamicDrawUsage);

	bufferGeometry.setAttribute("position", positionAttribute);
	bufferGeometry.setAttribute("uv", new BufferAttribute(meshData.uvs, 2));
	bufferGeometry.setIndex(new BufferAttribute(meshData.triangles, 1));

	const Mat = new MeshBasicMaterial({
		side: DoubleSide,
		wireframe: true,
		map: textures.noiseTexture,
	});
	object = new Mesh(bufferGeometry, Mat);
	object.name = "Terrain";
	object.rotateY(Math.PI/2);
	scene.add(object);
}

function render(time) {
	time *= 0.001;
	if(start === undefined && !isNaN(time))
		start = time;
	if(time - start >= 0.01 && !isAnimationOver()){
		elevateMesh(index, end);
		index++;
		end--;
		start = time;
	}
	
	renderer.render(scene, camera);
	if(isAnimationOver()){
		pauseRendering();
	}
}

function isAnimationOver(){
	return index >= src.width *src.height/2
}

function onWindowResize() {
	renderer.setSize(width, height);
	render();
}

function updateTextureAndsrc(maps) {
	src.map = maps.noiseMap;
	src.width = resolution;
	src.height = resolution;

	textures.noiseTexture = new DataTexture(
		maps.noiseMap,
		resolution,
		resolution,
		LuminanceFormat
	);
	textures.colorTexture = new DataTexture(
		maps.colorMap,
		resolution,
		resolution,
		RGBFormat
	);
}

function evaluateHeight(heightValue, heightMultiplier = 1.5) {
	if(heightValue <= 0.4){
        return heightValue* 0.4*10 ;
    }
    return heightValue * heightValue*10 * heightMultiplier;
}



