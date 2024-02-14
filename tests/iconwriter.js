// version 1.0.0 icon, 1 shape, texture type 7 (will be discarded), something 1.0f, 36 vertices (cube)
const iconHeader = new Uint8Array([
	0x00, 0x00, 0x01, 0x00,		0x01, 0x00, 0x00, 0x00,
	0x07, 0x00, 0x00, 0x00,		0x00, 0x00, 0x80, 0x3F,
	0x24, 0x00, 0x00, 0x00
]); // 20 bytes

// format: [xxyyzzaa][xxyyzzaa][uuvv][rgba], (8 + 8 + 4 + 4) (position.xyzw, normal.xyzw, texcoords.st, colour.rgba)
// 0x1000 = 4096 (1.0f), 0xf000 = -4096 (-1.0f)
// color is lime green (0, 255, 0, 127)
const iconData = new Uint8Array([
	// 1/36, [-1, -1, -1], [0.25, 0.25] poly  1.1 z-1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	// 2/36, [-1,  1, -1], [0.25, 0.75] poly  1.2 z-1
	0x00, 0xf0, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	// 3/36, [ 1, -1, -1], [0.75, 0.75] poly  1.3 z-1
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	// 4/36, [ 1,  1, -1] poly  2.1 z-1
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	// 5/36, [ 1, -1, -1] poly  2.2 z-1
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	// 6/36, [-1,  1, -1] poly  2.3 z-1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	// 7/36, [-1, -1, -1] poly  3.1 x-1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	// 8/36, [-1, -1,  1] poly  3.2 x-1
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	// 9/36, [-1,  1, -1] poly  3.3 x-1
	0x00, 0xf0, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//10/36, [-1, -1, -1] poly  4.1 x-1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//11/36, [-1, -1,  1] poly  4.2 x-1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//12/36, [-1,  1,  1] poly  4.3 x-1
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//13/36, [-1,  1, -1] poly  5.1 y+1
	0x00, 0xf0, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//14/36, [-1,  1,  1] poly  5.2 y+1
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//15/36, [ 1,  1, -1] poly  5.3 y+1
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//16/36, [ 1,  1, -1] poly  6.1 y+1
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//17/36, [-1,  1,  1] poly  6.2 y+1
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//18/36, [ 1,  1,  1] poly  6.3 y+1
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//19/36, [ 1,  1, -1] poly  7.1 x+1
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//20/36, [ 1,  1,  1] poly  7.2 x+1
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//21/36, [ 1, -1, -1] poly  7.3 x+1
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//22/36, [ 1,  1,  1] poly  8.1 x+1
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//23/36, [ 1, -1,  1] poly  8.2 x+1
	0x00, 0x10, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x10, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//24/36, [ 1, -1, -1] poly  8.3 x+1
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//25/36, [-1, -1, -1] poly  9.1 y-1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//26/36, [ 1, -1, -1] poly  9.2 y-1
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//27/36, [-1, -1,  1] poly  9.3 y-1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//28/36, [-1, -1,  1] poly 10.1 y-1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//29/36, [ 1, -1, -1] poly 10.2 y-1
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x10, 0x00, 0xf0, 0x00, 0xf0, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//30/36, [ 1, -1,  1] poly 10.3 y-1
	0x00, 0x10, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x10, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//31/36, [-1,  1,  1] poly 11.1 z+1
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//32/36, [-1, -1,  1] poly 11.2 z+1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//33/36, [ 1,  1,  1] poly 11.3 z+1
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,

	//35/36, [ 1, -1,  1] poly 12.2 z+1
	0x00, 0x10, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x10, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
	//34/36, [ 1,  1,  1] poly 12.1 z+1
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x10, 0x00, 0x10, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x04, 0x00, 0x04, 0x40, 0xff, 0x00, 0x7f,
	//36/36, [-1, -1,  1] poly 12.3 z+1
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0xf0, 0x00, 0xf0, 0x00, 0x10, 0x00, 0x04,
	0x00, 0x0c, 0x00, 0x0c, 0x40, 0xff, 0x00, 0x7f,
]); // 864 bytes

const animData = new Uint8Array([
	0x01, 0x00, 0x00, 0x00,		0x64, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x80, 0x3F,		0x00, 0x00, 0x00, 0x00,
	0x01, 0x00, 0x00, 0x00,		0x00, 0x00, 0x00, 0x00,
	0x01, 0x00, 0x00, 0x00,		0x00, 0x00, 0x00, 0x00,
	0x00, 0x00, 0x00, 0x00
]); // 36 bytes
 
/** generate texture data **/
const texture_ = new Uint16Array(16384);
for (let indice = 0; indice < 16384; indice++) {
	//texture_[indice] = 0b11111_00000_00000_1; //RGB5A1
	texture_[indice] = 0b1_00000_00000_11111; //A1BGR5
	//texture_[indice] = 0b00000_00000_11111_0; // BGR5A1
	//texture_[indice] = 0xffff; // does this even texture vro
} // 32768 bytes

const textureData = new Uint8Array(texture_.buffer);

const IconFileArray = new Array(8);

/** make icons **/
for (let iconIndice = 0; iconIndice < 8; iconIndice++) {
	// actual test goes here!
	// combine data together (header+data+animData+texture)
	const combined = new Uint8Array(20+864+36+32768);
	combined.set(iconHeader, 0);
	combined.set(iconData, 20);
	combined.set(animData, 20+864);
	combined.set(textureData, 20+864+36);

	combined[8] = iconIndice; // set texture type
	
	IconFileArray[iconIndice] = combined;
	if(typeof require !== "undefined") {
		require("fs").writeFileSync(`${iconIndice}_generated.icn`, combined);
	}
}


/** make ps2d's **/
const metadataSkeleton = new Uint8Array(Array.from({...[
	0x50, 0x53, 0x32, 0x44,		0x00, 0x00, 0x00, 0x00, // todo: don't sleep on this, it's the byte where we split the title
], length:964}));

/**
    0x82, 0x89, 0x82, 0x83, 0x82, 0x8f, 0x82, 0x8e, // icon
    0x82, 0x84, 0x82, 0x95, 0x82, 0x8d, 0x82, 0x90, // dump
    0x82, 0x85, 0x82, 0x92, 0x82, 0x51, 0x81, 0x40, // er2 
    0x82, 0x73, 0x82, 0x85, 0x82, 0x93, 0x82, 0x94, // Test
	0x81, 0x46, 0x82, 0x73, 0x82, 0x85, 0x82, 0x98, // :Tex
	0x82, 0x94, 0x82, 0x95, 0x82, 0x92, 0x82, 0x85, // ture
	0x81, 0x40, 0x82, 0x73, 0x82, 0x99, 0x82, 0x90, //  Typ
	0x82, 0x85, 0x81, 0x40, 0x82, 0x58, 0x00, 0x00, // e 9
**/

//automatic psu generator?