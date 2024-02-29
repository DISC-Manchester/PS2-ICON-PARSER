//To swap between mjs/esm and c6js, go to the end of this file, and (un)comment your wanted module mode.
/* jshint bitwise: false, esversion: 6, -W009, -W010 */ // not doing this makes linters scream about BWOs, es6 features, and using new Primitive() instead of said primitives
var ICONJS_DEBUG = false;
var ICONJS_STRICT = true;

/** 
 * The current version of the library. 
 * @constant {string}
 * @default
 */
const ICONJS_VERSION = "0.8.4";

/**
 * The RC4 key used for ciphering CodeBreaker Saves.
 * @constant {Uint8Array}
 */
const ICONJS_CBS_RC4_KEY = new Uint8Array([
	0x5f, 0x1f, 0x85, 0x6f, 0x31, 0xaa, 0x3b, 0x18,
	0x21, 0xb9, 0xce, 0x1c, 0x07, 0x4c, 0x9c, 0xb4,
	0x81, 0xb8, 0xef, 0x98, 0x59, 0xae, 0xf9, 0x26,
	0xe3, 0x80, 0xa3, 0x29, 0x2d, 0x73, 0x51, 0x62,
	0x7c, 0x64, 0x46, 0xf4, 0x34, 0x1a, 0xf6, 0xe1,
	0xba, 0x3a, 0x0d, 0x82, 0x79, 0x0a, 0x5c, 0x16,
	0x71, 0x49, 0x8e, 0xac, 0x8c, 0x9f, 0x35, 0x19,
	0x45, 0x94, 0x3f, 0x56, 0x0c, 0x91, 0x00, 0x0b,
	0xd7, 0xb0, 0xdd, 0x39, 0x66, 0xa1, 0x76, 0x52,
	0x13, 0x57, 0xf3, 0xbb, 0x4e, 0xe5, 0xdc, 0xf0,
	0x65, 0x84, 0xb2, 0xd6, 0xdf, 0x15, 0x3c, 0x63,
	0x1d, 0x89, 0x14, 0xbd, 0xd2, 0x36, 0xfe, 0xb1,
	0xca, 0x8b, 0xa4, 0xc6, 0x9e, 0x67, 0x47, 0x37,
	0x42, 0x6d, 0x6a, 0x03, 0x92, 0x70, 0x05, 0x7d,
	0x96, 0x2f, 0x40, 0x90, 0xc4, 0xf1, 0x3e, 0x3d,
	0x01, 0xf7, 0x68, 0x1e, 0xc3, 0xfc, 0x72, 0xb5,
	0x54, 0xcf, 0xe7, 0x41, 0xe4, 0x4d, 0x83, 0x55,
	0x12, 0x22, 0x09, 0x78, 0xfa, 0xde, 0xa7, 0x06,
	0x08, 0x23, 0xbf, 0x0f, 0xcc, 0xc1, 0x97, 0x61,
	0xc5, 0x4a, 0xe6, 0xa0, 0x11, 0xc2, 0xea, 0x74,
	0x02, 0x87, 0xd5, 0xd1, 0x9d, 0xb7, 0x7e, 0x38,
	0x60, 0x53, 0x95, 0x8d, 0x25, 0x77, 0x10, 0x5e,
	0x9b, 0x7f, 0xd8, 0x6e, 0xda, 0xa2, 0x2e, 0x20,
	0x4f, 0xcd, 0x8f, 0xcb, 0xbe, 0x5a, 0xe0, 0xed,
	0x2c, 0x9a, 0xd4, 0xe2, 0xaf, 0xd0, 0xa9, 0xe8,
	0xad, 0x7a, 0xbc, 0xa8, 0xf2, 0xee, 0xeb, 0xf5,
	0xa6, 0x99, 0x28, 0x24, 0x6c, 0x2b, 0x75, 0x5d,
	0xf8, 0xd3, 0x86, 0x17, 0xfb, 0xc0, 0x7b, 0xb3,
	0x58, 0xdb, 0xc7, 0x4b, 0xff, 0x04, 0x50, 0xe9,
	0x88, 0x69, 0xc9, 0x2a, 0xab, 0xfd, 0x5b, 0x1b,
	0x8a, 0xd9, 0xec, 0x27, 0x44, 0x0e, 0x33, 0xc8,
	0x6b, 0x93, 0x32, 0x48, 0xb6, 0x30, 0x43, 0xa5
]);

