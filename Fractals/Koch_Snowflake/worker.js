import * as THREE from "../../vendors/three.js-r130/build/three.module.js";


onmessage = function(array_points){
    console.log("worker received the message with", array_points);
    let result = compute_koch_snowflake(array_points.data);
    console.log(result);
    postMessage(result);
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