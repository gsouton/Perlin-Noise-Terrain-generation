import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
//import { GUI } from '../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js'


let camera, scene, renderer;
let material, meshes, geometry;
let box,  cone, tetrahedron, torus;

init();

function init() {
	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.z = 5;

	scene = new THREE.Scene();
    
    geometry = [
	    box = new THREE.BoxGeometry(),
        cone = new THREE.ConeGeometry(),
        tetrahedron = new THREE.TetrahedronBufferGeometry(),
        torus = new THREE.TorusGeometry(),
    ];

	material = new THREE.MeshNormalMaterial();
      
	meshes = [];
	let i = -3;
    geometry.forEach((geometry) =>{
        meshes.push(makeInstance(geometry, i));
        i += 2;
    });

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);

	renderer.setAnimationLoop(animation);
	document.body.appendChild(renderer.domElement);

	window.addEventListener("resize", onWindowResize);

    
}


function makeInstance(geometry, x) {
	const mesh = new THREE.Mesh(geometry, material); // create a mesh for the cube
	scene.add(mesh); // add the cube to the scene
	mesh.position.x = x; // modify the x position of the cube

	return mesh;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animation(time) {
	meshes.forEach((mesh) => {
		mesh.rotation.x = time / 2000;
		mesh.rotation.y = time / 1000;
	});

	renderer.render(scene, camera);
}