/**
 * Extension of DataView to add shortcuts for datatypes that I use often.
 * @augments DataView
 * @constructor
 * @param {ArrayBuffer} buffer ArrayBuffer to base DataView from.
 * @returns {!Object.<string, function(number): number>} [u16le, f16le, u32le, f32le]
 * @returns {!Object.<string, function(number): Object.<string.number>>} [t64le]
 * @access protected
 */
class yellowDataReader extends DataView {
	/** Unsigned 16-bit, Little Endian.
	 * @param {number} i Indice offset.
	 * @returns {number}
	 */
	u16le(i){return super.getUint16(i, 1);}
	/** Fixed-point 16-bit, Little Endian.
	 * @param {number} i Indice offset.
	 * @returns {number}
	 */
	f16le(i){return (super.getInt16(i, 1) / 4096);}
	/** Unsigned 32-bit, Little Endian.
	 * @param {number} i Indice offset.
	 * @returns {number}
	 */
	u32le(i){return super.getUint32(i, 1);}
	/** Floating-point 32-bit, Little Endian.
	 * @param {number} i Indice offset.
	 * @returns {number}
	 */
	f32le(i){return super.getFloat32(i, 1);}
	/** 64-bit Timestamp structure, Little Endian.
	 * Time returned is set for JST (UTC+09:00) instead of UTC.
	 * Time returned is going to be offseted for JST (GMT+09:00).
	 * @param {number} i Indice offset.
	 * @returns {Object.<string, number>}
	 * @property {number} seconds - Seconds.
	 * @property {number} minutes - Minutes.
	 * @property {number} hours - Hours.
	 * @property {number} day - Day.
	 * @property {number} month - Month.
	 * @property {number} year - Year.
	 */
	t64le(i){return {
		"__proto__": null,
		seconds: super.getUint8(i+1),
		minutes: super.getUint8(i+2),
		hours: super.getUint8(i+3),
		day: super.getUint8(i+4),
		month: super.getUint8(i+5),
		year: super.getUint16(i+6, 1)
	};}
	constructor(buffer) {
		super(buffer);
		return {
			u16le: this.u16le.bind(this),
			f16le: this.f16le.bind(this),
			u32le: this.u32le.bind(this),
			f32le: this.f32le.bind(this),
			t64le: this.t64le.bind(this)
		};
	}
}

/**
 * Implements an RC4 cipher.
 * @param {TypedArray|Uint8Array} key - 256-byte key
 * @param {TypedArray|Uint8Array} target - n-length data to cipher
 * @returns {!Uint8Array} target ciphered by key
 * @access protected
 */
function rc4Cipher(key, target) {
	//todo: support keys that aren't exactly 256-bytes long
	let myNewKey = new Uint8Array(key);
	let deciphered = new Uint8Array(target);
	let temp = 0;
	for (let index = 0; index < target.length; index++) {
		let indice = (index + 1) % 256;
		temp = (temp + myNewKey[indice]) % 256;
		let backup = myNewKey[indice];
		myNewKey[indice] = myNewKey[temp];
		myNewKey[temp] = backup;
		deciphered[index] ^= myNewKey[(myNewKey[indice] + myNewKey[temp]) % 256];
	}
	return deciphered;
}

/**
 * Enable or disable use of debugging information in console via console.debug()
 * @param {boolean} value - Enable/disable this feature
 * @default false
 * @public
 */
function setDebug(value) {
	ICONJS_DEBUG = !!value;
}

/**
 * Select if invalid characters in titles should be replaced with either spaces or nulls
 * @param {boolean} value - true: with nulls, false: with spaces
 * @default true
 * @deprecated Hasn't been needed for a while. Dropping support by ESM transition.
 * @public
 */
function setStrictness(value) {
	console.info("setStrictness is deprecated!");
	ICONJS_STRICT = !!value;
}

/**
 * Converts a texture format to a generalized texture type character.
 * @param {number} i - texture format
 * @returns {string} U: uncompressed, N: none, C: compressed
 * @access protected
 */
