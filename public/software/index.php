<?php

function processData($r) { 
	$root = "../";
	$r=explode("\n",$r); $z='';
	foreach($r as $v) { 
		$v=explode(' :: ',$v);
		if (substr($v[4], 0, 4) == "http") {
			$imgsrc = $v[4];
		} else {
			$imgsrc = $root.$v[4];
		}
		$dashboard = isset($v[5]) ? '<a href="'.$v[5].'" target="_blank" title="Mac Widget"><img src="'.$v[6].'" style="width: 32px; float: right; "></a>' : '';
		$chrome = isset($v[7]) ? '<a href="'.$v[7].'" target="_blank" title="Chrome App"><img src="'.$v[8].'" style="width: 32px; float: right; "></a>' : '';
		$link = $v[3] ? '<a href="'.$v[3].'" target="_blank" title="Online Application"><img src="../media/softwareWeb.png" style="width: 32px; top: 1px; position: relative; float: right; "></a>' : '';
		$image = $v[4]?'<img src="'.$imgsrc.'" width="150" align="left">':'';
		$ahref = '<a href="'.$v[3].'" target="_blank" class="square" title="'.$v[1].'">';
		$z.='<h2 style="font-family: Oswald, \'Lucida Grande\'; text-transform: uppercase;">'.$ahref.$v[1].'</a>'.$link.$dashboard.$chrome.'</h2><div class="square">'.$ahref.$image.'</a>'.$v[2].'</div>';
	}
	return $z;
};

// globals
$localhost = ($_SERVER['HTTP_HOST'] == 'localhost') ? true : false;
$path = explode("/", substr($_SERVER['REQUEST_URI'], $localhost ? 10 : 1));
$root = $localhost ? "http://localhost/mudcu.be/" : "/";

// path -> ltree
$path[0] = ($path[0] == "") ? "index" : $path[0]; // homepage
if($path[count($path) - 1] == "") array_pop($path); // directories
$path = str_replace(".html", "", implode($path, ".")); // ltree
$url=explode(".",$path);

////////

if (!isset($z)) $z = (object) 'z';

$z->title='Software';

$data = <<<X
2013/10/24 :: Sketchpad 3.0 :: Sketchpad is a free application allowing you to create beautiful landscapes and images. Sketchpad includes a number of drawing tools, including the <i>Text, Shape, Spirograph, Brush, Calligraphy, Pencil, Paint-Bucket, and Stamp</i> tool. It also includes generic drawing utilities, such as the <i>Marquee, Crop, Eraser, and Color-Picker</i> tools. :: https://sketch.io/sketchpad/ :: media/zSketchpad.jpeg :: https://chrome.google.com/webstore/detail/kkghjbajgkcialbbimbifdcjilhcgoim :: ../media/softwareChrome.png
2010/09/15 :: Color Piano 2.0 :: Color Piano Theory (CPT) ties together chords, scales, inversions, octaves, and key signatures. CPT is a visual interface for learning the keyboard. Memorize information by giving it <i>multiple associations</i>; in turn giving the information multiple &ldquo;pathways&rdquo; for the brain to locate it. With color added to the mix, our brains can build a memory recognition triangulation: sound&mdash;measured in <i>hz</i>, color&mdash;measured in <i>RGB</i>, and space&mdash;the <i>XY</i> coordinate of key on the keyboard. CPT also provides the solf&#232;ge, <i>do, re, mi, fa, sol, la, ti, and so on</i>, to help people learn to sing by using the piano and a familiar sound to tune their voice. :: /piano/ :: media/zPiano.jpeg :: http://www.apple.com/downloads/dashboard/music/pianotheory.html :: ../media/softwareDashboard.png :: https://chrome.google.com/webstore/detail/ihmigmmflfcbhdpdgbkkeojchjhhphnh :: ../media/softwareChrome.png
2010/09/15 :: ColRD: Gradient Creator :: Dazzling gradients are at your fingertips. This unique interface allows you to think of gradients as blocks of color, in the same way you would create palettes of color. Drag & drop GIMP&rsquo;s .ggr format into your browser to view and edit instantly! Export into <i>CSS, GGR</i>, or create your own personalized <i>Gradient Desktop Wallpaper</i>. :: http://colrd.com/create/gradient/ :: media/zCreateGradients.jpeg :: https://chrome.google.com/webstore/detail/hcplneddoadgichngfbobgpllfphdfla :: ../media/softwareChrome.png
2010/09/15 :: ColRD: Palette Creator :: A natural progression from the Color creator, the palette creator allows you to <i>add, remove, and organize collections of colors</i> in your browser. You can then save them to ColRD, as with the Gradient and Palette creators, or export them into <i>CSS, JPEG, Photoshop or Illustrator</i> formats for use in your projects. :: http://colrd.com/create/palette/ :: media/zCreatePalettes.jpeg :: https://chrome.google.com/webstore/detail/fdadlpmlbimjjlpdknpjoejgedagffhg :: ../media/softwareChrome.png
2010/09/15 :: ColRD: Color Creator :: Discover colors in full-screen glory. Click almost anywhere on the screen to edit your color in multiple ways, including <i>Red, Green, Blue, Hue, Saturation, Luminance, and Alpha</i>. Use the similar colors swatch to find colors within the Websafe color spectrum closest matching the color you&rsquo;re viewing. Save your color to ColRD, and share your creation with people from across the web-o-sphere! :: http://colrd.com/create/color/ :: media/zCreateColors.jpeg :: https://chrome.google.com/webstore/detail/fjphfihfjambfacmkdbeamlommleaeon :: ../media/softwareChrome.png
2010/09/15 :: Background Generator :: Background Generator provides the ability to edit the background of any website in real-time! BG allows you to create fancy backgrounds without getting dirty with Photoshop, GIMP, ect. The project includes a collection of textures (wood, rust, paper, concrete and so-on) which are combined with custom linear-gradients and colors to create a wide assortment of themes. BG outputs valid CSS3 code, and also supports older browsers back to CSS1 by generating JPEGs. :: /bg/ :: media/zBackgroundGenerator.jpeg
2007/06/04 :: Color Sphere :: Color Sphere allows you to visualize color harmonies, supporting eighteen unique formulas. Color Sphere also allows you to visualize color blindness simulations, to get an idea of the accessibility of your palette. You can break the color space down to Websmart or Websafe colors, to ensure compatibility. You can even export your palette to Photoshop or Illustrator. Hands down, a fun way to view color harmonies. :: /sphere/ :: media/zSphere.jpeg :: http://www.apple.com/downloads/dashboard/reference/colortheory.html :: ../media/softwareDashboard.png :: https://chrome.google.com/webstore/detail/knomilfbnhpkmibhmleppnkmcempglag :: ../media/softwareChrome.png
2010/09/15 :: Daltonize :: Daltonization is a process performed by the computer that allows people with color vision deficiencies to distinguish a range of detail they are otherwise excluded from perceiving. For instance, in the daltonization of an Ishihara test plate (a popular test of color vision) numbers emerge from a pattern that were once invisible to the color blind person. This set of bookmarklets allows users to daltonize, or simulate color blindness on any websites image content. :: http://daltonize.appspot.com :: media/zDaltonize.jpeg :: https://chrome.google.com/extensions/detail/efeladnkafmoofnbagdbfaieabmejfcf :: ../media/softwareChrome.png
X;

