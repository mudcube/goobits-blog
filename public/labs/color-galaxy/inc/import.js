/* Import Colors from Bitmap */

import_fu=function() { var w=200, h=2;

	$('image').height=img.height; $('image').width=img.width;

	var c=$2D('image'); c.clearRect(0,0,img.width,img.height); c.drawImage(img, 0, 0, img.width, img.height);
	
	$('image_thumb').height=h; $('image_thumb').width=w;
	
	var d=$2D('image_thumb'); c.clearRect(0,0,w,h); d.drawImage(img, 0, 0, img.width, img.height, 0, 0, w,h);

	var r=d.getImageData(0,0,w,h).data, z='', rr={};
	
	for(var i=0; i<=r.length && !isNaN(r[i]); i+=4) { var rgb={'R':r[i],'G':r[i+1],'B':r[i+2]};
		
		var hex=color.RGB_HEX(rgb), ob=ob2r(rgb);

		if(!rr[hex] && r[i+3]==255) { rr[ob]=ob; }
	
	};

	cDB['Import']=rr;

};

import_switch=function(v,id,s) {

	function fu() {
	
		var r=graph(id?id:view.id);
	
		view.details(125,color.RGB_HEX(r.rgb),r.id);

	}

	img=new Image(); img.src='media/'+v+'.jpg';
	
	img.onload=function() { import_fu(); 

		var r=['514280391_93547770a8','774833066_fa3f900ec0','1481335975_9496a23001','2303348202_5a7601db04'], z='';
	
		for(var i in r) { z+='<img src="media/'+r[i]+'.jpg" onmousedown="import_switch(\''+r[i]+'\');" height="100" style="cursor: pointer">'; }
	
		cDB['Library']['Import']='Imports colors from an image source<br>'+z;
		
		if(!s) fu();

	}
	
	if(s) fu();
	
};