function getTextureFormat(i) {
	if(ICONJS_DEBUG) {
		console.debug("Texture format: %i", i);
	}
	// bit 1: enable smooth shading (TODO)
	// bit 2: ??? something weird with colours, check iconwriter.js output...
	if(!!(i & 4)) { // if bit 3 (textured)...
		if(!!(i & 8)) { // if bit 4 (compressed)...
			return "C"; // Compressed.
		}
		return "U"; // Uncompressed.
	} else { // if bit 3 isn't set...
		return "N"; // No texture.
	}
}

/**
 * Decompress a compressed texture using RLE.
 * @param {ArrayBuffer} input - texture
 * @returns {!Uint16Array} decompressed texture, equivalent to an uncompressed texture
 * @public
 */
function uncompressTexture(texData) {
	// for texture formats 8-15
	if (texData.length & 1) {
		throw "Texture size isn't a multiple of 2 (was ${texData.length})";
	}
	const {u16le} = new yellowDataReader(texData);
	let uncompressed = new Uint16Array(16384);
	let offset = 0;
	for (let index = 0; index < 16384;) {
		let currentValue = u16le(offset);
		if(currentValue === 0) {
			// if this is specifically a katamari 1 or 2 icon, skip this byte
			// because it's formatted like that for some reason
			offset += 2;
			currentValue = u16le(offset);
		}
		offset += 2;
		if (currentValue >= 0xfe00) { // everyone says this is 0xff00 but gauntlet:DL tells me its lower
			//do a raw copy of the next currentValue bytes
			let length = ((0x10000 - currentValue));
			for (let enumerator = 0; enumerator < length; enumerator++) {
				uncompressed[index] = u16le(offset);
				offset += 2;
				index++;
			}
		} else {
			//repeat next byte currentValue times
			uncompressed[index] = u16le(offset);
			for (let indey = 0; indey < currentValue; indey++) {
				uncompressed[index] = u16le(offset);
				index++;
			}
			offset += 2;
		}
	}
	return uncompressed;
}

/**
 * Converts a BGR5A1 texture to a RGB5A1 texture
 * @param {Uint16Array} bgrData - texture
 * @returns {!Uint16Array} converted texture
 * @public
 */
function convertBGR5A1toRGB5A1(bgrData) {
	if(bgrData.byteLength !== 32768) {
		throw `Not a 128x128x16 texture. (length was ${bgrData.length})`;
	}
	// converts 5-bit blue, green, red (in that order) with one alpha bit to GL-compatible RGB5A1
	let converted = new Uint16Array(16384);
	for (let index = 0; index < 16384; index++) {
		let b = ( bgrData[index]         & 0b11111);
		let g = ((bgrData[index] >>  5) & 0b11111);
		let r = ((bgrData[index] >> 10) & 0b11111);
		//               rrrrrgggggbbbbba (a = 1 because 0 is 127 which is 1.0f opacity for the GS)
		let newValue = 0b0000000000000001;
		// mind you, the alpha bit      ^ seems to be set randomly on textures, anyway. Maybe i'm reading these wrong?
		newValue |= (r << 1);
		newValue |= (g << 6);
		newValue |= (b << 11);
		converted[index] = newValue;
	}
	return converted;
}

/**
 * Takes a string and returns the first part before a null character.
 * @param {string} dirty - String to slice from first null character.
 * @returns {string} Substring of dirty before first null character.
 * @access protected
 */
function stringScrubber(dirty) {
	return dirty.replace(/\0/g, "").substring(0, (dirty.indexOf("\x00") === -1) ? dirty.length : dirty.indexOf("\x00"));
}

/**
 * Read a PS2D format file (icon.sys)
 * @param {ArrayBuffer} input - icon.sys formatted file
 * @returns {Object} (user didn't write a description)
 * @public
 */
function readPS2D(input) {
	const {u32le, f32le} = new yellowDataReader(input);
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
	];
	const lightColors = [
		{r: f32le(128), g: f32le(132), b: f32le(136), a: f32le(140)},
		{r: f32le(144), g: f32le(148), b: f32le(152), a: f32le(156)},
		{r: f32le(160), g: f32le(164), b: f32le(168), a: f32le(172)},
		{r: f32le(176), g: f32le(180), b: f32le(184), a: f32le(188)}	
	];
	// P2SB says color 1 is ambient, 2-4 are for 3-point cameras
	// official HDD icon.sys files (completely different PS2ICON text-based format) also say the same.
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
	};
	if(ICONJS_DEBUG){
		console.debug({header, titleOffset, bgAlpha, bgColors, lightIndices, lightColors, title, filenames});
	}
	return {filenames, title, background: {colors: bgColors, alpha: bgAlpha}, lighting: {points: lightIndices, colors: lightColors}};
}

