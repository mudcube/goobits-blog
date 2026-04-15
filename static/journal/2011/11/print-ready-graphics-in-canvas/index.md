---
title: "Print-ready graphics in Canvas"
date: "2011-11-09"
categories: 
  - "diy"
tags: 
  - "canvas"
  - "image-tools"
coverImage: "images/hero.jpeg"
---

Last month, I posted about the possibility of creating high-resolution and print-ready graphics in `<canvas>`. Since then, it’s been in the back of my mind, but happened to be at Kinko’s today, and decided to take this experiment to the next level…

The following flash-cards were designed in Illustrator \[by [Altered Focus](http://alteredfoc.us/)\], exported into SVG, then parsed into `<canvas>`… and finally, that one template card (in the picture below it’s the “C” major card on the left) was used to create a large variety of combinations—based on a set of music-theory instructions. Such as;

```js
Chord = { // definition for an A chord
	e1: false,
	a: { 0: true },
	d: { 2: 1 },
	g: { 2: 2 },
	b: { 2: 3 },
	e2: { 0: true }
}
```

**The best thing is;** the designer can change the **design in Illustrator** and the design is **automatically updated on the front-end**, the programmer doesn’t even notice. I’m telling you, _Illustrator is one bad-ass HTML5 editor.

There are a few bugs in my music-theory code (please excuse the improper fingering positions!), but, as you can see from the following [1,264 x 65,320 pixel image](http://www.flickr.com/photos/mudx/6223941349/sizes/o/in/photostream/), you can create hundreds of variations of a single design. The nice thing is, I can find the bug in my code, fix it, and then updating hundreds of them takes about 30-seconds of CPU time!

Next step; find a good printer, and then get these cards into the local-guitar shops around Portland.

Oh, and, was thinking… Jacob Seidelin’s [Canvas2Image](http://www.nihilogic.dk/labs/canvas2image/) could be modified to specify the resolution the toDataURL export from `<canvas>`, exporting into 300DPI, instead of a scaled up 72DPI.

**Alternative route to convert from Illustrator to `<canvas>`**

Although it’s not as versatile as a full-blown SVG-parser (as it’s a bit harder to modify the contents) you can get from Illustrator to `<canvas>` in a much quicker/easier way; [AI-Canvas](http://visitmix.com/work/ai2canvas/) allows you to export from Adobe Illustrator directly into `<canvas>` paths, and even animations.
