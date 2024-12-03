new function(_) {

/* MATH */

math={ 
	
	'format':function(n) { n=String(n);
	
		var x=n.split('.'), x1=x[0], x2=x.length>1?'.'+x[1]:'', rgx=/(\d+)(\d{3})/;
	
		while(rgx.test(x1)) { x1=x1.replace(rgx,'$1'+','+'$2'); }
	
		return(x1+x2);
	
	},
	
	'round':function(n,p) { p=Math.pow(10,p?p:1); return(Math.round(n*p)/p); },
	
	'between':function(n,a,z) { return((n>=a && n<=z)?true:false); },

	'rand':function(n) { return(Math.floor(Math.random()*n)); }

};

distance={};

distance.point_point=function(a,b) { var n=Math.atan(b.Y-a.Y, b.X-a.X)<0?-1:1;

    return(Math.sqrt( ((a.X-b.X)*(a.X-b.X)) + ((a.Y-b.Y)*(a.Y-b.Y)) )*n);

};

distance.point_line=function(a,b,c) { var z;
	
	var A=c.X-a.X, B=c.Y-a.Y, C=b.X-a.X, D=b.Y-a.Y;

	var dot=A*C+B*D, len_sq=C*C+D*D, param=dot/len_sq;
	
	if(param<0) { z=a; }

	else if(param>1) { z=b; }
	
	else { z={'X':a.X + param * C, 'Y':a.Y + param * D}; }

	return(distance.point_point(z,c));

};

};