import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "../../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";
import * as LineGeometry from "./lineGeometry.js";

// ---------- GUI Attributes ----------
const gui = new GUI();
let controlsParameters = {
	reset: function () {
		controls.reset();
	},
};
let sceneParameters = {
	color: randomColor,
	reset: resetScene,
};

let animationParamaters = {
	iteration: 5,
	animation_speed: 1.2,
	color: 0x00ffdd,
	animation: animationKochFlake,
};

// ---------- Animation ID (requestFrame) ----------
let animationLoopID;

//---------- controls ---------- 
let controls;

// ---------- Objects needed to render a scene ----------
let renderer, scene, camera;

//---------- Camera Settings ----------
const near = -1;
const far = 100;

//---------- Objects to render on screen ----------

const object_scene_1 = [];
let animated_object = {
	mesh: undefined,
	material: new THREE.LineBasicMaterial({ color: animationParamaters.color }),
};


init();

function init() {

	// ---------- Initialize Renderer ----------
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.append(renderer.domElement);

	// ----------Init Scene ----------
	scene = new THREE.Scene();
	
	// ---------- Init Orhtographic Camera for 2D ----------
	camera = new THREE.OrthographicCamera(
		-innerWidth / 2,
		innerWidth / 2,
		innerHeight / 2,
		-innerHeight / 2,
		near,
		far
	);
	camera.zoom = 1;

	// ---------- add Controls ----------
	controls = new OrbitControls(camera, renderer.domElement);
	//controls.minZoom = 5.7e-15;
	//controls.maxZoom = 50000;
	//controls.enableDamping = true;

	// --- Grid Helper -----
	/*
	const grid = new THREE.GridHelper(innerWidth, 30);
	grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
	scene.add(grid);
	*/

	//---------- generate object for scene 1 ----------
	const koch_points = generateKochFlakesPoints(8); // generate points for a triangle with 8 iterations for koch
	//const p1 = generateKochFlakesPoints(1);
	//const p2 = generateKochFlakesPoints(2);
	const p3 = generateKochFlakesPoints(3);

	object_scene_1.push(makeInstanceKochFlake(koch_points)); // push on stack a mesh made out with the points
	//object_scene_1.push(makeInstanceKochFlake(p1));
	//object_scene_1.push(makeInstanceKochFlake(p2));
	object_scene_1.push(makeInstanceKochFlake(p3));


	// generate more snowflakes by scaling them 
	for (let scale = 2; scale < 15; scale++) {
		let color = Math.random() * 0xffffff; // assign a random color
		object_scene_1.push(makeInstanceKochFlake(koch_points, scale, color)); // create instance
		//object_scene_1.push(makeInstanceKochFlake(p1, scale, color));
		//object_scene_1.push(makeInstanceKochFlake(p2, scale, color));
		object_scene_1.push(makeInstanceKochFlake(p3, scale, color));


	}

	window.addEventListener("resize", onWindowResize); // on resize apdat camera and render
	controls.addEventListener("change", render); // same for when controls are used

	buildGUI(); 

	render();
}

/**
 * Assign a random color to all object in scene 1 and then render
 */
function randomColor(){
	object_scene_1.forEach((object) =>{
		object.material.color.set(Math.random()*0xffffff);
	});
	render();
}

/**
 * generate the each point for a koch snowflake with 7 iteration by default
 */
function generateKochFlakesPoints(iteration = 7) {
	let points = LineGeometry.triangleVectors();
	return compute_koch_snowflake(points, iteration);
}

/**
 * Create a Mesh with the given points,
 * Add the mesh to scene
 * @param {array of Vector3 THREE.js} koch_flakes_points that has been already computed 
 * @param {Number} scale 
 * @param {Number} color 
 * @returns a Mesh (Line)
 */
function makeInstanceKochFlake(koch_flakes_points, scale = 1,color = 0xffdd00) {
	if (scale > 1) {
		koch_flakes_points.forEach(point =>{
			point.multiplyScalar(scale);
		})
	}
	const lineMaterial = new THREE.LineBasicMaterial({ color: color });
	const lineGeometry = new THREE.BufferGeometry().setFromPoints(
		koch_flakes_points
	);
	const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
	scene.add(lineMesh);
	return lineMesh;
}



/**
 * Render the scene from the point of view of the camera
 */
function render(time) {
	renderer.render(scene, camera);
}

/**
 * Compute each position for an array given with the koch flake pattern
 * @param {Array of Vector2 THREE JS} array_points 
 * @param {Number} iteration Number of time to repeat the process
 * @param {Number} initialSize Initial size for each spike
 * @param {Number} reduce_factor Reduce each spike by a factor
 * @returns Array of points computed
 */
