function $(v) { return(document.getElementById(v)); }
function $S(v) { return(document.getElementById(v).style); }
function $T(v,i) { return((typeof(i)=='string'?$(i):(i?i:document)).getElementsByTagName(v)); }
function arr(o) { var r=[]; for(var i in o) { r[i]=o[i]; } return(r); } 
function base(v) { return($('key').selectedIndex+(12*$('octave').selectedIndex)+(isNaN(v)?0:v)); }
function tog(o) { if($('this')) { $S($('this').innerHTML).display='none'; $('this').id=''; } $S(o.innerHTML).display='block'; o.id='this'; }
function ucword(v) { return(v[0].toUpperCase()+v.substr(1)); }

/* NEW */

function findCS(r) { 

	var z={}; $('T').value=''; // finds chord+scale

	if($('find').value) { var b=$('find').value.split(' '); Key=b; }

	for(var i in r) { for(var ii in Key) { if(isNaN(r[i][Key[ii]])) { z[i]=1; break; } } } 

	for(var i in r) { if(!z[i]) $('T').value+=i+" || "; }

}

function fuTap() {

	function z(v) { var o={208:'Prestissimo',198:'Presto',168:'Vivace',126:'Allegro',116:'Allegretto',108:'Moderato',78:'Andante',68:'Adante',58:'Adagio',38:'Largo',28:'Lento',0:'Grave'};
		
		for(var i in o) { if(v>i) return(o[i]); }

	}

	if(tap) { var b=new Date().getTime(), c=parseInt(1/((b-tap)/1000)*60);
	
		$('T').value=z(c); $('tempo').value=c; tap=0;

	} else tap=new Date().getTime();

}

function info(o) { 

	var a='', b='', c='', d='', e=''; 
	
	$('which').innerHTML=''; 
	
//	MIDIPlugin.stopAllNotes();

	for(var i in o) { if(o[i]>0) b+='-'+(o[i]-d); d=o[i]; e=base(d)%12; c+=', '+K[e].substr(blackR[e]?3:0); a+=', '+Kb[d%12]; }

	$('T').value=c.substr(2)+"\n"+a.substr(2)+"\n"+b.substr(1);

}

function keyboard(v,b) { 

	var map={81:0,50:1,87:2,51:3,69:4,82:5,53:6,84:7,54:8,89:9,55:10,85:11,73:12,57:13,79:14,48:15,80:16,219:17,187:18,221:19,8:20,220:21,90:12,83:13,88:14,68:15,67:16,86:17,71:18,66:19,72:20,78:21,74:22,77:23,188:24,76:25,190:26,186:27,191:28};

	if(!isNaN(map[v])) { event.preventDefault(); 
	
		if(!b) { $('T').value=''; $('which').innerHTML=''; }

		mkNote(map[v]+($('octave').selectedIndex*12),b);

} }

function prog() { var n=0, o=Prog;

	for(var i in o) { setTimeout("$('chord').selectedIndex="+o[i][1]+"; mkChord("+Ko[o[i][0]]+",1)",(1000*60/$('tempo').value)*o[i][2]*n++); }

}

/* PLAY */

var cur;

function mkNote(v,s) { var b=v%12, c=blackR[b]; cur=v; // depress+release

    if(0<=v && v<=36) { document[v].src=(s?KeyUpDir:KeyDownDir)+(c?'black':'white')+'.png';

		if(!s) { var d=(b>1?(b>3?(b>6?(b>8?(b>10?5:4):3):2):1):0)+(Math.floor(v/12)*5), left=c?(14*(v+1)-3):(24*(v-d+1)-6);

			$('which').innerHTML+="<div onmousedown='mDown("+v+")' onmouseup='mUp("+v+")' onmouseover='mOver("+v+")' onmouseout='mOut("+v+")'"+' style="color: #000; padding: 2px; width: 11gpx; height: 12px; background: #99FF77; margin: '+(c?55:90)+'px 0 0 '+left+'px;">'+K[b].substr(c?3:0)+'</div>';

			setTimeout("mkNote('"+v+"',1)",$('sustain').value);

	} }

	if(s) MIDIPlugin.stopNote(v+48); 

	else MIDIPlugin.playNote(v+48);

}

