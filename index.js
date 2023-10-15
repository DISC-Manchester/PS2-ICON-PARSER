const iconjs = require("./icon.js");
const filesystem = require("fs");
const processObj = require("process");

// to make it viewable
require("util").inspect.defaultOptions.maxArrayLength = 10;
require("util").inspect.defaultOptions.compact = true;
require("util").inspect.defaultOptions.depth = 2;

// debugger
iconjs.setDebug(false);

// node.js client
if(processObj.argv[2] === "psu") {
	let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.psu");
	const parsed = iconjs.readEmsPsuFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
	const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
	let output = {parsed, PS2D}
	Object.keys(PS2D.filenames).forEach(function(file) {
		output[file] = iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames[file]].data);
	});
	console.log(output);
} else if(processObj.argv[2] === "psv") {
	let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.psv");
	const parsed = iconjs.readPsvFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
	console.log(parsed);
	const PS2D = iconjs.readPS2D(parsed["icon.sys"]);
	let output = {parsed, PS2D};
	console.log(output);
} else if(processObj.argv[2] === "sps") {
	let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.sps");
	const parsed = iconjs.readSharkXPortSxpsFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
	console.log(parsed);
	const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
	let output = {parsed, PS2D}
	Object.keys(PS2D.filenames).forEach(function(file) {
		output[file] = iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames[file]].data);
	});
	console.log(output);
} else {
	let inputFile = filesystem.readFileSync(processObj.argv[2] ? processObj.argv[2] : "icon.sys");
	const metadata = iconjs.readPS2D(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
	console.log("\noutput:", metadata, "\n")

	Object.keys(metadata.filenames).forEach(function(file) {
		let getFile = filesystem.readFileSync(metadata.filenames[file]);
		const output = iconjs.readIconFile(getFile.buffer.slice(getFile.byteOffset, getFile.byteOffset + getFile.byteLength));
		//console.log(individialIcon);
		console.log(`contents of ${metadata.filenames[file]} (${file}):`, output, "\n");
});
}