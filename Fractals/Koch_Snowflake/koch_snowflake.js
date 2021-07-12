import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { OrbitControls } from "../../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";

//controls
let controls;

// needed to render a scene
let renderer, scene, camera;
let camera_speed = 0.001;

//Camera Settings
const fov = 70;
const aspect = window.innerWidth / window.innerHeight;
const near = -1;
const far = 100;

let grid;

//Points and Line

let line1Points, line2Points, line3Points;
let line1Geometry, line2Geometry, line3Geometry;
let line1Mesh,line2Mesh,line3Mesh;
let line1Mat, line2Mat,line3Mat;


let l = [];

init();

function init() {
	// Initialize Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setAnimationLoop(update);	
    document.body.append(renderer.domElement);

	// Init Scene
	scene = new THREE.Scene();

	// Init Orhtographic Camera for 2D
	camera = new THREE.OrthographicCamera(
		-innerWidth / 2,
		innerWidth / 2,
		innerHeight / 2,
		-innerHeight / 2,
		near,
		far
	);
    //camera.position.set(0, innerHeight/3, 0);
	camera.zoom = 100.0;
	camera.updateProjectionMatrix();

    // --- add Controls -----
    controls = new OrbitControls(camera, renderer.domElement);
    //controls.enableDamping = true;

    
    // --- Grid Helper -----
    grid = new THREE.GridHelper(innerWidth, 30);
    grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI/2);
    //scene.add(grid);

	

	//Construct a lines
	
	//top
	/*line1Points = [ new THREE.Vector2( 0, 0),new THREE.Vector2(-1 , 0)];

	line1Geometry = new THREE.BufferGeometry().setFromPoints(line1Points
	);
	line1Mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
	line1Mesh = new THREE.Line(line1Geometry, line1Mat);
	scene.add(line1Mesh);

	//left
	line2Points = [new THREE.Vector2(-1 , 0),new THREE.Vector2(-1+1/2 , Math.sqrt(3)/2), ];

	line2Geometry = new THREE.BufferGeometry().setFromPoints(line2Points);
	line2Mat = new THREE.LineBasicMaterial({ color: 0xffdd00 });
	line2Mesh = new THREE.Line(line2Geometry, line2Mat);
	scene.add(line2Mesh);

	//right
	line3Points = [ new THREE.Vector2(-1/2 , Math.sqrt(3)/2),new THREE.Vector2(0 , 0)];

	line3Geometry = new THREE.BufferGeometry().setFromPoints(line3Points);
	line3Mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
	line3Mesh = new THREE.Line(line3Geometry, line3Mat);
	scene.add(line3Mesh);

	// Compute koch snowflake
	const koch_array_top = compute_koch_snowflake(line1Points, 10);
	line1Mesh.geometry.setFromPoints(koch_array_top);

	const koch_array_left = compute_koch_snowflake(line2Points, 10);
	line2Mesh.geometry.setFromPoints(koch_array_left);

	const koch_array_right = compute_koch_snowflake(line3Points, 10);
	line3Mesh.geometry.setFromPoints(koch_array_right, 4);
		*/
    

    window.addEventListener( 'resize', onWindowResize );
    //controls.addEventListener('change', render);
	

	// render
	render();
}


function makeInstanceKochFlake(scaling_factor, koch_flakes_points){
	const line1Points = [ new THREE.Vector2( 0, 0),new THREE.Vector2(-1 , 0)];

	line1Geometry = new THREE.BufferGeometry().setFromPoints(line1Points
	);
	line1Mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
	line1Mesh = new THREE.Line(line1Geometry, line1Mat);
	scene.add(line1Mesh);

	//left
	line2Points = [new THREE.Vector2(-1 , 0),new THREE.Vector2(-1+1/2 , Math.sqrt(3)/2), ];

	line2Geometry = new THREE.BufferGeometry().setFromPoints(line2Points);
	line2Mat = new THREE.LineBasicMaterial({ color: 0xffdd00 });
	line2Mesh = new THREE.Line(line2Geometry, line2Mat);
	scene.add(line2Mesh);

	//right
	line3Points = [ new THREE.Vector2(-1/2 , Math.sqrt(3)/2),new THREE.Vector2(0 , 0)];

	line3Geometry = new THREE.BufferGeometry().setFromPoints(line3Points);
	line3Mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
	line3Mesh = new THREE.Line(line3Geometry, line3Mat);
	scene.add(line3Mesh);
}

function createKochFlake(iteration = 7){
	//bottom side
	const line1Points = [ new THREE.Vector2( 0, 0),new THREE.Vector2(-1 , 0)];
	const koch_bottom = compute_koch_snowflake(line1Points, iteration);
	
	// left side
	const line2Points = [new THREE.Vector2(-1 , 0),new THREE.Vector2(-1+1/2 , Math.sqrt(3)/2), ];
	const koch_left = compute_koch_snowflake(line2Points, iteration);
	
	// right side
	const line3Points = [ new THREE.Vector2(-1/2 , Math.sqrt(3)/2),new THREE.Vector2(0 , 0)];
	const koch_right = compute_koch_snowflake(line3Points, iteration);

	return [koch_bottom, koch_left, koch_right];


}



function render(time) {
	renderer.render(scene, camera);
}

function compute_koch_snowflake(array_points, iteration = 3, initialSize = 1, reduce_factor = 1 ) {
	if (iteration === 0) return array_points;
	let tmp = [array_points[0]];
	for (let i = 0; i < array_points.length - 1; i++) {
		let divisions = divideSegementInThree(array_points[i],array_points[i + 1]);
		let middleOfDivision = divisions[0].clone().lerp(divisions[1], 1 / 2);
        let segment = new THREE.Vector2(divisions[1].x - middleOfDivision.x, divisions[1].y - middleOfDivision.y);
		let normal = normalVector(segment);
		
		normal.multiplyScalar(initialSize/Math.pow(3,reduce_factor));
		middleOfDivision.add(normal);

		tmp.push(divisions[0]);
		tmp.push(middleOfDivision);
		tmp.push(divisions[1]);
		tmp.push(array_points[i + 1]);
	}
	return compute_koch_snowflake(tmp, iteration - 1, initialSize, reduce_factor+1);
}



function divideSegementInThree(pointA, pointB) {
	return [
		pointA.clone().lerp(pointB, 1 / 3),
		pointA.clone().lerp(pointB, 2 / 3),
	];
}

function normalVector(vector) {
	let normalized_vector = vector.clone().normalize();
	return normalized_vector.set(-normalized_vector.y, normalized_vector.x);
}

/* Function called every frame*/
function update(time) {
    time *= 0.001; 
	render();
    //updateCameraOnRender(time);
}

function updateCameraOnRender(time){
    if(camera.zoom >= 130)
        camera_speed = camera_speed*-1;
    if(camera.zoom <= -130)
        camera_speed = camera_speed*-1;
    camera.zoom += camera_speed * time;

    camera.updateProjectionMatrix();

}

function updateCameraOnResize(){
    camera.left = -innerWidth/2;
    camera.right = innerWidth/2;
    camera.top = innerHeight/2;
    camera.bottom = -innerHeight/2;
    camera.updateProjectionMatrix();

}

function onWindowResize() {
    updateCameraOnResize();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //render();
}
