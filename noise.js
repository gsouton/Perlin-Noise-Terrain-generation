import { GUI } from "./vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
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
	WebGLRenderer,
} from "./vendors/three.js-r130/build/three.module.js";

import { generateRandomMaps } from "./HeightMap/NoiseGenerator/noise.js";
import { Region } from "./HeightMap/region.js";
import { DragControls } from "./vendors/three.js-r130/examples/jsm/controls/DragControls.js";

//create gui
const gui = new GUI({ autoPlace: false, width: 200});
const customGUIEl = document.getElementById("noiseGUI");
customGUIEl.appendChild(gui.domElement);


//Renderer settings
const canvas = document.getElementById("noise");


// Camera Settings
let fov = 40;
let aspect = width / height;
let near = 0.1;
let far = 1000;

let camera, scene, renderer;
let object = [];


let noiseProperties = {
	currentType: "perlin2D",
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

	// add drag controls
	const controls = new DragControls(object, camera, renderer.domElement);
	controls.addEventListener("drag", render);
}

function initMaps() {
	const maps = generateRandomMaps(noiseProperties.resolution, noiseProperties.resolution, regions);
	updateTextureAndHeightmap(maps);
}

function createInstancePlane() {
	const planeGeo = new PlaneGeometry(2, 2);

	const planeMaterial = new MeshBasicMaterial({
		map: textures[noiseProperties.texture],
	});
	object.push(new Mesh(planeGeo, planeMaterial));
	object[0].name = "Plane";

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

function updateTextureAndHeightmap(maps) {
	

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
	const maps = generateRandomMaps(noiseProperties.resolution, noiseProperties.resolution, regions);
	updateTextureAndHeightmap(maps);
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

	
}
