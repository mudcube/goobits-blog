---
title: "HTML5: SoundFonts"
date: "2011-11-28"
categories: 
  - "open-source"
tags: 
  - "audio"
  - "html5"
  - "piano"
  - "webaudio"
---

[Color Piano Theory](https://chrome.google.com/webstore/detail/ihmigmmflfcbhdpdgbkkeojchjhhphnh) is now available on the Chrome Webstore. There haven’t been any major UI overhauls since [last reported](http://mudcu.be/journal/2011/01/color-piano-theory/), but there has been a lot of work going on the back-end! Most importantly moving from the Java interface to native HTML5 <audio> tag (as Java isn’t supported in the Chrome Webstore). Although this sounds like a simple task, there’s a lot of steps involved; hopefully this will save someone else a bit of trouble!

**Generating your own soundfont files;**

- [JSMIDI](https://github.com/sergi/jsmidi) will allow you to generate MIDI files with the MidiWriter package;

```js
	var key = 0x45; // the note A4
	var noteEvents = [];
	Array.prototype.push.apply(noteEvents, MidiEvent.createNote(key));
	var track = new MidiTrack({ events: noteEvents});
	var song  = MidiWriter({ tracks: [track] });
	console.log(song.b64);
```

- **Saving the MIDI files to disk;** [File Writer API](http://www.w3.org/TR/file-writer-api/) allows you to save those generated MIDI files to your hard-disk, or, alternatively (and a bit more simple in terms of programming), you could POST the base64 from an embedded `<iframe>` to .PHP, and write to the file-system;

```js
	var iframe = document.createElement("iframe");
	iframe.src = "index.php?midi=" + (song.b64) + "&key=" + key;
	document.body.appendChild(iframe);
```

```js
if ($_REQUEST['midi']) {
	$myFile = "./midi/".$_REQUEST['key'].".mid";
	$fh = fopen($myFile, "w") or die("can't open file");
	fwrite($fh, base64_decode(str_replace(' ','+',$_REQUEST['midi'])));
	fclose($fh);
	return;
}
```

- **Getting out of MIDI format;** At this point, we have a bunch of MIDI files. We need to eventually get these MIDI’s -> OGG format, by mapping it to a high-quality SoundFont;
    - _Older versions_ of iTunes allows you to batch convert from _MIDI’s_ -> _MP4’s_. That was very nice feature that seems to have disappeared…
    - Online app, such as [SolMire](http://solmire.com/), allow you to convert from _MIDI’s_ -> _MP3’s_ and other formats, one at a time. I especially like that SolMire allows you to choose the desired SoundFont to use on the .MIDI.
    - [MIDI2MP3](http://www.audiosoftstore.com/downloads.html) is a command line application available for Window and Mac OSX that enables you to use specific SoundFonts in your encodings, and allows you to use the command line… and therefore the ability for batch _MIDI_ -> _WAV_ conversion! [FluidSynth Soundfont GM](http://packages.debian.org/squeeze/fluid-soundfont-gm) is a good .SF2 file to get you started.
- **Getting into the OGG format;**
    - [Switch](http://www.nch.com.au/switch/index.html) (for Mac) allows you to convert from _WAV’s, MP4’s, and MP3’s_ -> _OGG’s_.
    - [oggenc](http://www.rarewares.org/ogg-oggenc.php) from Vorbis, allows you do batch conversion of _WAV’s_ -> _OGG’s_ using a bash script. The calls are like this:
        -  ./oggenc -m 64 -M 128 audio.wav
- **Converting the _OGG’s_ -> _base64_, and storing them in _.js_ or _.jgz_ file(s):**
    - Read this amazing Tutorial by the [Grinning Gecko](http://grinninggecko.com/html5-offline-audio/)!

The following code will allow you to take those MIDI files we created with the JSMIDI package (step #1) and convert them from WAV to OGG to JS to JGZ in seconds! Presenting a solution for the batch conversions of multiple MIDI’s into base64 soundfonts;

```bash
#!/bin/bash

# gzip     - http://www.gzip.org/
# base64   - http://www.fourmilab.ch/webtools/base64/
# oggenc   - http://www.rarewares.org/ogg-oggenc.php
# midi2mp3 - http://www.audiosoftstore.com/downloads.html

# from MIDI to WAV to OGG to JS to JGZ, and beyond!

find ./directory -name '*.mid' -print0 | while read -d $'\0' file
	do
		# from MIDI to WAV
		./inc/midi2mp3 $file -sf ./sf2/FluidSynth_1.43.sf2 -e wave
		# from WAV to OGG
		./inc/oggenc -m 64 -M 128 $file.wav
		# from OGG to base64 embedded in Javascript
		echo "if (typeof(Soundfont) === 'undefined') Soundfont = {};" > $file.js
		echo "Soundfont['`basename $file`'] = 'data:audio/mpeg;base64,`base64 -i $file.ogg -o -`';" >> $file.js
		# gzipped version
		gzip $file.js -c > $file.jgz
	done
```

Now you’re ready to create your own custom Soundfont =)