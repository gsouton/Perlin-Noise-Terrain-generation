export function generateMeshData(heightmap, heightMultiplier) {
	let width = heightmap.width;
	let height = heightmap.height;
	let topLeft = (width - 1) / -2; // to center the mesh
	let topRight = (height - 1) / 2;

	let meshData = {
		vertices: new Float32Array(width * height * 3),
		triangles: new Uint32Array(width * height * 6 * 3),
		uvs: new Float32Array(width * height * 2),
		trianglesIndex: 0,
		addTriangle: function (a, b, c) {
			this.triangles[this.trianglesIndex] = a;
			this.triangles[this.trianglesIndex + 1] = b;
			this.triangles[this.trianglesIndex + 2] = c;
			this.trianglesIndex += 3;
		},
	};

	let vertexIndex = 0;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let verticeStride = vertexIndex * 3;
			let uvStride = vertexIndex * 2;
			meshData.vertices[verticeStride] = topLeft + x;
			meshData.vertices[verticeStride + 1] = evaluateHeight(
				heightmap.map[vertexIndex] / 255, heightMultiplier
			);
			meshData.vertices[verticeStride + 2] = topRight - y;

			meshData.uvs[uvStride] = x / width;
			meshData.uvs[uvStride + 1] = y / height;

			if (x < width - 1 && y < height - 1) {
				meshData.addTriangle(
					vertexIndex,
					vertexIndex + width + 1,
					vertexIndex + width
				);
				meshData.addTriangle(
					vertexIndex + width + 1,
					vertexIndex,
					vertexIndex + 1
				);
			}

			vertexIndex++;
		}
	}
	return meshData;
}

function evaluateHeight(heightValue, heightMultiplier) {
	if(heightValue <= 0.4){
        return heightValue* 0.4*10 ;
    }
    return heightValue * heightValue*10 * heightMultiplier;
}
