---
title: "Sketchpad 4.0"
date: "2016-06-17"
categories: 
  - "apps"
tags: 
  - "sketchpad"
---

I’m excited to announce [Sketchpad 4.0](https://sketch.io/sketchpad/)! The focuses on this release has making the app more colorful, faster, and easier to use.

Here’s an overview of what’s new:

- Stroke/Fill is available on all brushes.
- VectorFill replaces Floodfill for crisper edges and much faster rendering! This can lead to some fun by importing an SVG into Sketchpad, re-coloring it, and download it back as an SVG (right click to download!).
- Linear gradient editor
- Radial gradient editor
- Text updates with special thanks to [OpenType.js](http://nodebox.github.io/opentype.js/) & some inspiration from [FitText](https://github.com/astrojs/fitsjs/)! Editing text now feels very smooth. Additionally these new features are available:
    1. Font Size is automatically set based on textarea dimensions
    2. Bold, Italic, Underline & Stroke styles
    3. Align Left, Center, Right & Justify
    4. Line Height & Letter Spacing
- Crop has been merged with the Resize tool making life simpler. What’s better the crop tool now automatically zooms your viewport to fit so you can see your entire document while cropping.
- Your library view has been updated with a more robust & spacious interface, along with more obvious buttons for renaming, duplicating, and removing documents.
- High-res export now works on all tool and style combinations!
- New auto-save UI allows you to disable the ‘auto-saving’ feature. This is helpful especially on large documents with thousands of layers that may take awhile to autosave. Although, to that end, auto-saving is much faster in the new version.
- And finally you’ll find an export button right on the toolbar for all those who requested it!
- Special thanks to [jsondiffpatch](https://github.com/benjamine/jsondiffpatch) which is now used in Sketchpad’s history.

There are a couple things that could not be 100% converted to the new version Sketchpad. You may want to consider whether these matter to you before upgrading your files (you will be prompted). My apologies for any inconvenience these may cause you:

- FloodFill was depreciated. It just did not make sense to keep in. It cost too much to maintain, it was notorious for crashing users browsers. Sketchpad is a vector app, so a bitmap FloodFill never made sense. The new VectorFill replaces the FloodFill, and the results are much nicer!
- LinearGradient format needed to be upgraded in order support the new Gradient Editor, in doing so LinearGradients may shift slightly.

If for any reason you’d like to use the _older version of Sketchpad_ you can find it at its new permanent URL: [https://sketch.io/sketchpad-3.7.6/](https://sketch.io/sketchpad-3.7.6/)

Or better yet, check out the latest!

[https://sketch.io/sketchpad/](https://sketch.io/sketchpad/)
