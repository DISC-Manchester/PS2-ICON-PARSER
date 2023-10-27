const icondumper2 = require("./icon.js");
const iconjs = icondumper2.readers;
const filesystem = require("fs");
const processObj = require("process");

const gltfConstants = {
	"FLOAT": 5126,
	"ARRAY_BUFFER": 34962,
	"LINEAR": 9729,
	"NEAREST_MIPMAP_LINEAR": 9986,
	"REPEAT": 10497
};

function rgb5a1_rgb8(colour) {
	let b = ( colour         & 0b11111);
	let g = ((colour >>  5) & 0b11111);
	let r = ((colour >> 10) & 0b11111);
	//let a = ( color >> 15 );
	let output = new Number();
	output |= ((r * 8) << 16);
	output |= ((g * 8) << 8);
	output |= ((b * 8) << 0);
	output *= 256;
	output += (255); // couldn't do a |= as that converts it to signed, (a+1)*255
	return output;
} // TODO: support textures :P

function imf2gltf(icon = null, filename = "untitled") {
	if (icon === null) {
		throw "Missing first argument, of which should be a icondumper2 Intermediate Model Format object.";
	}
	if (icon.hasOwnProperty("numberOfShapes") === false) {
		throw "Expected a icondumper2 Intermediate Model Format object.";
	}
	let shapesArray = new Array(icon.numberOfShapes);
	for (let index = 0; index < icon.numberOfShapes; index++) {
		shapesArray[index] = new Array();
	}
	let verticesArray = new Array();
	let normalsArray = new Array();
	let uvArray = new Array();
	let colourArray = new Array();
	icon.vertices.forEach(function(vertexObject){
		for (let index = 0; index < icon.numberOfShapes; index++) {
			shapesArray[index].push(vertexObject.shapes[index].x);
			shapesArray[index].push(vertexObject.shapes[index].y);
			shapesArray[index].push(vertexObject.shapes[index].z);
		}
		normalsArray.push(vertexObject.normal.x);
		normalsArray.push(vertexObject.normal.y);
		normalsArray.push(vertexObject.normal.z);
		uvArray.push(vertexObject.uv.u);
		uvArray.push(vertexObject.uv.v);
		// gamma correction, glTF clients expect lineari(s|z)ed-sRGB, not sRGB.
		colourArray.push(Math.pow((vertexObject.color.r/255), 2.2));
		colourArray.push(Math.pow((vertexObject.color.g/255), 2.2));
		colourArray.push(Math.pow((vertexObject.color.b/255), 2.2));
		colourArray.push((vertexObject.color.a > 1) ? (vertexObject.color.a/255): 1);
	});
	shapesArray.forEach(function(arr) {
		verticesArray = [...verticesArray, ...arr];
	});
	let outputFloatArray = new Float32Array([...verticesArray, ...normalsArray, ...uvArray, ...colourArray]); // 3[nOS], 3, 2, 4#
	let gltfOutputArray = new Array(icon.numberOfShapes);
	for (let index = 0; index < icon.numberOfShapes; index++) {
		const gltfOutput = new Object();
		//setting up GLTF
		gltfOutput.scene = 0;
		gltfOutput.scenes = [{"name": filename, "nodes": [0]}];
		gltfOutput.nodes = [{"mesh": 0, "name": `${filename}#${index}`, "rotation": [1,0,0,0]}];
		gltfOutput.meshes = [{
			"name": `Mesh (${filename}#${index})`,
			"primitives": [{
				"attributes": {
					"POSITION": 0,
					"NORMAL": 1,
					"TEXCOORD_0": 2,
					"COLOR_0": 3,
				},
				"material": 0
			}]
		}]; // no indices because who needs indexing when you're transcoding?
		gltfOutput.materials = [{
			"name": `Material (${filename}#${index})`,
			"pbrMetallicRoughness": {
				"baseColorFactor": [1.0, 1.0, 1.0, 1.0],
				"metallicFactor": 0.0,
				"roughnessFactor": 1.0
			},
			"extensions": { // or else artifacts.
				"KHR_materials_specular": {
					"specularFactor": 0, // this value is less respected then sCF, blender/glTF is main example of this.
					"specularColorFactor": [0, 0, 0]
				}
			}
		}];
		gltfOutput.buffers = [{"uri": `${filename}.bin`, "byteLength": outputFloatArray.byteLength}];
		gltfOutput.bufferViews = [
			{
				"buffer": 0,
				"byteOffset": (((icon.vertices.length*3)*4)*index),
				"byteLength": ((icon.vertices.length*3)*4),
				"target": gltfConstants.ARRAY_BUFFER
			},
			{
				"buffer": 0,
				"byteOffset": (((icon.vertices.length*3)*4)*icon.numberOfShapes),
				"byteLength": (normalsArray.length*4),
				"target": gltfConstants.ARRAY_BUFFER
			},
			{
				"buffer": 0,
				"byteOffset": ((((icon.vertices.length*3)*4)*icon.numberOfShapes)+(normalsArray.length*4)),
				"byteLength": (uvArray.length*4),
				"target": gltfConstants.ARRAY_BUFFER
			},
			{
				"buffer": 0,
				"byteOffset": (((((icon.vertices.length*3)*4)*icon.numberOfShapes)+(normalsArray.length*4))+(uvArray.length*4)),
				"byteLength": (colourArray.length*4),
				"target": gltfConstants.ARRAY_BUFFER
			}
		];
		gltfOutput.accessors = [
			{
				"bufferView": 0,
				"componentType": gltfConstants.FLOAT,
				"count": icon.vertices.length,
				"type": "VEC3",
				"max": [ 4.0,  4.0,  4.0],
				"min": [-4.0, -4.0, -4.0],
				"name": "Vertex Position Accessor"
			},
			{
				"bufferView": 1,
				"componentType": gltfConstants.FLOAT,
				"count": icon.vertices.length,
				"type": "VEC3",
				"max": [ 1.0,  1.0,  1.0],
				"min": [-1.0, -1.0, -1.0],
				"name": "Normal Accessor"
			},
			{
				"bufferView": 2,
				"componentType": gltfConstants.FLOAT,
				"count": icon.vertices.length,
				"type": "VEC2",
				"max": [ 1.0,  1.0],
				"min": [ 0.0,  0.0],
				"name": "Texture Coordinate Accessor"
			},
			{
				"bufferView": 3,
				"componentType": gltfConstants.FLOAT,
				"count": icon.vertices.length,
				"type": "VEC4",
				"max": [ 1.0,  1.0,  1.0,  1.0],
				"min": [ 0.0,  0.0,  0.0,  1.0],
				"name": "Colour Accessor"
			}
		];
		gltfOutput.asset = {"version": "2.0", "generator": `icondumper2/${icondumper2.version}`}
		gltfOutput.extensionsUsed = ["KHR_materials_specular"];
		gltfOutputArray[index] = (gltfOutput);
	}
	return {objects: gltfOutputArray, buffer: outputFloatArray};
}

