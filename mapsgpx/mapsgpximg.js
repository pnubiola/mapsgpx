/**
 *  © 2014 Pere Nubiola i Radigales
 *  This file is part of mapsgpx.

    mapsgpx is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    mapsgpx is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with mapsgpx.  If not, see <http://www.gnu.org/licenses/>.
 */

importScripts("mapsgpxmess.js");
var WorkerMode = false
onmessage = function (event) {
	console.log("worker receive message");
	file = event.data;
	if (file){
		WorkerMode = true
		var p = new readObject(file);
	}
}

var readObject = function(file, func){
	var ExifIFD = 0x8769;
	var GPSIFD = 0x8825;
	var ORITAG = 0x0112;//1 to 8 default 1
	var DTTAG  = 0x0132;
	var DTOTAG = 0x9003;
	var DTDTAG = 0x9004;
	var AUTHTAG   = 0x013b;
	var TITLETAG = 0x010e;
	var GPSLTREF = 0x0001;
	var GPSLAT = 0x0002;
	var GPSLNREF = 0x0003;
	var GPSLON = 0x0004;
	var GPSALREF = 0x0005;
	var GPSALT = 0x0006;
	var GPSTIME  = 0x0007;
	var GPSDATE  = 0x001d;

	var reader = new FileReaderSync();
	var mess = new mapsgpxmess();
	var end = 0;
	var data = null;
	var link = 0;
	mess.filename = file.name;
	console.log(file.name);
	var bigendian = false;
	var retfunc = func;
	console.log("readObject " + file.name);
	
	var ifdrecord = function(ofset ){
		var lons = [0, 1 , 1 , 2 , 4 , 8, 0 , 1, 0 , 4 , 8 ];
		this.tag = calc(data[ofset] , data[ofset + 1]);
		this.type = calc(data[ofset + 2 ] , data[ofset + 3]);
		this.lon = calc(data[ofset + 4 ] , data[ofset + 5] , data[ofset + 6 ] , data[ofset + 7]);
		this.data = 0;
		this.extend = null;
		var pos , val;
		if ( (lons[this.type] * this.lon) < 5 ) {
			pos = ofset + 8;
		}else {
			this.data = calc(data[ofset + 8 ] , data[ofset + 9] , data[ofset + 10 ] , data[ofset + 11])
			pos = link + this.data;
			this.extend = 0;
		}
		switch(this.type){
			case 1:
			case 7:
				val = new Uint8Array(this.lon);
				for (var i = 0 ; i < this.lon ; i++) val[i] = data[pos + i];
				break;
			case 2:
				val = "";
				for (var i = 0 ; i < this.lon ; i++) val += String.fromCharCode((data[pos + i]));
				break;
			case 3:
				val = new Uint16Array(this.lon);
				for (var i = 0 ; i < this.lon ; i++) val[i] = calc(data[pos + (i *2)] , data[pos + (i *2) + 1]);
				break;
			case 4:
				val = new Uint32Array(this.lon);
				for (var i = 0 ; i < this.lon ; i++) val[i] = calc(data[pos + (i * 4)] , data[pos + (i * 4) + 1]  , data[pos + (i * 4) + 2]  , data[pos + (i * 4) + 3] );
				break;
			case 5:
				val = new Float64Array(this.lon);
				for (var i = 0 ; i < this.lon ; i++) {
					val[i] = calc(data[pos + (i * 8)] , data[pos + (i * 8) + 1] , data[pos + (i * 8) + 2] , data[pos + (i * 8) + 3]) /
					calc(data[pos + (i * 8) + 4] , data[pos + (i * 8) + 5] , data[pos + (i * 8) + 6] , data[pos + (i * 8) + 7]);
				}
				break;
			case 9:
				val = new Uint32Array(this.lon);
				for (var i = 0 ; i < this.lon ; i++) val[i] = calcsg(data[pos + (i * 4)] , data[pos + (i * 4) + 1] , data[pos + (i * 4) + 2] , data[pos + (i * 4) + 3]);
				break;
			case 10:
				val = new Float64Array(this.lon);
				for (var i = 0 ; i < this.lon ; i++) {
					val[i] = calcsg(data[pos + (i * 8)] , data[pos + (i * 8) + 1] , data[pos + (i * 8) + 2] , data[pos + (i * 8) + 3]) /
					calcsg(data[pos + (i * 8) + 4] , data[pos + (i * 8) + 5] , data[pos + (i * 8) + 6] , data[pos + (i * 8) + 7]);
				}
				break;
			default:
				return;
			
		}
		if (this.extend === null){
			this.data = val;
		}
		else {
			this.extend = val;
		}
		
	}
	function message(err){
		mess.error = err;
		if (WorkerMode) postMessage(mess);
		else if (retfunc !== undefined) retfunc(mess);		
	}
	var loadend = function(result){
		data = new Uint8Array(result);
		if (!data || !data.length){
			message("File without data");
			close();
			return;
		}
		if (data[0] == 0xFF && data[1] == 0xD8) {
			//file is jpeg
			pos = 2;
			//ignore APP0 
			while (data[pos] == 0xFF && data[pos + 1] == 0xE0) pos +=  (data[pos + 2 ] * 256) + data[pos +3] + 2;
			//verif app1
			if (data[pos] != 0xFF || data[pos + 1] != 0xE1){
				// no APP1
				message("File do not has Exif atributes");
				close();
				return;
			}
			end = pos + 2 + (data[pos + 2 ] * 256) + data[pos + 3];
			pos += 4;
			var p = [0x45,0x78, 0x69, 0x66, 0x00, 0x00 ]; 
			for (var i = 0 ; i < p.length ;i++){
				if (data[pos + i] != p[i]){
					message("File do not has Exif data");
					close();
					return;
				}
			}	
			link = pos + 6;
			
		}
		if (data [link] == 0x49 && data [link +1] == 0x49 ){
			bigendian = false;
		}
		else if(data [link] == 0x4D && data [link +1] == 0x4D ){
			bigendian = true;
		}
		else {
			//not reconized file
			message("File type is unknow");
			close();
			return;
		}
		if( calc(data[link + 2] ,data[link + 3]) != 42 ){
			//error 42 
			message("error: no number 42");
			close();
			return;
		}
		var next = calc(data[link + 4] , data[link + 5] , data[link + 6] ,data[link + 7]);
		while (next){
			next = ifd(link + next);
		}
		if (WorkerMode) postMessage(mess);
		else if(retfunc !== undefined) retfunc(mess);
	}
	function vdate(np){
		var rec = new ifdrecord(np);
		var regdt = /[0-9]{4}:[0-9]{2}:[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}/g;
		if(rec.data != 0 && rec.type == 2){
			var w = rec.extend;
			if (regdt.test(w)){
				w = w.substring(0,10).replace(/:/gi , "-") + "T" + w.substring(11,19) ;
				w = new Date(w);
				w.setTime(w.getTime() + (w.getTimezoneOffset() * 60000));
				return w;
			}
		}
		return null;
	}
	var ifd = function(pos , ifdt){
		var num = calc(data[pos] , data[pos + 1]);
		var np = pos + 2;
		var rec ;
		var gpsd = null;
		var gpst = null;
		for (var i = 0 ; i < num ; i++){
			var tag =calc( data[ np  ] , data[ np  + 1]);
			switch (tag){
				case ExifIFD:
				case GPSIFD:
					rec = new ifdrecord(np);
					ifd(link + rec.data[0]  , tag == GPSIFD ? "gps" :"exif");
					break;
				case ORITAG:
					//1 to 8 default 1
					if (ifdt === undefined) {
						rec = new ifdrecord(np);
						mess.orientation = rec.data[0];
					}
					break;
				case DTTAG:
					if (ifdt === undefined) {
						mess.dtchange = vdate(np);
					}
					break;
				case DTOTAG:
					if (ifdt == "exif") {
						mess.dtoriginal = vdate(np);
					}
					break;
				case DTDTAG:
					if (ifdt == "exif") {
						mess.dtdigital = vdate(np);
					}
					break;
				case AUTHTAG:
					if (ifdt === undefined) {
						rec = new ifdrecord(np);
						if (rec.lon < 5 && rec.lon > 0) mess.author = rec.data;
						else mess.author = rec.extend;
					}
					break;
				case TITLETAG:
					if (ifdt === undefined) {
						rec = new ifdrecord(np);
						if (rec.lon < 5 && rec.lon > 0) mess.title = rec.data;
						else mess.title = rec.extend;
					}
					break;
				case GPSLTREF:
					if (ifdt == "gps") {
						rec = new ifdrecord(np);
						if (mess.gpslat === null) mess.gpslat = 1;
						mess.gpslat *= (rec.data.substring(0,1) == "N") ? 1 :-1;
					}
					break ;
				case GPSLAT:
					if (ifdt == "gps") {
						rec = new ifdrecord(np);
						if (mess.gpslat === null) mess.gpslat = 1;
						mess.gpslat *= (rec.extend[0] + (rec.extend[1]/60) + (rec.extend[2]/3600));
					}
					break;
				case GPSLNREF:
					if (ifdt == "gps") {
						rec = new ifdrecord(np);
						if (mess.gpslon === null) mess.gpslon = 1;
						mess.gpslon *= (rec.data.substring(0,1) == "E") ? 1 :-1;
					}
					break ;
				case GPSLON:
					if (ifdt == "gps") {
						rec = new ifdrecord(np);
						if (mess.gpslon === null) mess.gpslon = 1;
						mess.gpslon *= (rec.extend[0] + (rec.extend[1]/60) + (rec.extend[2]/3600));
					}
					break;
				case GPSALREF:
					if (ifdt == "gps") {
						rec = new ifdrecord(np);
						if (mess.gpsalt === null) mess.gpsalt = 1;
						mess.gpsalt *= rec.data[0] ? -1 : 1;
					}
					break;
				case GPSALT:
					if (ifdt == "gps") {
						rec = new ifdrecord(np);
						if (mess.gpsalt === null) mess.gpsalt = 1;
						mess.gpsalt *= rec.extend[0];
					}
					break;
				case GPSTIME:
					if (ifdt == "gps") {
						var hr , mn , sg
						rec = new ifdrecord(np);
						hr = Math.floor(rec.extend[0]);
						rec.extend[1] +=  (rec.extend[0] - hr ) * 60;
						mn = Math.floor(rec.extend[1]);
						rec.extend[2] +=  (rec.extend[1] - mn ) * 60;
						sg = Math.round(rec.extend[2]);
						gpst = "T" + hr.toString() + ":" + mn.toString() + ":" + sg.toString();
						if (gpsd) mess.gpsdate = new Date(gpsd + gpst);
					}
					break;
				case GPSDATE:
					if (ifdt == "gps") {
						rec = new ifdrecord(np);
						gpsd = rec.extend.substr(0 , rec.lon -1).replace(/:/g , "-");
						if (gpst) mess.gpsdate = new Date(gpsd + gpst);
					}
					break;
			}
			np += 12;
		}
		
		return calc(data[np] , data[np + 1] , data[np + 2 ] , data[np + 3]);
	}
	var calc = function( a, b ,c ,d){
		if (c === undefined ){
			return bigendian ? (a * 0x100) + b : (b * 0x100) + a;
		}
		return bigendian ? (a * 0x1000000) + (b * 0x10000) + ( c * 0x100) + d : (d * 0x1000000) + (c * 0x10000) + ( b * 0x100) + a; 
	}
	
	var calcsg = function( a, b ,c ,d){
		var s;
		if (c === undefined ){
			s = ( bigendian ? a : b ) >>> 7 == 1 ? -1 : 1; 
			return s * (bigendian ? ((a & 0x7F) * 0x100) + b : ((b & 0x7F) * 0x100) + a);
		}
		s = ( bigendian ? a : d ) >>> 7 == 1 ? -1 : 1; 
		return bigendian ? ((a & 0x7f) * 0x1000000) + (b * 0x10000) + ( c * 0x100) + d : ((d & 0x7f) * 0x1000000) + (c * 0x10000) + ( b * 0x100) + a; 
	}
	loadend(reader.readAsArrayBuffer(file));
}