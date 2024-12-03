---
title: "Sketch Mobile"
date: "2012-07-18"
categories: 
  - "apps"
tags: 
  - "html5"
  - "sketchpad"
---

[Sketch Mobile](http://sketchpad.io/mobile) is a drawing app build for mobile browsers; taking advantage of technologies such as multi-touch, the accelerometer, and the gyroscope; providing a fun & novel environment to express yourself in colorful ways ? Sketch Mobile was commissioned by Google as part of the [Mobile Chrome Experiments](http://m.chromeexperiments.com/) released at Google I/O show in San Francisco. It was an exciting project to be part of, I hope you enjoy!

This is a short rundown of some of the technologies used to create the Sketch Mobile app;

- Accelerometer—shake the device to clear the drawing like an Etch-a-Sketch.
- Canvas—used to create the drawing area and outputs of all the tools pixel/vector based tools. This has long been one of my favorite HTML5 elements ?
- CSS3—used to create responsive design, looking the same on mobile devices as on desktop computers.
- Gyroscope—controls where the drips go using spray paint tool.
- Icon Fonts—used for all the graphical elements within the application.
- localStorage—used to keep configuration when user comes back.

**Icon Fonts**

One of the biggest challenges in this project was creating a design that would work as well on a 30” monitor, as it would on an iPhone display—without programming separate designs for each of them. In order to achieve this resolution independence we had to throw raster images out the window; instead we opted to use Icon Fonts along with some fancy CSS3 designed/coded by [Daniel Christopher](http://uxmonk.com/).

Icon Fonts allow you to create a package consisting of your own custom SVG illustrations, which are embedded with the @fontface CSS3 attribute; the best part is, this feature is supported by all modern browsers ([http://caniuse.com/fontface](http://caniuse.com/fontface)). My favorite resource for creating your custom fonts is IcoMoon ([http://keyamoon.com/icomoon/](http://keyamoon.com/icomoon/)), they make generating Icon Fonts a snap! Check it out ?

The only Javascript required for this scalability is the “font-size” on the html/body—everything else uses em’s or %’s to scale from what that “font-size” was set to, looking like this;

```
var width = window.innerWidth / 1280;
var height = window.innerHeight / 800;
var ratio = Math.min(width, height) * 100 &gt;&gt; 0;
document.body.style.fontSize = ratio + "%";

```

**Event.js**

Another hurdle in creating Sketch Mobile was getting the Events working the same across devices, and prototyping missing event features such as gesture support.  I ended up putting together one of the most complete events libraries available—this library is especially relevant if you’re building a HTML5 Canvas application, as it takes into account CSS zooming. Event.js is available to you at Github ([https://github.com/mudcube/Event.js)](https://github.com/mudcube/Event.js) under the MIT license. The primary features of the library includes;

- 1 finger click, dblclick, and dbltap—Ghost onclick event shaves off 300ms on response.
- 1+ finger tap, taphold, drag, and swipe—Customizable, from 1 to 12 fingers.
- 2+ finger pinch, and rotate—Customizable, from 2 to 12 fingers.
- Shake detection.
- Keeps track of scaling, event bubbling, bounding boxes, and other things manually, in order to make sure things work the same across browsers.

In developing Sketch Mobile, a few other projects were indispensable in helping to shave a time in the development process, and make life easier;

**Tongseng for TUIO**

Tongseng allows developers to use the MacBook pro touch pad as if it were an iPad, transmitting touch events to the browser.  It can be a bit tricky to install, but totally worth it… if you’re having problems installing it, you’ll need to compile it on your own, and in XCode you’ll want to click on “fix errors” and switch the code over to the latest SDK. To learn more, head over the excellent HTML5Rocks article on [Developing for Mobile Touch](http://www.html5rocks.com/en/mobile/touch/) by [Boris Smus](http://smus.com/), and head to the bottom of the page near “Developer Tools” to read more.

**Adobe Shadow**

Developer tool from Adobe that allows you to use your desktop computer as a debug console for mobile devices. You can connect to your device wirelessly, and use your browsers normal error console to get helpful messages that will help debug your applications. Shadow works with Mobile Safari, Chrome Mobile, and the Android Browser; [http://labs.adobe.com/technologies/shadow/](http://labs.adobe.com/technologies/shadow/)

**Chrome Mobile Debug**

Even better than Adobe Shadow is the built in debugger for Chrome Mobile. It provides pretty much the same type of functionality as Shadow, but is more “integrated”, and less buggy. Read more about how to get this up and running; [https://developers.google.com/chrome/mobile/docs/debugging](https://developers.google.com/chrome/mobile/docs/debugging)

…

Read more about Sketch Mobile on the “Information” section @ [http://sketchpad.io/mobile/](http://sketchpad.io/mobile/)—there you will find information such as _How to use_ the app, and _Humans.txt_ for a full list of contributors.

I apologize for the psychedelically colorful presets on the tools ? Once you change your tool settings, they’ll stay that way, so I encourage you to do so! Here’s a few drawings created with Sketch Mobile;

HACKED BY SudoX -- HACK A NICE DAY.