function loadAndConvertIcon(inputData, attemptedFilename = "-") {
	if (inputData.hasOwnProperty("numberOfShapes") === false) {
		throw "Expected a icondumper2 Intermediate Model Format object.";
	}
	const filename = encodeURIComponent(attemptedFilename).replaceAll(/\%[0-9A-F]{2,2}/g, "").replaceAll(".", "_");
	const glTF_output = imf2gltf(inputData, filename);
	for (let index = 0; index < (inputData.numberOfShapes); index++) {
		(require("fs")).writeFileSync(`${filename}_${index}.gltf`, new TextEncoder().encode(JSON.stringify(glTF_output.objects[index])));
		console.log(`Saved shape ${filename}#${index} as "${filename}_${index}.gltf".`);
	}
	(require("fs")).writeFileSync(`${filename}.bin`, glTF_output.buffer);
	console.log(`Saved glTF buffer as "${filename}.bin".\n`);
}

// can anything de-dupe this code somehow? (index.js)
console.log(`icon.js version ${icondumper2.version}, 2023 (c) yellows111`);
switch(processObj.argv[2]) {
	case "psu": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.psu");
		const parsed = iconjs.readEmsPsuFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
		loadAndConvertIcon(iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames.n].data), PS2D.filenames.n);
		if(PS2D.filenames.n !== PS2D.filenames.c) {
			loadAndConvertIcon(iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames.c].data), PS2D.filenames.c);
		}
		if(PS2D.filenames.n !== PS2D.filenames.d) {
			loadAndConvertIcon(iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames.d].data), PS2D.filenames.d);
		}
		break;
	}
	case "psv": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.psv");
		const parsed = iconjs.readPsvFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		const PS2D = iconjs.readPS2D(parsed["icon.sys"]);
		//i should probably make PSV readers more like the others, but why should I? It's giving me shortcuts to what I want.
		loadAndConvertIcon(iconjs.readIconFile(parsed.icons.n), PS2D.filenames.n)
		if(PS2D.filenames.n !== PS2D.filenames.c) {
			loadAndConvertIcon(iconjs.readIconFile(parsed.icons.c), PS2D.filenames.c)
		}
		if(PS2D.filenames.n !== PS2D.filenames.d) {
			loadAndConvertIcon(iconjs.readIconFile(parsed.icons.d), PS2D.filenames.d)
		}
		break;
	}
	case "sps":
	case "xps": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.sps");
		const parsed = iconjs.readSharkXPortSxpsFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
		loadAndConvertIcon(iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames.n].data), PS2D.filenames.n);
		if(PS2D.filenames.n !== PS2D.filenames.c) {
			loadAndConvertIcon(iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames.c].data), PS2D.filenames.c);
		}
		if(PS2D.filenames.n !== PS2D.filenames.d) {
			loadAndConvertIcon(iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames.d].data), PS2D.filenames.d);
		}
		break;
	}
	case "sys": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "icon.sys");
		const PS2D = iconjs.readPS2D(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		let getFile = filesystem.readFileSync(PS2D.filenames.n);
		loadAndConvertIcon(iconjs.readIconFile(getFile.buffer.slice(getFile.byteOffset, getFile.byteOffset + getFile.byteLength)), PS2D.filenames.n);
		if(PS2D.filenames.n !== PS2D.filenames.c) {
			let getFile = filesystem.readFileSync(PS2D.filenames.c);
			loadAndConvertIcon(iconjs.readIconFile(getFile.buffer.slice(getFile.byteOffset, getFile.byteOffset + getFile.byteLength)), PS2D.filenames.c);
		}
		if(PS2D.filenames.n !== PS2D.filenames.d) {
			let getFile = filesystem.readFileSync(PS2D.filenames.d);
			loadAndConvertIcon(iconjs.readIconFile(getFile.buffer.slice(getFile.byteOffset, getFile.byteOffset + getFile.byteLength)), PS2D.filenames.d);
		}
		break;
	}
	default: {
		//Template literal goes here.
		console.log(
`${(processObj.argv.length > 2) ? "Unknown argument: "+processObj.argv[2]+"\n\n": ""}icondumper2 node.js client (glTF exporter version) subcommands:
psu: Read a EMS Memory Adapter export file.
psv: Read a PS3 export file.
sps: Read a SharkPort export file.
xps: Read a X-Port export file.

sys: Read a icon.sys (964 bytes) file, and attempt
     to read icon files from the current directory.
`		); // end of template
		processObj.exit(1);
	}
}
processObj.exit(0);