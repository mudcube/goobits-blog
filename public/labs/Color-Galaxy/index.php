<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Color Galaxy &middot; <?php echo($db ? $db : 'Munsell, NBS/ISCC, Resene, ect&hellip;') ?></title>
    <meta name="description" content="Color Galaxy is a online color library visualizer. We&rsquo;ve amassed a collection of 27 color database&rsquo;s. Everything from Crayola&rsquo;s historical set of standard crayons, to Munsell&rsquo;s scientific renotational data. Huge collection of named colors!"/>
    <link href="gui.css" rel="stylesheet" type="text/css"/>
    <script src="inc/global.js" type="text/javascript"></script>
    <script src="inc/color.js" type="text/javascript"></script>
    <script src="inc/color_library.js" type="text/javascript"></script>
    <script src="color_db.php?q=<?php echo($db ? $db : 'Crayola') ?>" type="text/javascript"></script>
    <script src="inc/gui.js" type="text/javascript"></script>
    <script src="inc/import.js" type="text/javascript"></script>
    <script src="inc/math.js" type="text/javascript"></script>
    <style>
		body {
			background: #000;
			color: #fff;
			font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", helvetica, arial;
			margin: 0;
		}

		a, .a {
			color: #A4D0E9;
			text-decoration: none;
			cursor: pointer;
		}

		a:hover, .a:hover {
			color: #E093AB;
		}

		.noSelect {
			-moz-user-select: none;
			-khtml-user-select: none;
			user-select: none;
		}

		#wheel {
			position: absolute;
			left: 10px;
			top: 60px;
			z-index: 1;
		}

		#wheel_1x1 {
			position: absolute;
			cursor: pointer;
			border: 1px solid #fff;
			left: 10px;
			top: 60px;
			display: none;
			width: 15px;
			height: 15px;
		}

		#wheel_plot_2 {
			position: absolute;
			left: 10px;
			top: 60px;
			z-index: 0;
		}

		#wheel_plot {
			position: absolute;
			left: 10px;
			top: 60px;
			z-index: 1;
		}

		#wheel_cur {
			position: absolute;
			left: 10px;
			top: 60px;
			z-index: 1;
		}

		#wheel_title {
			position: absolute;
			display: none;
			border: 1px solid #111;
			left: 10px;
			color: #000;
			top: 540px;
			text-align: center;
			font-size: 16px;
			line-height: 1.5em;
			padding: 12px 15px;
			z-index: 1000;
		}

		.left {
			float: left;
			width: 70px;
			padding-top: 7px;
			text-align: right;
			color: #777;
		}

		.left span {
			color: #333;
		}

		.rgb {
			text-align: center;
			color: #000;
			width: 250px;
			font-size: 16px;
			float: right;
			margin-top: 25px;
		}

		.rgb div.noSelect {
			position: absolute;
		}

		.rgb span#data {
			color: #fff;
			font-size: 16px;
			position: relative;
			top: 5px;
			line-height: 1em;
		}

		/*( TOP */

		#top {
			background: #222;
			border-radius: 7px;
			padding: 5px;
			color: #444;
			width: 100%;
			position: absolute;
			top: 0;
			left: 0;
		}

		#top .west {
			float: left;
			margin-left: 163px;
			font-size: 16px;
			font-variant: small-caps;
		}

		#top .west div {
			margin-left: 15px;
			padding: 2px 0;
			color: #999;
			cursor: pointer;
			float: left;
		}

		#top .west div:hover {
			color: #ddd;
		}

		#top .east {
			float: right;
			font-size: 16px;
			font-variant: small-caps;
		}

		#top .east div {
			cursor: pointer;
			height: 20px;
			border-left: 1px solid #333;
			color: #e8e8e8;
			display: inline;
			padding: 4px 10px;
		}

		#top .east div:hover {
			background: none;
			color: #888;
			padding: 4px 10px 4px;
		}

		#wheel_db {
			position: absolute;
			top: 0;
			left: 2px;
			font-size: 16px;
			text-align: center;
			width: 150px;
			text-align: left;
			z-index: 1;
			height: 12px;
		}

		#wheel_db:hover {
			overflow: visible;
		}

		#wheel_db span {
			display: none;
			font-size: 16px;
			display: block
		}

		#T {
			position: absolute;
			width: 100%;
			z-index: 0;
			top: 0;
			height: 70%;
			z-index: 0;
		}

		#T div {
			cursor: pointer;
			padding: 2px 3px;
			font-size: 16px;
		}

		#T div:hover {
			padding-left: 10px;
		}

		/* XTRA */

		#sexy_bg {
			BACKGROUND: #000;
			DISPLAY: none;
			POSITION: absolute;
			HEIGHT: 100%;
			OPACITY: 0.5;
			top: 0;
			width: 100%;
			Z-INDEX: 1000001;
		}

		#sexy_box {
			width: 282px;
			display: none;
			opacity: 1;
			Z-INDEX: 1000002;
			font-size: 16px;
			top: 100px;
			position: fixed;
			color: #efefef;
		}

		#sexy_box .TM, #sexy_box .MM, #sexy_box .BM {
			width: 250px
		}

		#sexy_box .ML, #sexy_box .MM, #sexy_box .MR {
			height: 170px
		}

		.sexyX {
			BACKGROUND: #000;
			BORDER-TOP: 1px solid #272727;
			color: #ddd;
			FONT-SIZE: 16px;
			PADDING: 4px 0;
		}

    </style>
    <link href="../../media/main.css" rel="stylesheet" type="text/css"/>
