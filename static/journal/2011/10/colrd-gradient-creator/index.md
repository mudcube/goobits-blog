---
title: "ColRD: Gradient Creator"
date: "2011-10-22"
categories: 
  - "apps"
  - "colrd"
tags: 
  - "color"
  - "gradient-picker"
  - "html5"
---

Tonight, on [ColRD](http://colrd.com/), we released the latest rendition of [Palette Creator](http://colrd.com/create/palette/), along with our newest addition; the [Gradient Creator](http://colrd.com/create/gradient/)! This new webapp makes it fun and easy to create CSS3 linear gradients . **UPDATE:** You can also download the Gradient Creator as a [Chrome webapp](https://chrome.google.com/webstore/detail/hcplneddoadgichngfbobgpllfphdfla).

**Features:**

- Drag & Drop GIMP Gradient (.GGR) files into the browser to view them!
- Delta Swatch:  Shows the colors most similar to the one you’re choosing of the 4096 websmart colors (in CIE-Lab color space).
- Keyboard goodness with Color Picker:  HSL, RGB, and HEX chooser.
- Preview:  See your gradient in full-screen mode before you save it.
- Flip:  Flip your gradient, so:  first is last, and last is first.
- Intriguing new interface to create gradients! …

**Do we need a new gradient editor GUI?**

Gradient editors haven’t changed much historically, the same dynamic is used throughout GIMP, Illustrator, Inkscape and Photoshop. For me, these interfaces are clunky, leading to repetitive stress of the wrists and fingers, which prompted me to think, “There must be a better way!”.  One of the most click-saving changes was combining the Color Picker and Gradient Creator as one unit—there are no popup windows or “Ok” buttons.

Traditionally gradient editors allow users to place a point in space that radiates it’s color in both directions evenly. This is the way that computers think about gradients; color points in space, blended (in the case of `<canvas>`) linearly.

**Description of the Gradient Creator;**

- ColRD gradient creator presents itself as color blocks—just like a palette.

- Inside each color block you will find the midpoint controller—these controllers allow you to stretch the color towards the left or the right of the block.
- To the left and right of the color block are col-resize controllers—these allow you to scale the width of the color block and the adjacent one.

- Color blocks can be reorganized by dragging and dropping, without rescaling the color block or the ones around it.
- If you drag and drop a color block onto the Color Picker, the color will be removed from your gradient (re-absorbed into color space!).

**Future developments;**

- GGR, SVG, and CSS3 exporting (soon, as in this week).
- Desktop wallpaper generator; textures, gradients, and user defined sizing (see [previous article](/journal/2011/10/background-generator/)), along with the Gradient Noise generator.
- Time-machine (undo and redo).
- The user could split the midpoint, creating a shadow of itself in the opposite direction, this way the user could control the color blur on one edge (as it is now), or both edges simultaneously.  The shadow could be fixed to the inverse of the controller (SHIFT-KEY) to create even blurs, or controlled on it’s own independently.

If you have any ideas for the future, let us know!

**Random thought;**

For those interested in exotic gradient editors, SpectraG is a project that uses mathematic equations to generate gradients;

[http://sourceforge.net/projects/spectrag/](http://sourceforge.net/projects/spectrag/)
