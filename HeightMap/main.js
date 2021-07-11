import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";

//create gui
const gui = new GUI();

// Camera Settings
let fov = 40;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.1;
let far = 1000;

let camera, scene, renderer;
let objects = [];

let materials = {
	basic: new THREE.MeshBasicMaterial({color : 0x10fd12}),
	lambert: new THREE.MeshLambertMaterial({color : 0x10fd12}),
	phong: new THREE.MeshPhongMaterial({color : 0x10fd12}),
}

let sphereProps = {
    radius: 1,
    heightSegment: 25,
    widthSegment: 25,
    sphereMaterial: materials.basic,
};


let SphereGeometry;
let sphereMesh;

init();

function init() {
	//create a camera
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 6;

	scene = new THREE.Scene();

	//---------- creat a sphere ------------

    sphereMesh = createSphere();

    console.log(SphereGeometry);
	scene.add(sphereMesh);
	objects.push(sphereMesh);

	//--------- add light to the scene ---------------
	const color = 0xffffff;
	const intensity = 1;
	const light = new THREE.DirectionalLight(color, intensity);
	light.position.set(-1, 2, 4);
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

function createSphere(){
	SphereGeometry = new THREE.SphereGeometry(sphereProps.radius, sphereProps.widthSegment, sphereProps.heightSegment);
    
    return new THREE.Mesh(SphereGeometry, sphereProps.sphereMaterial);
}

function updateMaterialSphere(){
	console.log(sphereMesh.material)
	if(sphereProps.sphereMaterial !== sphereMesh.material){
		sphereMesh = new THREE.Mesh(SphereGeometry, sphereProps.sphereMaterial);
	
	}
}



function render(time) {
	time *= 0.001;
	updateMaterialSphere()
	
	
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

	const sphereFolder = gui.addFolder("Sphere properties");
    sphereFolder.add(sphereProps, 'sphereMaterial', materials);
	sphereFolder.open();
}


