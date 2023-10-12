# icondumper2 (working title)
A JavaScript library (sorta) to read PS2 icons, and their related formats.

## What it supports
* EMS Memory Adapter export files (.psu)
* PS2 icons (.ico, .icn)
* PS2D format (icon.sys) 

## What can it do
* Allow any file in a PSU's virtual filesystem to be dumped.
* Warn of invalid icon.sys titles.
* Read and parse an EMS MA export file.
* Export the icon model, with all seperate shapes included to a JavaScript Object.
* Node.js compatible (CommonJS) exporting while still being compatible with other JavaScript implementations.

## What it doesn't do
* (Re)build save files.
* Modify the original input files.
* Use any Node.js-exclusive features.

## Client compatibility
(todo: write this)

## Why "icondumper2"?
Because it replaced what *was* left of icondumper.
