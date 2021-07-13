import * as THREE from "../../vendors/three.js-r130/build/three.module.js";
import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import { OrbitControls } from "../../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";
import * as LineGeometry from "./lineGeometry.js" 

// GUI Attributes
const gui = new GUI();
let controlsParameters = {
	reset: function () {
		controls.reset();
	},
};
let sceneParameters = {
	reset: resetScene,
};

let animationParamaters = {
	iteration: 5,
	choice: ["flake", "line"],
	flake: animationKochFlake,
};

//controls
let controls;

// needed to render a scene
let renderer, scene, camera;

//Camera Settings
const near = -1;
const far = 100;
let camera_speed = 0.01;

// Objects to render on screen
const koch_flakes_objects = [];
let koch_animation_objects = { flake: undefined, line: undefined };

let grid;

init();

function init() {
	// Initialize Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	//renderer.setAnimationLoop(update);
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
	camera.zoom = 1;

	// --- add Controls -----
	controls = new OrbitControls(camera, renderer.domElement);
	controls.minZoom = 5.7e-15;
	//controls.maxZoom = 50000;
	//controls.enableDamping = true;

	// --- Grid Helper -----
	grid = new THREE.GridHelper(innerWidth, 30);
	grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
	//scene.add(grid);

	const koch_points = createKochFlake(8);
	console.log(koch_points);
	koch_flakes_objects.push(makeInstanceKochFlake(koch_points));

	/*for (
		let i = 2, x_shift = 0.5, y_shift = -0.25;
		i < 20;
		i += 1, x_shift += 0.5, y_shift += -0.25
	) {
		koch_flakes_objects.push(
			makeInstanceKochFlake(koch_points, i, i, x_shift, y_shift)
		);
	}*/

	window.addEventListener("resize", onWindowResize);
	controls.addEventListener("change", render);

	buildGUI();

	// render
	render();
}

function makeInstanceKochFlake(
	koch_flakes_points,
	x_scale = 1,
	y_scale = 1,
	x_shift = 0,
	y_shift = 0,
	color = 0xffdd00,
	
) {
	if (x_scale > 1 && y_scale > 1) {
		shiftAndScale(koch_flakes_points, x_scale, y_scale, x_shift, y_shift);
	
	}
	
	const lineMaterial = new THREE.LineBasicMaterial({ color: color });
	const lineGeometry = new THREE.BufferGeometry().setFromPoints(koch_flakes_points);
	const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
	scene.add(lineMesh);
	return lineMesh;
	
	/*
	//bottom
	const line1Geometry = new THREE.BufferGeometry().setFromPoints(
		koch_flakes_points[0]
	);
	const line1Mat = new THREE.LineBasicMaterial({ color: color_bottom });
	const line1Mesh = new THREE.Line(line1Geometry, line1Mat);

	scene.add(line1Mesh);

	//left
	const line2Geometry = new THREE.BufferGeometry().setFromPoints(
		koch_flakes_points[1]
	);
	const line2Mat = new THREE.LineBasicMaterial({ color: color_left });
	const line2Mesh = new THREE.Line(line2Geometry, line2Mat);
	scene.add(line2Mesh);

	//right
	const line3Geometry = new THREE.BufferGeometry().setFromPoints(
		koch_flakes_points[2]
	);
	const line3Mat = new THREE.LineBasicMaterial({ color: color_right });
	const line3Mesh = new THREE.Line(line3Geometry, line3Mat);
	scene.add(line3Mesh);

	return [line1Mesh, line2Mesh, line3Mesh];
	*/
}

function scaleVectors(points, factor){
	points.forEach((point) =>{
		point.multiplyScalar(factor);
	});
}

function shiftAndScale(points, x_scale, y_scale, x_shift, y_shift) {
	points.forEach((point) => {
		point.x = point.x * x_scale + x_shift;
		point.y = point.y * y_scale + y_shift;
	});
}

function createKochFlake(iteration = 7) {
	let points = LineGeometry.triangleVectors();
	return compute_koch_snowflake(points, iteration);
	/*
	//bottom side
	const line1Points = [new THREE.Vector2(0, 0), new THREE.Vector2(-1, 0)];
	const koch_bottom = compute_koch_snowflake(line1Points, iteration);

	// left side
	const line2Points = [
		new THREE.Vector2(-1, 0),
		new THREE.Vector2(-1 + 1 / 2, Math.sqrt(3) / 2),
	];
	const koch_left = compute_koch_snowflake(line2Points, iteration);

	// right side
	const line3Points = [
		new THREE.Vector2(-1 / 2, Math.sqrt(3) / 2),
		new THREE.Vector2(0, 0),
	];
	const koch_right = compute_koch_snowflake(line3Points, iteration);

	return [koch_bottom, koch_left, koch_right];
	*/
}

function render(time) {
	renderer.render(scene, camera);
}

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

function updateCameraOnRender(time) {
	if (camera.zoom <= 0.1) {
		camera.zoom = 230;
	}
	camera.zoom -= camera_speed * time;
	camera.updateProjectionMatrix();
}

function updateCameraOnResize() {
	camera.left = -innerWidth / 2;
	camera.right = innerWidth / 2;
	camera.top = innerHeight / 2;
	camera.bottom = -innerHeight / 2;
	camera.updateProjectionMatrix();
}

function onWindowResize() {
	updateCameraOnResize();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

function buildGUI() {
	const sceneFolder = gui.addFolder("Scene parameters");
	sceneFolder.add(sceneParameters, "reset").name("Reset Scene");

	const controlsFolder = gui.addFolder("Controls");
	controlsFolder.add(controlsParameters, "reset").name("Reset position");
	controlsFolder.open();

	const visualization = gui.addFolder("Koch flake Animation");
	visualization.add(animationParamaters, "iteration", 1, 9, 1);
	visualization
		.add(animationParamaters, "choice", animationParamaters.choice)
		.name("Type of animiation")
		.onChange(function (value) {
			animationConstructionKochFlake(
				value,
				animationParamaters.iteration
			);
		});
	visualization.open();
}

function resetScene() {
	deleteScene();
	koch_flakes_objects.forEach((objects) => {
		objects.forEach((mesh) => {
			scene.add(mesh);
		});
	});
	render();
}

function deleteScene() {
	koch_flakes_objects.forEach((objects) => {
		objects.forEach((mesh) => {
			scene.remove(mesh);
		});
	});
	Object.keys(koch_animation_objects).forEach((object) => {
		scene.remove(object);
	});
}

function animationConstructionKochFlake(choice) {
	deleteScene();
	if (choice === "flake") {
		console.log("Start animating with a full koch flake");
		animationKochFlake(animationParamaters.iteration);
	}
}

function animationKochFlake(iteration = 5, color = 0x00ffdd, scale = 50) {
	
	let points = LineGeometry.triangleVectors(scale);
	const lineMaterial = new THREE.LineBasicMaterial({ color: color });
	const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
	const lineMesh = new THREE.Line(lineGeometry, lineMaterial);
	
	scene.add(lineMesh);
	points = compute_koch_snowflake(points, 7, scale);
	lineGeometry.setFromPoints(points);
	render();

	
}
