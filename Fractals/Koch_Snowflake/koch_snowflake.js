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
let points;
let lineGeometry, lineMat, lineMesh;

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
    camera.position.set(0, innerHeight/3, 0);
	camera.zoom = 1;

    // --- add Controls -----
    //controls = new OrbitControls(camera, renderer.domElement);
    //controls.enableDamping = true;

    
    // --- Grid Helper -----
    grid = new THREE.GridHelper(innerWidth, 30);
    grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI/2);
    //scene.add(grid);

	

	//Construct a line

	points = [];
	points.push(new THREE.Vector2(-innerWidth/2 , 0));
	points.push(new THREE.Vector2(innerWidth/2 , 0));

	lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
	lineMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
	lineMesh = new THREE.Line(lineGeometry, lineMat);

	const koch_array = compute_koch_snowflake(points, 10);
	lineMesh.geometry.setFromPoints(koch_array);
	scene.add(lineMesh);

    /*const p2 = [
        new THREE.Vector2(-innerWidth/2 , innerHeight),
        new THREE.Vector2(innerWidth/2 , innerHeight)];
    const geo2 = new THREE.BufferGeometry().setFromPoints(p2);
    const koch_array2 = compute_koch_snowflake(points, 10);

	const lineMat2 = new THREE.LineBasicMaterial({ color: 0x0000ff });
	const lineMesh2 = new THREE.Line(geo2, lineMat2);
    lineMesh2.geometry.setFromPoints(koch_array2);
    scene.add(lineMesh2);
    */

    window.addEventListener( 'resize', onWindowResize );
    //controls.addEventListener('change', render);


	// render
	render();
}

function render(time) {
	renderer.render(scene, camera);
}

function compute_koch_snowflake(array_points, iteration = 3, initialSize = innerHeight, reduce_factor = 1 ) {
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
    updateCameraOnRender(time);
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
