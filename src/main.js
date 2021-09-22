import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import {
	BufferAttribute,
	BufferGeometry,
	Color,
	DataTexture,
	DoubleSide,
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
import {
	generateImprovedPerlinMaps,
	generatePerlinMaps,
	generateRandomMaps,
} from "./NoiseGenerator/noise.js";
import { OrbitControls } from "../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";
import { Region } from "./region.js";
import { generateMeshData } from "./mesh.js";

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
let object, meshData;

let perlinProperties = {
	interpolationTypes: ["linear", "smoothstep", "smootherstep"],
	interpolation: "linear",
	scale: 0.3,
	scaleMax: 1,
	octaves: 1,
	persistance: 0.5,
};

let improvedPerlinProp = {
	scale: 0.3,
	scaleMax: 50,
	octaves: 4,
	persistance: 0.5,
	lacunarity: 2,
	seed: 1,
	offset: new Vector2(0, 0),
};

let noiseProperties = {
	currentType: "random",
	resolution: 16,
	textures: ["noiseTexture", "colorTexture"],
	texture: "noiseTexture",
	types: ["random", "perlin2D", "improved perlin2D"],
	Terrain3D: false,
	heightMultiplier: 1,
};

let planeProperties = {
	width: 2,
	height: 2,
	widthSegment: noiseProperties.resolution,
	heightSegment: noiseProperties.resolution,
	wireframe: false,
};

let objectProperties = {
	wireframe: false,
};



let deepWater = new Region(0.2, new Color("RoyalBlue"));
let water = new Region(0.4, new Color("RoyalBlue"));
let sand = new Region(0.49, new Color("PapayaWhip"));
let grass = new Region(0.7, new Color("Green"));
let mountain = new Region(0.9, new Color("SaddleBrown"));
let snowy = new Region(1.1, new Color("White"));

let regions = [deepWater, water, sand, grass, mountain, snowy];
let heightmap = { map: [], width: 0, height: 0 };
let textures = { noiseTexture: undefined, colorTexture: undefined };

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

	//controls.maxDistance = 6;
	///controls.minDistance = 0.5;
	controls.addEventListener("change", render); // same for when controls are used

	// Initialize maps and heighmap
	initMaps();

	//------ make a plane ----
	createInstancePlane();

	render();

	buildGUI();
}

function initMaps() {
	const maps = generateRandomMaps(
		noiseProperties.resolution,
		noiseProperties.resolution,
		regions
	);
	updateTextureAndHeightmap(maps);
}

function createTerrain() {
	meshData = generateMeshData(heightmap, noiseProperties.heightMultiplier);
	const bufferGeometry = new BufferGeometry();
	bufferGeometry.setAttribute(
		"position",
		new BufferAttribute(meshData.vertices, 3)
	);
	bufferGeometry.setAttribute("uv", new BufferAttribute(meshData.uvs, 2));
	bufferGeometry.setIndex(new BufferAttribute(meshData.triangles, 1));

	const Mat = new MeshBasicMaterial({
		side: DoubleSide,
		wireframe: objectProperties.wireframe,
		map: textures[noiseProperties.texture],
	});
	object = new Mesh(bufferGeometry, Mat);
	object.name = "Terrain";
	scene.add(object);
}

