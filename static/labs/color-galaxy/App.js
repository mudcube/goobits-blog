/* SEXY BOX */

sexy = function (v, b) {
	var bg = $S('sexy_bg'), box = $S('sexy_box')

	if ((bg.display = box.display = v ? 'block' : 'none') === 'block') {

		$C('TML', 'sexy_box')[0].innerHTML = 'About &ldquo;' + view.id + '&rdquo;:'

		$C('MM', 'sexy_box')[0].innerHTML = '<div class="z">' + view.tip_data + '</div>'

		box.left = '280px'
		box.width = b + 'px'

		bg.height = XYwin('Y') + 'px'

	}
}

/* CANVAS */

var co = {}

co.gc = function (c, v) { c.globalCompositeOperation = v; }
co.copy = function (a, b) { $2D(b).drawImage($(a), 0, 0, 500, 500); }

co.ellipses = function (a, b, c) {

	var K = 4 * ((Math.sqrt(2) - 1) / 3), A = {X: (b.X - a.X) / 2, Y: (b.Y - a.Y) / 2}, B = {X: a.X + A.X, Y: a.Y + A.Y}

	c.moveTo(B.X, B.Y - A.Y)
	c.bezierCurveTo(B.X + (K * A.X), B.Y - A.Y, B.X + A.X, B.Y - (K * A.Y), B.X + A.X, B.Y)
	c.bezierCurveTo(B.X + A.X, B.Y + (K * A.Y), B.X + (K * A.X), B.Y + A.Y, B.X, B.Y + A.Y)
	c.bezierCurveTo(B.X - (K * A.X), B.Y + A.Y, B.X - A.X, B.Y + (K * A.Y), B.X - A.X, B.Y)
	c.bezierCurveTo(B.X - A.X, B.Y - (K * A.Y), B.X - (K * A.X), B.Y - A.Y, B.X, B.Y - A.Y)

	c.closePath()

}

/* COLOR VISUALIZER */