/**
 * Read a Model file ({*}, usually ICN or ICO, however)
 * @param {ArrayBuffer} input - icon model file
 * @returns {Object} (user didn't write a description)
 * @public
 */
function readIconFile(input) {
	//!pattern ps2icon-hacked.hexpat
	const {u32le, f32le, f16le} = new yellowDataReader(input);
	const u32_rgba8 = function(i) {return {
		r: (i & 0xff), 
		g: ((i & 0xff00) >> 8), 
		b: ((i & 0xff0000) >> 16), 
		a: (i > 0x7fffffff ? 255 : (((i & 0xff000000) >>> 24) * 2)+1)
		// I don't think alpha transparency is actually USED in icons?, rendering with it looks strange.
	};};
	const magic = u32le(0);
	if (magic !== 0x010000) {
		// USER NOTICE: So far, I have yet to parse an icon that hasn't had 0x00010000 as it's magic.
		//              Can someone provide me pointers to such an icon if one exists?
		throw `Not a PS2 icon file (was ${magic}, expected ${0x010000})`;
	}
	const numberOfShapes = u32le(4);
	if(numberOfShapes > 16) {
		throw `Too many defined shapes! Is this a valid file? (file reports ${numberOfShapes} shapes)`;
	}
	const textureType = u32le(8);
	const textureFormat = getTextureFormat(textureType);
	//:skip 4
	const numberOfVertexes = u32le(16);
	if((numberOfVertexes % 3) > 0){
		throw `Not enough vertices to define a triangle (${numberOfVertexes % 3} vertices remained).`;
	}
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
	const animationHeader = {id: u32le(offset), length: u32le(offset+4), speed: f32le(offset+8), "offset": u32le(offset+12), keyframes: u32le(offset+16)};
	let animData = new Array();
	// now we have to enumerate values, so now we introduce an offset value.
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
			//see convertBGR5A1toRGB5A1() for more info.
			break;
		}
		case 'C': {
			// compression format is RLE-based, where first u32 is size, and format is defined as:
			/**
			* u16 rleType;
			* if (rleType >= 0xff00) {
			*	//do a raw copy
			*	let length = (0x10000 - rleType);
			*	byte data[length];
			* } else {
			*	//repeat next byte rleType times
			*	data = new Uint16Array(rleType);
			*	for (let index = 0; index < rleType; index++) {
			*		data[index] = u16 repeater @ +4;
			*	}
			* }
			**/
			//output of this will be another u16[0x4000] of the decompressed texture
			//after that just parse output as-if it was uncompressed.
			//see uncompressTexture() and convertBGR5A1toRGB5A1() for more info.
			const size = u32le(offset);
			texture = {size, data: input.slice(offset+4, offset+(4+size))};
		}
	}
	if(ICONJS_DEBUG){
		console.debug({magic, numberOfShapes, textureType, textureFormat, numberOfVertexes, chunkLength, vertices, animationHeader, animData, texture});
	}
	return {numberOfShapes, vertices, textureFormat, texture, animData};
}

/**
 * Read a 512-byte file descriptor that is used on Memory Cards or PSU files.
 * @param {ArrayBuffer} input - File descriptor segment.
 * @returns {Object} (user didn't write a description)
 * @access protected
 */
