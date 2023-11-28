# icondumper2 (working title)
A JavaScript library (sorta) to read PS2 icons, and their related formats.

## What it supports
* EMS Memory Adapter export files (.psu)
* PS3 virtual memory card export files (.psv)
* SharkPort export files (.sps)
* X-Port export files (.xps)
* PS2 icons (.ico, .icn)
* PS2D format (icon.sys)

## What can it do
* Allow any file in a PSU's or SPS/XPS's virtual filesystem to be dumped.
* Warn of invalid icon.sys display names.
* Read and parse an EMS MA export file.
* Export the icon model, with all seperate shapes included to a JavaScript Object.
* Node.js compatible (CommonJS) exporting while still being compatible with other JavaScript implementations.
* Convert a 128x128x16 BGR5A1 bitmap to a RGB5A1 format.
* Convert an icon or a set of icons to glTF, with textures.

## What it doesn't do
* (Re)build save files.
* Modify the original input files.
* Use any Node.js-exclusive features.

## Client compatibility
(todo: write this)

## Why "icondumper2"?
Because it replaced what *was* left of icondumper (1).

## Included files
| File             | Description                               |
| ----             | ----------------------------------------- |
| icon.js          | The library itself.                       |
| index.js         | Node.js example client.                   |
| gltf-exporter.js | Node.js client to export icons to glTF 2. |
| index.htm        | HTML reference client.                    |
