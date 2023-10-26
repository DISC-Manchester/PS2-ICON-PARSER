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

function imf2gltf(icon = null, shape = 0, filename = "untitled") {
	if (icon === null) {
		throw "Missing first argument, of which should be a icondumper2 Intermediate Model Format object.";
	}
	if (icon.hasOwnProperty("numberOfShapes") === false) {
		throw "Expected a icondumper2 Intermediate Model Format object.";
	}
	if(shape >= icon.numberOfShapes) {
		throw `Shape out of bounds. (object has ${icon.numberOfShapes} shapes.)`;
	}
	const gltfOutput = new Object();
	//setting up GLTF
	gltfOutput.scene = 0;
	gltfOutput.scenes = [{"nodes": [0]}];
	gltfOutput.nodes = [{"mesh": 0, "name": filename, "rotation": [1,0,0,0]}];
	gltfOutput.meshes = [{
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
		"name": `Material (${filename}_${shape})`,
		"pbrMetallicRoughness": {
			"baseColorFactor": [1.0, 1.0, 1.0, 1.0],
			"metallicFactor": 0.0,
			"roughnessFactor": 1.0
		}
	}];
	let verticesArray = new Array();
	let normalsArray = new Array();
	let uvArray = new Array();
	let colourArray = new Array();
	icon.vertices.forEach(function(vertexObject){
		verticesArray.push(vertexObject.shapes[shape].x);
		verticesArray.push(vertexObject.shapes[shape].y);
		verticesArray.push(vertexObject.shapes[shape].z);
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
	let outputFloatArray = new Float32Array([...verticesArray, ...normalsArray, ...uvArray, ...colourArray]); // 3, 3, 2, 4
	gltfOutput.buffers = [{"uri": `${filename}.bin`, "byteLength": outputFloatArray.byteLength}];
	gltfOutput.bufferViews = [
		{
			"buffer": 0,
			"byteOffset": 0,
			"byteLength": (verticesArray.length*4),
			"target": gltfConstants.ARRAY_BUFFER
		},
		{
			"buffer": 0,
			"byteOffset": (verticesArray.length*4),
			"byteLength": (normalsArray.length*4),
			"target": gltfConstants.ARRAY_BUFFER
		},
		{
			"buffer": 0,
			"byteOffset": ((verticesArray.length*4)+(normalsArray.length*4)),
			"byteLength": (uvArray.length*4),
			"target": gltfConstants.ARRAY_BUFFER
		},
		{
			"buffer": 0,
			"byteOffset": (((verticesArray.length*4)+(normalsArray.length*4))+(uvArray.length*4)),
			"byteLength": (colourArray.length*4),
			"target": gltfConstants.ARRAY_BUFFER
		}
	];
	gltfOutput.accessors = [
		{
			"bufferView": 0,
			"componentType": gltfConstants.FLOAT,
			"count": verticesArray.length/3,
			"type": "VEC3",
			"max": [ 4.0,  4.0,  4.0],
			"min": [-4.0, -4.0, -4.0],
			"name": "Vertex Position Accessor"
		},
		{
			"bufferView": 1,
			"componentType": gltfConstants.FLOAT,
			"count": (normalsArray.length/3),
			"type": "VEC3",
			"max": [ 1.0,  1.0,  1.0],
			"min": [-1.0, -1.0, -1.0],
			"name": "Normal Accessor"
		},
		{
			"bufferView": 2,
			"componentType": gltfConstants.FLOAT,
			"count": (uvArray.length/2),
			"type": "VEC2",
			"max": [ 1.0,  1.0],
			"min": [ 0.0,  0.0],
			"name": "Texture Coordinate Accessor"
		},
		{
			"bufferView": 3,
			"componentType": gltfConstants.FLOAT,
			"count": (colourArray.length/4),
			"type": "VEC4",
			"max": [ 1.0,  1.0,  1.0,  1.0],
			"min": [ 0.0,  0.0,  0.0,  1.0],
			"name": "Colour Accessor"
		}
	];
	gltfOutput.asset = {"version": "2.0", "generator": `icondumper2/${icondumper2.version}`}
	return {object: gltfOutput, buffer: outputFloatArray};
}

function loadAndConvertIcon(inputData, state = "-") {
	if (inputData.hasOwnProperty("numberOfShapes") === false) {
		throw "Expected a icondumper2 Intermediate Model Format object.";
	}
	for (let index = 0; index < (inputData.numberOfShapes); index++) {
		const filename = `export_${state}_${index}`;
		const gltfFile = imf2gltf(inputData, index, filename);

		(require("fs")).writeFileSync(`${filename}.gltf`, new TextEncoder().encode(JSON.stringify(gltfFile.object)));
		(require("fs")).writeFileSync(`${filename}.bin`, gltfFile.buffer);
		console.log(`Saved shape ${index} as "${filename}.gltf", "${filename}.bin" pair.`);
	}
}

// can anything de-dupe this code somehow? (index.js)
console.log(`icon.js version ${icondumper2.version}, 2023 (c) yellows111`);
switch(processObj.argv[2]) {
	case "psu": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.psu");
		const parsed = iconjs.readEmsPsuFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
		Object.keys(PS2D.filenames).forEach(function(file) {
			loadAndConvertIcon(iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames[file]].data), file);
		});
		break;
	}
	case "psv": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.psv");
		const parsed = iconjs.readPsvFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		loadAndConvertIcon(iconjs.readIconFile(parsed.icons.n), "n")
		loadAndConvertIcon(iconjs.readIconFile(parsed.icons.c), "c")
		loadAndConvertIcon(iconjs.readIconFile(parsed.icons.d), "d")
		break;
	}
	case "sps":
	case "xps": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.sps");
		const parsed = iconjs.readSharkXPortSxpsFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
		Object.keys(PS2D.filenames).forEach(function(file) {
			loadAndConvertIcon(iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames[file]].data), file);
		});
		break;
	}
	case "sys": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "icon.sys");
		const metadata = iconjs.readPS2D(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		Object.keys(metadata.filenames).forEach(function(file) {
			let getFile = filesystem.readFileSync(metadata.filenames[file]);
			loadAndConvertIcon(iconjs.readIconFile(getFile.buffer.slice(getFile.byteOffset, getFile.byteOffset + getFile.byteLength)), file);
			//console.log(individialIcon);
		});
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