// http://blog.stevenlevithan.com/archives/parseuri/

parse = { }; // parses composed string (json, svg, qstring, ect...)

parse.qstring = function(str, id) { // parse query string
	var o = { }; // contains variables
	str.replace(new RegExp("(?:^|&)([^&=]*)=?([^&]*)", "g"), function ($0, $1, $2) {
		if(!$1 || !$2) return;
		var c1 = $2.substr(0, 1);
		if(!isNaN(parseInt($2))) // numeric
			o[$1] = parseInt($2);
		else if(c1 == '[' || c1 == '{') // array, object
			o[$1] = $.json_decode($2, true); 
		else if(c1) // string
			o[$1] = $2;
	});
	return id ? o[id] : o;
};

parse.uri = function(str, strict) { // parse univeral resource identifier
	var	key = ["href","protocol","host","userInfo","user","password","hostname","port","relative","path","directory","file","search","hash"],
		r = (new RegExp("(?:(?![^:@]+:[^:@\\/]*@)([^:\\/?#.]+):)?(?:\\/\\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\\/?#]*)(?::(\\d*))?)(((\\/(?:[^?#](?![^?#\\/]*\\.[^?#\\/.]+(?:[?#]|$)))*\\/?)?([^?#\\/]*))(?:\\?([^#]*))?(?:#(.*))?)")).exec(str),
		uri = { }, 
		i = 14;
	while(i--) uri[key[i]] = r[i] || "";
	return uri;
};