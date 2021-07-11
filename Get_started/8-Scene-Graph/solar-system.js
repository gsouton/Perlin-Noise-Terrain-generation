import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";

const gui = new GUI();

// Camera Settings
let fov = 40;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.1;
let far = 1000;

let camera, scene, renderer;
let objects, solarSystem, sunMesh, earthOrbit, earthMesh, moonOrbit, moonMesh;
let SphereGeometry;

init();

function init() {
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 50, 0); // set the camera above the origin
	camera.up.set(0, 0, 1); // camera facing Y
	camera.lookAt(0, 0, 0); // look at origin

	scene = new THREE.Scene();
	objects = [];

	//-------- create a root object solar system -----------
	/* It is just an object containing the local space */
	solarSystem = new THREE.Object3D();
	scene.add(solarSystem);
	objects.push(solarSystem);

	//---------- creat a sphere geometry object ------------
	const radius = 1;
	const widthSegment = 6;
	const heightSegment = 6;
	SphereGeometry = new THREE.SphereGeometry(
		radius,
		widthSegment,
		heightSegment
	);

	//--------- let's make a sun -------------
	/*This object is child of solar system with scale x5*/
	const sunMaterial = new THREE.MeshPhongMaterial({ emissive: 0xffff00 });
	sunMesh = new THREE.Mesh(SphereGeometry, sunMaterial);
	sunMesh.scale.set(5, 5, 5);
	//scene.add(sunMesh); // add sun to the scene
	solarSystem.add(sunMesh); // add the sun to the solar system
	objects.push(sunMesh); // add to array of objects

	//--------- create earth orbit ---------
	earthOrbit = new THREE.Object3D();
	earthOrbit.position.x = 10;
	solarSystem.add(earthOrbit);
	objects.push(earthOrbit);

	//--------- make earth ---------
	const earthMaterial = new THREE.MeshPhongMaterial({
		color: 0x2233ff,
		emissive: 0x112244,
	});
	earthMesh = new THREE.Mesh(SphereGeometry, earthMaterial);
	earthOrbit.add(earthMesh);
	objects.push(earthMesh);

	//---- moon orbit -------
	moonOrbit = new THREE.Object3D();
	moonOrbit.position.x = 2;
	earthOrbit.add(moonOrbit);

	//-------- let's create a moon ------
	const moonMaterial = new THREE.MeshPhongMaterial({
		color: 0x88888,
		emissive: 0x22222,
	});
	moonMesh = new THREE.Mesh(SphereGeometry, moonMaterial);
	moonMesh.scale.set(0.5, 0.5, 0.5);
	moonOrbit.add(moonMesh);
	objects.push(moonMesh);

	//--------- add light to the scene ---------------
	const color = 0xffffff;
	const intensity = 3;
	const light = new THREE.PointLight(color, intensity);
	scene.add(light);

	//------- Initialize renderer -------------------
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	renderer.setAnimationLoop(animation);
	document.body.appendChild(renderer.domElement);

	//------------ Manage the resize window ------------
	window.addEventListener("resize", onWindowResize);

	
}

function addAxisGrid(node, label, units) {
	const helper = new AxisGridHelper(node, units);
	gui.add(helper, "visible").name(label);
}

function render(time) {
	time *= 0.001;
	objects.forEach((mesh) => {
		mesh.rotation.y = time;
	});
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

class AxisGridHelper {
	constructor(node, units = 10) {
		const axes = new THREE.AxesHelper();
		axes.material.depthTest = false; // appear even though the axis are inside spheres
		axes.renderOrder = 2; // draw after spheres and after the grid to be sure that the sphere are not drawn on top (default = 0)
		node.add(axes);

		const grid = new THREE.GridHelper(units, units);
		grid.material.depthTest = false; // appear even though the axis are inside spheres
		grid.renderOrder = 3; // draw after spheres to be sure that the sphere are not drawn on top (default = 0)
		node.add(axes);

		this.grid = grid;
		this.axes = axes;
		this.visible = false;
	}

	get visible() {
		return this._visible;
	}
	set visible(v) {
		this._visible = v;
		this.grid.visible = v;
		this.axes.visible = v;
	}
}

//---------- GUI -------------
addAxisGrid(solarSystem, "solarSystem");
addAxisGrid(sunMesh, "sunMesh");
addAxisGrid(earthOrbit, "earthOrbit");
addAxisGrid(earthMesh, "earthMesh");
addAxisGrid(moonOrbit, "moonOrbit");
addAxisGrid(moonMesh, "moonMesh");
