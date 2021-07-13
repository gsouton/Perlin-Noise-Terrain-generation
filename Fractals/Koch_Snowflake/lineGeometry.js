import * as THREE from "../../vendors/three.js-r130/build/three.module.js";

export { triangleVectors, squaredLine };

function triangleVectors(scale = 1) {
	return [
		new THREE.Vector2(0.5, 0).multiplyScalar(scale),
		new THREE.Vector2(-0.5, 0).multiplyScalar(scale),

		new THREE.Vector2(-0.5, 0).multiplyScalar(scale),
		new THREE.Vector2(-0.5 + 1 / 2, Math.sqrt(3) / 2).multiplyScalar(scale),

		new THREE.Vector2(0.5 - 1 / 2, Math.sqrt(3) / 2).multiplyScalar(scale),
		new THREE.Vector2(0.5, 0).multiplyScalar(scale),
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
