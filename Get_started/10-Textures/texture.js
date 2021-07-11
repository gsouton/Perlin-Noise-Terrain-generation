import * as THREE from '../../vendors/three.js-r130/build/three.module.js'

let camera, scene, renderer;
let geometry, material, objects = [];
let rotation_speed = 0.001;

init();

function init(){
    camera = new THREE.PerspectiveCamera(70, window.innerWidth/ window.innerHeight, 0.01, 10);
    camera.position.z = 5;

    scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();

    geometry = new THREE.BoxGeometry(1, 1, 1);
    const small_cube = new THREE.BoxGeometry(0.1, 0.1, 0.1);

    /* This method is to prefer when you want to wait that the texture is loaded before rendering */
    loader.load("/resources/Get_Started/textures/wall.jpg", (texture) =>{
        const material = new THREE.MeshBasicMaterial({map: texture})
        const cube1 = new THREE.Mesh(geometry, material);
        cube1.position.set(2, 2, 0);
        scene.add(cube1);
        objects.push(cube1);

    });

    

    const materials = [
        new THREE.MeshBasicMaterial({map: loader.load("/resources/Get_Started/textures/flower-1.jpg")}),
        new THREE.MeshBasicMaterial({map: loader.load("/resources/Get_Started/textures/flower-2.jpg")}),
        new THREE.MeshBasicMaterial({map: loader.load("/resources/Get_Started/textures/flower-3.jpg")}),
        new THREE.MeshBasicMaterial({map: loader.load("/resources/Get_Started/textures/flower-4.jpg")}),
        new THREE.MeshBasicMaterial({map: loader.load("/resources/Get_Started/textures/flower-5.jpg")}),
        new THREE.MeshBasicMaterial({map: loader.load("/resources/Get_Started/textures/flower-6.jpg")}),
    ]
    const cube2 = new THREE.Mesh(geometry, materials);
    cube2.position.set(-2, 2, 0);
    scene.add(cube2);
    objects.push(cube2);

     /* This method is to prefer when you want to wait that the texture is loaded before rendering */
     loader.load("/resources/Get_Started/textures/mip-low-res-enlarged.png", (texture) =>{
        const material = new THREE.MeshBasicMaterial({map: texture})
        const cube3 = new THREE.Mesh(small_cube, material);
        
        cube3.position.set(-2, -2, 0);
        scene.add(cube3);
        objects.push(cube3);

    });

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animation);
    document.body.appendChild(renderer.domElement);


    window.addEventListener( 'resize', onWindowResize );

}



function animation(time){
    objects.forEach((object)=>{
        object.rotation.x = time * rotation_speed;
        object.rotation.y = time * rotation_speed;
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
