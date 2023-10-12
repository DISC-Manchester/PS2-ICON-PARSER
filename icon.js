//todo: Make this a module/mjs file. C6 compatibility can stay, if needed.
ICONJS_DEBUG = false;
ICONJS_STRICT = true;

function setDebug(value) {
	ICONJS_DEBUG = !!value;
}

function setStrictness(value) {
	ICONJS_STRICT = !!value;
}

// where U = uncompressed, N = none, C = compressed

function getTextureFormat(i) {
	if (i<8) {
		if(i==3) {
			return 'N';
		}
		return 'U';
	} else if (i>=8) {
		return 'C';
	} else {
		return void(0);
	}
}

function BGR5A1(i) {
	return {b: (i & 0b11111), g: ((i >> 5) & 0b11111), r: ((i >> 10) & 0b11111), a: (i >> 15)}
	// map this as *8 for each color and i+1*127 for alpha, GL-wise, float(i+1)
}

function stringScrubber(dirty) {
	return dirty.replaceAll("\x00","").substring(0, (dirty.indexOf("\x00") === -1) ? dirty.length : dirty.indexOf("\x00"));
}

function readPS2D(input) {
	const view = new DataView(input);
	const u32le = function(i){return view.getUint32(i, 1)}
	const f32le = function(i){return view.getFloat32(i, 1)}
	//!pattern ps2d.hexpat
	const header = u32le(0);
	if (header !== 0x44325350) {
		throw `Not a PS2D file (was ${header}, expected ${0x44325350})`;
	}
	//:skip 2
	const titleOffset = u32le(6);
	//:skip 2
	const bgAlpha = u32le(12); // should read as a u8, (k/127?.5) for float value (255 = a(2.0~))
	const bgColors = [
		{r: u32le(16), g: u32le(20), b: u32le(24), a: u32le(28)},
		{r: u32le(32), g: u32le(36), b: u32le(40), a: u32le(44)},
		{r: u32le(48), g: u32le(52), b: u32le(56), a: u32le(60)},
		{r: u32le(64), g: u32le(68), b: u32le(72), a: u32le(76)}
	]; // top-left, top-right, bottom-left, bottom-right;
	const lightIndices = [
		{x: f32le(80), y: f32le(84), z: f32le(88)}, //:skip 4
		{x: f32le(96), y: f32le(100), z: f32le(104)}, //:skip 4
		{x: f32le(112), y: f32le(116), z: f32le(120)} //:skip 4
	]
	const lightColors = [
		{r: f32le(128), g: f32le(132), b: f32le(136), a: f32le(140)},
		{r: f32le(144), g: f32le(148), b: f32le(152), a: f32le(156)},
		{r: f32le(160), g: f32le(164), b: f32le(168), a: f32le(172)},
		{r: f32le(176), g: f32le(180), b: f32le(184), a: f32le(188)}	
	]
	// save builder says color 1 is ambient, 2-4 are for 3-point cameras
	const int_title = input.slice(0xc0, 0x100);
	const tmp_title16 = new Uint16Array(int_title);
	for (let index = 0; index < 32; index++) {
		//find "bad" shift-jis two-bytes, and convert to spaces (or NULL if strict)
		if(tmp_title16[index] === 129 || tmp_title16[index] === 33343) {
			console.warn(`PS2D syntax error: known bad two-byte sequence 0x${tmp_title16[index].toString(16).padEnd(4,"0")} (at ${index}). Replacing with ${(ICONJS_STRICT) ? "NULL" : "0x8140"}.\n${(ICONJS_STRICT) ? "This is console-accurate, so" : "An actual console does not do this."} I recommend patching your icon.sys files!`);
			tmp_title16[index] = (ICONJS_STRICT) ? 0 : 0x4081; // is a reference, so this'll edit int_title too
		}
	}
	//:skip 4 -- Unless proven, keep 64 bytes for display name.
	const int_filename_n = input.slice(0x104, 0x143);
	const int_filename_c = input.slice(0x144, 0x183);
	const int_filename_d = input.slice(0x184, 0x1C3);
	//;skip 512 -- rest of this is just padding
	const rawTitle = (new TextDecoder("shift-jis")).decode(int_title);
	const title = [
		stringScrubber(rawTitle.substring(0,(titleOffset/2))), 
		(rawTitle.indexOf("\x00") < (titleOffset/2)) ? "" : stringScrubber(rawTitle.substring((titleOffset/2)))
	];
	const filenames = {
		n: stringScrubber((new TextDecoder("utf-8")).decode(int_filename_n)),
		c: stringScrubber((new TextDecoder("utf-8")).decode(int_filename_c)),
		d: stringScrubber((new TextDecoder("utf-8")).decode(int_filename_d))
	}
	if(ICONJS_DEBUG){
		console.log({header, titleOffset, bgAlpha, bgColors, lightIndices, lightColors, title, filenames});
	}
	return {filenames, title, background: {colors: bgColors, alpha: bgAlpha}, lighting: {points: lightIndices, colors: lightColors}};
}

