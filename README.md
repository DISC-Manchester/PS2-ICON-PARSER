# icondumper2 (working title)
A JavaScript library (sorta) to read PS2 icons, and their related formats.

## What is a "PS2 icon"?
A set of vertices with may or may not include a texture while defining colours for those vertices.

## Why?
Current implementations had some issues with rendering some icons. These were mostly:
* Not rendering any color for texture type 3.
* Failing to decompress some specific RLE-compressed icons. (types above 8)
* Requires writing/reading a specific format for successful output of data.

As of writing, there was no exporter that exists for the format that exhibited one of these problems.

**icondumper2** is the result of me trying to avoid these problems.

## What it supports:
* EMS Memory Adapter export files (.psu)
* PS3 virtual memory card export files (.psv)
* SharkPort export files (.sps)
* X-Port export files (.xps)
* CodeBreaker Save export files (.cbs)
* Max Drive "PowerSave"/export files (.max)
* PS2 icons (.ico, .icn)
* PS2D format (icon.sys)

## What can it do:
* Allow any file in a supported virtual filesystem (such as those from export files) to be read.
* Warn of invalid icon.sys display names.
* Export the icon model, with all seperate shapes included as a JavaScript Object.
* CommonJS (that includes node!) module exporting while still being compatible with other JavaScript implementations.
* Convert a 128x128x16 BGR5A1 bitmap to a standard RGB5A1 format.
* Convert an icon or a set of icons to glTF 2, with textures saved as PNG.
* Decompress any LZARI-formatted data.

## What it doesn't do:
* Create, manipulate or otherwise taint save files.
* Modify any original input files.
* Use any implementation-specific features.

## Client compatibility:
The library requires use of `const`, `let` and `class` declarations.

Any JavaScript implementation should work if they support all three of these declarations.

### Tested clients:
* Chrome (or Blink-based browser) 49 (or higher) - HTML reference client
* Firefox (or Gecko-based browser) 45 (or higher) - HTML reference client
* Node.js 13 (or higher) - Example client and glTF 2 exporter.

## Why "icondumper2"?
Because it replaced what *was* left of icondumper (1).

## Included files:
| File             | Description                               |
| ---------------- | ----------------------------------------- |
| icon.js          | The library itself.                       |
| index.js         | Node.js example client.                   |
| gltf-exporter.js | Node.js client to export icons to glTF 2. |
| index.htm        | HTML reference client.                    |
| lzari.js         | A LZARI decompression-only library.       |

## Included example files:
| Directory    | Description                               | Formats  |
| ------------ | ----------------------------------------- | -------- |
| /example_001 | A tetrahedron with all 3 base colors set. | PSU, SPS |