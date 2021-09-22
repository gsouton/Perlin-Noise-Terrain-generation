import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DataTexture,
	DoubleSide,
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

const terrain = document.getElementById("terrain");


init();

function init() {
	//------- Initialize renderer -------------------
	renderer = new WebGLRenderer({ canvas: terrain, antialias: true });
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);

	//------- create a camera ---------
	camera = new PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0 * resolution, 0.9 * resolution, 1.6 * resolution);
	camera.rotateX(-Math.PI / 8);
	//camera.rotateY(Math.PI/6);
	//camera.rotateZ(Math.PI/7);

	camera.updateProjectionMatrix();

	// ------ create a scene ----------
	scene = new Scene();
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
	observer.observe(terrain);

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

function rendererSwitchAnimationLoop() {
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
	const bufferGeometry = new BufferGeometry();
	bufferGeometry.setAttribute(
		"position",
		new BufferAttribute(meshData.vertices, 3)
	);
	//bufferGeometry.setAttribute("uv", new BufferAttribute(meshData.uvs, 2));
	bufferGeometry.setIndex(new BufferAttribute(meshData.triangles, 1));

	const Mat = new MeshBasicMaterial({
		side: DoubleSide,
		wireframe: true,
		color: 0xffddff,
		//map: textures.noiseTexture,
	});
	object = new Mesh(bufferGeometry, Mat);
	object.name = "Terrain";
	object.position.y += 10;
	scene.add(object);
}

function render(time) {
	
	object.rotation.y += 0.005;
	renderer.render(scene, camera);
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