$content = processData($data);

$z->body= <<<X
 <link href="{$root}software/style.css" rel="stylesheet" type="text/css" />
	<div id="colorspy" style="width: 660px;">
		<span class="header">Free Software</span>
		{$content}
	</div>
	<div id="colorspy" style="float: right; width: 300px; border-radius: 7px; padding-bottom: 0; margin-bottom: 30px; ;">
		<span class="header">Free Code</span>
		<a href="https://github.com/mudcube/Color.Picker.js/tree/master/Mini-Sphere" class="square"><h2>Color Picker - Sphere</h2></a>
		<a href="https://github.com/mudcube/Color.Picker.js/tree/master/Classic" class="square"><h2>Color Picker - Classic</h2></a>
		<a href="https://github.com/mudcube/Color.Picker.js/tree/master/HSL+RGBA" class="square"><h2>Color Picker - HSL</h2></a>
		<a href="../labs/index.php?dir=Color%2FVision" class="square"><h2>Color Vision</h2></a>
	</div>
	<div id="colorspy" style="float: right; width: 300px; border-radius: 7px; padding-bottom: 0; margin: 0; margin-bottom: 30px; ;">
		<span class="header">Tutorials</span>
		<a href="/journal/2011/11/bitwise-gems-and-other-optimizations/" class="square"><h2>HTML5: Bitwise Gems</h2></a>
		<a href="/journal/2011/11/base64-soundfonts" class="square"><h2>HTML5: SoundFonts</h2></a>
		<a href="http://www.html5rocks.com/en/tutorials/canvas/texteffects/" class="square"><h2>HTML5: Text Effects</h2></a>
		<a href="/journal/2011/01/html5-typographic-metrics/" class="square"><h2>HTML5: Typographic Metrics</h2></a>
	</div>
X;

$z->footer = <<<X
<img src="../media/softwareWeb.png" width="32" align="absmiddle">, <img src="../media/softwareChrome.png" width="32" align="absmiddle"> and <img src="../media/softwareDashboard.png" width="32" align="absmiddle"> provided by <a href="http://IconFinder.com">IconFinder.com</a>
X;

include('../z.php');

?>