function compute_koch_snowflake(
	array_points,
	iteration = 3,
	initialSize = 1,
	reduce_factor = 1
) {
	if (iteration === 0) return array_points;
	let tmp = [array_points[0]];
	for (let i = 0; i < array_points.length - 1; i++) {
		let divisions = divideSegementInThree(
			array_points[i],
			array_points[i + 1]
		);
		let middleOfDivision = divisions[0].clone().lerp(divisions[1], 1 / 2);
		let segment = new THREE.Vector2(
			divisions[1].x - middleOfDivision.x,
			divisions[1].y - middleOfDivision.y
		);
		let normal = normalVector(segment);

		normal.multiplyScalar(initialSize / Math.pow(3, reduce_factor));
		middleOfDivision.add(normal);

		tmp.push(divisions[0]);
		tmp.push(middleOfDivision);
		tmp.push(divisions[1]);
		tmp.push(array_points[i + 1]);
	}
	return compute_koch_snowflake(
		tmp,
		iteration - 1,
		initialSize,
		reduce_factor + 1
	);
}

/**
 * Divide a segment in three equally
 * @param {Vector THREE JS} pointA 
 * @param {Vector THREE JS} pointB 
 * @returns the points corresponding to 1/3 and 2/3 in an Array
 */
function divideSegementInThree(pointA, pointB) {
	return [
		pointA.clone().lerp(pointB, 1 / 3),
		pointA.clone().lerp(pointB, 2 / 3),
	];
}

/**
 * 
 * @param {Vector2 THREE JS} vector 
 * @returns The normal of a vector
 */
function normalVector(vector) {
	let normalized_vector = vector.clone().normalize();
	return normalized_vector.set(-normalized_vector.y, normalized_vector.x);
}

/**
 * Function designed to be use by renderer.setAnimationLoop
 * @param {time stamp} time 
 */
function update(time) {
	time *= 0.001;
	render();
	updateCameraOnRender(time);
}

/**
 * Adapt the camera on resize of the screen
 */
function updateCameraOnResize() {
	camera.left = -innerWidth / 2;
	camera.right = innerWidth / 2;
	camera.top = innerHeight / 2;
	camera.bottom = -innerHeight / 2;
	camera.updateProjectionMatrix();
}

/**
 * Function call whenever the window resizes
 * dapt the camera and renderer size and rerender
 */
function onWindowResize() {
	updateCameraOnResize();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

/**
 * Function that add all the GUI on the window
 */
function buildGUI() {
	const sceneFolder = gui.addFolder("Scene parameters");
	sceneFolder.add(sceneParameters, "color").name("Change colors (Random)");
	sceneFolder.add(sceneParameters, "reset").name("Reset Scene");
	sceneFolder.open();

	const controlsFolder = gui.addFolder("Controls");
	controlsFolder.add(controlsParameters, "reset").name("Reset position");
	controlsFolder.open();

	const visualizationFolder = gui.addFolder("Koch flake Animation");
	visualizationFolder.add(animationParamaters, "animation_speed", 1.0, 2.5, 0.1);
	visualizationFolder.add(animationParamaters, "iteration", 1, 9, 1);
	visualizationFolder.addColor(animationParamaters, "color").onChange(function(value){
		animated_object.material.color.set(value);
		render();
	});
	visualizationFolder.add(animationParamaters, "animation").name("See animation ");


	visualizationFolder.open();
}

/**
 * Reset the scene, stop all animation, clear the scene and render the initial scene
 * @returns 
 */
function resetScene() {
	stopAnimation();
	clearScene();
	object_scene_1.forEach((object) => {
		scene.add(object);
	});
	render();
	return;
}

/**
 * Stop all animation and clear the scene and render();
 */
function clearScene() {
	stopAnimation();
	scene.clear();
	render();
}


/**
 * Stop the current animation if exist
 * @returns 
 */
function stopAnimation(){
	if(animationLoopID !== undefined)
		cancelAnimationFrame(animationLoopID);
	animated_object.mesh = undefined;

	return;
}

/**
 * Function that animate the construction of the koch flake
 */
function animationKochFlake(scale = 500) {
	clearScene();
	let points = LineGeometry.triangleVectors(scale);
	const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
	animated_object.mesh = new THREE.Line(lineGeometry, animated_object.material);
	scene.add(animated_object.mesh);
	render();

	
	let counter = 1;
	let start = undefined;
	console.log("start animation");
	animationLoopID = requestAnimationFrame(function(time){
		animation(time, start, points, scale, counter);
	});		
}

/**
 * Function use in rendering the animation of koch flake
 * @param {time stamp} time 
 * @param {undefined} startTime 
 * @param {Array} points 
 * @param {Numver} scale 
 * @param {Number} counter 
 */
function animation(time, startTime = undefined, points, scale, counter){
	time *= 0.001; // time in seconds
	if(startTime === undefined){
		startTime = time;
	}
	if(time - startTime >= animationParamaters.animation_speed && counter <= animationParamaters.iteration){
		console.log(counter);
		startTime = time;
		points = compute_koch_snowflake(points, 1, scale, counter);
		animated_object.mesh.geometry.setFromPoints(points);
		render();
		counter++;
	}

	animationLoopID = requestAnimationFrame(function(time){
		animation(time, startTime, points, scale, counter);
	});

	if(counter > animationParamaters.iteration){
		console.log("Request stop animation");
		stopAnimation();
	}
}



