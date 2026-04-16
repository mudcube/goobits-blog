---
title: "Orange Honey; Epilogue"
date: "2011-07-16"
categories:
  - "code-art"
tags: 
  - "canvas"
  - "creative-tools"
  - "typography"
coverImage: "images/pastedGraphic_9.png"
---

The past four years (2007-2011) much of my energy and capital has been focused into building the Mugtug graphics suite; [Sketchpad](https://sketch.io/sketchpad/), [Darkroom on the Wayback Machine](https://web.archive.org/web/*/http://mugtug.com/darkroom/), and Lightbox. The suite has come a long way since I developed Sketchpad during a seven month work binge of Red-Bulls! Through the collaboration of many developers we’ve moved forwards to create an entire framework that blurs the line between “web-app” and “desktop-app”…

Due to my own budgetary constraints, and differing visions within the corporation, the time has come for me to move on from [Orange Honey on the Wayback Machine](https://web.archive.org/web/*/http://orangehoney.com/). The projects will continue under the direction of my good friend Charles Pritchard. He is without a doubt _the most_ knowledgable developer I’ve worked with.

The following highlight a few of my final contributions to Mugtug; made possible with HTML5;

- **Layer Styles**; this module creates effects such as _InnerShadow_, _OuterShadow_, _InnerGlow_, and _OuterGlow_.  These are similar to what Photoshop achieves, the difference is, my version has the ability to do what I’ve coined “style stacking”.  Style stacking allows the designer to add multiple fills (solid, gradient, pattern) to, for instance, InnerShadow;

[![Layer styles reference](images/5807041058_21caef727a_o.png "5807041058_21caef727a_o")](/journal/2011/07/orange-honey-epilogue/images/5807041058_21caef727a_o.png "Open full-size layer styles reference")

[![Layer styles screenshot](images/Screen-shot-2011-03-26-at-9.37.34-PM.png "Screen shot 2011-03-26 at 9.37.34 PM")](/journal/2011/07/orange-honey-epilogue/images/Screen-shot-2011-03-26-at-9.37.34-PM.png "Open full-size layer styles screenshot")

- **SVG Parser**; this module converts .svg files into `<canvas>` commands, accepting complex examples, supporting features from `&lt;gaussianblur&gt;` to the `&lt;use&gt;` element;

[![SVG parser screenshot](images/Screen-shot-2011-07-16-at-11.09.30-AM.png "Screen shot 2011-07-16 at 11.09.30 AM")](/journal/2011/07/orange-honey-epilogue/images/Screen-shot-2011-07-16-at-11.09.30-AM.png "Open full-size SVG parser screenshot")

This is an image from [OpenClipart](http://www.openclipart.org/detail/21763/sport-car-by-yves_guillou-21763) rendered in the SVG->Canvas parser;

[![OpenClipart rendered in SVG parser](images/Screen-shot-2011-07-16-at-11.08.19-AM.png "Screen shot 2011-07-16 at 11.08.19 AM")](/journal/2011/07/orange-honey-epilogue/images/Screen-shot-2011-07-16-at-11.08.19-AM.png "Open full-size OpenClipart render")

There is no Gaussian blur in HTML5’s `<canvas>`, and to do a “true” Gaussian blur takes a lot of processing, and computational time. I ended up using Mario Klingemann’s [StackBlur demo on the Wayback Machine](https://web.archive.org/web/*/http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html) to polyfill the support in the SVG parser, the results are pretty good; I think some of the blurring wasn’t turned up enough do to my own Matrix scaling issues. Canvas left, SVG right;

[![Gaussian blur comparison screenshot](images/Screen-shot-2011-03-14-at-12.41.25-AM.png "Screen shot 2011-03-14 at 12.41.25 AM")](/journal/2011/07/orange-honey-epilogue/images/Screen-shot-2011-03-14-at-12.41.25-AM.png "Open full-size blur comparison")

- **Radial Gradient**; this demo shows how fun radials and gradients can be.

[![Radial gradient demo screenshot](images/Screen-shot-2011-07-16-at-3.07.38-PM1.png "Screen shot 2011-07-16 at 3.07.38 PM")](/journal/2011/07/orange-honey-epilogue/images/Screen-shot-2011-07-16-at-3.07.38-PM1.png "Open full-size radial gradient demo")

- **Composite Erase**; this module creates a new composite mode, allowing you to erase colors based on the color of a brush;

[![Composite erase demo screenshot](images/Screen-shot-2011-07-16-at-3.13.14-PM.png "Screen shot 2011-07-16 at 3.13.14 PM")](/journal/2011/07/orange-honey-epilogue/images/Screen-shot-2011-07-16-at-3.13.14-PM.png "Open full-size composite erase demo")

- **Brushes**; this module adds some fun new brushes to play with, like galaxy (left);

[![Brushes demo screenshot](images/Screen-shot-2011-03-15-at-9.51.50-PM.png "Screen shot 2011-03-15 at 9.51.50 PM")](/journal/2011/07/orange-honey-epilogue/images/Screen-shot-2011-03-15-at-9.51.50-PM.png "Open full-size brushes demo")

- **Marquee**; this module creates a “magick wand” with marching ants, for selecting portions of an image, and modifying them with fills, filters, and other effects;

[![Marquee tool demo screenshot](images/Screen-shot-2011-07-16-at-3.12.37-PM.png "Screen shot 2011-07-16 at 3.12.37 PM")](/journal/2011/07/orange-honey-epilogue/images/Screen-shot-2011-07-16-at-3.12.37-PM.png "Open full-size marquee demo")
