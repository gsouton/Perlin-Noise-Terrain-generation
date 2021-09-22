import {
	Color,
	DataTexture,
	LuminanceFormat,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	RGBFormat,
	Scene,
	Vector2,
	WebGLRenderer,
} from "../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import { DragControls } from "../vendors/three.js-r130/examples/jsm/controls/DragControls.js";

import { generateImprovedPerlinMaps } from "../src/NoiseGenerator/noise.js";
import { Region } from "../src/region.js";

//create gui
const gui = new GUI({ autoPlace: false, width: 200 });
const customGUIEl = document.getElementById("improvedPerlinGUI");
customGUIEl.appendChild(gui.domElement);


const canvas = document.getElementById("improvedPerlin");

// Camera Settings
let fov = 40;
let aspect = width / height;
let near = 0.1;
let far = 1000;

let camera, scene, renderer;
let object = [];

let improvedPerlinProp = {
	scale: 20,
	scaleMax: 50,
	octaves: 4,
	persistance: 0.5,
	lacunarity: 2,
	seed: 1,
	offset: new Vector2(0, 0),
};

let noiseProperties = {
	resolution: 128,
	textures: ["noiseTexture", "colorTexture"],
	texture: "noiseTexture",
};

let deepWater = new Region(0.2, new Color("RoyalBlue"));
let water = new Region(0.4, new Color("RoyalBlue"));
let sand = new Region(0.49, new Color("PapayaWhip"));
let grass = new Region(0.7, new Color("Green"));
let mountain = new Region(0.9, new Color("SaddleBrown"));
let snowy = new Region(1.1, new Color("White"));

let regions = [deepWater, water, sand, grass, mountain, snowy];
let textures = { noiseTexture: undefined, colorTexture: undefined };

init();

function init() {
	//------- Initialize renderer -------------------
	renderer = new WebGLRenderer({ canvas: canvas, antialias: true });
	renderer.setSize(width, height);
	renderer.setPixelRatio(window.devicePixelRatio);

	//------- create a camera ---------
	camera = new PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 6;

	// ------ create a scene ----------
	scene = new Scene();

	//------------ Manage the resize window ------------
	window.addEventListener("resize", onWindowResize);

	// Initialize maps and heighmap
	initMaps();

	//------ make a plane ----
	createInstancePlane();

	render();

	buildGUI();

	const controls = new DragControls(object, camera, renderer.domElement);
	controls.addEventListener("drag", render);
}

function initMaps() {
	const maps = generateImprovedPerlinMaps(
		noiseProperties.resolution,
		noiseProperties.resolution,
		improvedPerlinProp.scale,
		improvedPerlinProp.octaves,
		improvedPerlinProp.persistance,
		improvedPerlinProp.lacunarity,
		improvedPerlinProp.seed,
		improvedPerlinProp.offset,
		regions
	);
	updateTextureAndsrc(maps);
}

function createInstancePlane() {
	const planeGeo = new PlaneGeometry(2, 2);

	const planeMaterial = new MeshBasicMaterial({
		map: textures[noiseProperties.texture],
	});
	object.push(new Mesh(planeGeo, planeMaterial));
	object[0].name = "Plane";
	object[0].position.set(0.5850609519085801, -0.07682641649536968, 0);
	scene.add(object[0]);
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	if(width < 600){
		gui.close();
	}else if(width > 600){
		gui.open();
	}
	
	renderer.setSize(width, height);
	render();
}

function updateTextureAndsrc(maps) {


	textures.noiseTexture = new DataTexture(
		maps.noiseMap,
		noiseProperties.resolution,
		noiseProperties.resolution,
		LuminanceFormat
	);
	textures.colorTexture = new DataTexture(
		maps.colorMap,
		noiseProperties.resolution,
		noiseProperties.resolution,
		RGBFormat
	);
}

function updateTexture() {
	const maps = generateImprovedPerlinMaps(
		noiseProperties.resolution,
		noiseProperties.resolution,
		improvedPerlinProp.scale,
		improvedPerlinProp.octaves,
		improvedPerlinProp.persistance,
		improvedPerlinProp.lacunarity,
		improvedPerlinProp.seed,
		improvedPerlinProp.offset,
		regions
	);

	updateTextureAndsrc(maps);

	object[0].material.map = textures[noiseProperties.texture];

	render();
}

function buildGUI() {
	const noiseFolder = gui.addFolder("Noise properties");

	noiseFolder.open();
	noiseFolder
		.add(noiseProperties, "resolution", 2, 256, 1)
		.onChange(function () {
			updateTexture();
		});

	noiseFolder
		.add(noiseProperties, "textures", noiseProperties.textures)
		.setValue(noiseProperties.texture)
		.name("Texture map")
		.onChange(function (value) {
			noiseProperties.texture = value;
			object[0].material.map = textures[noiseProperties.texture];
			render();
		});

	const improvedPerlinPropFolder = noiseFolder.addFolder(
		"Improved Perlin Noise properties"
	);
	improvedPerlinPropFolder
		.add(improvedPerlinProp, "scale", 1, improvedPerlinProp.scaleMax, 0.001)
		.onChange(function (value) {
			improvedPerlinProp.scale = value;
			updateTexture();
		});
	improvedPerlinPropFolder
		.add(improvedPerlinProp, "octaves", 1, 10, 1)
		.onChange(function (value) {
			improvedPerlinProp.octaves = value;
			updateTexture();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp, "persistance", 0.01, 1, 0.0001)
		.onChange(function (value) {
			improvedPerlinProp.persistance = value;
			updateTexture();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp, "lacunarity", 1, 10, 0.0001)
		.onChange(function (value) {
			improvedPerlinProp.lacunarity = value;
			updateTexture();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp, "seed", 1, Number.MAX_VALUE, 1)
		.onChange(function (value) {
			improvedPerlinProp.seed = value;
			updateTexture();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp.offset, "x", -200, 200, 0.000001)
		.name("X offset")
		.onChange(function (value) {
			improvedPerlinProp.offset.x = value;
			updateTexture();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp.offset, "y", -200, 200, 0.000001)
		.name("Y offset")
		.onChange(function (value) {
			improvedPerlinProp.offset.y = value;
			updateTexture();
		});

	improvedPerlinPropFolder.open();
}