function mkChord(v,s) { 

	var o=C[$('chord').value]; cur=v; 
	
	if(s!=2) info(o);

	if(!isNaN(v) && !s) { 
	
		$('key').selectedIndex=v%12; 
		$('octave').selectedIndex=Math.floor(v/12);
		
	}

	for(var i in o) mkNote(base(o[i] + (!isNaN(v) && s ? v : 0)));
	
}

function mkScale() { 

	var o=S[$('scale').value], n=0;
	
	info(o);

	for(var i in o) { setTimeout("mkNote(base("+o[i]+"))",(1000*60/$('tempo').value)*n++); }

}

function invert(v) { 

	var o=arr(C[$('chord').value]); 
	
	info(o); 

	if(inV+=v) { if(inV<0) o=o.reverse(); for(var i=0; i<Math.abs(inV); i++) { o[i%o.length]+=12*(inV>0?1:-1); } }
	
	for(var i in o) { mkNote(base(o[i])); }
	
}

/* BUILD */

function mkO(o,r) { var z=''; for(var i in r) { z+='<option value="'+i+'">'+i+'</option>'; } o.innerHTML=z; }
function mkR(o,r,b) { var z=''; for(var i=0; i<r.length; i++) { z+='<option value="'+(b?r[i]:i)+'">'+r[i]+'</option>'; } o.innerHTML=z; }

function mUp(v) { mkNote(v,1); MouseDown=false; }
function mDown(v) { $('T').value=''; $('which').innerHTML=''; if($('lock').checked) mkChord(v); else mkNote(v); MouseDown=true; }
function mOver(v) { if(MouseDown && cur!=v) { $('T').value=''; $('which').innerHTML=''; if($('lock').checked) mkChord(v); else mkNote(v); } }
function mOut(v) { if(MouseDown) mkNote(v,1); }

function mkKeys(m,n,o,s,x,y) { var ob={1:1,4:1,6:1,9:1,11:1}, z='';

	function mk(v) { return("<div onmousedown='mDown("+v+")' onmouseup='mUp("+v+")' onmouseover='mOver("+v+")' onmouseout='mOut("+v+")' style='position:absolute; LEFT: "+x+"px; TOP: "+y+"px;'><img name='"+v+"' src='"+KeyUpDir+s+".png' class='undraggable' /></div>"); }

	for(var j=0; j<m; j++) { z+=mk(o[j%n]+12*Math.floor(j/n)); x+=(s=='white'?24:(ob[j]?45:26)); }
	
	$('keys').innerHTML+=z;

}

function mkBG() { var d=$('bg'), c=d.getContext('2d'), g=c.createLinearGradient(0,0,0,200);

	g.addColorStop(0,'#000'); g.addColorStop(.3,'#333'); g.addColorStop(.6,'#333'); g.addColorStop(1,'#000');
	
	function z() { c.beginPath(); c.moveTo(10,10); c.lineTo(10,147); c.lineTo(541,147); c.lineTo(541,10); c.closePath(); }

	c.lineJoin='round'; c.lineWidth=16;

	z(); c.fillStyle=g; c.fill();
	z(); c.strokeStyle=g; c.stroke();

}

var sliders = {
	volume: { onslide: function(n) { runSlider('volume', n); }, n: 100 },
	reverb: { onslide: function(n) { runSlider('reverb', n); }, n: 0 }
};

var runSlider = function(id, n) {
	
	$(id+'Value').innerHTML = Math.round(n * 100)+'%'; 
	
	MIDIPlugin['set'+ucword(id)](n);

};

window.onload = function() {	

	MIDIPlugin.openPlugin();
	
	var n = 0;
	
	for(var id in sliders) { 

		$(id+'Title').setAttribute("style", "position: absolute; top: "+((20*n)+15)+"px; left: 20px;");
		$(id+'Slider').setAttribute("style", "position: absolute; top: "+((20*n)+17)+"px; left: 78px; width: 90px;");
		$(id+'Value').setAttribute("style", "position: absolute; top: "+((20*n)+15)+"px; left: 174px;");
		
		var o = sliders[id];
		o.core = new AppleHorizontalSlider($(id+'Slider'), o.onslide);
		o.core.setValue(o.n);

		n ++;

	}

	mkKeys(22,7,white,'white',30,23);
	mkKeys(15,5,black,'black',46,23);

//	mkR($('synth'),MIDIPlugin.getSoundBanks(),1);
//	mkR($('voice'),MIDIPlugin.getVoices());
	mkR($('key'),K);
	mkO($('chord'),C);
	mkO($('scale'),S);

	mkBG();
	mkUpdate();

}