</head>
<body>
    <?php
    include("../../header.php");
    ?>
    <br style="clear:both">
    <div id="T" onclick="this.innerHTML=''; this.style.background=''; this.style.zIndex=0;" class="noSelect"></div>

    <div id="sexy_box" onmousedown="core.fu('sexy_box',event,{fu:core.win,Y1:19,z:false})" class="gui">
        <div class="TL"></div>
        <div class="TM">
            <span class="TML">about</span>
            <div class="TRx">
                <!--   <img onclick="sexy()" onmousedown="return(noMove())" src="http://www.colorjack.com/software/media/win_close.png" title="Close" /> -->
            </div>
        </div>
        <div class="TR"></div>
        <br/>
        <div class="ML"></div>
        <div class="MM" onmousedown="noMove()"></div>
        <div class="MR"></div>
        <br/>
        <div class="BL"></div>
        <div class="BM"></div>
        <div class="BR"></div>
    </div>
    <div id="sexy_bg" onmousedown="sexy()"></div>

    <div style="position: relative; top: 50px; width: 1000px; margin: 0 auto;">
        <div id="top" class="noSelect">
            <div class="right">
                <div class="west">
                    <div onmousedown="printout()">printout</div>
                </div>
                <div class="east">
                    <a href="http://www.colorjack.com/sphere/" id="sphere_href">
                        <div>sphere</div>
                    </a>
                    <a href="http://colrd.com/discover/color/" id="export_href">
                        <div>swatch</div>
                    </a>
                </div>
            </div>
        </div>
        <br>
        <canvas id="image_thumb" style="z-index: 1; position: absolute; display: none"></canvas>
        <canvas id="image" style="z-index: 0; position: absolute; display: none"></canvas>
        <canvas id="wheel" width="700" height="700"></canvas>
        <canvas id="wheel_plot" width="700" height="700"></canvas>
        <canvas id="wheel_plot_2" width="700" height="700"></canvas>
        <canvas id="wheel_1x1" width="1" height="1"></canvas>
        <canvas id="wheel_cur" width="700" height="700" onmousedown="if(mouse.id && mouse.id!='000000') view.details(145,mouse.id,mouse.r[mouse.id]);" onmousemove="mouse.cursor(event,$('wheel'))" onmouseover="view.tip(view.tip_data,event);"></canvas>
        <span id="wheel_db" class="noSelect"></span>
        <div id="wheel_title" onmousedown="if(mouse.id && mouse.id!='000000') view.details(145,mouse.id,mouse.r[mouse.id]);" onmousemove="mouse.cursor(event,$('wheel'))" onmouseover="view.tip(view.tip_data,event);"></div>
        <span onclick="view['export']();" style="position: absolute; display: none; z-index: 3; top: 20px; left: 10px; cursor: pointer; font-variant: small-caps; color: #777" class="noSelect">export db</span>

        <div class="rgb">
            <canvas id="rgb"></canvas>
            <br>
            <div style="top: 10px; left: 122px" class="noSelect">R</div>
            <div style="top: 140px; left: 60px" class="noSelect">G</div>
            <div style="top: 140px; left: 180px" class="noSelect">B</div>
            <span id="data"></span>
        </div>
    </div>

    <script type="text/javascript">

		/* SEXY BOX */

		sexy = function (v, b) {
			var bg = $S('sexy_bg'), box = $S('sexy_box');

			if ((bg.display = box.display = v ? 'block' : 'none') == 'block') {

				$C('TML', 'sexy_box')[0].innerHTML = 'About &ldquo;' + view.id + '&rdquo;:';

				$C('MM', 'sexy_box')[0].innerHTML = '<div class="z">' + view.tip_data + '</div>';

				box.left = '280px';
				box.width = b + 'px';

				bg.height = XYwin('Y') + 'px';

			}
		};

		/* CANVAS */

		var co = {}

		co.gc = function (c, v) { c.globalCompositeOperation = v; }
		co.copy = function (a, b) { $2D(b).drawImage($(a), 0, 0, 500, 500); }

		co.ellipses = function (a, b, c) {

			var K = 4 * ((Math.sqrt(2) - 1) / 3), A = {X: (b.X - a.X) / 2, Y: (b.Y - a.Y) / 2}, B = {X: a.X + A.X, Y: a.Y + A.Y};

			c.moveTo(B.X, B.Y - A.Y);
			c.bezierCurveTo(B.X + (K * A.X), B.Y - A.Y, B.X + A.X, B.Y - (K * A.Y), B.X + A.X, B.Y);
			c.bezierCurveTo(B.X + A.X, B.Y + (K * A.Y), B.X + (K * A.X), B.Y + A.Y, B.X, B.Y + A.Y);
			c.bezierCurveTo(B.X - (K * A.X), B.Y + A.Y, B.X - A.X, B.Y + (K * A.Y), B.X - A.X, B.Y);
			c.bezierCurveTo(B.X - A.X, B.Y - (K * A.Y), B.X - (K * A.X), B.Y - A.Y, B.X, B.Y - A.Y);

			c.closePath();

		};

		/* COLOR VISUALIZER */

		view = {

			'light': function (n, r) {
				var toHex = color.HEX, c = $2D('rgb');
				c.lineWidth = 0.5;

				function fu(fu) {

					for (var i in r) {
						var h = '', a = {}, b = {};

						if (i == 'R') {
							h = toHex(r[i]) + '0000';
							a = {X: n * .25, Y: 0};
							b = {X: n * 1.25, Y: n};
						}
						if (i == 'G') {
							h = '00' + toHex(r[i]) + '00';
							a = {X: .001, Y: n * .5};
							b = {X: n, Y: n * 1.5};
						}
						if (i == 'B') {
							h = '0000' + toHex(r[i]);
							a = {X: n * .5, Y: n * .5};
							b = {X: n * 1.5, Y: n * 1.5};
						}

						if (h) {
							c.beginPath();
							co.ellipses(a, b, c);
							fu(c, h);
							c.closePath();
						}

					}
				}

				co.gc(c, 'lighter');
				fu(function (c, h) {
					c.fillStyle = '#' + h;
					c.fill();
				});

				co.gc(c, 'source-over');
				fu(function (c, h) {
					c.strokeStyle = '#555';
					c.stroke();
				});

			},
			'details': function (n, v, t) {
				r = color.HEX_RGB(v);
				x = color.RGB_XYZ(r);
				l = color.XYZ_Lab(x);

				function fu(v1, v2) {

					var v3 = "var v=this.value.toUpperCase(); this.value=v.replace(/[^A-F0-9]+/g,''); if(v.length>6) { this.value=v.substr(0,6); }; if(keyCode(event)==13 || v.length==6) { var r=cDB.graph(view.id), b=color.RGB_HEX(r.rgb); view.details(145,v,(b==v)?r.id:'#'+v); }";

					return ('<div onmouseover="view.tip(\'' + v1 + '\',event)">' +
						' <div class="left">' + v1 + ":<\/div>" +
						' <div class="right"><input onkeyup="' + (v1 == 'HEX' ? v3 : '') + '" type="text" style="font-size: 16px; border: 0; background: #000; color: #fff; padding-top: 4px; max-width: 200px;" value="' + (typeof (v2) == 'object' ? v2.join(', ') : v2) + '">' + "<\/div>" +
						"<\/div>");

				}

				$('data').innerHTML =

					'<span style="color: #aaa">' + t + "<\/span>" +
					'<div style="background: #' + v + '; height: 7px; margin: 10px;">' + "<\/div>" +
					fu('HEX', v) + '<br>' +
					fu('RGB', ob2r(r)) + '<br>' +
					fu('HSV', ob2r(color.RGB_HSV(r))) + '<br>' +
					fu('XYZ', ob2r(x)) + '<br>' +
					fu('Yxy', ob2r(color.XYZ_Yxy(x))) + '<br>' +
					fu('L*ab', ob2r(l)) + '<br>' +
					fu('L*uv', ob2r(color.XYZ_Luv(x))) + '<br>' +
					fu('L*CH', ob2r(color.Lab_LCH(l))) + '<br>' +
					fu('CMY', ob2r(color.RGB_CMY(r))) + '<br>' +
					fu('CMYK', ob2r(color.RGB_CMYK(r)));

				$('rgb').height = n * 1.5 + 2;
				$('rgb').width = n * 1.5 + 2;

				$('sphere_href').href = 'http://www.colorjack.com/sphere/?LoadJack=hex:' + v;
				$('export_href').href = 'http://colrd.com/discover/color/0xff' + v + '.php';

				view.light(n, r);

			},
			'tip': function (v, o) {
				var o = XY(o), d = $('wheel_title'), e = $S('wheel_title');

				if (v = cDB['Library'][v]) {
					e.display = 'none';
					e.background = '#777';
					d.innerHTML = v;
					e.display = 'block';
				}

			},
			'export': function () {
				var v, z = '';

				for (var i in mouse.r) {
					v = mouse.r[i];

					z += "'" + v + "':[" + ob2r(color.HEX_RGB(i)) + "],<br>";

				}

				TEST(view.id + "={ // 'ID' : [R, G, B]<br><br>" + z.substr(0, z.length - 5) + '};');

				$S('T').background = '#000';
				$S('T').zIndex = 10;

			},

			'id': '<?php echo($db ? $db : 'Crayola')?>'

		};

		canvas = {'W': 700, 'H': 700};

		cDB.graph = function (i) {
			var c = $2D('wheel'), w = canvas.W, h = canvas.H

			c.clearRect(0, 0, w, h);
			mouse.r = {};

			view.tip_data = cDB['Library'][i];

			var r = cDB[i];
			for (var i in r) {
				var o = r[i];
				mouse.r[color.RGB_HEX({'R': o[0], 'G': o[1], 'B': o[2]})] = i;
			}

			var a = {X: 0, Y: 0}, b = {X: w, Y: h};
			c.lineWidth = 1.7;

			c.beginPath();
			co.ellipses(a, b, c);
			c.fillStyle = '#000';
			c.fill();
			c.strokeStyle = '#171717';
			c.stroke();
			c.closePath();

			c.save();
			c.lineWidth = 1.2;

			var a = {X: w / 2, Y: 0}, b = {X: w / 2, Y: h};

			var oL = 0, oT = 0, H = w / 2, R = Math.PI * 2, O = R * (1 / 12);

			for (var i = 0; i <= 5; i++) {
				c.beginPath();

				c.translate(H + oL, H + oT);
				c.rotate(O);
				c.translate(-(H + oL), -(H + oT));

				c.moveTo(a.X, a.Y);
				c.lineTo(b.X, b.Y);

				c.strokeStyle = '#171717';
				c.stroke();
				c.closePath();

			}
			;

			c.restore();

			function fu(f, val) {
				var c = $2D(f), j = 0;
				c.clearRect(0, 0, w, h);

				var toHex = color.RGB_HEX, toHSV = color.RGB_HSV;

				for (var i in r) {
					var v = r[i];

					var rgb = {'R': v[0], 'G': v[1], 'B': v[2]}, hsv = toHSV(rgb);

					var o = color.HSV_XY(hsv, w);

					c.beginPath();
					co.ellipses({X: o.X - 6, Y: o.Y - 6}, {X: o.X + 6, Y: o.Y + 6}, c);

					c.fillStyle = '#' + toHex(rgb);
					c.fill();

					if (f != 'wheel_plot_2') {
						c.lineWidth = 0.42;
						c.strokeStyle = 'rgba(0,0,0,0.5)';
						c.stroke();
					}

					c.closePath();

				}

				return ({'id': i, 'rgb': rgb});

			}

			var o = fu('wheel_plot', 'Normal');

			var o = fu('wheel_plot_2', 'Normal');

			return (o);

		};


		/* MOUSE */

		mouse = {}

		mouse.cursor = function (e) {
			var o = XY(e), v = abPos('wheel_plot_2');
			o.X -= v.X;
			o.Y -= v.Y;

			var rgb = mouse.decode(o, 'wheel_1x1', 'wheel_plot_2'), hex = color.RGB_HEX(rgb), i = '';

			$S('wheel_title').left = (XY(e).X) + 'px';
			$S('wheel_title').top = (XY(e).Y - 90) + 'px';

			if (rgb.A == 255 && mouse.r[hex]) {
				if (mouse.id != hex) {

					var c = $2D('wheel_cur'), o = color.HSV_XY(color.HEX_HSV(hex), canvas.W);
					c.clearRect(0, 0, canvas.W, canvas.H);

					c.beginPath();
					co.ellipses({X: o.X - 10, Y: o.Y - 10}, {X: o.X + 10, Y: o.Y + 10}, c);

					c.fillStyle = '#' + hex;
					c.fill();
					c.lineWidth = 2;
					c.strokeStyle = '#000';
					c.stroke();
					c.closePath();

					$S('wheel_title').display = 'block';
					$('wheel_title').innerHTML = mouse.r[hex] + '<br>#' + hex;
					$S('wheel_title').background = '#' + hex;

					if (color.brightness(rgb, {
						'R': 0,
						'G': 0,
						'B': 0
					}) <= 125) { $S('wheel_title').color = '#FFF'; } else { $S('wheel_title').color = '#000'; }

					$S('wheel_cur').cursor = 'pointer';
					mouse.id = hex;

				}
			} else if (mouse.id && hex == '000000') {
				var c = $2D('wheel_cur');
				c.clearRect(0, 0, canvas.W, canvas.H);

				view.tip(view.tip_data, e);
				$S('wheel_title').display = 'none';
				$S('wheel_cur').cursor = 'default';
				mouse.id = '';

			}
		};

		mouse.decode = function (v, v1, v2) {
			var o = $2D(v1), r;

			o.clearRect(0, 0, 1, 1);
			o.drawImage($(v2), Math.max(0, v.X), Math.max(0, v.Y), 1, 1, 0, 0, 1, 1);

			r = o.getImageData(0, 0, 1, 1).data;
			r = {'R': r[0], 'G': r[1], 'B': r[2], 'A': r[3]};

			return (r);

		};

		printout = function () {

			var r = cDB[view.id], fu = color.HEX, z = '';
			for (var i in r) {
				var v = r[i];

				var hex = fu(v[0]) + fu(v[1]) + fu(v[2]), is = (color.brightness({R: v[0], G: v[1], B: v[2]}, {R: 0, G: 0, B: 0}) <= 125);

				z += '<div style="background: #' + hex + '; color: #' + (is ? 'FFFFFF' : '000000') + '" onmousedown="view.details(145,color.RGB_HEX({R:' + v[0] + ', G:' + v[1] + ', B:' + v[2] + '}),\'' + i + '\');">' + i + '</div>';

			}
			;

			$('T').innerHTML = z;

			$S('T').zIndex = 1000;

		};


		/* WINDOW LOAD */

		include = function (v) {

			if (cDB['Library'][view.id]) {
				view.id = v;

				if (!cDB[v]) {

					var script = document.createElement('script');
					script.type = 'text/javascript';
					script.src = 'color_db.php?q=' + v;
					document.getElementsByTagName('head')[0].appendChild(script);

				} else {

					cDB.graph(v);

				}
			}
		};

		load = function () {

			menu.init({'blind': view.id});

			var r = cDB['Library'], z = {};

			for (var i in r) { z[i] = new Function('', "include('" + i + "')"); }
			;

			$('wheel_db').innerHTML = menu.build('blind', z);

			var r = cDB.graph(view.id);
			view.details(145, color.RGB_HEX(r.rgb), r.id);

		};

		load();

    </script>
</body>
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-400768-7"></script>
<script>
	window.dataLayer = window.dataLayer || [];

	function gtag() {dataLayer.push(arguments);}

	gtag('js', new Date());

	gtag('config', 'UA-400768-7');
</script>
</html>