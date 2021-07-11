import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";

//create gui
const gui = new GUI();
const sphereFolder = gui.addFolder("Sphere properties");
const materialFolder = gui.addFolder("Material properties");
const standardPropGUI = materialFolder.addFolder(
	"Standard Material properties"
);
const phongPropGUI = materialFolder.addFolder("Phong Material properties");

// Camera Settings
let fov = 40;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.1;
let far = 1000;

let camera, scene, renderer;

let SphereGeometry;
let sphereMesh = undefined;

let materialProps = {
	wireframe: false,
	roughness: 1.0,
	metalness: 1.0,
	shininess: 1.0,
	reflectivity: 1.0,
	color: 0x8810ff,
};

let materials = {
	basic: new THREE.MeshBasicMaterial({ color: 0x8810ff }),
	lambert: new THREE.MeshLambertMaterial({ color: 0x8810ff }),
	phong: new THREE.MeshPhongMaterial({ color: 0x8810ff }),
	toon: new THREE.MeshToonMaterial({ color: 0x8810ff }),
	normal: new THREE.MeshNormalMaterial(),
	depth: new THREE.MeshDepthMaterial(),
	standard: new THREE.MeshStandardMaterial({ color: 0x8810ff }),
};

let sphereProps = {
	radius: 1,
	widthSegment: 8,
	heightSegment: 6,
	phiStart: 0,
	phiLength: Math.PI * 2,
	thetaStart: 0,
	thetaLength: Math.PI,
	material: materials.basic,
};

init();

function init() {
	//create a camera
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 6;

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x1f1f1f);

	//---------- creat a sphere ------------

	sphereMesh = createSphere();
	sphereMesh.material.needsUpdate;

	scene.add(sphereMesh);

	//--------- add light to the scene ---------------
	const color = 0xffffff;
	const intensity = 2.2;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-1, 1, 5);
	scene.add(light);

	//------- Initialize renderer -------------------
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setAnimationLoop(animation);
	document.body.appendChild(renderer.domElement);

	//------------ Manage the resize window ------------
	window.addEventListener("resize", onWindowResize);

	buildGUI();
}

function createSphere() {
	SphereGeometry = new THREE.SphereGeometry(
		sphereProps.radius,
		sphereProps.widthSegment,
		sphereProps.heightSegment,
		sphereProps.phiStart,
		sphereProps.phiLength,
		sphereProps.thetaStart,
		sphereProps.thetaLength
	);
	if(sphereMesh !== undefined){
		let mesh = new THREE.Mesh(SphereGeometry, sphereProps.material);
		mesh.rotation.x = sphereMesh.rotation.x;
		mesh.rotation.x = sphereMesh.rotation.y;
		mesh.rotation.x = sphereMesh.rotation.z;
		scene.remove(sphereMesh);
		return mesh;
	}
	return new THREE.Mesh(SphereGeometry, sphereProps.material);
}

function render(time) {
	time *= 0.0001;
	sphereMesh.rotation.x += 0.001;
	sphereMesh.rotation.y += 0.001;
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animation(time) {
	render(time);
}

function buildGUI() {
	//Sphere parameters

	sphereFolder.add(sphereProps, "radius", 0.5, 2).onChange(function (value) {
		sphereProps.radius = value;
		sphereMesh = createSphere();
		scene.add(sphereMesh);
	});
	sphereFolder
		.add(sphereProps, "widthSegment", 3, 32)
		.onChange(function (value) {
			scene.remove(sphereMesh);
			sphereProps.widthSegment = value;
			sphereMesh = createSphere();
			scene.add(sphereMesh);
		});
	sphereFolder
		.add(sphereProps, "heightSegment", 2, 32)
		.onChange(function (value) {
			scene.remove(sphereMesh);
			sphereProps.heightSegment = value;
			sphereMesh = createSphere();
			scene.add(sphereMesh);
		});
	sphereFolder.add(sphereProps, "phiStart", 0, 6).onChange(function (value) {
		scene.remove(sphereMesh);
		sphereProps.phiStart = value;
		sphereMesh = createSphere();
		scene.add(sphereMesh);
	});

	sphereFolder
		.add(sphereProps, "phiLength", 0, Math.PI * 2)
		.onChange(function (value) {
			scene.remove(sphereMesh);
			sphereProps.phiStart = value;
			sphereMesh = createSphere();
			scene.add(sphereMesh);
		});

	sphereFolder
		.add(sphereProps, "thetaStart", 0, Math.PI * 2)
		.onChange(function (value) {
			scene.remove(sphereMesh);
			sphereProps.thetaStart = value;
			sphereMesh = createSphere();
			scene.add(sphereMesh);
		});
	sphereFolder
		.add(sphereProps, "thetaLength", 0, Math.PI * 2)
		.onChange(function (value) {
			scene.remove(sphereMesh);
			sphereProps.thetaLength = value;
			sphereMesh = createSphere();
			scene.add(sphereMesh);
		});

	sphereFolder
		.add(sphereProps, "material", Object.keys(materials))
		.onChange(function (value) {
			sphereProps.material = materials[value];
			sphereMesh.material = sphereProps.material;
			updateGUI();
		});
	sphereFolder.open();

	materialFolder.addColor(materialProps, "color").onChange(function (value) {
		Object.keys(materials).forEach((key) => {
			if (key !== "normal" && key !== "depth")
				materials[key].color.set(value);
		});
	});
	materialFolder.add(materialProps, "wireframe").onChange(function (value) {
		Object.keys(materials).forEach((key) => {
			materials[key].wireframe = value;
		});
	});

	standardPropGUI
		.add(materialProps, "roughness", 0.0, 1.0)
		.step(0.01)
		.onChange(function (value) {
			sphereMesh.material.roughness = value;
		});
	standardPropGUI
		.add(materialProps, "metalness", 0, 1)
		.step(0.01)
		.onChange(function (value) {
			sphereMesh.material.metalness = value;
		});

	phongPropGUI
		.add(materialProps, "shininess", 0, 1)
		.step(0.01)
		.onChange(function (value) {
			sphereMesh.material.shininess = value;
		});
	phongPropGUI
		.add(materialProps, "reflectivity", 0, 1)
		.step(0.01)
		.onChange(function (value) {
			sphereMesh.material.reflectivity = value;
		});

	standardPropGUI.hide();
	phongPropGUI.hide();

	materialFolder.open();
}

function updateGUI() {
	if (sphereMesh.material === materials.standard) {
		standardPropGUI.show();
		standardPropGUI.open();
	} else standardPropGUI.hide();

	if (sphereMesh.material === materials.phong) {
		phongPropGUI.show();
		phongPropGUI.open();
	} else phongPropGUI.hide();
}
