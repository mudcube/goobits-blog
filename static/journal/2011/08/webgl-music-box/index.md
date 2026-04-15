---
title: "Music Box"
date: "2011-08-08"
categories: 
  - "apps"
tags: 
  - "html5"
  - "piano"
  - "webgl"
coverImage: "images/hero.png"
---

Last weekend I got a chance to mess around with [Mr. Doob](http://mrdoob.com/)’s rendering framework [Three.js](https://github.com/mrdoob/three.js/) and [Daniel van der Meer](http://www.abumarkub.net/abublog/)’s amazing [MIDIBridge](https://github.com/abudaan/javascriptmidi).  I’ve been a big fan of both Ricardo and Daniel for some time now, so it was fun to work with their codebases.

Three.js is a lightweight 3D engine that can render in `<canvas>`, `<svg>` and WebGL.  Ricardo (Mr. Doob) claims this framework is written “for dummies”, which is perfect for me, because that is exactly where I’m at with 3D programming.  Creating this wall of interactive color blocks was simple with Three.js.

MIDIBridge allows Javascript to connect to Java’s internal MIDI synthesizer. The author, Daniel, is working on a Javascript to Flash bridge that uses SoundFont2 to map amazing libraries of sound.  There are thousands of SoundFont2 patches available, which opens up the doors to all sorts of new creativity.  The framework is easy to tie into by sending direct midi messages to specific channels.  For instance, the message code 128 turns the note off whereas 144 turns it on.

[Matt West](http://matt.west.co.tt)’s MIDI file reader [jasmid](https://github.com/gasman/jasmid) was extremely useful to parse the MIDI files from the server on the client-side using Javascript.  I’ve tweaked the script slightly to allow for pausing, and resuming of songs.  The collection of royalty free classical piano pieces comes from [Disklavier World](http://www.kuhmann.com/Yamaha.htm).  Thank you to all, amazing contributions!

Here’s the [WebGL Music Box](/labs/) that reads a selection of classical music such as Tchaikovsky’s Waltz of the Flowers from the Nutcracker. And then there is the [interactive](/labs/) version that you can control the notes with your mouse.

This demo has been tested on Mac in Google Chrome, Safari, and Firefox.
