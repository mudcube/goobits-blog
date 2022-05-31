window.BG || (window.BG = {});

(function () {
	let iFrameHref = window.location.href
	let timeout = 0

	/**
	 *
	 * @param waiting
	 */
	function activate(waiting) {
		const $iframe = document.getElementById('iframe')
		const $document = $iframe.contentWindow.document
		if (!$document.body || (iFrameHref === $document.location.href && waiting)) {
			if ((new Date()).getTime() - timeout > 30000) return
			setTimeout(function () {
				activate(true)
			}, 10)
			return
		} else {
			timeout = 0
		}

		iFrameHref = $document.location.href
		$document.body.style.background = 'none'
		BG.uploader.createDropArea($document.body)

		const location = window.location
		const elms = $document.getElementsByTagName('a')
		const length = elms.length
		for (let i = 0; i < length; i++) {
			Event.add(elms[i], 'click mousedown', function (event) {
				BG.remoteFrame = this
				event.preventDefault()
				event.stopPropagation()
				this.style.background = 'none'
				if (!this.href) return
				if ($iframe.src === this.href) return
				BG.onFormSubmit(location.origin + location.pathname + '?' + this.href)
				return false
			})
		}

		BG.loader.stop()
	}

	BG.remoteFrame = undefined; // webpage in iframe

	BG.toggleRemoteFrame = function (state) {
		const frame = document.getElementById('remoteFrame')
		if (!frame) return
		if (state === 'down') {
			frame.style.display = 'block'
		} else if (state === 'up') {
			frame.style.display = 'none'
		}
	}

	BG.createRemoteFrame = async function () {
		BG.loader.message('Loading Website...')

		const $a = document.createElement('a')
		const $main = document.querySelector('#main')
		$main.innerHTML = ''

		const originalUrl = window.location.search.substr(1)
		const request = await fetch(`https://api.codetabs.com/v1/proxy?quest=${originalUrl}`)
		const html = await request.text()
		const blob = new Blob([html], {type: 'text/html'})
		const url = URL.createObjectURL(blob)

		const $iframe = document.createElement('iframe')
		$iframe.id = 'iframe'
		$iframe.style.cssText = `width: ${window.innerWidth}px; height: 100%; border: 0; position: absolute; top: 0;`
		$iframe.src = url
		$iframe.onload = function () {
			const window = $iframe.contentWindow
			const document = window.document
			document.body.style.background = 'transparent'

			$a.href = originalUrl

			const origin = $a.origin
			const $path = $a.pathname.substr(0, $a.pathname.indexOf('/') + 1);
			const $items = Object.values(document.getElementsByTagName('*'))

			$items.forEach(($element) => {
				if ($element.getAttribute('src')) {
					$a.href = $element.getAttribute('src');
					if ($a.origin !== origin) {
						let $src = $element.getAttribute('src');
						if ($src.substr(0, 1) !== '/') $src = $path + $src;
						$element.setAttribute('src', origin + $src);
					}
				} else if ($element.getAttribute('href')) {
					$a.href = $element.getAttribute('href');
					if ($a.origin !== origin) {
						let $src = $element.getAttribute('href');
						if ($src.substr(0, 1) !== '/') $src = $path + $src;
						$element.setAttribute('href', origin + $src);
					}
				}
			})

			activate()
		}

		$main.appendChild($iframe)

		const $frame = document.createElement('div')
		$frame.style.cssText = 'width: 100%; height: 100%; z-index: 1; display: none; position: absolute; top: 0;'
		$frame.id = 'remoteFrame'
		document.body.appendChild($frame)
	}
})()