function readEntryBlock(input) {
	const {u32le, t64le} = new yellowDataReader(input);
	//!pattern psu_file.hexpat
	const permissions = u32le(0);
	let type;
	if (permissions>0xffff) {
		throw `Not a EMS Memory Adapter (PSU) export file (was ${permissions}, expected less than ${0xffff})`;
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
	const sectorOffset = u32le(16);
	const dirEntry = u32le(20);
	const timestamps = {created: t64le(8), modified: t64le(24)};
	const specialSection = input.slice(0x20, 0x40);
	const int_filename = input.slice(0x40, 512); 
	const filename = stringScrubber((new TextDecoder("utf-8")).decode(int_filename));
	if(ICONJS_DEBUG){
		console.debug({permissions, type, size, sectorOffset, dirEntry, timestamps, specialSection, filename});
	}
	return {type, size, filename, timestamps};
}

/**
 * Read a EMS Memory Adapter export file (PSU format)
 * @param {ArrayBuffer} input - PSU formatted file
 * @returns {Object} (user didn't write a description)
 * @public
 */
function readEmsPsuFile(input){
	const header = readEntryBlock(input.slice(0,0x1ff));
	if(header.size > 0x7f) {
		throw `Directory is too large! (maximum size: ${0x7f}, was ${header.size})`;
	}
	let fsOut = {"__proto__": null, length: header.size, rootDirectory: header.filename, timestamps: header.timestamps};
	let output = {"__proto__": null};
	let offset = 512;
	for (let index = 0; index < header.size; index++) {
		const fdesc = readEntryBlock(input.slice(offset, offset + 512));
		switch(fdesc.type) {
			case "directory": {
				offset += 512;
				output[fdesc.filename] = null;
				break;
			}
			case "file": {
				if(ICONJS_DEBUG){
					console.debug(`PARSING | F: "${fdesc.filename}" O: ${offset} S: ${fdesc.size}`);
				}
				offset += 512;
				const originalOffset = offset;
				if((fdesc.size % 1024) > 0) {
					offset += ((fdesc.size & 0b11111111110000000000) + 1024);
				} else {
					offset += fdesc.size;
					// if we're already filling 1k blocks fully, why change the value?
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

/**
 * Read a PS3 save export file (PSV format)
 * @param {ArrayBuffer} input - PSV formatted file
 * @returns {Object} (user didn't write a description)
 * @public
 */
function readPsvFile(input){
	const {u32le, t64le} = new yellowDataReader(input);
	//!pattern psv_file.hexpat
	const magic = u32le(0);
	if (magic !== 0x50535600) {
		throw `Not a PS3 export (PSV) file (was ${magic}, expected ${0x50535600})`;
	}
	//:skip 4
	//:skip 20 // key seed, console ignores this 
	//:skip 20 // sha1 hmac digest, useful for verifying that this is, indeed, save data.
	//:skip 8
	const type1 = u32le(56);
	const type2 = u32le(60);
	if(type1 !== 0x2c && type2 !== 2) {
		throw `Not parsing, this is not in the PS2 save export format (was ${type1}:${type2}, expected 44:2)`;
	}
	const displayedSize = u32le(64);
	const ps2dOffset = u32le(68);
	const ps2dSize = u32le(72); // don't know why this is included if its always 964
	const nModelOffset = u32le(76);
	const nModelSize = u32le(80);
	const cModelOffset = u32le(84);
	const cModelSize = u32le(88);
	const dModelOffset = u32le(92);
	const dModelSize = u32le(96);
	const numberOfFiles = u32le(100); // in-case this library changes stance on other files
	// file = {t64le created, t64le modified, u32 size, u32 permissions, byte[32] title}
	// and if it's not the root directory, add another u32 for offset/location
	const rootDirectoryData = input.slice(104, 162);
	const timestamps = {created: t64le(104), modified: t64le(112)};
	let offset = 162;
	let fileData = new Array();
	for (let index = 0; index < numberOfFiles; index++) {
		fileData.push(input.slice(offset,offset+0x3c));
		offset += 0x3c;
	}
	//then file data after this but we already have pointers to the files we care about
	const icons = {
		n: input.slice(nModelOffset, nModelOffset+nModelSize),
		c: input.slice(cModelOffset, cModelOffset+cModelSize),
		d: input.slice(dModelOffset, dModelOffset+dModelSize),
	};
	if (ICONJS_DEBUG) {
		console.debug({magic, type1, type2, displayedSize,
			ps2dOffset, ps2dSize,
			nModelOffset, nModelSize,
			cModelOffset, cModelSize,
			dModelOffset, dModelSize,
			numberOfFiles, rootDirectoryData, fileData
		});
	}
	return {icons, "icon.sys": input.slice(ps2dOffset, ps2dOffset+ps2dSize), timestamps};
}

/**
 * Read a SPS or XPS file descriptor.
 * @param {ArrayBuffer} input - File descriptor segment.
 * @returns {Object} (user didn't write a description)
 * @access protected
 */
function readSxpsDescriptor(input) {
	const {u32le, t64le} = new yellowDataReader(input);
	//!pattern sps-xps_file.hexpat
	//:skip 2 // ... it's the file descriptor block size (including the bytes themselves, so 250)
	const int_filename = input.slice(2, 66);
	const filename = stringScrubber((new TextDecoder("utf-8")).decode(int_filename));
	const size = u32le(66);
	const startSector = u32le(70);
	const endSector = u32le(74);
	const permissions = u32le(78); // the first two bytes are *swapped*. The comments that ensued were not kept.
	let type;
	if (permissions>0xffff) {
		throw `Not a SharkPort (SPS) or X-Port (XPS) export file (was ${permissions}, expected less than ${0xffff})`;
	}
	if((permissions & 0b0010000000000000)>=1){
		type = "directory";
	}
	if((permissions & 0b0001000000000000)>=1){
		type = "file";
	}
	if((permissions & 0b00011000)>=1){
		throw `I don't parse portable applications or legacy save data. (${permissions} has bits 4 or 5 set)`;
	}
	const timestamps = {created: t64le(82), modified: t64le(90)};
	//:skip 4
	//:skip 4 - u32 optional (98)
	//:skip 8 - t64 optionalTime (102) // I don't know why this is here.
	const int_asciiName = input.slice(114, 178);
	const int_shiftjisName = input.slice(178, 242); // Because why parse a PS2D when you can hard-code it?
	//:skip 8
	if(ICONJS_DEBUG) {
		console.debug({int_filename, size, startSector, endSector, permissions, type, timestamps, int_asciiName, int_shiftjisName});
	}
	return {type, size, filename, timestamps};
}

/**
 * Read a SharkPort or X-Port export file (SPS or XPS format)
 * @param {ArrayBuffer} input - SPS|XPS formatted file
 * @returns {Object} (user didn't write a description)
 * @public
 */
function readSharkXPortSxpsFile(input) {
	const {u32le} = new yellowDataReader(input);
	//!pattern sps-xps_file.hexpat
	const identLength = u32le(0);
	if(identLength !== 13) {
		throw `Not a SharkPort (SPS) or X-Port (XPS) export file (was ${identLength}, expected 13)`;
	}
	let offset = 4;
	const ident = input.slice(offset, offset+identLength);
	if((new TextDecoder("utf-8")).decode(ident) !== "SharkPortSave") {
		throw `Unrecognized file identification string. Expected "SharkPortSave".`;
	}
	offset += (identLength + 4);
	const titleLength = u32le(offset);
	const title = input.slice(offset + 4, (offset + 4) + titleLength);
	offset += (titleLength + 4);
	const descriptionLength = u32le(offset);
	const description = input.slice(offset + 4, (offset + 4) + descriptionLength);
	offset += (descriptionLength + 4);
	const description2Length = u32le(offset);
	let description2;
	if(description2Length !== 0) {
		description2 = input.slice(offset + 4, (offset + 4) + description2Length);
		offset += (description2Length + 4);
	} else {
		offset += 4;
	}
	const comments = {
		"game": stringScrubber((new TextDecoder("utf-8")).decode(title)),
		"name": stringScrubber((new TextDecoder("utf-8")).decode(description))
	};
	if(description2Length !== 0) {
		comments.desc = stringScrubber((new TextDecoder("utf-8")).decode(description2));
	}
	//const totalSize = u32le(offset); has data, unused in script
	offset += 4;
	const header = readSxpsDescriptor(input.slice(offset, offset + 250));
	offset += 250;
	// alright now lets parse some actual data
	let fsOut = {"__proto__": null, length: header.size, rootDirectory: header.filename, timestamps: header.timestamps, comments};
	let output = {"__proto__": null};
	for (let index = 0; index < (header.size - 2); index++) {
		const fdesc = readSxpsDescriptor(input.slice(offset, offset + 250));
		switch(fdesc.type) {
			case "directory": {
				offset += 250;
				output[fdesc.filename] = null;
				break;
			}
			case "file": {
				if(ICONJS_DEBUG){
					console.debug(`PARSING | F: "${fdesc.filename}" O: ${offset} S: ${fdesc.size}`);
				}
				offset += 250;
				output[fdesc.filename] = {
					size: fdesc.size,
					data: input.slice(offset, offset+fdesc.size)
				};
				offset += fdesc.size;
				break;
			}
		}
	}
	fsOut[header.filename] = output;
	//:skip 4 //  then here lies, at offset (the end of file), a u32 checksum.
	return fsOut;
}

/**
 * Read a CodeBreaker Save (CBS) file's directory structure
 * @param {ArrayBuffer} input - Uncompressed, unciphered input
 * @returns {Object} (user didn't write a description)
 * @protected
 */
function readCodeBreakerCbsDirectory(input) {
	const {u32le, t64le} = new yellowDataReader(input);
	const virtualFilesystem = {"__proto__": null};
	for (let offset = 0; offset < input.byteLength;) {
		const timestamps = {created: t64le(offset), modified: t64le(offset+8)};
		const dataSize = u32le(offset+16);
		const permissions = u32le(offset+20);
		offset += 32;
		const _filename = input.slice(offset, offset+32);
		const filename = stringScrubber((new TextDecoder("utf-8")).decode(_filename));
		offset += 32;
		const data = input.slice(offset, offset+dataSize);
		offset += dataSize;
		virtualFilesystem[filename] = ({timestamps, dataSize, permissions, data});
	}
	return virtualFilesystem;
}

/**
 * Read a CodeBreaker Save (CBS) file.
 * @param {ArrayBuffer} input - CBS formatted file
 * @param {function(Uint8Array): ArrayBuffer} inflator - a function which provides a zlib-compatible inflate function.
 * @returns {Object} (user didn't write a description)
 * @public
 */
function readCodeBreakerCbsFile(input, inflator = null) {
	if(typeof inflator !== "function") {
		throw "No inflator function passed. Skipping.";
	}
	const {u32le, t64le} = new yellowDataReader(input);
	const magic = u32le(0);
	if (magic !== 0x00554643) {
		throw `Not a CodeBreaker Save (CBS) file (was ${magic}, expected ${0x00554643})`;
	}
	//u32le(4); something? it's always 8000
	const dataOffset = u32le(8);
	//const uncompressedSize = u32le(12);
	const compressedSize = u32le(16);
	const _dirName = input.slice(20, 52);
	const dirName = stringScrubber((new TextDecoder("utf-8")).decode(_dirName));
	const timestamps = {created: t64le(52), modified: t64le(60)};
	const permissions = u32le(72);
	if (permissions>0xffff) {
		throw `Not a valid export file (was ${permissions}, expected less than ${0xffff})`;
	}
	if((permissions & 0b0001100000000000)>=1){
		throw `I don't parse portable applications or legacy save data. (${permissions} has bits 10 or 11 set)`;
	}
	const _displayName = input.slice(92, 296);
	const displayName = stringScrubber((new TextDecoder("utf-8")).decode(_displayName));
	const compressedData = input.slice(dataOffset, dataOffset + compressedSize);
	const decipheredData = rc4Cipher(ICONJS_CBS_RC4_KEY, new Uint8Array(compressedData));
	const inflatedData = inflator(decipheredData);
	const fsOut = {"__proto__": null, rootDirectory: dirName, timestamps};
	fsOut[dirName] = readCodeBreakerCbsDirectory(inflatedData);
	if(ICONJS_DEBUG) {
		console.debug({magic, dataOffset, compressedSize, dirName, permissions, displayName});
	}
	return fsOut;
}

/**
 * Read a Max Drive (MAX) or PowerSave (PWS) file's directory structure.
 * @param {ArrayBuffer} input - Uncompressed input
 * @returns {Object} (user didn't write a description)
 * @protected
 */
function readMaxPwsDirectory(input, directorySize) {
	const {u32le} = new yellowDataReader(input);
	const virtualFilesystem = {"__proto__": null};
	let offset = 0;
	for (let index = 0; index < directorySize; index++) {
		const dataSize = u32le(offset);
		const _filename = input.slice(offset+4, offset+36);
		const filename = stringScrubber((new TextDecoder("utf-8")).decode(_filename));
		if(filename === "") { throw `Unexpected null filename at byte ${offset+4}.`; }
		offset += 36;
		const data = input.slice(offset, offset+dataSize);
		offset += dataSize;
		if(index !== directorySize - 1) {
			while((offset & 15) !== 8) {
				offset++;
			}
		}
		virtualFilesystem[filename] = ({dataSize, data});
	}
	return virtualFilesystem;
}

/**
 * Read a Max Drive (MAX) or PowerSave (PWS) file.
 * @param {ArrayBuffer} input - MAX/PWS formatted file
 * @param {function(Uint8Array): ArrayBuffer} unlzari - a function which provides a LZARI-compatible decompression function.
 * @returns {Object} (user didn't write a description)
 * @public
 */
function readMaxPwsFile(input, unlzari) {
	if(typeof unlzari !== "function") {
		throw "No decompresser function passed. Skipping.";
	}
	const {u32le} = new yellowDataReader(input);
	const ident = input.slice(0, 12);
	if((new TextDecoder("utf-8")).decode(ident) !== "Ps2PowerSave") {
		throw "Unrecognized file identification string. Expected \"Ps2PowerSave\".";
	}
	//:skip 4 (u32 checksum)
	const _dirName = input.slice(0x10, 0x30);
	const dirName = stringScrubber((new TextDecoder("utf-8")).decode(_dirName));
	const _displayName = input.slice(0x30, 0x50);
	const displayName = stringScrubber((new TextDecoder("utf-8")).decode(_displayName));
	const compressedSize = u32le(0x50);
	if(compressedSize !== (input.byteLength - 88)) {
		console.warn(`This file says it's larger then it actually is! (Given size: ${compressedSize}, actual size: ${input.byteLength - 88})`);
	}
	const size = u32le(0x54);
	const compressedData = input.slice(88, input.byteLength);
	const uncompressedData = unlzari(new Uint8Array(compressedData)); // read above why we can't trust given size
	const fsOut = {"__proto__": null, rootDirectory: dirName};
	fsOut[dirName] = readMaxPwsDirectory(uncompressedData, size);
	// there's no... timestamps or permissions... this doesn't bode well.
	if(ICONJS_DEBUG) {
		console.debug({ident, compressedSize, dirName, displayName});
	}
	return fsOut;
}


/** 
 * Define (module.)exports with all public functions.
 * @exports icondumper2/icon
 */ // start c6js#
/* globals exports: true */
if(typeof exports !== "object") {
	exports = {
		readers: {"readIconFile": readIconFile, "readPS2D": readPS2D, "readEmsPsuFile": readEmsPsuFile, "readPsvFile": readPsvFile, "readSharkXPortSxpsFile": readSharkXPortSxpsFile, "readCodeBreakerCbsFile": readCodeBreakerCbsFile, "readMaxPwsFile": readMaxPwsFile},
		helpers: {"uncompressTexture": uncompressTexture, "convertBGR5A1toRGB5A1": convertBGR5A1toRGB5A1},
		options: {"setDebug": setDebug, "setStrictness": setStrictness},
		version: ICONJS_VERSION
	};
} else {
	exports.readers = {"readIconFile": readIconFile, "readPS2D": readPS2D, "readEmsPsuFile": readEmsPsuFile, "readPsvFile": readPsvFile, "readSharkXPortSxpsFile": readSharkXPortSxpsFile, "readCodeBreakerCbsFile": readCodeBreakerCbsFile, "readMaxPwsFile": readMaxPwsFile};
	exports.helpers = {"uncompressTexture": uncompressTexture, "convertBGR5A1toRGB5A1": convertBGR5A1toRGB5A1};
	exports.options = {"setDebug": setDebug, "setStrictness": setStrictness};
	exports.version = ICONJS_VERSION;
}
/* globals module: true */
if(typeof module !== "undefined") {
	module.exports = exports;
}
//end c6js
//start esm
/*export {
	readIconFile, readPS2D, readEmsPsuFile, readPsvFile, readSharkXPortSxpsFile, readCodeBreakerCbsFile, readMaxPwsFile, uncompressTexture, convertBGR5A1toRGB5A1, setDebug, ICONJS_VERSION
};*/
//end esm