function readIconFile(input) {
	//!pattern ps2icon-hacked.hexpat
	const view = new DataView(input);
	const u32le = function(i){return view.getUint32(i, 1)}
	const f32le = function(i){return view.getFloat32(i, 1)}
	const f16le = function(i){return (view.getInt16(i, 1) / 4096)}
	const u32_rgba8 =	function(i) {return {
		r: (i & 0xff), 
		g: ((i & 0xff00) >> 8), 
		b: ((i & 0xff0000) >> 16), 
		a: (i > 0x7fffffff ? 255 : (((i & 0xff000000) >>> 24) * 2)+1)
	}};
	const magic = u32le(0);
	if (magic !== 0x010000) {
		// USER WARNING: APPARENTLY NOT ALL ICONS ARE 0x010000. THIS THROW WILL BE DROPPED LATER.
		throw `Not a PS2 icon file (was ${magic}, expected ${0x010000})`;
	}
	const numberOfShapes = u32le(4);
	const textureType = u32le(8);
	const textureFormat = getTextureFormat(textureType);
	//:skip 4
	const numberOfVertexes = u32le(16);
	// now we're entering a bunch of chunks... oh baby, now it's painful.
	// format: [xxyyzzaa * numberOfShapes][xxyyzzaa][uuvvrgba], ((8 * numberOfShapes) + 16) [per chunk]
	let offset = 20;
	let vertices = new Array();
	const chunkLength = ((numberOfShapes * 8) + 16);

	// for numberOfVertexes, copy chunkLength x times, then append with normal, uv and rgba8 color. Floats are 16-bit.
	for (let index = 0; index < numberOfVertexes; index++) {
		let shapes = new Array();
		for (let indey = 0; indey < numberOfShapes; indey++) {
			shapes.push({
				x: f16le(offset+((chunkLength*index)+(indey*8))), 
				y: f16le(offset+((chunkLength*index)+(indey*8))+2), 
				z: f16le(offset+((chunkLength*index)+(indey*8))+4)
			});
			//:skip 2
		}
		
		let normal = {
			x: f16le(offset+(chunkLength*index)+((numberOfShapes * 8))), 
			y: f16le(offset+(chunkLength*index)+((numberOfShapes * 8))+2), 
			z: f16le(offset+(chunkLength*index)+((numberOfShapes * 8))+4)
		};
		//:skip 2
		let uv = {
			u: f16le(offset+(chunkLength*index)+((numberOfShapes * 8))+8), 
			v: f16le(offset+(chunkLength*index)+((numberOfShapes * 8))+10)
		};
		let color = u32_rgba8(u32le(offset+(chunkLength*index)+((numberOfShapes * 8))+12));
		// keep original u32le color?
		
		vertices.push({shapes, normal, uv, color});
	}
	offset = (20+(numberOfVertexes * chunkLength));
	animationHeader = {id: u32le(offset), length: u32le(offset+4), speed: f32le(offset+8), "offset": u32le(offset+12), keyframes: u32le(offset+16)};
	let animData = new Array();
	// now we have to do stuff dynamically
	// format for a keyframe: sssskkkk[ffffvvvv] where [ffffvvvv] repeat based on the value that kkkk(eys) has.
	// sssskkkk[ffffvvvv] is repeated based on animationHeader.keyframes value.
	offset += 20;
	for (let index = 0; index < animationHeader.keyframes; index++) {
		let frameData = new Array();
		let shapeId = u32le(offset);
		let keys = u32le(offset+4);
		offset += 8;
		for (let indey = 0; indey < keys; indey++) {
			frameData.push({frame: f32le(offset), value: f32le(offset+4)});
			offset += 8;
		}
		animData.push({shapeId, keys, frameData});
	}
	let texture = null;
	switch(textureFormat) {
		case 'N': {
			break;
		}
		case 'U': {
			//where every 16-bit entry is a BGR5A1 color 0b[bbbbbgggggrrrrra]
			texture = new Uint16Array(input.slice(offset, (offset+0x8000)));
			//texture.forEach(function(indice){console.log(BGR5A1(indice))});
			break;
		}
		case 'C': {
			// compression format unknown, but all in type use same header format
			size = u32le(offset);
			texture = {size, data: input.slice(offset+4, offset+(4+size))};
		}
	}
	if(ICONJS_DEBUG){
		console.log({magic, numberOfShapes, textureType, textureFormat, numberOfVertexes, chunkLength, vertices, animationHeader, animData, texture});
	}
	return {numberOfShapes, vertices, textureFormat, texture, animData};
}

