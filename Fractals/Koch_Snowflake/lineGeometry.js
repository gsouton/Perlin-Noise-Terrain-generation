import * as THREE from "../../vendors/three.js-r130/build/three.module.js";

export { triangleVectors, squaredLine };

function triangleVectors(scale = 1) {
    let y = Math.sqrt(3)/2;
    let y_offset = 1/(2*Math.sqrt(3));

	return [
        new THREE.Vector2(0.5, -y_offset).multiplyScalar(scale),
		new THREE.Vector2(-0.5, -y_offset).multiplyScalar(scale),
        
		new THREE.Vector2(-0.5,  -y_offset).multiplyScalar(scale),
		new THREE.Vector2(0, y- y_offset).multiplyScalar(scale),
		
        new THREE.Vector2(0, y - y_offset).multiplyScalar(scale),
		new THREE.Vector2(0.5, - y_offset).multiplyScalar(scale),
        
	];
}

function squaredLine() {
	return [
		new THREE.Vector2(-1, 1),
		new THREE.Vector2(1, 1),

		new THREE.Vector2(1, 1),
		new THREE.Vector2(1, -1),

		new THREE.Vector2(1, -1),
		new THREE.Vector2(-1, -1),

		new THREE.Vector2(-1, -1),
		new THREE.Vector2(-1, 1),
	];
}
