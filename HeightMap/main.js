import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import {
	MathUtils,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	WebGLRenderer,
} from "../vendors/three.js-r130/build/three.module.js";
import {
	generateImprovedPerlinTexture,
	generatePerlinTexture,
	generateRandomTexture,
} from "./NoiseGenerator/noise.js";
import { OrbitControls } from "../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";
import { improvedPerlin } from "./NoiseGenerator/perlin.js";

//create gui
const gui = new GUI();

//controls
let controls;

// Camera Settings
let fov = 40;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.1;
let far = 1000;

let camera, scene, renderer;
let object;

let perlinProperties = {
	interpolationTypes: ["linear", "smoothstep", "smootherstep"],
	interpolation: "linear",
	scale: 0.3,
	scaleMax: 1,
	octaves: 1,
	persistance: 0,
};

let improvedPerlinProp = {
	scale: 0.3,
	scaleMax: 50,
    seed: 1,
	octaves: 1,
	persistance: 0,
	lacunarity: 1,
};

let noiseProperties = {
	currentType: "random",
	resolution: 4,
	types: ["random", "perlin2D", "improved perlin2D"],
};

init();

function init() {
	//------- Initialize renderer -------------------
	renderer = new WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);

	//------- create a camera ---------
	camera = new PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 6;

	// ------ create a scene ----------
	scene = new Scene();
	//------------ Manage the resize window ------------
	window.addEventListener("resize", onWindowResize);

	//----------- add control -------
	controls = new OrbitControls(camera, renderer.domElement);
	controls.maxDistance = 6;
	controls.minDistance = 0.5;
	controls.addEventListener("change", render); // same for when controls are used

	//------ make a plane ----
	createInstancePlane(1.5, 1.5);

	render();

	buildGUI();
}

function createInstancePlane(width = 1, height = 1) {
	const texture = generateRandomTexture(
		noiseProperties.resolution,
		noiseProperties.resolution
	);
	const planeGeo = new PlaneGeometry(width, height);
	const planeMaterial = new MeshBasicMaterial({
		map: texture,
		color: 0xffffff,
	});
	object = new Mesh(planeGeo, planeMaterial);
	scene.add(object);
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

function updateTexture(type) {
	if (type === "random") {
		const texture = generateRandomTexture(
			noiseProperties.resolution,
			noiseProperties.resolution
		);
		object.material.map = texture;
	}
	if (type === "perlin2D") {
		perlinProperties.scaleMax = 1;
		const texture = generatePerlinTexture(
			noiseProperties.resolution,
			noiseProperties.resolution,
			perlinProperties.scale,
			perlinProperties.interpolation,
			perlinProperties.octaves,
			perlinProperties.persistance
		);
		object.material.map = texture;
	}
	if (type === "improved perlin2D") {
		perlinProperties.scaleMax = 200;
		const texture = generateImprovedPerlinTexture(
			noiseProperties.resolution,
			noiseProperties.resolution,
			perlinProperties.scale,
			improvedPerlinProp.octaves,
			improvedPerlinProp.persistance,
            improvedPerlinProp.lacunarity
		);
		object.material.map = texture;
	}

	render();
}

function buildGUI() {
	const noiseFolder = gui.addFolder("Noise properties");

	noiseFolder.open();
	noiseFolder
		.add(noiseProperties, "resolution", 4, 2048, 1)
		.onChange(function (value) {
			updateTexture(noiseProperties.currentType);
		});

	noiseFolder
		.add(noiseProperties, "types", noiseProperties.types)
		.setValue("random")
		.onChange(function (value) {
			if (value === "perlin2D") {
				perlinPropertiesFolder.show();
				perlinPropertiesFolder.open();
			} else {
				perlinPropertiesFolder.hide();
			}
			if (value === "improved perlin2D") {
				improvedPerlinPropFolder.show();
				improvedPerlinPropFolder.open();
			} else {
				improvedPerlinPropFolder.hide();
			}
			noiseProperties.currentType = value;
			updateTexture(noiseProperties.currentType);
		});

	const perlinPropertiesFolder = noiseFolder.addFolder(
		"Perlin Noise properties"
	);
	perlinPropertiesFolder
		.add(perlinProperties, "scale", 0, perlinProperties.scaleMax, 0.000001)
		.onChange(function (value) {
			perlinProperties.scale = value;
			updateTexture(noiseProperties.currentType);
		});
	perlinPropertiesFolder
		.add(perlinProperties, "octaves", 0, 10, 1)
		.onChange(function (value) {
			perlinProperties.octaves = value;
			updateTexture(noiseProperties.currentType);
		});

	perlinPropertiesFolder
		.add(perlinProperties, "persistance", 0, 1, 0.0001)
		.onChange(function (value) {
			perlinProperties.persistance = value;
			updateTexture(noiseProperties.currentType);
		});

	perlinPropertiesFolder
		.add(
			perlinProperties,
			"interpolation",
			perlinProperties.interpolationTypes
		)
		.onChange(function (value) {
			perlinProperties.interpolation = value;
			updateTexture(noiseProperties.currentType);
		});

	const improvedPerlinPropFolder = noiseFolder.addFolder(
		"Improved Perlin Noise properties"
	);
	improvedPerlinPropFolder
		.add(improvedPerlinProp, "scale", 0, improvedPerlinProp.scaleMax, 0.001)
		.onChange(function (value) {
			perlinProperties.scale = value;
			updateTexture(noiseProperties.currentType);
		});
	improvedPerlinPropFolder
		.add(improvedPerlinProp, "octaves", 0, 10, 1)
		.onChange(function (value) {
			improvedPerlinProp.octaves = value;
			updateTexture(noiseProperties.currentType);
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp, "persistance", 0.01, 1, 0.0001)
		.onChange(function (value) {
			improvedPerlinProp.persistance = value;
			updateTexture(noiseProperties.currentType);
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp, "lacunarity", 1, 100, 1)
		.onChange(function (value) {
			improvedPerlinProp.lacunarity = value;
			updateTexture(noiseProperties.currentType);
		});

	perlinPropertiesFolder.hide();
	improvedPerlinPropFolder.hide();
}
