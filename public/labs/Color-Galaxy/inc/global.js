function $(v,o) { return((typeof(o)=='object'?o:document).getElementById(v)); }
function $2D(o) { return((typeof(o)=='object'?o:$(o)).getContext('2d')); }
function $S(o) { return((typeof(o)=='object'?o:$(o)).style); }
function $SS(n) { var o=document.styleSheets[0]; if(o.cssRules) o=o.cssRules; else o=o.rules; return(o[n].style); }
function $T(v,o) { return((typeof(o)=='object'?o:$(o)).getElementsByTagName(v)); }
function abPos(o) { var o=(typeof(o)=='object'?o:$(o)), z={X:0,Y:0}; while(o!=null) { z.X+=o.offsetLeft; z.Y+=o.offsetTop; o=o.offsetParent; }; return(z); }
function agent(v) { return(Math.max(navigator.userAgent.toLowerCase().indexOf(v),0)); }
function getTime() { return((new Date()).getTime()); }
function keyCode(e) { return(!(agent('msie')||agent('opera'))?e.keyCode:e.which); }
function noMove() { if(stop) { stop=0; document.onmouseup=function(){ document.onmouseup=''; stop=1; }; } return false; }
function pageQuery(v) { var o=window.location.search, n=o.indexOf(v), len=v.length; if(n!=-1) { return(o.substr(n+len)?o.substr(n+len):null); } else { return false; } };
function XY(e,v) { var o=agent('msie')?{'X':event.clientX+document.body.scrollLeft,'Y':event.clientY+document.body.scrollTop}:{'X':e.pageX,'Y':e.pageY}; return(v?o[v]:o); }
function XYwin(v) { var o=agent('msie')?{'X':document.body.clientWidth,'Y':document.body.clientHeight}:{'X':window.innerWidth,'Y':window.innerHeight}; return(v?o[v]:o); }
function zero(n) { return(!isNaN(n=parseFloat(n))?n:0); }
function zindex(d) { if(d.style) d.style.zIndex=win.zindex++; }

String.prototype.replaceAll=function(a,b) { return(this.split(a).join(b)); }

function trim(v) { return(v.replace(/^\s\s*/, '').replace(/\s\s*$/, '')); }
function ucwords(str) { return(str.replace(/^(.)|\s(.)/g, function($1) { return($1.toUpperCase( )); })); }
function ucword(v) { return(v[0].toUpperCase()+v.substr(1)); }

function TEST(v,s) { var o=$('T');

	if(typeof(v)=='object') { var z='';
	
		for(var i in v) { z+=i+':'+v[i]+', '; }
		
		v=z.substr(0,z.length-2);

	};

	if(!s) { o.innerHTML=v; } 
	
	else { o.innerHTML+=v; }
	
};

function clone(o) {

	if(typeof(o)!='object') { return(o); }

	if(o==null) { return(o); }
	
	var z=!isNaN(o.length)?[]:{};
	
	for(var i in o) { z[i]=clone(o[i]); }

	return(z);
	
};

function ob2r(r) { var z=[], j=0;
	
	function fu(r) { for(var i in r) { z[j++]=math.round(r[i],2); } }
	
	if(r.length) for(var i in r) { fu(r[i]); } else fu(r);

	return(z);
	
};

/* EVENT */

Event={

	'add':function(o,v,fu) { if(typeof(v)!='object') v={el:v,e:v};
	
		if(o) if(o.addEventListener) o.addEventListener(v.el,fu,false);
		
		else if(o.attachEvent) { v=v.e; o["e"+v+fu]=fu; o[v+fu]=function() { o["e"+v+fu](window.event); }; o.attachEvent("on"+v, o[v+fu]); }
	
	},
	'rm':function(o,v,fu) { if(typeof(v)!='object') v={el:v,e:v};

		if(o) if(o.removeEventListener) o.removeEventListener(v.el,fu,false);
	
		else if(o.detachEvent) { v=v.e; o.detachEvent("on"+v, o[v+fu]); o[v+fu]=null; o["e"+v+fu]=null; }
	
	}
};


/* MOVEMENT */

var aXY={}, bXY={}, oXY={}, cXY={}, stop=1, zINDEX=2;

core={

	'X':function(o,m,a,x) { a.X=Math.max(x.X1, x.X2?Math.min(x.X2, a.X+x.X1):a.X+x.X1); return(a); },
	'Y':function(o,m,a,x) { a.Y=Math.max(x.Y1, x.Y2?Math.min(x.Y2, a.Y+x.Y1):a.Y+x.Y1); return(a); },
	'XY':function(o,m,a,x) {
		
		a.X=Math.max(x.X1, x.X2?Math.min(x.X2, a.X+x.X1):a.X+x.X1);
		a.Y=Math.max(x.Y1, x.Y2?Math.min(x.Y2, a.Y+x.Y1):a.Y+x.Y1);
		
		return(a);
	
	},
	'fu':function(o,e,C,F) { if(stop) { var oX=abPos($(o)).X, oY=abPos($(o)).Y, r=XY(e);

		function c(e,m) { r=XY(e); if(C) r=C.fu(o, m, {'X':r.X-oX, 'Y':r.Y-oY}, C); return(r); }
		function f(e,m) { c(e,m); if(F) F(oXY, r, m, e); return(r); }

		if(isNaN(C.oX)) oX=r.X-oX; else oX=oX-C.oX-zero($S(o).left);
		if(isNaN(C.oY)) oY=r.Y-oY; else oY=oY-C.oY-zero($S(o).top);
		
		stop=0; oXY=c(e); cXY=f(e, mXY='down'); core.time=getTime();

		document.onmousemove=function(e){ if(!stop) { cXY=f(e, 'move'); } }
		document.onmouseup=function(e){ stop=1; document.onmousemove=''; document.onmouseup=''; cXY=f(e, mXY='up'); }; 
		document.onselectstart=function(){ return false; }

	} },
	'win':function(o,m,a,x) { a.X=(x.X1?Math.max(a.X,x.X1):a.X); a.Y=(x.Y1?Math.max(a.Y,x.Y1):a.Y);

		if(m=='down') { if(x.z) { zindex($(o)); }; core.win.stop=0; }

		else if(m=='move') { core.win.stop=1; }

		$S(o).left=a.X+'px'; $S(o).top=a.Y+'px';
	
		if(m=='up') { core.win.stop=1; }

		return(a);
	
	}
};


/* MATH */

function exp(a,z,n,d) {

	if(n<=1) n*=100;

	if(d=='low') var y=Math.pow(2,n/15.019); 
	
	else var y=-105.78*Math.pow(2,-1*n/15)+102;

	return((y/100)*(z-a)+a-(.01*z))

};


/* CLASSNAME */

function $C(v,o) { // GET CLASS

	var o=(typeof(o)=='object'?o:$(o)).getElementsByTagName("*"), rx=new RegExp('\\b'+v+'\\b'), z=[];

	for(var i=0; i<o.length; i++) { if(rx.test(o[i].className)) z.push(o[i]); }
	
	return(z);

};

function C$(v,o) { // SET CLASS

	if(!$(v)) { return false; }

	var d=$(v), c=d.className;

	if(o['+']) { d.className=c+' '+o['+']; }

	if(o['-']) {
	
		var ob=o['-'].split(' '), r={}; for(var i in ob) { r[ob[i]]=1; }

		var c=c.split(' '), z=''; for(var i in c) { i=c[i]; if(!r[i]) z+=i+' '; };

		d.className=z;

	}
};