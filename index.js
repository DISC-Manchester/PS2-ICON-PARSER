const icondumper2 = require("./icon.js");
const iconjs = icondumper2.readers;
const filesystem = require("fs");
const processObj = require("process");

// to make it viewable
require("util").inspect.defaultOptions.maxArrayLength = 10;
require("util").inspect.defaultOptions.compact = true;
require("util").inspect.defaultOptions.depth = 2;

// output debugging information
icondumper2.options.setDebug(false);

// node.js client
console.log(`icon.js version ${icondumper2.version}, ${(new Date()).getFullYear().toString()} (c) yellows111`);
switch(processObj.argv[2]) {
	case "psu": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.psu");
		const parsed = iconjs.readEmsPsuFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
		let output = {parsed, PS2D}
		Object.keys(PS2D.filenames).forEach(function(file) {
			output[file] = iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames[file]].data);
		});
		console.log(output);
		break;
	}
	case "psv": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.psv");
		const parsed = iconjs.readPsvFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		console.log(parsed);
		const PS2D = iconjs.readPS2D(parsed["icon.sys"]);
		let output = {parsed, PS2D};
		console.log(output);
		break;
	}
	case "sps":
	case "xps": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.sps");
		const parsed = iconjs.readSharkXPortSxpsFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		console.log(parsed);
		const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
		let output = {parsed, PS2D}
		Object.keys(PS2D.filenames).forEach(function(file) {
			output[file] = iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames[file]].data);
		});
		console.log(output);
		break;
	}
	case "cbs": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "file.cbs");
		function myInflator(inputBuffer) {
			return (require("zlib").inflateSync(inputBuffer)).buffer;
		}
		const parsed = iconjs.readCodeBreakerCbsFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength), myInflator);
		console.log(parsed);
		const PS2D = iconjs.readPS2D(parsed[parsed.rootDirectory]["icon.sys"].data);
		let output = {parsed, PS2D}
		Object.keys(PS2D.filenames).forEach(function(file) {
			output[file] = iconjs.readIconFile(parsed[parsed.rootDirectory][PS2D.filenames[file]].data);
		});
		console.log(output);
		break;
	}
	case "sys": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "icon.sys");
		const metadata = iconjs.readPS2D(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength));
		console.log("\noutput:", metadata, "\n")
		if(processObj.argv.length > 4 && processObj.argv[4].toLowerCase() === "--no-read-models") {break;} else {
			Object.keys(metadata.filenames).forEach(function(file) {
				let getFile = filesystem.readFileSync(metadata.filenames[file]);
				const output = iconjs.readIconFile(getFile.buffer.slice(getFile.byteOffset, getFile.byteOffset + getFile.byteLength));
				//console.log(individialIcon);
				console.log(`contents of ${metadata.filenames[file]} (${file}):`, output, "\n");
			});
		}
		break;
	}
	case "ico":
	case "icn": {
		let inputFile = filesystem.readFileSync(processObj.argv[3] ? processObj.argv[3] : "input.icn");
		console.log(`contents of ${require("path").basename(processObj.argv[3])}:`, iconjs.readIconFile(inputFile.buffer.slice(inputFile.byteOffset, inputFile.byteOffset + inputFile.byteLength)));
		break;
	}
	default: {
		//Template literal goes here.
		console.log(
`${(processObj.argv.length > 2) ? "Unknown argument: "+processObj.argv[2]+"\n\n": ""}icondumper2 node.js client subcommands:
psu: Read a EMS Memory Adapter export file.
psv: Read a PS3 export file.
sps: Read a SharkPort export file.
xps: Read a X-Port export file.
cbs: Read a CodeBreaker Save export file.

sys: Read a icon.sys (964 bytes) file, and attempt
     to read icon files from the current directory.
     (suppress behaviour with --no-read-models)
icn: Read an icon file directly. (Also as: ico)
`		); // end of template
	}
	processObj.exit(1);
}
processObj.exit(0);