view = {

	'light': function (n, r) {
		var toHex = color.HEX, c = $2D('rgb')
		c.lineWidth = 0.5

		function fu(fu) {

			for (var i in r) {
				var h = '', a = {}, b = {}

				if (i == 'R') {
					h = toHex(r[i]) + '0000'
					a = {X: n * .25, Y: 0}
					b = {X: n * 1.25, Y: n}
				}
				if (i == 'G') {
					h = '00' + toHex(r[i]) + '00'
					a = {X: .001, Y: n * .5}
					b = {X: n, Y: n * 1.5}
				}
				if (i == 'B') {
					h = '0000' + toHex(r[i])
					a = {X: n * .5, Y: n * .5}
					b = {X: n * 1.5, Y: n * 1.5}
				}

				if (h) {
					c.beginPath()
					co.ellipses(a, b, c)
					fu(c, h)
					c.closePath()
				}

			}
		}

		co.gc(c, 'lighter')
		fu(function (c, h) {
			c.fillStyle = '#' + h
			c.fill()
		})

		co.gc(c, 'source-over')
		fu(function (c, h) {
			c.strokeStyle = '#555'
			c.stroke()
		})

	},
	'details': function (n, v, t) {
		r = color.HEX_RGB(v)
		x = color.RGB_XYZ(r)
		l = color.XYZ_Lab(x)

		function fu(v1, v2) {

			var v3 = "var v=this.value.toUpperCase(); this.value=v.replace(/[^A-F0-9]+/g,''); if(v.length>6) { this.value=v.substr(0,6); }; if(keyCode(event)==13 || v.length==6) { var r=cDB.graph(view.id), b=color.RGB_HEX(r.rgb); view.details(145,v,(b==v)?r.id:'#'+v); }"

			return ('<div onmouseover="view.tip(\'' + v1 + '\',event)">' +
				' <div class="left">' + v1 + ":<\/div>" +
				' <div class="right"><input onkeyup="' + (v1 === 'HEX' ? v3 : '') + '" type="text" style="font-size: 16px; border: 0; background: #000; color: #fff; padding-top: 4px; max-width: 200px;" value="' + (typeof (v2) == 'object' ? v2.join(', ') : v2) + '">' + "<\/div>" +
				"<\/div>")

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
			fu('CMYK', ob2r(color.RGB_CMYK(r)))

		$('rgb').height = n * 1.5 + 2
		$('rgb').width = n * 1.5 + 2

		$('sphere_href').href = 'https://colorsphere.app/?LoadJack=hex:' + v
		$('export_href').href = 'http://colrd.com/discover/color/0xff' + v.toLowerCase()

		view.light(n, r)

	},
	'tip': function (v, o) {
		var o = XY(o), d = $('wheel_title'), e = $S('wheel_title')

		if ((v = cDB['Library'][v])) {
			e.display = 'none'
			e.background = '#777'
			d.innerHTML = v
			e.display = 'block'
		}

	},
	'export': function () {
		var v, z = ''

		for (var i in mouse.r) {
			v = mouse.r[i]

			z += "'" + v + "':[" + ob2r(color.HEX_RGB(i)) + "],<br>"

		}

		TEST(view.id + "={ // 'ID' : [R, G, B]<br><br>" + z.substr(0, z.length - 5) + '};')

		$S('T').background = '#000'
		$S('T').zIndex = 10

	},

	'id': window.location.search.substr(1).split('=').pop() || 'Crayola'

}

canvas = {'W': 700, 'H': 700}

cDB.graph = function (i) {
	var c = $2D('wheel'), w = canvas.W, h = canvas.H

	c.clearRect(0, 0, w, h)
	mouse.r = {}

	view.tip_data = cDB['Library'][i]

	var r = cDB[i]
	for (var i in r) {
		var o = r[i]
		mouse.r[color.RGB_HEX({'R': o[0], 'G': o[1], 'B': o[2]})] = i
	}

	var a = {X: 0, Y: 0}, b = {X: w, Y: h}
	c.lineWidth = 1.7

	c.beginPath()
	co.ellipses(a, b, c)
	c.fillStyle = '#000'
	c.fill()
	c.strokeStyle = '#171717'
	c.stroke()
	c.closePath()

	c.save()
	c.lineWidth = 1.2

	var a = {X: w / 2, Y: 0}, b = {X: w / 2, Y: h}

	var oL = 0, oT = 0, H = w / 2, R = Math.PI * 2, O = R * (1 / 12)

	for (var i = 0; i <= 5; i++) {
		c.beginPath()

		c.translate(H + oL, H + oT)
		c.rotate(O)
		c.translate(-(H + oL), -(H + oT))

		c.moveTo(a.X, a.Y)
		c.lineTo(b.X, b.Y)

		c.strokeStyle = '#171717'
		c.stroke()
		c.closePath()

	}


	c.restore()

	function fu(f, val) {
		var c = $2D(f), j = 0
		c.clearRect(0, 0, w, h)

		var toHex = color.RGB_HEX, toHSV = color.RGB_HSV

		for (var i in r) {
			var v = r[i]

			var rgb = {'R': v[0], 'G': v[1], 'B': v[2]}, hsv = toHSV(rgb)

			var o = color.HSV_XY(hsv, w)

			c.beginPath()
			co.ellipses({X: o.X - 6, Y: o.Y - 6}, {X: o.X + 6, Y: o.Y + 6}, c)

			c.fillStyle = '#' + toHex(rgb)
			c.fill()

			if (f !== 'wheel_plot_2') {
				c.lineWidth = 0.42
				c.strokeStyle = 'rgba(0,0,0,0.5)'
				c.stroke()
			}

			c.closePath()

		}

		return ({'id': i, 'rgb': rgb})

	}

	var o = fu('wheel_plot', 'Normal')

	var o = fu('wheel_plot_2', 'Normal')

	return (o)

}


/* MOUSE */

mouse = {}

mouse.cursor = function (e) {
	var o = XY(e), v = abPos('wheel_plot_2')
	o.X -= v.X
	o.Y -= v.Y

	var rgb = mouse.decode(o, 'wheel_1x1', 'wheel_plot_2'), hex = color.RGB_HEX(rgb), i = ''

	$S('wheel_title').left = (XY(e).X) + 'px'
	$S('wheel_title').top = (XY(e).Y - 90) + 'px'

	if (rgb.A === 255 && mouse.r[hex]) {
		if (mouse.id != hex) {

			var c = $2D('wheel_cur'), o = color.HSV_XY(color.HEX_HSV(hex), canvas.W)
			c.clearRect(0, 0, canvas.W, canvas.H)

			c.beginPath()
			co.ellipses({X: o.X - 10, Y: o.Y - 10}, {X: o.X + 10, Y: o.Y + 10}, c)

			c.fillStyle = '#' + hex
			c.fill()
			c.lineWidth = 2
			c.strokeStyle = '#000'
			c.stroke()
			c.closePath()

			$S('wheel_title').display = 'block'
			$('wheel_title').innerHTML = mouse.r[hex] + '<br>#' + hex
			$S('wheel_title').background = '#' + hex

			if (color.brightness(rgb, {
				'R': 0,
				'G': 0,
				'B': 0
			}) <= 125) { $S('wheel_title').color = '#FFF'; } else { $S('wheel_title').color = '#000'; }

			$S('wheel_cur').cursor = 'pointer'
			mouse.id = hex

		}
	} else if (mouse.id && hex == '000000') {
		var c = $2D('wheel_cur')
		c.clearRect(0, 0, canvas.W, canvas.H)

		view.tip(view.tip_data, e)
		$S('wheel_title').display = 'none'
		$S('wheel_cur').cursor = 'default'
		mouse.id = ''

	}
}

mouse.decode = function (v, v1, v2) {
	var o = $2D(v1), r

	o.clearRect(0, 0, 1, 1)
	o.drawImage($(v2), Math.max(0, v.X), Math.max(0, v.Y), 1, 1, 0, 0, 1, 1)

	r = o.getImageData(0, 0, 1, 1).data
	r = {'R': r[0], 'G': r[1], 'B': r[2], 'A': r[3]}

	return (r)

}

printout = function () {

	var r = cDB[view.id], fu = color.HEX, z = ''
	for (var i in r) {
		var v = r[i]

		var hex = fu(v[0]) + fu(v[1]) + fu(v[2]), is = (color.brightness({R: v[0], G: v[1], B: v[2]}, {R: 0, G: 0, B: 0}) <= 125)

		z += '<div style="background: #' + hex + '; color: #' + (is ? 'FFFFFF' : '000000') + '" onmousedown="view.details(145,color.RGB_HEX({R:' + v[0] + ', G:' + v[1] + ', B:' + v[2] + '}),\'' + i + '\');">' + i + '</div>'

	}


	$('T').innerHTML = z

	$S('T').zIndex = 1000

}


/* WINDOW LOAD */

include = function (v) {

	if (cDB['Library'][view.id]) {
		view.id = v

		if (!cDB[v]) {

			var script = document.createElement('script')
			script.type = 'text/javascript'
			script.src = 'color_db.php?q=' + v
			document.getElementsByTagName('head')[0].appendChild(script)

		} else {

			cDB.graph(v)

		}
	}
}

load = function () {

	menu.init({'blind': view.id})

	var r = cDB['Library'], z = {}

	for (var i in r) { z[i] = new Function('', "include('" + i + "')"); }


	$('wheel_db').innerHTML = menu.build('blind', z)

	var r = cDB.graph(view.id)
	view.details(145, color.RGB_HEX(r.rgb), r.id)

}

window.addEventListener('DOMContentLoaded', load)