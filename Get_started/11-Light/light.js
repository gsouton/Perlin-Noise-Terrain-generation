import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "../../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";
import { ColorGUIHelper } from "./color-gui-helper.js";

//create gui
const gui = new GUI();

//Controls
let controls;

// Camera Settings
let fov = 45;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.1;
let far = 100;

// objects needeed for render and display
let camera, scene, renderer;

//Light
let helper;
let ambientLight, hemisphereLight, directionalLight, pointLight;

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

init();

function init() {
	//---------- create a camera -----------------
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 10, 20);

	//---------- Create a scene ---------------------
	scene = new THREE.Scene();
	scene.background = new THREE.Color("black");

	//------- Initialize renderer -------------------
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setAnimationLoop(animation);
	document.body.appendChild(renderer.domElement);

	//-------- Intialize controls-------------------
	controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 5, 0);
	controls.update();

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
	sphereMaterial = new THREE.MeshPhongMaterial({ color: "#CAB" });
	sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
	sphereMesh.position.set(-sphereRadius, sphereRadius + 2, 0);
	scene.add(sphereMesh);

	//--------- add Ambient light to the scene ---------------
	/* 
        Not really light the shapes in 3D are flat, it multiplies the material color by the light color * intensity
        It is mostly use as combination with other type of light to help the making dark less dark
    */
	const color = 0xffffff;
	const intensity = 1;
	ambientLight = new THREE.AmbientLight(color, intensity);
	//scene.add(ambientLight);
	//------- add hemisphere light to the scene --------
	/**
	 * Here again everything looks flat, it is mostly use as combination with other light to give nice effect
	 * with the influence of ground and sky color
	 */
	const skyColor = 0xb1e1ff; // light blue
	const groundColor = 0xb97a20; // brownish orange
	hemisphereLight = new THREE.HemisphereLight(
		skyColor,
		groundColor,
		intensity
	);
	//scene.add(hemisphereLight);

	//------ add directional Light -------------------
    /**
     * Light coming from a specific direction try to mimic the sun 
     */
	directionalLight = new THREE.DirectionalLight(color, intensity);
	directionalLight.position.set(0, 10, 0);
	directionalLight.target.position.set(-5, 0, 0);
	//scene.add(directionalLight);
	//scene.add(directionalLight.target);
	//helper = new THREE.DirectionalLightHelper(directionalLight);
	///scene.add(helper);


    //--------- PointLight--------------------------
    pointLight = new THREE.PointLight(color, intensity);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);
    helper = new THREE.PointLightHelper(directionalLight);
	scene.add(helper);


	//------------ Manage the resize window ------------
	window.addEventListener("resize", onWindowResize);

	buildGUI();
}

function render(time) {
	time *= 0.0001;

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

function updateLight(){
    //directionalLight.target.updateMatrixWorld();
    helper.update();
}


function buildGUI() {
	gui.addColor(new ColorGUIHelper(hemisphereLight, "color"), "value").name(
		"color"
	);
    gui.add(pointLight, 'distance', 0, 40).onChange(updateLight);


	gui.add(directionalLight, "intensity", 0, 2, 0.01);
	makeXYZGUI('distance', pointLight.position, updateLight);

}

function makeXYZGUI(name, vector3, onChangeFn) {
	const folder = gui.addFolder(name);
	folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
	folder.add(vector3, "y", -10, 10).onChange(onChangeFn);
	folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
	folder.open();
}
