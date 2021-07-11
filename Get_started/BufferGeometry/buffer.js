import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "../../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";
const vertices = [
    // front
    { pos: [-1, -1,  1], norm: [ 0,  0,  1], uv: [0, 0], }, // 0
    { pos: [ 1, -1,  1], norm: [ 0,  0,  1], uv: [1, 0], }, // 1
    { pos: [-1,  1,  1], norm: [ 0,  0,  1], uv: [0, 1], }, // 2
   

    { pos: [ 1,  1,  1], norm: [ 0,  0,  1], uv: [1, 1], }, // 3
    // right
    { pos: [ 1, -1,  1], norm: [ 1,  0,  0], uv: [0, 0], }, // 4
    { pos: [ 1, -1, -1], norm: [ 1,  0,  0], uv: [1, 0], }, // 5
   
 
    { pos: [ 1,  1,  1], norm: [ 1,  0,  0], uv: [0, 1], }, // 6
    { pos: [ 1,  1, -1], norm: [ 1,  0,  0], uv: [1, 1], }, // 7
    // back
    { pos: [ 1, -1, -1], norm: [ 0,  0, -1], uv: [0, 0], }, // 8
    { pos: [-1, -1, -1], norm: [ 0,  0, -1], uv: [1, 0], }, // 9

    { pos: [ 1,  1, -1], norm: [ 0,  0, -1], uv: [0, 1], }, // 10
    { pos: [-1,  1, -1], norm: [ 0,  0, -1], uv: [1, 1], }, // 11
    // left
    { pos: [-1, -1, -1], norm: [-1,  0,  0], uv: [0, 0], }, // 12
    { pos: [-1, -1,  1], norm: [-1,  0,  0], uv: [1, 0], }, // 13
   

    { pos: [-1,  1, -1], norm: [-1,  0,  0], uv: [0, 1], }, // 14
    { pos: [-1,  1,  1], norm: [-1,  0,  0], uv: [1, 1], }, // 15
    // top
    { pos: [ 1,  1, -1], norm: [ 0,  1,  0], uv: [0, 0], }, // 16
    { pos: [-1,  1, -1], norm: [ 0,  1,  0], uv: [1, 0], }, // 17
   

    { pos: [ 1,  1,  1], norm: [ 0,  1,  0], uv: [0, 1], }, // 18
    { pos: [-1,  1,  1], norm: [ 0,  1,  0], uv: [1, 1], }, // 19
    // bottom
    { pos: [ 1, -1,  1], norm: [ 0, -1,  0], uv: [0, 0], }, // 20
    { pos: [-1, -1,  1], norm: [ 0, -1,  0], uv: [1, 0], }, // 21
   

    { pos: [ 1, -1, -1], norm: [ 0, -1,  0], uv: [0, 1], }, // 22
    { pos: [-1, -1, -1], norm: [ 0, -1,  0], uv: [1, 1], }, // 23
  ];

const positions = [];
const normals = [];
const uvs = [];
for (const vertex of vertices) {
	positions.push(...vertex.pos);
	normals.push(...vertex.norm);
	uvs.push(...vertex.uv);
}

const geometry = new THREE.BufferGeometry();
const positionNumComponents = 3;
const normalNumComponents = 3;
const uvNumComponents = 2;

geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));


geometry.setIndex([
    0,  1,  2,   2,  1,  3,  // front
    4,  5,  6,   6,  5,  7,  // right
    8,  9, 10,  10,  9, 11,  // back
   12, 13, 14,  14, 13, 15,  // left
   16, 17, 18,  18, 17, 19,  // top
   20, 21, 22,  22, 21, 23,  // bottom
 ]);


//object needed to render a scene
let renderer, camera, scene;

// camera settings
const fov = 75;
const aspect = window.innerWidth/ window.innerHeight;
const near = 0.1;
const far = 100;

//cubes
let texture, cubes;

init();

function init(){
    //---------- create a camera -----------------
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 0, 5);

	//---------- Create a scene ---------------------
	scene = new THREE.Scene();
	//scene.background = new THREE.Color("black");

	//------- Initialize renderer -------------------
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setAnimationLoop(animation);
	document.body.appendChild(renderer.domElement);

    addDirectionalLight();

    // load texture
    const loader = new THREE.TextureLoader();
    texture = loader.load('/resources/Get_Started/textures/star.png');

    cubes = [
        makeCustomCubes(geometry, 0xff0000, -4),
        makeCustomCubes(geometry, 0x00ff00, 0),
        makeCustomCubes(geometry, 0x0000ff, 4),
    ];




}

function makeCustomCubes(geometry, color, x){
    const material = new THREE.MeshPhongMaterial({color, map:texture});
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.x = x;
    return cube;
}

function addDirectionalLight(){
    const color = 0xffffff;
    const intensity = 1.5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
}


function render(time){
    time *= 0.001; 
    cubes.forEach((object, ndx) =>{
        const speed = 1 + ndx * 0.1;
        const rot = time * speed;
        object.rotation.x = rot;
        object.rotation.y = rot;

    });
    renderer.render(scene, camera);
}



function animation(time){
    render(time);
}