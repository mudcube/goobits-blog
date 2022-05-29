

function ScatterGraph(oContainer) {

	if (!oContainer) return;

	var iWidth = parseInt(oContainer.style.width);
	var iHeight = parseInt(oContainer.style.height);

	var oTextLayer = document.createElement("div");
	oTextLayer.style.width = iWidth+"px";
	oTextLayer.style.height = iHeight+"px";
	oTextLayer.style.position = "absolute";
	oContainer.appendChild(oTextLayer);


	var oCanvas = document.createElement("canvas");
	var oCtx = oCanvas.getContext("2d");
	oCanvas.width = iWidth;
	oCanvas.height = iHeight;
	oCanvas.style.width = iWidth+"px";
	oCanvas.style.height = iHeight+"px";
	oCanvas.style.position = "absolute";
	oCanvas.className = "scatter";
	oContainer.appendChild(oCanvas);

	var oInputLayer = document.createElement("div");
	oInputLayer.style.width = iWidth+"px";
	oInputLayer.style.height = iHeight+"px";
	oInputLayer.style.position = "absolute";
	oContainer.appendChild(oInputLayer);
	var bMouseIsDown = false;
	var bIsRotating = false;

	var bDrawSolidSphere = false;
	var iSolidSphereSize = false;
	var strSolidSphereColor = "black";

	var aDataValues = [];
	var iValues = 0;
	var fRotX = 0, fRotY = 0, fRotZ = 0;

	var fViewCenterX = 0, fViewCenterY = 0, fViewCenterZ = 0;

	var fZoom = 0;

	var iOffsetX = (iWidth / 2);
	var iOffsetY = (iHeight / 2);
	var strShape = "circle";
	var iPointSize = 3;
	var bStaticPointSize = false;

	var fDegRad = Math.PI / 180;

	var fScale = 3;

	var fFocal = 500;

	var fMaxZ = Number.MAX_VALUE;
	var fMinZ = -Number.MAX_VALUE;

	var bDrawAxisX = true;
	var bDrawAxisY = true;
	var bDrawAxisZ = true;

	var iAxisLength = 256;
	var iAxisOffset = iAxisLength / 2;
	var iAxisLineSize = 1;
	var strAxisLineStyle = "white";

	var strTextColor = strAxisLineStyle;
	var strTextBGColor = "#444444";
	var strTextFont = "verdana";
	var iTextFontSize = 12;

	var strAxisXText = "";
	var strAxisYText = "";
	var strAxisZText = "";

	addEvent(oInputLayer, "mousedown", 
		function(e) {
			e = e || window.event;
			bMouseIsDown = true;
			iMouseDownX = e.clientX;
			iMouseDownY = e.clientY;
		}
	);

	addEvent(oInputLayer, "mouseup", 
		function(e) {
			bMouseIsDown = false;
			bIsRotating = false;
		}
	);

	var me = this;
	addEvent(oInputLayer, "mousemove", 
		function(e) {
			e = e || window.event;
			if (bMouseIsDown) {
				bIsRotating = true;

				var iMouseX = e.clientX;
				var iMouseY = e.clientY;
				var fDeltaX = (iMouseX - iMouseDownX) / 3;
				var fDeltaY = -((iMouseY - iMouseDownY) / 3);

				fRotY += fDeltaX;
				//fRotX += fDeltaY;

				iMouseDownX = iMouseX;
				iMouseDownY = iMouseY;

				update();
			}
		}
	);



	function addEvent(oObject, strEvent, fncAction) {
		if (oObject.addEventListener) { 
			oObject.addEventListener(strEvent, fncAction, false); 
		} else if (oObject.attachEvent) { 
			oObject.attachEvent("on" + strEvent, fncAction); 
		}
	}

	function update() {
		clear();

		var oAxisXCenter = transformPoint({x:iAxisLength/2,y:0,z:0});
		var oAxisYCenter = transformPoint({x:0,y:iAxisLength/2,z:0});
		var oAxisZCenter = transformPoint({x:0,y:0,z:iAxisLength/2});
		var oValueCenter = transformPoint({x:fViewCenterX,y:fViewCenterY,z:fViewCenterZ});

		renderAxisX();
		renderAxisZ();

		var aRender = [
			[renderAxisY, oAxisXCenter],
			[renderValues, oValueCenter]
		];
		var aSortedRender = aRender.sort(
			function(a, b) {
				return (b[1].z - a[1].z);
			}
		)
		for (var i=0;i<aSortedRender.length;i++) {
			aRender[i][0]();
		}

	}

	function clear() {
		oCtx.clearRect(0,0,iWidth,iHeight);
		oTextLayer.innerHTML = "";
	}

	function renderAxisX() {
		if (bDrawAxisX) {
			drawLine(
				oCtx,
				{x:-iAxisLength/2 + iAxisOffset,y:0,z:0},
				{x:iAxisLength/2 + iAxisOffset,y:0,z:0},
				iAxisLineSize,
				strAxisLineStyle
			);
			if (strAxisXText != "") {
				drawText(
					strAxisXText, 				
					{x:iAxisLength/2 + iAxisOffset,y:0,z:0}
				);
			}
		}
	}

	function renderAxisY() {
		if (bDrawAxisY) {
			drawLine(
				oCtx,
				{x:0,y:-iAxisLength/2 + iAxisOffset,z:0},
				{x:0,y:iAxisLength/2 + iAxisOffset,z:0},
				iAxisLineSize,
				strAxisLineStyle
			);
			if (strAxisYText != "") {
				drawText(
					strAxisYText, 
					{x:0,y:iAxisLength/2 + iAxisOffset,z:0}
				);
			}
		}
	}

	function renderAxisZ() {
		if (bDrawAxisZ) {
			drawLine(
				oCtx,
				{x:0,y:0,z:-iAxisLength/2 + iAxisOffset},
				{x:0,y:0,z:iAxisLength/2 + iAxisOffset},
				iAxisLineSize,
				strAxisLineStyle
			);
			if (strAxisZText != "") {
				drawText(
					strAxisZText, 				
					{x:0,y:0,z:iAxisLength/2 + iAxisOffset}
				);
			}
		}
	}

	function renderSphere() {
		if (bDrawSolidSphere) {

			var oTrans = transformPoint({
				x : fViewCenterX,
				y : fViewCenterY,
				z : fViewCenterZ
			});

			var fSphereSize = 100 * fScale;
			var fDist = oTrans.z;

			oCtx.fillStyle = strSolidSphereColor;
			var fScaleRatio = fFocal / (fFocal + fDist);
			var iScaledSize = Math.max(1, Math.floor(fSphereSize * fScaleRatio));
			var iX = iOffsetX;
			var iY = iOffsetY;

			oCtx.beginPath();
			oCtx.moveTo(iX + iScaledSize, iY);
			oCtx.arc(iX, iY, iScaledSize, 0, 360, false);
			oCtx.fill();
		}
	}

	function drawLine(oContext, oPoint1, oPoint2, iSize, strStyle) {
		var oProj1 = project(transformPoint(oPoint1));
		var oProj2 = project(transformPoint(oPoint2));
		oContext.beginPath();
		oContext.moveTo(oProj1.x + iOffsetX, oProj1.y + iOffsetY);
		oContext.lineTo(oProj2.x + iOffsetX, oProj2.y + iOffsetY);
		oContext.lineWidth = iSize;
		oContext.strokeStyle = strStyle;
		oContext.stroke();
	}

	function drawText(strText, oPoint) {
		var oProj = project(transformPoint(oPoint));
		var oText = document.createElement("div");
		oText.innerHTML = strText;
		oText.style.color = strTextColor;
		oText.style.fontSize = iTextFontSize + "px";
		oText.style.fontFamily = strTextFont;
		oText.style.position = "absolute";
		oText.style.padding = "3px";
		oText.style.backroundColor = strTextBGColor;
		oText.style.left = (oProj.x + iOffsetX) - (iTextFontSize+6)/3 + "px";
		oText.style.top = ((oProj.y + iOffsetY) - ((iTextFontSize+6))) + "px";
		oTextLayer.appendChild(oText);
	}


	function renderValues() {

		renderSphere();

		if (iValues < 1) return;

		var i = iValues;
		do {
			var oValue = aDataValues[i-1];
			var oTransPoint = transformPoint(oValue);

			if (oTransPoint.z > fMaxZ - fZoom) continue;
			if (oTransPoint.z < fMinZ - fZoom) continue;

			var o2D = project(oTransPoint);

			var strColor = oValue.color;

			var iX = Math.round(o2D.x + iOffsetX);
			var iY = Math.round(o2D.y + iOffsetY);

			if (bStaticPointSize) {
				var iScaledSize = iPointSize;
			} else {
				var fScaleRatio = fFocal / (fFocal + oTransPoint.z);
				var iScaledSize = Math.max(1, Math.floor(iPointSize * fScaleRatio));
			}

			if (strShape == "circle") {
				oCtx.beginPath();
				oCtx.moveTo(iX + iScaledSize, iY);
				oCtx.arc(iX, iY, iScaledSize, 0, 360, false);
				oCtx.fillStyle = strColor;
				oCtx.fill();
			}
			if (strShape == "square") {
				oCtx.fillStyle = strColor;
				oCtx.fillRect(iX - iScaledSize, iY - iScaledSize, iScaledSize*2, iScaledSize*2);
			}
		} while (--i);
	}

	function transformPoint(oValue) {
		var oRotValue = {
			x: oValue.x,
			y: oValue.y,
			z: oValue.z
		};

		if (fRotX) rotateX(oRotValue, fRotX * fDegRad);
		if (fRotY) rotateY(oRotValue, fRotY * fDegRad);
		if (fRotZ) rotateZ(oRotValue, fRotZ * fDegRad);

		oRotValue.x -= fViewCenterX;
		oRotValue.y -= fViewCenterY;
		oRotValue.z -= fViewCenterZ;

		oRotValue.z -= fZoom;

		return oRotValue;
	}

	function project(oPoint) {
		return {
			x: (oPoint.x * fFocal / ((oPoint.z) + fFocal)) * fScale,
			y: -(oPoint.y * fFocal / ((oPoint.z) + fFocal)) * fScale
		};
	}

	function rotateX(oValue, a) {
		var ry = oValue.y - fViewCenterY;
		var rz = oValue.z - fViewCenterZ;
		var c = Math.cos(a);
		var s = Math.sin(a);
		oValue.y = c * ry - s * rz + fViewCenterY;
		oValue.z = s * ry + c * rz + fViewCenterZ;
	}
	function rotateY(oValue, a) {
		var rx = oValue.x - fViewCenterX;
		var rz = oValue.z - fViewCenterZ;
		var c = Math.cos(a);
		var s = Math.sin(a);
		oValue.x = c * rx - s * rz + fViewCenterX;
		oValue.z = s * rx + c * rz + fViewCenterZ;
	}
	function rotateZ(oValue, a) {
		var rx = oValue.x - fViewCenterX;
		var ry = oValue.y - fViewCenterY;
		var c = Math.cos(a);
		var s = Math.sin(a);
		oValue.x = c * rx - s * ry + fViewCenterX;
		oValue.y = s * rx + c * ry + fViewCenterY;
	}

	this.setRotation = function(oRot) {
		fRotX = parseFloat(oRot.x);
		fRotY = parseFloat(oRot.y);
		fRotZ = parseFloat(oRot.z);
		update();
	}
	this.getRotation = function() {
		return {
			x : fRotX,
			y : fRotY,
			z : fRotZ
		};
	}

	this.setZoom = function(fValue) {
		fZoom = fValue;
		update();
	}
	this.getZoom = function() {
		return fZoom;
	}

	this.setPointSize = function(iSize) {
		iPointSize = iSize;
		update();
	}
	this.getPointSize = function() {
		return iPointSize;
	}

	this.setStaticPointSize = function(bEnable) {
		bStaticPointSize = bEnable;
	}
	this.getStaticPointSize = function() {
		return bStaticPointSize;
	}


	this.setPointShape = function(strShape) {
		strPointShape = strShape;
		update();
	}
	this.getPointShape = function() {
		return strPointShape;
	}

	this.setViewCenter = function(oVec) {
		fViewCenterX = parseFloat(oVec.x);
		fViewCenterY = parseFloat(oVec.y);
		fViewCenterZ = parseFloat(oVec.z);
		update();
	}
	this.getRotation = function() {
		return {
			x : fRotCenterX,
			y : fRotCenterY,
			z : fRotCenterZ
		};
	}

	this.project = function(oVec) {
		var o2D = project(transformPoint(oVec));
		return o2D;
	}

	this.setData = function(aNewValues) {
		aDataValues = [];
		for (var i=0;i<aNewValues.length;i++) {
			var oNewValue = aNewValues[i];
			aDataValues.push(
				{
					x: parseFloat(oNewValue.x),
					y: parseFloat(oNewValue.y),
					z: parseFloat(oNewValue.z),
					color : oNewValue.color
				}
			);
		}
		iValues = aDataValues.length;
		update();
	}

	this.setMaxZ = function(fZ) {
		fMaxZ = fZ;
	}
	this.setMinZ = function(fZ) {
		fMinZ = fZ;
	}
	this.getMaxZ = function() {
		return fMaxZ;
	}
	this.getMinZ = function() {
		return fMinZ;
	}

	this.setSolidSphere = function(iSize, strColor) {
		if (iSize > 0) {
			iSolidSphereSize = iSize;
			strSolidSphereColor = strColor;
			bDrawSolidSphere = true;
		} else {
			bDrawSolidSphere = false;
		}
	}

	this.getColorAt = function(x, y)
	{
		if (oCtx.getImageData) {
			var oImgData = oCtx.getImageData(x, y, 1, 1);
			return {
				R: oImgData.data[0],
				G: oImgData.data[2],
				B: oImgData.data[3],
				A: oImgData.data[4]
			}
		} else {
			return {
				R:0,G:0,B:0,A:0
			};
		}
	}

	this.setAxisXText = function(strText) {
		strAxisXText = strText;
	}
	this.setAxisYText = function(strText) {
		strAxisYText = strText;
	}
	this.setAxisZText = function(strText) {
		strAxisZText = strText;
	}

}