/* UPDATE */

var download='http://www.apple.com/downloads/dashboard/music/pianotheory.html';
var update='http://www.mudcube.com/widget/Piano_Theory.txt';
var curVer='1.0.3', serVer;

function mkUpdate() { var req=new XMLHttpRequest();

    req.onreadystatechange=function() { if(req.readyState==4 && req.status==200) { var serVer=trim(req.responseText);

		if(curVer<serVer && !isNaN(parseFloat(serVer))) {
	
			$("update").onclick=function() { widget.openURL(download); }
			$("update").innerHTML='<span>Get<br>v'+serVer+'</span>';
			$S("update").display="block";

	} } }

    req.open("GET", update, true); 
    req.setRequestHeader("Cache-Control", "no-cache"); 
	req.send();

}

function LTrim(v) { var rx=/\s*((\S+\s*)*)/; return(v.replace(rx,"$1")); }
function RTrim(v) { var rx=/((\s*\S+)*)\s*/; return(v.replace(rx,"$1")); }
function trim(v) { return(LTrim(RTrim(v))); }

/* GLOBALS */

var inV=0, tap=0, Key=[0,4,7,20], MouseDown=false;
var KeyUpDir="media/keys/up/", KeyDownDir="media/keys/down/";
var blackR={1:1,3:1,6:1,8:1,10:1}, black=[1,3,6,8,10], white=[0,2,4,5,7,9,11];
var func=function(){ mkChord(); };

var K=['C','C#/Db','D','D#/Eb','E','F','F#/Gb','G','G#/Ab','A','A#/Bb','B'];
var K2={'C':1,'C#':2,'Db':2,'D':3,'D#':4,'Eb':4,'E':5,'F':6,'F#':7,'Gb':7,'G':8,'G#':9,'Ab':9,'A':10,'A#':11,'Bb':11,'B':12};
var Kb=['1','b2','2','b3','3','4','b4','5','b5','6','b7','7'];

var Prog=[['C',0,2],['G',0,2],['A',1,2],['E',1,2],['F',0,2],['C',0,2],['F',0,2],['G',0,2]];

var fifth=[0,7,2,9,4,11,6,1,8,3,10,5];

var C={'Major':[0,4,7],
	   'Minor':[0,3,7],
	   'Sus4':[0,5,7],
	   'b5':[0,4,6],
	   'Diminished':[0,3,6],
	   'Augmented':[0,4,8],
	   'Major 6':[0,4,7,9],
	   'Minor 6':[0,3,7,9],
	   '7':[0,4,7,10],
	   '7sus4':[0,5,7,10],
	   'Minor 7':[0,3,7,10],
	   'Minor 7 +9':[0,3,7,10,14],
	   'Minor 7 +9+11':[0,3,7,10,14,17],
	   'Major 7':[0,4,7,11],
	   'Major 7 +9':[0,4,7,11,14],
	   'Major 7 +#11':[0,4,7,11,14,18],
	   'Major7(13)':[0,4,7,11,21],
	   'Major7(9,13)':[0,4,7,11,14,21],
	   'Major7#5':[0,4,8,11],
	   'Major7#5(9)':[0,4,8,11,14],
	   'MinMaj7':[0,3,7,11],
	   'MinMaj7(9)':[0,3,7,11,14],
	   '7b5':[0,4,6,10],
	   'Minor7b5':[0,3,6,10],
	   'Augmented 7':[0,4,8,10],
	   'Diminished 7':[0,3,6,9],
	   'Add9':[0,4,7,14],
	   'Minor +9':[0,3,7,14],
	   'Major 6 +9':[0,4,7,9,14],
	   'Minor 6 +9':[0,3,7,9,14],
	   '7(9)':[0,4,7,10,14],
	   '7(b9)':[0,4,7,10,13],
	   '7(#9)':[0,4,7,10,15],
	   '7(13)':[0,4,7,10,21],
	   '7(b13)':[0,4,7,10,20],
	   '7(9,13)':[0,4,7,10,14,21],
	   '7(b9,13)':[0,4,7,10,13,21],
	   '7(#9,13)':[0,4,7,10,15,21],
	   '7(b9,b13)':[0,4,7,10,13,20],
	   '7(#9,b13)':[0,4,7,10,15,20],
	   '7(9,#11)':[0,4,7,10,14,18],
	   '7(9,#11,13)':[0,4,7,10,14,18,21]};