function readEntryBlock(input) {
	const view = new DataView(input);
	const u32le = function(i){return view.getUint32(i, 1)};
	const u16le = function(i){return view.getUint16(i, 1)};
	const t64le = function(i){return {
		seconds: view.getUint8(i+1),
		minutes: view.getUint8(i+2),
		hours: view.getUint8(i+3),
		day: view.getUint8(i+4),
		month: view.getUint8(i+5),
		year: view.getUint16(i+6, 1)
	}}; //NOTE: times are in JST timezone (GMT+09:00), so clients should implement correctly!
	//!pattern psu_file.hexpat
	const permissions = u32le(0);
	let type;
	if (permissions>0xffff) {
		throw `Not a EMS Max (PSU) save file (was ${permissions}, expected less than ${0xffff})`;
	}
	if((permissions & 0b00100000)>=1){
		type = "directory";
	}
	if((permissions & 0b00010000)>=1){
		type = "file";
	}
	if((permissions & 0b0001100000000000)>=1){
		throw `I don't parse portable applications or legacy save data. (${permissions} has bits 10 or 11 set)`;
	}
	const size = u32le(4);
	const createdTime = t64le(8);
	const sectorOffset = u32le(16);
	const dirEntry = u32le(20);
	const modifiedTime = t64le(24);
	const specialSection = input.slice(0x20, 0x40);
	const int_filename = input.slice(0x40, 512); 
	const filename = stringScrubber((new TextDecoder("utf-8")).decode(int_filename));
	if(ICONJS_DEBUG){
		console.log({permissions, type, size, createdTime, sectorOffset, dirEntry, modifiedTime, specialSection, filename});
	}
	return {type, size, filename, createdTime, modifiedTime};
}

function readEmsPsuFile(input){
	const header = readEntryBlock(input.slice(0,0x1ff));
	let fsOut = {length: header.size, rootDirectory: header.filename, timestamps: {created: header.createdTime, modified: header.modifiedTime}};
	let output = new Object();
	let offset = 512;
	for (let index = 0; index < header.size; index++) {
		fdesc = readEntryBlock(input.slice(offset, offset + 512));
		switch(fdesc.type) {
			case "directory": {
				offset += 512;
				output[fdesc.filename] = null;
				break;
			}
			case "file": {
				if(ICONJS_DEBUG){
					console.log(`PARSING | F: "${fdesc.filename}" O: ${offset} S: ${fdesc.size}`);
				}
				offset += 512;
				const originalOffset = offset;
				if((fdesc.size % 1024) > 0) {
					offset += ((fdesc.size & 0b11111111110000000000) + 1024);
				} else {
					offset += fdesc.size;
					// if we're already filling sectors fully, no to change anything about it
				}
				output[fdesc.filename] = {
					size: fdesc.size,
					data: input.slice(originalOffset, originalOffset+fdesc.size)
				};
				break;
			}
		}
	}
	fsOut[header.filename] = output;
	return fsOut;
}

if(typeof module !== "undefined") {
	// for C6JS
	module.exports = {readIconFile, readPS2D, readEmsPsuFile, setDebug, setStrictness};
}