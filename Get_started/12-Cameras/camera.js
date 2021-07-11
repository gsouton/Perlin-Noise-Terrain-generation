import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "../../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";
import { MinMaxGUIHelper } from "./MinMaxGUIHelper.js";

//create gui
const gui = new GUI();

//Controls
let controlL, controlR;

// Camera Settings
let fov = 45;
let aspect = window.innerWidth / (window.innerHeight / 2);
let near = 0.00001;
let far = 100;

// objects needeed for render and display
let cameraL, cameraR, cameraHelperL, scene, rendererL, rendererR;

//Light
let directionalLight;

//Plane
let planeGeometry, planeMaterial, planeMesh;
let planeSize = 40;

//Cube
let cubeGeometry, cubeMaterial, cubeMesh;
let cubeSize = 4;

//Sphere
let sphereGeometry, sphereMaterial, sphereMesh;
let sphereRadius = 3,
	sphereWDivision = 32,
	sphereHDivision = 30;

//slider
let sliderPos = window.innerWidth / 2;

init();

function init() {
	//---------- Create a Left scene ---------------------
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xbcd48f);

	//---------- create a camera -----------------
	cameraL = new THREE.PerspectiveCamera(fov, aspect, near, far);
	cameraL.position.set(0, 10, 20);
	cameraHelperL = new THREE.CameraHelper(cameraL);
	scene.add(cameraHelperL);

	cameraR = new THREE.PerspectiveCamera(60, aspect, near, 500);
	cameraR.position.set(40, 10, 30);
	cameraR.lookAt(0, 5, 0);

	//------- Initialize renderers -------------------
	rendererL = new THREE.WebGLRenderer({ antialias: true });
	rendererL.setSize(window.innerWidth, window.innerHeight / 2);
	rendererL.setPixelRatio(window.devicePixelRatio);
	rendererL.setAnimationLoop(animation);
	document.body.appendChild(rendererL.domElement);

	rendererR = new THREE.WebGLRenderer({ antialias: true });
	rendererR.setSize(window.innerWidth, window.innerHeight / 2);
	rendererR.setPixelRatio(window.devicePixelRatio);
	rendererR.setAnimationLoop(animation);
	document.body.appendChild(rendererR.domElement);

	//-------- Intialize controls-------------------
	controlL = new OrbitControls(cameraL, rendererL.domElement);
	controlL.target.set(0, 5, 0);
	controlL.update();

	controlR = new OrbitControls(cameraR, rendererR.domElement);
	controlR.target.set(0, 5, 0);
	controlR.update();

	//---------- Load texture ---------------
	const loader = new THREE.TextureLoader();
	const texture = loader.load("/resources/Get_Started/textures/checker.png");
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.magFilter = THREE.NearestFilter;
	const repeats = planeSize / 2;
	texture.repeat.set(repeats, repeats);

	//--- Create a Plane -------------------
	planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
	planeMaterial = new THREE.MeshPhongMaterial({
		map: texture,
		side: THREE.DoubleSide,
	});
	planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
	planeMesh.rotation.x = Math.PI * -0.5;
	scene.add(planeMesh);

	//-------- Create a cube ------------
	cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
	cubeMaterial = new THREE.MeshPhongMaterial({ color: "#8AC" });
	cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
	cubeMesh.position.set(cubeSize + 1, cubeSize / 2, 0);
	scene.add(cubeMesh);

	//-------- Create a Sphere------------
	sphereGeometry = new THREE.SphereGeometry(
		sphereRadius,
		sphereWDivision,
		sphereHDivision
	);
	//sphereMaterial = new THREE.MeshPhongMaterial({ color: "#CAB" });
	for (let i = 0; i < 30; i++) {
		const sphereMat = new THREE.MeshPhongMaterial();
		sphereMat.color.setHSL(i * 0.73, 1, 0.5);
		const mesh = new THREE.Mesh(sphereGeometry, sphereMat);
		mesh.position.set(
			-sphereRadius - 1,
			sphereRadius + 2,
			i * sphereRadius * -2.2
		);
		scene.add(mesh);
	}
	//sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
	//sphereMesh.position.set(-sphereRadius, sphereRadius + 2, 0);
	//scene.add(sphereMesh);

	//------ add directional Light -------------------
	/**
	 * Light coming from a specific direction try to mimic the sun
	 */
	const color = 0xffffff;
	const intensity = 1.1;
	directionalLight = new THREE.DirectionalLight(color, intensity);
	directionalLight.position.set(0, 10, 0);
	directionalLight.target.position.set(-5, 0, 0);
	scene.add(directionalLight);
	scene.add(directionalLight.target);

	//------------ Manage the resize window ------------
	window.addEventListener("resize", onWindowResize);

	buildGUI();
}

function render(time) {
	time *= 0.0001;

	cameraHelperL.update();
	updateCamera();
	rendererL.render(scene, cameraL);
	rendererR.render(scene, cameraR);
}

function onWindowResize() {
	cameraL.aspect = window.innerWidth / window.innerHeight / 2;
	cameraL.updateProjectionMatrix();

	rendererL.setSize(window.innerWidth, window.innerHeight / 2);
	rendererR.setSize(window.innerWidth, window.innerHeight / 2);
}

function animation(time) {
	render(time);
}

function updateCamera() {
	cameraL.updateProjectionMatrix();
}

function buildGUI() {
	gui.add(cameraL, "fov", 1, 180);
	gui.add(cameraL, "near", 0.000001, 100);
	gui.add(cameraL, "far", 0, 500);
}
