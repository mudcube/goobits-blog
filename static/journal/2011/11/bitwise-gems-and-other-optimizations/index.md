---
title: "Bitwise Gems and other optimizations"
date: "2011-11-07"
categories: 
  - "open-source"
tags: 
  - "canvas"
  - "javascript"
---

[![Emerald theme manager screenshot](images/1320621615_emerald-theme-manager1.png "1320621615_emerald-theme-manager")](/journal/2011/11/bitwise-gems-and-other-optimizations/images/1320621615_emerald-theme-manager1.png "Open full-size emerald theme manager screenshot")One of my favorite posts in the last few years was [Bitwise Gems in AS3](http://lab.polygonal.de/2007/05/10/bitwise-gems-fast-integer-math/) by _Polygonal Labs_, an article inspired by [Bitwise Operations in C](http://www.gamedev.net/reference/articles/article1563.asp) on _Gamedev_. This article is a summery of what I’ve learned, applied to Javascript, plus a few other tricks.

**What’s the wisdom in using bit_wise_?**

Bitwise operations can be moderately faster than conventional methods. When processing a lot of data, even a 5% increase in speed can become noticeable. A good example of where you would want to use bitwise operations is in the pixel-manipulation of a _`<canvas>` element_, especially when dealing with larger dimensions. When you add up all speed improvements here, and then multiply that by each user that uses your application around the world, we could be talking about _years of time saved!_ (in the collective sense).

Standard operation on the (left) === (right) is bitwise or an alternative method such as replacing Math.max(a, b) with (a > b ? a : b). All speed results are measured in Javascript using _Google Chrome 15_. Without further ado;

**Minimize calls to new Object() and new Array();**  
_+/- 50% **faster** using flat-variables, not bitwise, but still wise._

```
var rgb = { R: 255, G: 0, B: 0 }; // slow.
var rgb = [ 255, 0, 0 ]; // faster by 40%
var R = 255, G = 0, B = 0; // faster by 50%

```

\[2-23-2012\] Updated as per [Closure Compiler](https://groups.google.com/group/closure-compiler-discuss/browse_thread/thread/f7a4bc71f35461e3) group discussion.  
**Rounding, flooring, and ceiling with bit-shifting;**  
_+/- 20% **faster** using bitwise operations._

```
var n = Math.PI;
Math.round(n) === n + (n < 0 ? -0.5 : 0.5)>>0
Math.ceil(n) === n + (n < 0 ? 0 : 1) >> 0;
Math.floor(n) === n + (n < 0 ? -1 : 0) >> 0;

```

Or, if you’re certain the number will be positive (for example dealing with pixel values):

```
var n = Math.PI;
Math.round(n) === (n + 0.5) >> 0;
Math.ceil(n) === (n + 1) >> 0;
Math.floor(n) === n >> 0;

```

**Storing mathematic constants in local variables;**  
_+/- 15% **faster** than not doing it, just a reminder.

```
var E = Math.E;
var PI = Math.PI;
var SQRT2 = Math.SQRT2;
var SQRT1_2 = Math.SQRT1_2;
var LN2 = Math.LN2;
var LN10 = Math.LN10;
var LOG2E = Math.LOG2E;
var LOG10E = Math.LOG10E;

```

**Fast modulo operation using bitwise AND (&);**  
_+/- 15% **_faster_** using bitwise operations.  
_

```
var numerator = 99999;
var divisor = 4; // divisor must be power of 2
(numerator % divisor) === (numerator & (divisor - 1));

```

**Math.max & Math.min;**  
_+/- 15% **faster** using alternate operations._

```
Math.max(a, b) === (a > b) ? a : b;
Math.min(a, b) ===  (a < b) ? a : b;

```

**Math.abs;**  
_+/- 10% **faster** using bitwise, or alternate operations.  
The best solution here is not the bitwise operation, nor Math.abs()._

```
var n = 99999;
var n = Math.abs(n);
var n = n > 0 ? n : -n; // +/- 10%
var n = (n ^ (n >> 31)) - (n >> 31); // +/- 3%

```

**Test for even/uneven integers using bitwise AND;**  
_+/- 10% **faster** using bitwise operations._

```
var n = 99999;
((n % 2) == 0) === ((n & 1) == 0);

```

**Multiply by any power of two using left bit-shifting;**  
_+/- 5% **faster** using bitwise operations._

```
var n = 99999;
(n * 2) === (n << 1);
(n * 64) === (n << 6);

```

**Divide by any power of two using right bit-shifting;**  
_+/- 5% **_faster_** using bitwise operations._

```
var n = 99999;
(n / 2) === (n >> 1);
(n / 64) === (n >> 6);

```

**Swap integers without a temporary variable using XOR (^);**  
_+/- 5% **faster** using bitwise operations._

```
var a = 1, b = 2;
// standard
var tmp = a;
a = b;
b = tmp;
// bitwise
a ^= b;
b ^= a;
a ^= b;

```

**Sign flipping using NOT (~) or XOR (^);**  
_+/- 2% **_faster_** using bitwise operations._

```
var n = 99999;
(-n) === (~n + 1);

```

**HEX -> RGB conversion;**

```
// 24-bit
var hex = 0x336699;
var r = hex >> 16;
var g = hex >> 8 & 0xFF;
var b = hex & 0xFF;

// 32-bit
var hex = 0xff336699;
var r = hex >> 24;
var g = hex >> 16 & 0xFF;
var b = hex >> 8 & 0xFF;
var a = hex & 0xFF;

```

**RGB -> HEX conversion;**

```
// 24-bit
var r = 0x33;
var g = 0x66;
var b = 0x99;
var hex = r << 16 | g << 8 | b;

// 32-bit
var r = 0x33;
var g = 0x66;
var b = 0x99;
var a = 0xff;
var hex = a << 24 | r << 16 | g << 8 | b;

```

**Fast color conversion from R5G5B5 to R8G8B8 pixel format;**

```
var R8 = (R5 << 3) | (R5 >> 2);
var G8 = (R5 << 3) | (R5 >> 2);
var B8 = (R5 << 3) | (R5 >> 2);

```

The speed-tests were done with the following code.

```
// lets pretend were running it on a image 1000x1000 pixels
var size = 1000 * 1000;
// example code
var bit1 = "Math.round(Math.PI)"; // standard
var bit2 = "(Math.PI + 0.5) >> 0"; // bitwise
// create the speedtest
function createFunction(f) {
	return '(function() { 
	   var t = (new Date()).getTime();
	   for (var n = 0; n < size; n ++) { '+f+' }
	   return t - (new Date()).getTime();
	});';
};
var timeFunctions = {
	a: eval(createFunction(bit1)),
	b: eval(createFunction(bit2))
};
var timeData = { };
//
function getAverage(type) {
	var loops = 10;
	var loopid = 0;
	var average = 0;
	function go() {
		if (loopid ++ == loops) {
			timeData[type] = average/loops;
			if (type == "a") { // get next
				setTimeout(function() { getAverage("b"); }, 1);
			} else { // complete
				var speedGain = ((timeData.a / timeData.b - 1) * 100 + 0.5);
				console.log(speedGain + "%");
			}
			return;
		}
		average += timeFunctions[type]();
		// setTimeout so browser can rest one loop
		setTimeout(function() { go(type); }, 1);
	};
	go();
};
setTimeout(function() { getAverage("a"); }, 1);

```

There are 10 loops \* (1000×1000 pixels) = 10 million iterations are used to get the average execution speed of each function. setTimeout is clear the CPU, and prevent the previous loop from interfering with the next loop.

**Further optimizations;**

- Replace **_Math.random_** with _Park Miller (1988) [“minimal standard” linear congruential pseudo-random number generator](http://www.firstpr.com.au/dsp/rand31/)._ This is also handy because the results are replicable by the seed you originally send it.
- Pre-calculate as much math as possible;
    - var RAD2DEG = 180 / PI;
    - var DEG2RAD =  1 / RAD2DEG;
    - …and so on…
- When using [Color Matrices](http://en.wikipedia.org/wiki/Color_balance#Mathematics_of_color_balance) store the values of the matrix to local-variables (m0, m1, m2, m3… ect) before looping the pixels.
- Use function calls sparingly; when speed is critical, instead of calling a function, use the contents of the function hard coded into your for() or while() loops. Choose where your line between readability, redundancy, and speed lies.

**What optimizations do you use in your _graphics_ or _audio_ applications?**