var S={'Aeolian':[0,2,3,5,7,8,10],
	   'Altered':[0,1,3,4,6,8,10],
	   'Altered b7':[0,1,3,4,6,8,9],
	   'Arabian':[0,2,4,5,6,8,10],
	   'Augmented':[0,4,7,8,11],
	   'Balinese':[0,1,3,7,8],
	   'Blues':[0,3,5,6,7,10],
	   'Byzantine':[0,1,4,5,7,8,11],
	   'Chinese':[0,4,6,7,11],
	   'Chinese Mongolian':[0,2,4,7,9],
	   'Diminished (H-W)':[0,1,3,4,6,7,9,10],
	   'Diminished (W-H)':[0,2,3,5,6,8,9,11],
	   'Dorian':[0,2,3,5,7,9,10],
	   'Dorian b2':[0,1,3,5,7,9,10],
	   'Dorian #4':[0,2,3,6,7,9,10],
	   'Double Harmonic':[0,1,4,5,7,8,11],
	   'Enigmatic':[0,1,4,6,8,10,11],
	   'Egyptian':[0,2,5,7,10],
	   'Eight Tone Spanish':[0,1,1,4,5,6,8,10],
	   'Harmonic Minor':[0,2,3,5,7,8,11],
	   'Hindu':[0,2,4,5,7,8,10],
	   'Hirajoshi':[0,2,3,7,8],
	   'Hungarian Major':[0,3,4,6,7,9,10],
	   'Hungarian Minor':[0,2,3,6,7,8,11],
	   'Hungarian Gypsy':[0,2,3,6,7,8,11],
	   'Ichikosucho':[0,2,4,5,6,7,9,11],
	   'Ionian':[0,2,4,5,7,9,11],
	   'Ionian Aug':[0,2,4,5,8,9,11],
	   'Kumoi':[0,2,3,7,9],
	   'Leading Whole Tone':[0,2,4,6,8,10,11],
	   'Locrian':[0,1,3,5,6,8,10],
	   'Locrian 2':[0,2,3,5,6,8,10],
	   'Locrian 6':[0,1,3,5,6,9,10],
	   'Lydian':[0,2,4,6,7,9,11],
	   'Lydian Aug':[0,2,4,6,8,9,11],
	   'Lydian b7':[0,2,4,6,7,9,10],
	   'Lydian #9':[0,3,4,6,7,9,11],
	   'Lydian Diminished':[0,2,3,6,7,9,11],
	   'Lydian Minor':[0,2,4,6,7,8,10],
	   'Melodic Minor':[0,2,3,5,7,9,11],
	   'Mixolydian':[0,2,4,5,7,9,10],
	   'Mixolydian b6':[0,2,4,5,7,8,10],
	   'Mohammedan':[0,2,3,5,7,8,11],
	   'Neopolitan':[0,1,3,5,7,8,11],
	   'Neopolitan Major':[0,1,3,5,7,9,11],
	   'Neopolitan Minor':[0,1,3,5,7,8,10],
	   'Overtone':[0,2,4,6,7,9,10],
	   'Pelog':[0,1,3,7,8],
	   'Pentatonic Major':[0,2,4,7,9],
	   'Pentatonic Minor':[0,3,5,7,10],
	   'Persian':[0,1,4,5,6,8,11],
	   'Phrygian':[0,1,3,5,7,8,10],
	   'Phrygian Major':[0,1,4,5,7,8,10],
	   'Prometheus':[0,2,4,6,9,10],
	   'Prometheus Neopolitan':[0,1,4,6,9,10],
	   'Purvi Theta':[0,1,4,6,7,8,11],
	   'Six Tone Symmetrical':[0,1,4,5,8,9],
	   'Todi Theta':[0,1,3,6,7,8,11],
	   'Whole Tone':[0,2,4,6,8,10]};

function rewrite(o) { var z={};

	for(var i in o) { var r={}; for(var ii in o[i]) { r[o[i][ii]]=1; } z[i]=r; }

	return(z);

}

var Co=rewrite(C), So=rewrite(S), Ko=function() { var z={}; for(var i in K) { z[K[i]]=i; }; return(z); }();

widget.onhide=function() { MIDIPlugin.closePlugin() };
widget.onshow=function() { MIDIPlugin.openPlugin() };

document.onkeydown=function() { keyboard(event.keyCode); };
document.onkeyup=function() { keyboard(event.keyCode,1); };