function createInstancePlane() {
	const planeGeo = new PlaneGeometry(
		planeProperties.width,
		planeProperties.height,
		planeProperties.widthSegment,
		planeProperties.heightSegment
	);

	const planeMaterial = new MeshBasicMaterial({
		map: textures[noiseProperties.texture],
		color: 0xffffff,
		side: DoubleSide,
		wireframe: objectProperties.wireframe,
	});
	object = new Mesh(planeGeo, planeMaterial);
	object.name = "Plane";
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

function updateTextureAndHeightmap(maps) {
	heightmap.map = maps.noiseMap;
	heightmap.width = noiseProperties.resolution;
	heightmap.height = noiseProperties.resolution;

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

function updateTexture(type) {
	if (type === "random") {
		const maps = generateRandomMaps(
			noiseProperties.resolution,
			noiseProperties.resolution,
			regions
		);
		updateTextureAndHeightmap(maps);

		object.material.map = textures[noiseProperties.texture];
	} else if (type === "perlin2D") {
		perlinProperties.scaleMax = 1;
		const maps = generatePerlinMaps(
			noiseProperties.resolution,
			noiseProperties.resolution,
			perlinProperties.scale,
			perlinProperties.interpolation,
			perlinProperties.octaves,
			perlinProperties.persistance,
			regions
		);
		updateTextureAndHeightmap(maps);
		object.material.map = textures[noiseProperties.texture];
	} else if (type === "improved perlin2D") {
		perlinProperties.scaleMax = 200;
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

		updateTextureAndHeightmap(maps);

		object.material.map = textures[noiseProperties.texture];
	}

	render();
}

function updateControls() {
	if (noiseProperties.Terrain3D) {
		camera.position.set(
			1.5 * noiseProperties.resolution,
			1.5 * noiseProperties.resolution,
			-1.5 * noiseProperties.resolution
		);
		camera.rotation.y += 10 * noiseProperties.resolution;
		camera.rotation.x += 10 * noiseProperties.resolution;
		camera.updateProjectionMatrix();
		controls.update();
		controls.saveState();
		return;
	} else {
		camera.position.set(0, 0, 6);
		camera.rotation.x = 0;
		camera.rotation.y = 0;
		camera.updateProjectionMatrix();
		controls.update();
		controls.saveState();
		return;
	}
}

function updateObject() {
	if (noiseProperties.Terrain3D) {
		scene.remove(object);
		createTerrain();
		render();
		return;
	} else if (!noiseProperties.Terrain3D && object.name !== "Plane") {
		scene.remove(object);
		createInstancePlane();
	}
	render();
}

function buildGUI() {
	gui.add(controls, "reset").name("Reset position");

	gui.add(noiseProperties, "Terrain3D")
		.name("Generate Terrain")
		.onChange(function (value) {
			noiseProperties.Terrain3D = value;
			if (value && object.name === "Plane") {
				scene.remove(object);
				createTerrain();
				updateControls();
				render();
			} else if (!value && object.name === "Terrain") {
				scene.remove(object);
				meshData = undefined;
				createInstancePlane();
				updateControls();
				render();
			}
		});

	const meshFolder = gui.addFolder("Mesh properties");
	meshFolder.add(objectProperties, "wireframe").onChange(function () {
		object.material.wireframe = objectProperties.wireframe;
		render();
	});
	meshFolder
		.add(noiseProperties, "heightMultiplier", 1, 10)
		.onChange(function () {
			updateObject();
		});

	const noiseFolder = gui.addFolder("Noise properties");

	noiseFolder.open();
	noiseFolder
		.add(noiseProperties, "resolution", 2, 256, 1)
		.onChange(function () {
			updateTexture(noiseProperties.currentType);
			if (noiseProperties.Terrain3D) {
				scene.remove(object);
				createTerrain();
				render();
			}
			updateControls();
		});

	noiseFolder
		.add(noiseProperties, "types", noiseProperties.types)
		.setValue("random")
		.onChange(function (value) {
			if (value === "perlin2D") {
				improvedPerlinPropFolder.hide();
				perlinPropertiesFolder.show();
				perlinPropertiesFolder.open();
			} else {
				perlinPropertiesFolder.hide();
			}
			if (value === "improved perlin2D") {
				perlinPropertiesFolder.hide();
				improvedPerlinPropFolder.show();
				improvedPerlinPropFolder.open();
			} else {
				improvedPerlinPropFolder.hide();
			}
			noiseProperties.currentType = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
		});

	noiseFolder
		.add(noiseProperties, "textures", noiseProperties.textures)
		.name("Texture map")
		.onChange(function (value) {
			noiseProperties.texture = value;
			object.material.map = textures[noiseProperties.texture];
			render();
		});

	const perlinPropertiesFolder = noiseFolder.addFolder(
		"Perlin Noise properties"
	);
	perlinPropertiesFolder
		.add(perlinProperties, "scale", 0, perlinProperties.scaleMax, 0.000001)
		.onChange(function (value) {
			perlinProperties.scale = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
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
		.add(improvedPerlinProp, "scale", 1, improvedPerlinProp.scaleMax, 0.001)
		.onChange(function (value) {
			improvedPerlinProp.scale = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
		});
	improvedPerlinPropFolder
		.add(improvedPerlinProp, "octaves", 1, 10, 1)
		.onChange(function (value) {
			improvedPerlinProp.octaves = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp, "persistance", 0.01, 1, 0.0001)
		.onChange(function (value) {
			improvedPerlinProp.persistance = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp, "lacunarity", 1, 10, 0.0001)
		.onChange(function (value) {
			improvedPerlinProp.lacunarity = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp, "seed", 1, Number.MAX_VALUE, 1)
		.onChange(function (value) {
			improvedPerlinProp.seed = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp.offset, "x", -200, 200, 0.000001)
		.name("X offset")
		.onChange(function (value) {
			improvedPerlinProp.offset.x = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
		});

	improvedPerlinPropFolder
		.add(improvedPerlinProp.offset, "y", -200, 200, 0.000001)
		.name("Y offset")
		.onChange(function (value) {
			improvedPerlinProp.offset.y = value;
			updateTexture(noiseProperties.currentType);
			updateObject();
		});

	perlinPropertiesFolder.hide();
	improvedPerlinPropFolder.hide();
}
