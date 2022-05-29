/* DROP MENU */

menu={};

/* Mouse */

menu.toggle=function(n) { var p=n.parentNode.parentNode, o=menu;

	if(p.opened!=true) {

		if(o.parent.opened==true) o.close();

		stop=0; o.prev=n; o.parent=p;

		var c=p.parentNode.id.replace('_opt','');

		var offset=parseInt(n.parentNode.style.top);

		if(!isNaN(offset)) {

			offset=(offset/o.cellHeight)*(o.cellHeight+2);

			var d=-1*offset-abPos(p).Y+3;

			if(d>0) { n.parentNode.style.top=(offset+d)+'px'; } else n.parentNode.style.top=(offset-3)+'px';

		};

		p.style.overflow='visible';
		
		n.parentNode.className+='opened';
		
		window.setTimeout(function() { p.opened=true; }, 100);
		
		window.onmousedown=o.close;

	}
	else o.select(n,p);

};

menu.select=function(n,s) { var p=n.parentNode.parentNode; stop=1;

	var o=$T('li',p); p.style.overflow='hidden';

	for(var x=0; x<o.length; x++) {

		o[x].className=trim(o[x].className.replace('sel',''));

		if(o[x]==n) { n.className += ' sel'; n.parentNode.style.top=-((x-1)*menu.cellHeight)+'px'; }

	}

	n.parentNode.className=trim(n.parentNode.className.replace('opened',''));
	
	p.opened=p.okClose=false;
	
	window.onmousedown=null;
	
	var c=p.parentNode.id.replace('_opt','')
	
	menu.fu(c,n.innerHTML);
	
};

menu.close=function() { if(menu.parent.opened==true) menu.select(menu.prev) };

menu.onSelect=function(n,s) { var p=n.parentNode.parentNode; if(p.okClose==true) menu.select(n,s); };

menu.okClose=function(p) { if(p.opened) p.okClose=true; };

/* Visualizer */

menu.build=function(c,r) { var z='', length=0, o=menu, j=0;

	if(typeof(r)=='object' && !r.length) for(var i in r) { length++; } else length=r.length;

	for(var i in r) {
	
		if(typeof(r[i])=='function') { menu.cur['fu'+i]=r[i]; }

		var style=(j==0)?'style="border-top: none;"':((j+1)==length?'style="border-bottom: none;"':'');

		if(i==o.cur[c] || (!o.cur[c] && j==0) ) { var position='style="top:-'+(o.cellHeight*j)+'px"'; className='class="sel"'; }

		else { className=''; }

		z+='<li onmousedown="menu.toggle(this)" onmouseup="menu.onSelect(this)" onmouseover="menu.okClose(this.parentNode.parentNode)" '+style+' '+className+'>'+i+"<\/li>";

		j++;

	};

	return('<div class="menuWrap" id="'+c+'_opt">'+
		   ' <div class="t"><div class="l"></div><div class="r"></div><div class="c"></div></div>'+
		   ' <div class="menuBox">'+
		   '  <ul '+position+'>'+
		   '   <li class="top"><div class="l"></div><div class="r"></div><div class="c"></div></li>'+z+
		   '   <li class="bottom"><div class="l"></div><div class="c"></div><div class="r"></div></li>'+
		   '  </ul>'+
		   ' </div>'+
		   ' <div class="b"><div class="l"></div><div class="r"></div><div class="c"></div></div>'+
		   '</div>');

};

menu.fu=function(c,v) { var o=menu.cur; o[c]=v;

	if(typeof(o['fu'+v])=='function') o['fu'+v]();

	var a=v, b=a.substr(0,a.indexOf('(')!=-1?a.indexOf('(')-1:a.length); menu.key[c]=b;
	
};

menu.init=function(o) {

	menu.cur={}; menu.key={};

	for(var i in o) { menu.key[i]=o[i]; menu.cur[i]=o[i]; }

};

menu.cellHeight=17;

menu.parent={};

menu.prev={};