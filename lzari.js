// based on Luigi Auriemma's memory2memory LZARI modification. LZARI was created by Haruhiko Okumura.
// yellows111 modifications: forced all magic constants to be their actual values,
// static calculations have been squashed, some functions have been transcluded into others

/** @copyright MIT license:
*  Based on a work by Haruhiko Okumura dated 1989-07-04.
*  Copyright 2023 yellows111
*
*  Permission is hereby granted, free of charge, to any person obtaining a 
*  copy of this software and associated documentation files (the "Software"), 
*  to deal in the Software without restriction, including without limitation 
*  the rights to use, copy, modify, merge, publish, distribute, sublicense, 
*  and/or sell copies of the Software, and to permit persons to whom the 
*  Software is furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in 
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
*  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
*  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
*  DEALINGS IN THE SOFTWARE.
**/

//TODO: privatize variables and document the library

var inputData = null;
var inputLocation = 0;
var low = 0;
var high = 131072;
var value = 0;
var text_buffer = new Array(4155);
var characterToSymbol = new Array(314);
var symbolToCharacter = new Array(315);
var symbolFrequency = new Array(315);
var symbolCumulative = new Array(315);
var positionCumulative = new Array(4097);
var bit_Buffer = 0;
var bit_Mask = 0;

function GetBit() {
	//partial xgetc modification
	if(inputLocation >= inputData.length) {return -1};
	if((bit_Mask >>= 1) === 0) {
		bit_Buffer = inputData[inputLocation++];
		bit_Mask = 128;
	}
	return +((bit_Buffer & bit_Mask) !== 0);
}

function BinarySearchSym(x) {
	let i = 1;
	let j = 314;
	while (i < j) {
		let k = ((i + j) / 2)|0;
		if (symbolCumulative[k] > x) {
			i = k + 1;
		} else {
			j = k;
		}
	}
	return i;
}

function BinarySearchPos(x) {
	let i = 1;
	let j = 4096;
	while (i < j) {
		let k = ((i + j) / 2)|0;
		if (positionCumulative[k] > x) {
			i = k + 1;
		} else {
			j = k;
		}
	}
	return i - 1;
}

function DecodeChar() {
	var range = high - low;
	var sym = BinarySearchSym((((value - low + 1) * symbolCumulative[0] - 1) / range)|0);
	high = low + ((range * symbolCumulative[sym - 1]) / symbolCumulative[0])|0;
	low +=       ((range * symbolCumulative[sym    ]) / symbolCumulative[0])|0;
	for ( ; ; ) {
		if (low >= 65536) {
			value -= 65536;
			low -= 65536;
			high -= 65536;
		} else if (low >= 32768 && high <= 98304) {
			value -= 32768;
			low -= 32768;
			high -= 32768;
		} else if (high > 65536) { break };		
		low += low;
		high += high;
		value = 2 * value + GetBit();
	}
	//transcluded UpdateModel
	let character = symbolToCharacter[sym];
	// do not remove above, will be overwritten otherwise!
	let i;
	
	if(symbolCumulative[0] >= 32767) {
		let chr = 0;
		for (i = 314; i > 0; i--) {
			symbolCumulative[i] = chr;
			chr += (symbolFrequency[i] = (symbolFrequency[i] + 1) >> 1);
		}
		symbolCumulative[0] = chr;
	}
	for(i = sym; symbolFrequency[i] === symbolFrequency[i - 1]; i--) {};
	if (i < sym) {
		let ch_i = symbolToCharacter[i];
		let ch_sym = symbolToCharacter[sym];
		symbolToCharacter[i] = ch_sym;
		symbolToCharacter[sym] = ch_i;
		characterToSymbol[ch_i] = sym;
		characterToSymbol[ch_sym] = i;
		//i would change these vars...
		//but it looks so darn cool...
	}
	symbolFrequency[i]++;
	while (--i >= 0) {
		symbolCumulative[i]++;
	}
	//end transclusion
	return character;
}

function DecodePosition() {
	var range = high - low;
	var position = BinarySearchPos((((value - low + 1) * positionCumulative[0] - 1) / range)|0);
	high = low + ((range * positionCumulative[position    ]) / positionCumulative[0])|0;
	low +=       ((range * positionCumulative[position + 1]) / positionCumulative[0])|0;
	for ( ; ; ) {
		if (low >= 65536) {
			value -= 65536;
			low -= 65536;
			high -= 65536;
		} else if (low >= 32768 && high <= 98304) {
			value -= 32768;
			low -= 32768;
			high -= 32768;
		} else if (high > 65536) { break };
		low += low;
		high += high;
		value = 2 * value + GetBit();
	}
	return position;
}

/**
 * Decompresses LZARI-formatted data.
 * @param {Uint8Array} input - source data
 * @returns {Uint8Array} output - uncompressed data
 * @access public
 */
function decodeLzari(input) {
	//transcluded reset function.
	inputData = null;
	inputLocation = 0;
	low = 0;
	high = 131072;
	value = 0;
	text_buffer = new Array(4155);
	characterToSymbol = new Array(314);
	symbolToCharacter = new Array(315);
	symbolFrequency = new Array(315);
	symbolCumulative = new Array(315);
	positionCumulative = new Array(4097);
	bit_Buffer = 0;
	bit_Mask = 0;
	//end transclusion

    inputData = input;
	inputLocation = 4;

    let dataSize = new DataView(input.buffer).getInt32(0,1);

    if (dataSize == 0) return(0);
    if (dataSize < 0) return(-1);

	let outputLength = dataSize;
	let outputData = new Uint8Array(dataSize);
	let outputLocation = 0;

	//transcluded StartDecode
	for (let i = 0; i < 17; i++) {
		value = 2 * value + GetBit();
	}
	//transcluded StartModel
	symbolCumulative[314] = 0;
	for (let sym = 314; sym >= 1; sym--) {
		let ch = sym - 1;
		characterToSymbol[ch] = sym;
		symbolToCharacter[sym] = ch;
		symbolFrequency[sym] = 1;
		symbolCumulative[sym - 1] = (symbolCumulative[sym] + symbolFrequency[sym]);
	}
	symbolFrequency[0] = 0;
	positionCumulative[4096] = 0;
	for (let i = 4096; i >= 1; i--) {
		positionCumulative[i - 1] = (positionCumulative[i] + (10000 / (i + 200))|0);
	}
	//end transclusion
	//normal Decode process

	for (let i = 0; i < 4036; i++) {
		text_buffer[i] = 32;
	}
	var r = 4036;

	for (let count = 0; count < dataSize; ) {
        if(inputLocation >= inputData.length) {break};
		let c = DecodeChar();
		if (c < 256) {
			outputData[outputLocation++] = c;
			text_buffer[r++] = c;
			r &= (4095);
			count++;
		} else {
			let i = (r - DecodePosition() - 1) & 4095;
			let j = c - 253;
			for (let k = 0; k < j; k++) {
				c = text_buffer[(i + k) & 4095];
				outputData[outputLocation++] = c;
				text_buffer[r++] = c;
				r &= (4095);
				count++;
			}
		}
	}
	//console.debug("LZARI I/O", {inputData, outputData});
    return(outputData);
}

/** 
 * Define (module.)exports with all public functions.
 * @exports icondumper2/lzari
 */ // start c6js
if(typeof exports !== "object") {
	exports = {
		decodeLzari
	};
} else {
	exports.decodeLzari = decodeLzari;
}

if(typeof module !== "undefined") {
	module.exports = exports;
}

//end c6js
//start esm
/*export {
	decodeLzari
};*/
//end esm