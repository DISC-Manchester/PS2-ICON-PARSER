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

function getCrc32(data) {
	let output = -1;
	for (let byteIndex of data) {
		for (let index = 0; index < 8; index++, byteIndex >>>= 1) {
			output = (output >>> 1) ^ (-((output ^ byteIndex) & 1) & 0xEDB88320);
		} // 0xEDB88320 is a reverse polynomial that's common in crc32
	} //i know it's some bitwise madness, it works, either way.
	return ((~output) >>> 0);
}

function getAdler32(data) {
	let s1 = 1;
	let s2 = 0;
	for (let index of data) {
		s1 = (s1 + index) % 65521;
		s2 = (s2 + s1) % 65521;
	}
	return (s2 << 16) | s1;
}

function rgb5a1_rgb8(colour) {
	let b = ( colour        & 0b11111);
	let g = ((colour >>  5) & 0b11111);
	let r = ((colour >> 10) & 0b11111);
	let output = new Number();
	output |= ((r * 8) << 16);
	output |= ((g * 8) <<  8);
	output |= ((b * 8) <<  0);
	return output;
}

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
				"baseColorTexture": {"index":0, "texCoord": 0}
			},
			"extensions": { // or we get annoying PBR and specular stuff we don't need
				"KHR_materials_unlit": {}
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
				"max": [ 5.0,  5.0,  5.0],
				"min": [-5.0, -5.0, -5.0],
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
				"min": [-1.0, -1.0],
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
		gltfOutput.extensionsUsed = ["KHR_materials_unlit"];
		gltfOutput.textures = [{"source": 0}];
		gltfOutput.images = [{"name": `Texture (${filename}#${index})`, "uri": `${filename}.png`}]
		gltfOutputArray[index] = (gltfOutput);
	}
	let texture16 = null; // Uint16Array(16384)
	switch(icon.textureFormat) {
		case "N": {
			texture16 = (new Uint16Array(16384)).fill(0xffff);
			break;
		}
		case "C": {
			texture16 = icondumper2.helpers.uncompressTexture(icon.texture.data);
			break;
		}
		case "U": {
			texture16 = icon.texture;
			break;
		}
	}
	let texture24 = new Uint8Array(49983);
	texture24.set([
		0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
		0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
		0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00, 0x80,
		0x08, 0x02, 0x00, 0x00, 0x00, // you may know 
		0x4c, 0x5c, 0xf6, 0x9c, // what this is from 0x89.
		0x00, 0x00, 0xc3, 0x06, 0x49, 0x44, 0x41, 0x54,
		0x78, 0x01 // if you didn't get it, here's a clue
	],0);
	let textureOffset = 43;
	let texture24Data = new Array();
	let texture24CheckedData = new Array();
	for (let x = 0; x < 128; x++) {
		let line = [(x === 127 ? 1 : 0), 0x81, 0x01, 0x7e, 0xfe, 0x00];
		texture24Data = texture24Data.concat(line);
		texture24CheckedData.push(0);
		let scanline = new Array(128*3);
		for (let y = 0; y < 128; y++) {
			color = rgb5a1_rgb8(texture16[(x*128)+y]);
			scanline[(y*3)  ] = ((color >> 0 ) & 255);
			scanline[(y*3)+1] = ((color >> 8 ) & 255);
			scanline[(y*3)+2] = ((color >> 16) & 255);
		}
		texture24Data = texture24Data.concat(scanline);
		texture24CheckedData = texture24CheckedData.concat(scanline);
	}
	texture24.set(texture24Data, textureOffset);
	textureOffset += texture24Data.length;
	let a32conv = new DataView(new ArrayBuffer(4));
	a32conv.setInt32(0, getAdler32(new Uint8Array(texture24CheckedData)))
	texture24.set([a32conv.getUint8(0), a32conv.getUint8(1), a32conv.getUint8(2), a32conv.getUint8(3)], textureOffset);
	textureOffset += 4;
	let crc32 = getCrc32(new Uint8Array([
		0x49, 0x44, 0x41, 0x54, 0x78, 0x01, ...texture24Data, 
		a32conv.getUint8(0), a32conv.getUint8(1), 
		a32conv.getUint8(2), a32conv.getUint8(3)
	]));
	texture24.set([
		(crc32 >> 24) & 0xff, 
		(crc32 >> 16) & 0xff, 
		(crc32 >>  8) & 0xff, 
		 crc32        & 0xff
	], textureOffset);
	textureOffset += 4;
	texture24.set([
		0x00, 0x00, 0x00, 0x00,
		0x49, 0x45, 0x4E, 0x44, 
		0xae, 0x42, 0x60, 0x82
	], textureOffset);
	return {objects: gltfOutputArray, buffer: outputFloatArray, texture: texture24};
}

function loadAndConvertIcon(inputData, attemptedFilename = "-") {
	if (inputData.hasOwnProperty("numberOfShapes") === false) {
		throw "Expected a icondumper2 Intermediate Model Format object.";
	}
	const filename = encodeURIComponent(attemptedFilename).replace(/\%[0-9A-F]{2,2}/g, "").replace(/\./g, "_");
	const glTF_output = imf2gltf(inputData, filename);
	for (let index = 0; index < (inputData.numberOfShapes); index++) {
		(require("fs")).writeFileSync(`${filename}_${index}.gltf`, new TextEncoder().encode(JSON.stringify(glTF_output.objects[index])));
		console.info(`Saved shape ${filename}#${index} as "${filename}_${index}.gltf".`);
	}
	(require("fs")).writeFileSync(`${filename}.bin`, glTF_output.buffer);
	console.info(`Saved glTF buffer as "${filename}.bin".`);

	(require("fs")).writeFileSync(`${filename}.png`, glTF_output.texture);
	console.info(`Saved texture as "${filename}.png".\n`);
}

// can anything de-dupe this code somehow? (index.js)
console.info(`icon.js version ${icondumper2.version}, ${(new Date()).getFullYear().toString()} (c) yellows111`);
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
	case "cbs": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.cbs");
		function myInflator(inputBuffer) {
			return (require("zlib").inflateSync(inputBuffer)).buffer;
		}
		const parsed = iconjs.readCodeBreakerCbsFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength), myInflator);
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
	case "ico":
	case "icn": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "input.icn");
		loadAndConvertIcon(iconjs.readIconFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength)), require("path").basename(processObj.argv[3]));
		break;
	}
	default: {
		//Template literal goes here.
		console.info(
`${(processObj.argv.length > 2) ? "Unknown argument: "+processObj.argv[2]+"\n\n": ""}icondumper2 node.js client (glTF exporter version) subcommands:
psu: Read a EMS Memory Adapter export file.
psv: Read a PS3 export file.
sps: Read a SharkPort export file.
xps: Read a X-Port export file.
cbs: Read a CodeBreaker Save export file.

sys: Read a icon.sys (964 bytes) file, and attempt
     to read icon files from the current directory.
icn: Read an icon file directly. (Also as: ico)
`		); // end of template
		processObj.exit(1);
	}
}
processObj.exit(0);