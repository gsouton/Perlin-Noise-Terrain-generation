import { GUI } from "../../vendors/three.js-r130/examples/jsm/libs/dat.gui.module.js";
import {Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer} from "../vendors/three.js-r130/build/three.module.js";
import { generateImprovedPerlinTexture, generateOrignalPerlinTexture, generateRandomTexture} from "./NoiseGenerator/noise.js";
import { OrbitControls } from "../vendors/three.js-r130/examples/jsm/controls/OrbitControls.js";


//create gui
const gui = new GUI();

//controls
let controls;

// Camera Settings
let fov = 40;
let aspect = window.innerWidth / window.innerHeight;
let near = 0.1;
let far = 1000;

let camera, scene, renderer;
let object;

let planeProperties = {
    scale: 1,
}

let perlinProperties = {
    scale: 0.3,
    octave: 4,
    persistance: .5,
    lacunarity: 2,

}

let noiseProperties = {
    currentType: "random",
    resolution: 4,
    types: ["random", "classic perlin", "improved perlin"],
}



init();

function init() {

    
	//------- Initialize renderer -------------------
	renderer = new WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);

    

	//------- create a camera ---------
	camera = new PerspectiveCamera(fov, aspect, near, far);
	camera.position.z = 6;

	// ------ create a scene ----------
	scene = new Scene();
	//------------ Manage the resize window ------------
	window.addEventListener("resize", onWindowResize);

    //----------- add control -------
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxDistance = 6;
    controls.minDistance = 0.5;
	controls.addEventListener("change", render); // same for when controls are used


    //------ make a plane ----
    createInstancePlane();


    render();

	buildGUI();
}



function createInstancePlane(){
    const texture = generateRandomTexture(noiseProperties.resolution, noiseProperties.resolution);
    const planeGeo = new PlaneGeometry(3, 3);
    const planeMaterial = new MeshBasicMaterial({map: texture,color: 0xffffff});
    object = new Mesh(planeGeo, planeMaterial);
    scene.add(object);
}





function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function updateTexture(type){
    if(type === "random"){
        const texture = generateRandomTexture(noiseProperties.resolution, noiseProperties.resolution);
        object.material.map = texture;
    }
    if(type === "classic perlin"){
        const texture =  generateOrignalPerlinTexture(noiseProperties.resolution, noiseProperties.resolution, perlinProperties.scale);
        object.material.map = texture;
    }
    if(type === "improved perlin"){
        const texture = generateImprovedPerlinTexture(noiseProperties.resolution, noiseProperties.resolution, perlinProperties.scale);
        object.material.map = texture;
    }
    

    render();

}

function buildGUI() {
    const planeFolder = gui.addFolder("Plane properties");
    planeFolder.add(planeProperties, "scale", 1, 4, 0.1).onChange(function(value){
        object.scale.set(value, value, 0);
        render();
    });
    planeFolder.hide();

    const noiseFolder = gui.addFolder("Noise properties");
   

    noiseFolder.open();
    noiseFolder.add(noiseProperties, "resolution", 4, 2048, 1).onChange(function(value){
        updateTexture(noiseProperties.currentType);
    });
    noiseFolder.add(noiseProperties, "types", noiseProperties.types).setValue("random").onChange(function(value){
        if(value === "classic perlin" || value === "improved perlin"){
            perlinPropertiesFolder.show();
            perlinPropertiesFolder.open();
        }else{
            perlinPropertiesFolder.hide();
        }
        noiseProperties.currentType = value;
        updateTexture(noiseProperties.currentType);
        
    });
    const perlinPropertiesFolder = noiseFolder.addFolder("Perlin Noise properties");
    perlinPropertiesFolder.add(perlinProperties, "scale", 0, 600, 0.01).onChange(function(value){
        perlinProperties.scale = value;
        updateTexture(noiseProperties.currentType);
    });

    perlinPropertiesFolder.hide();




    planeFolder.open();
}


