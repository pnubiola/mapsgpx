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

var mapsgpx = function(mapcanvas , gpxfile , imgfiles) {
	var file = gpxfile[0];
	var mapcnv = mapcanvas;
	var imgf = imgfiles; 
	var reader = new FileReader();
	var xmldata = null;
	var lat = null;
	var lon = null;
	var UserData = null;
	var wayp = null;
	var rte = null;
	var tck = null;
	var map = null;
	var numWorkers = 0;
	this.getUser = function(elen) {
		if (UserData) UserData.getUserData(elen);
		else null;
	}
	this.readFileImages= function(im){
		setWorkers(im);
	}
	var setWorkers = function(im){
		numWorkers = im.length;
		for (var i = 0 ; i < numWorkers ; i++){
			var w = new Worker('mapsgpximg.js');
			w.onmessage = getWorkerResult ;
			im[i].hasWayPoint = false;
			w.postMessage(im[i]);
		}
		
	}
	reader.onloadend = function() {
		if (window.DOMParser) {
			parser = new DOMParser();
			xmldata = parser.parseFromString(reader.result, "text/xml");
		} else { // Internet Explorer
			xmldata = new ActiveXObject("Microsoft.XMLDOM");
			xmldata.async = false;
			xmldata.loadXML(txt);
		}
		// metadata
		var calccenter;
		var lonmax;
		var lonmin;
		var latmax;
		var latmin;
		var data = xmldata.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1", "metadata");
		if (data.length > 0) {
			UserData = new userdata();
			var a = UserData.setUserData(data[0]);
			if (a) {
				latmax = UserData.getMaxlat();
				latmin = UserData.getMinlat();
				lonmax = UserData.getMaxlon();
				lonmin = UserData.getMinlon();
				calccenter = false;
			}
		} else {
			latmax = -180;
			latmin = 180;
			lonmax = -180;
			lonmin = 180;
			calccenter = true;
		}
		// waypoint
		var data = xmldata.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1", "wpt");
		for (var i = 0; i < data.length; i++) {
			if (i == 0)	wayp = [];
			wayp[i] = new waypoint();
			wayp[i].init(data[i]);
			if (calccenter) {
				if (latmax < wayp[i].getMaxLat()) latmax = wayp[i].getMaxLat();
				if (latmin < wayp[i].getMinLat()) latmin = wayp[i].getMinLat();
				if (lonmax < wayp[i].getMaxLon()) lonmax = wayp[i].getMaxLon();
				if (lonmin < wayp[i].getMinLon()) lonmin = wayp[i].getMinLon();
			}
		}
		// routes
		var data = xmldata.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1", "rte");
		for (var i = 0; i < data.length; i++) {
			if (i == 0)
				rte = [];
			rte[i] = new route(data[i]);
			if (calccenter) {
				if (latmax < rte[i].getMaxLat()) latmax = rte[i].getMaxLat();
				if (latmin < rte[i].getMinLat()) latmin = rte[i].getMinLat();
				if (lonmax < rte[i].getMaxLon()) lonmax = rte[i].getMaxLon();
				if (lonmin < rte[i].getMinLon()) lonmin = rte[i].getMinLon();
			}
		}
		// tracks
		var data = xmldata.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1", "trk");
		for (var i = 0; i < data.length; i++) {
			if (i == 0)
				tck = [];
			tck[i] = new track(data[i]);
			if (calccenter) {
				if (latmax < tck[i].getMaxLat()) latmax = tck[i].getMaxLat();
				if (latmin < tck[i].getMinLat()) latmin = tck[i].getMinLat();
				if (lonmax < tck[i].getMaxLon()) lonmax = tck[i].getMaxLon();
				if (lonmin < tck[i].getMinLon()) lonmin = tck[i].getMinLon();
			}
		}
		// create map
		var mapOptions = {
			center : new google.maps.LatLng((latmax + latmin) / 2,	(lonmax + lonmin) / 2),
			zoom : 8,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(mapcnv, mapOptions);
		for (var i = 0; i < wayp.length; i++) {
			wayp[i].map(map)
		}
		if (rte)
			for (var i = 0; i < rte.length; i++) {
				rte[i].mapRoute(map);
			}
		if (tck)
			for (var i = 0; i < tck.length; i++) {
				tck[i].mapTrack(map);
			}
		// read immages
		setWorkers(imgf);
	}
	var createWayPoint = function(mes){
		var wp = document.createElementNS("http://www.topografix.com/GPX/1/1" , "wpt");
		var att = document.createAttribute("lat");
		att.value = mes.gpslat.toString();
		wp.setAttributeNode(att);
		att = document.createAttribute("lon");
		att.value = mes.gpslon.toString();
		wp.setAttributeNode(att);
		var w;
		if (mes.gpsalt){
			w = document.createElementNS("http://www.topografix.com/GPX/1/1" , "ele");
			w.innerHtml = mes.gpsalt.toString();
			wp.appendChild(w);
		}
		if (mes.gpsdate){
			w = document.createElementNS("http://www.topografix.com/GPX/1/1" , "time");
			w.innerHtml = mes.gpsdate.toISOString();
			wp.appendChild(w);
		}else if(mes.dtoriginal){
			w = document.createElementNS("http://www.topografix.com/GPX/1/1" , "time");
			w.innerHtml = mes.dtoriginal.toISOString();
			wp.appendChild(w);			
		}else if(mes.dtchange){
			w = document.createElementNS("http://www.topografix.com/GPX/1/1" , "time");
			w.innerHtml = mes.dtchange.toISOString();
			wp.appendChild(w);			
		}else if(mes.dtdigital){
			w = document.createElementNS("http://www.topografix.com/GPX/1/1" , "time");
			w.innerHtml = mes.dtdigital.toISOString();
			wp.appendChild(w);			
		}
		if (mes.author){
			w = document.createElementNS("http://www.topografix.com/GPX/1/1" , "name");
			w.innerHtml = mes.author;
			wp.appendChild(w);
		}		
		if (mes.title){
			w = document.createElementNS("http://www.topografix.com/GPX/1/1" , "desc");
			w.innerHtml = mes.title;
			wp.appendChild(w);
		}		
		w = document.createElementNS("http://www.topografix.com/GPX/1/1" , "symb");
		w.innerHtml = "Pin, Red";
		wp.appendChild(w);
		var rx = /^(rte|trk|extensions)$/g;
		var k = xmldata.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1","gpx")[0].firstElementChild;
		while (k && !rx.test(k.tagname)) k = k.nextElementSibling;
		wp = xmldata.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1","gpx")[0].insertBefore(w , k);
		if (wayp)	wayp = [];
		var i = wayp.length;
		wayp[i] = new waypoint();
		wayp[i].init(wp);
		return wayp[i]; 
	}
	var getWorkerResult = function(event){
		var dt = event.data;
		if (dt.error == null && dt.gpslat != null && dt.gpslon != null ){
			var wp = new pointloc(dt.gpslat , dt.gpslon);
			var dp = null;
			var d = 100;
			for (var i = 0 ; i < wayp.length ; i++){
				dp = wayp[i].mindistance(wp , d , dp);
				if (dp) d = dp.distance;
			}
			if (rte)
				for (var i = 0 ; i < rte.length ; i++){
					dp = rte[i].mindistance(wp , d , dp);
					if (dp) d = dp.distance;
				}
			if (tck)
				for (var i = 0 ; i < tck.length ; i++){
					dp = tck[i].mindistance(wp , d , dp);
					if (dp) d = dp.distance;
				}
			if (dp &&  dp.wp){
				dp.wp.addLinks(dt);
				dp.wp.map(map);
			}else{
				var n = createWayPoint(dt);
				n.addLinks(dt);
				n.map(map);
			}
			
		}
		
	}

	if (file) {
		reader.readAsText(file);
	}
}
var distance = function(p1, p2 ) {
	
	var tr  = 6371000; // m
	var lt1 = p1.lat * Math.PI / 180;
	var lt2 = p2.lat * Math.PI / 180;
	var ltinc = (p2.lat - p1.lat) * Math.PI / 180;
	var lninc = (p2.lon - p1.lon) * Math.PI / 180;

	var a = Math.sin(ltinc/2) * Math.sin(ltinc/2) + Math.cos(lt1) * Math.cos(lt2) * Math.sin(lninc/2) * Math.sin(lninc/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	return tr * c;
}

var getColor = function(color) {
	switch (color) {
	case "Black":
		return "#000000";
	case "DarkRed":
		return "#8B0000";
	case "DarkGreen":
		return "#006400";
	case "DarkYellow":
		return "#9B870C";
	case "DarkBlue":
		return "#00008B";
	case "DarkMagenta":
		return "#8B008B";
	case "DarkCyan":
		return "#008B8B";
	case "LightGray":
		return "#D3D3D3";
	case "DarkGray":
		return "#A9A9A9";
	case "Red":
		return "#FF0000";
	case "Green":
		return "#008000";
	case "Yellow":
		return "#FFFF00";
	case "Blue":
		return "#0000FF";
	case "Magenta":
		return "#FF00FF";
	case "Cyan":
		return "#00FFFF";
	case "White":
		return "#FFFFFF";
	case "Transparent":
		return "#000000";
	}
}
var pointloc = function(x, y , d) {
	this.lat = x;
	this.lon = y;
	this.distance = null;
	this.wp = null;
	if (d !== undefined){
		this.distance = d;
	}
}
var getNodesValue = function(ele, ns, tag) {
	var name = ele.getElementsByTagNameNS(ns, tag);
	if (!name.length || !name[0].hasChildNodes())
		return null;
	return name[0].childNodes[0].nodeValue;
}
var userdata = function() {
	var name;
	var desc;
	var author;
	var copyright;
	var lnk;
	var time;
	var keywords;
	var minlat;
	var maxlat;
	var minlon;
	var maxlon;

	this.setUserData = function(metadata) {
		name = getNodesValue(metadata, "http://www.topografix.com/GPX/1/1",
				"name");
		desc = getNodesValue(metadata, "http://www.topografix.com/GPX/1/1",
				"desc");
		author = getNodesValue(metadata, "http://www.topografix.com/GPX/1/1",
				"author");
		copyright = getNodesValue(metadata,
				"http://www.topografix.com/GPX/1/1", "copyright");
		// link =
		// getNodesValue(metadata,"http://www.topografix.com/GPX/1/1","link");
		lnk = metadata.getElementsByTagNameNS(
				"http://www.topografix.com/GPX/1/1", "link");
		if (lnk.length > 0)
			lnk = new link(lnk[0]);
		else
			lnk = null;
		time = getNodesValue(metadata, "http://www.topografix.com/GPX/1/1",
				"time");
		if (time) {
			time = new Date(time);
		}
		keywords = getNodesValue(metadata, "http://www.topografix.com/GPX/1/1",
				"keywords");
		var bounds = metadata.getElementsByTagNameNS(
				"http://www.topografix.com/GPX/1/1", "bounds");
		if (bounds.length > 0) {
			if (bounds[0].hasAttributeNS("http://www.topografix.com/GPX/1/1",
					"minlat")) {
				minlat = parseFloat(bounds[0].getAttributeNs(
						"http://www.topografix.com/GPX/1/1", "minlat"));
				maxlat = parseFloat(bounds[0].getAttributeNs(
						"http://www.topografix.com/GPX/1/1", "maxlat"));
				minlon = parseFloat(bounds[0].getAttributeNs(
						"http://www.topografix.com/GPX/1/1", "minlon"));
				maxlon = parseFloat(bounds[0].getAttributeNs(
						"http://www.topografix.com/GPX/1/1", "maxlon"));
			} else if (bounds[0].hasAttribute("minlat")) {
				minlat = parseFloat(bounds[0].getAttribute("minlat"));
				maxlat = parseFloat(bounds[0].getAttribute("maxlat"));
				minlon = parseFloat(bounds[0].getAttribute("minlon"));
				maxlon = parseFloat(bounds[0].getAttribute("maxlon"));
			} else
				return null;
			return {
				maxlat : maxlat,
				minlat : minlat,
				maxlon : maxlon,
				minlon : minlon
			};
		}
		return null;
	}
	this.getMaxlat = function() {
		return maxlat;
	}
	this.getMinlat = function() {
		return minlat;
	}
	this.getMaxlon = function() {
		return maxlon;
	}
	this.getMinlon = function() {
		return minlon;
	}
	this.getUserData = function(elen) {
		var ele = document.getElementById(elen);
		if (!ele){
			console.log("not element for getUserData " + elen);
		}
		while (ele.firstChild) {
			ele.removeChild(ele.firstChild);
		}
		if (name) {
			this.addDivNode(ele, "name", name);
		}
		if (desc) {
			this.addDivNode(ele, "desc", desc);
		}
		if (author) {
			this.addDivNode(ele, "author", author);
		}
		if (copyright) {
			this.addDivNode(ele, "copyright", copyright);
		}
		if (lnk) {
			this.addDivNode(ele, "link", lnk, 1);
		}
		if (time) {
			this.addDivNode(ele, "time", time.toLocaleDateString() + " "
					+ time.toLocaleTimeString());
		}
		if (keywords) {
			this.addDivNode(ele, "keywords", link);
		}
		var e = document.createElement("button");
		e.innerHTML = "Click for hide info";
		e.onclick = function() {
			document.getElementById(ele.getAttribute("id")).style.display = "none";
		};
		e.style.margin = "auto";
		e.style.display = "block";
		ele.style.display = "block";
		ele.appendChild(e);
	}
	this.addDivNode = function(ele, l, v, ln) {
		var div;
		var lab;
		var val;
		var att;
		div = document.createElement('div');
		lab = document.createElement('span');
		val = document.createElement('span');
		if (lab) {
			att = document.createAttribute("class");
			att.value = "label";
			lab.setAttributeNode(att);
			lab.appendChild(document.createTextNode(l + ": "));
			div.appendChild(lab);
		}
		if (val) {
			att = document.createAttribute("class");
			att.value = "value";
			val.setAttributeNode(att);
			if (ln && v)
				val.appendChild(v.getAsChild());
			else
				val.appendChild(document.createTextNode(v));
			div.appendChild(val);
		}
		ele.appendChild(div);
	}
}
var link = function(ele) {
	var xmlele = ele;
	var ref = null;
	var text = null;
	var type = null
	if (ele.hasAttributeNS("http://www.topografix.com/GPX/1/1", "href")) {
		ref = ele.getAttributeNs("http://www.topografix.com/GPX/1/1", "href")
	} else if (ele.hasAttribute("href")) {
		ref = ele.getAttribute("href")
	}
	text = getNodesValue(ele, "http://www.topografix.com/GPX/1/1", "text");
	type = getNodesValue(ele, "http://www.topografix.com/GPX/1/1", "type");
	if (!type) {
		if ((text && (text.endsWith(".jpg") || text.endsWith(".jpeg"))) || (ref && (ref.endsWith(".jpg") || ref.endsWith(".jpeg")))){
			type = "image/jpeg";
		}   
	}
	link.create = function(txt ,parent , type){
		var e = document.createElementNS("http://www.topografix.com/GPX/1/1" , "link");
		var w = document.createTextNode(txt);
		var tx = document.createElementNS("http://www.topografix.com/GPX/1/1" , "text");
		tx.appendChild(w);
		var w = document.createTextNode(type);
		var tp = document.createElementNS("http://www.topografix.com/GPX/1/1" , "type");
		tp.appendChild(w);
		e.appendChild(tx);
		e.appendChild(tp);
		if (parent ) {
			var k = parent.firstElementChild;
			if (k == null) {
				parent.appendChild(e);
			}else{
				var rx ;
				if (parent.tagname == "metadata"){
					rx = /^(time|keywords|bounds|extensions)$/g;
				}else {
					rx = /sym|type|fix|sat|hdop|vdop|pdop|ageofdgpsdata|dgpsid|exrtensions/g;
				}
				while (k && !rx.test(k.tagname)) k = k.nextElementSibling;
				e = parent.insertBefore(e , k);
			}
		}
		var lk = new link(e)
		return lk;
	}
	this.getAsChild = function() {
		var ret;
		var rgx = /image\/jpeg/g;
		if (type && rgx.test(type)){
			ret = document.createElement("img");
			att = document.createAttribute("src");
			rgx = /base64/g;
			if (rgx.test(type)){
				att.value = text;
			}else
				att.value = text ? text : href;
			ret.setAttributeNode(att);
			return ret;
		}
		ret = document.createElement("a");
		if (ref) {
			ret.href = ref;
		}
		if (text && type) {
			ret.innerHTML = text + " type: " + type;
		} else if (text) {
			ret.innerHTML = text;
		} else if (type) {
			ret.innerHTML = "type: " + type;
		} else {
			ret.innerHTML = href;
		}
		return ret;
	}
}
var rpoint = function(wp) {
	this.lat = null;
	this.lon = null;
	if (wp.hasAttributeNS("http://www.garmin.com/xmlschemas/GpxExtensions/v3",
			"lat")) {
		this.lat = parseFloat(wp.getAttributeNs(
				"http://www.garmin.com/xmlschemas/GpxExtensions/v3", "lat"));
		this.lon = parseFloat(wp.getAttributeNs(
				"http://www.garmin.com/xmlschemas/GpxExtensions/v3", "lon"));
	} else if (wp.hasAttribute("lat")) {
		this.lat = Number.parseFloat(wp.getAttribute("lat"));
		this.lon = parseFloat(wp.getAttribute("lon"));
	} else
		return -1;

}
var waypoint = function() {
	urlsimb = "http://maps.google.com/mapfiles/kml/";
	var gpxsymb = [ "Waypoint", "Flag, Red", "Pin, Red", "Diamond, Red",
			"Triangle, Red", "Square, Red", "Rectangle, Red", "Block, Red",
			"Circle, Red", "Oval, Red", "Flag, Green", "Pin, Green",
			"Diamond, Green", "Triangle, Green", "Square, Green",
			"Rectangle, Green", "Block, Green", "Circle, Green", "Oval, Green",
			"Flag, Blue", "Pin, Blue", "Diamond, Blue", "Triangle, Blue",
			"Square, Blue", "Rectangle, Blue", "Block, Blue", "Circle, Blue",
			"Oval, Blue", "Dot, White", "Circle with X", "Residence" ];
	var mapssymb = [ "wht-square-lv.png", "RedFlag.png", "red-pushpin.png",
			"RedDiamond.png", "RedTriangle.png", "RedSquare.png",
			"RedRectangle.png", "RedBlock.png", "RedCircle.png", "RedOval.png",
			"GreenFlag.png", "grn-pushpin.png", "GreenDiamond.png",
			"GreenTriangle.png", "GreenSquare.png", "GreenRectangle.png",
			"GreenBlock.png", "GreenCircle.png", "GreenOval.png",
			"BlueFlag.png", "Blue-pushpin.png", "BlueDiamond.png",
			"BlueTriangle.png", "BlueSquare.png", "BlueRectangle.png",
			"BlueBlock.png", "BlueCircle.png", "BlueOval.png", "WhiteDot.png",
			"CircleWithX.png", "Residence.png" ];
	var lat = null;
	var lon = null;
	var maxLat = null;
	var minLat = null;
	var maxLon = null;
	var minLon = null;
	var elev = null;
	var name = null;
	var desc = null;
	var streetAddres = null;
	var city = null;
	var state = null;
	var country = null;
	var icon = null;
	var image = null;
	var rtpoints = null;
	this.time = null
	this.ord;
	var marker = null;
	var xmlele = null;
	this.init = function(wp, ord) {
		if (ord !== undefined) {
			this.ord = ord;
		}
		if (wp.hasAttributeNS("http://www.topografix.com/GPX/1/1", "lat")) {
			lat = parseFloat(wp.getAttributeNs(
					"http://www.topografix.com/GPX/1/1", "lat"));
			lon = parseFloat(wp.getAttributeNs(
					"http://www.topografix.com/GPX/1/1", "lon"));
		} else if (wp.hasAttribute("lat")) {
			lat = parseFloat(wp.getAttribute("lat"));
			lon = parseFloat(wp.getAttribute("lon"));
		} else
			return -1;
		xmlele = wp;
		maxLat = lat;
		minLat = lat;
		maxLon = lon;
		minLon = lon;
		elev = getNodesValue(wp, "http://www.topografix.com/GPX/1/1", "ele");
		name = getNodesValue(wp, "http://www.topografix.com/GPX/1/1", "name");
		desc = getNodesValue(wp, "http://www.topografix.com/GPX/1/1", "desc");
		icon = getNodesValue(wp, "http://www.topografix.com/GPX/1/1", "sym");
		if (icon) {
			for (var i = 0; i < gpxsymb.length; i++)
				if (icon == gpxsymb[i])
					icon = "icones/" + mapssymb[i];
		}
		var w = wp.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1","link");
		if (w && w.length) {
			if (!image) image = [];
			for (var i = 0; i < w.length; i++)
				image[i] = new link(w[i]);
		}
		w = getNodesValue(wp, "http://www.topografix.com/GPX/1/1", "time");
		if (w)	this.time = Date.parse(w);
		// garmin extension
		streetAdress = getNodesValue(wp,
				"http://www.garmin.com/xmlschemas/GpxExtensions/v3",
				"StreetAddress");
		city = getNodesValue(wp, "http://www.garmin.com/xmlschemas/GpxExtensions/v3", "City");
		state = getNodesValue(wp, "http://www.garmin.com/xmlschemas/GpxExtensions/v3", "State");
		country = getNodesValue(wp, "http://www.garmin.com/xmlschemas/GpxExtensions/v3", "Country");
		w = wp.getElementsByTagNameNS("http://www.garmin.com/xmlschemas/GpxExtensions/v3", "rpt");
		for (var i = 0; i < w.length; i++) {
			if (i == 0)
				rtpoints = [];
			rtpoints[i] = new rpoint(w[i]);
			if (rtpoints[i].lat > maxLat)
				maxLat = rtpoints[i].lat;
			else if (rtpoints[i].lat < minLat)
				minLat = rtpoints[i].lat;
			if (rtpoints[i].lon > maxLon)
				maxLon = rtpoints[i].lon;
			else if (rtpoints[i].lon < minLon)
				minLon = rtpoints[i].lon;
		}
	}
	this.getTime = function() {
		return this.time;
	}
	this.getOrd = function() {
		return this.ord;
	}
	this.setTime = function(t) {
		time = t
	};
	this.getLat = function() {
		return this.lat;
	}
	this.getLon = function() {
		return this.lon;
	}
	this.getMaxLat = function() {
		return this.maxLat;
	}
	this.getMaxLon = function() {
		return this.maxLon;
	}
	this.getMinLat = function() {
		return this.minLat;
	}
	this.getMinLon = function() {
		return this.minLon;
	}
	
	this.addIMG = function(txt){
		var ln = link.create(txt , this.xmlelem , "image/jpeg");
		if (!image) image = [];
		image[image.length] = ln;
	}
	var setSpawnElem = function(mes , val){
		var ret = document.createElement("div");
		for (var i = 0 ; i < translates.length ; i++){
			var e = document.createElement("spawn");
			var at = document.createAttribute("lang");
			at.value = translates[i]
			e.setAttributeNode(at);
			at = document.createAttribute("class");
			at.value = "linklabel";
			e.setAttributeNode(at);
			e.innerHTML = translate_lang[ translates[i]][mes] + ": ";
			ret.appendChild(e);
		}
		var e1 = document.createElement("spawn");
		at1 = document.createAttribute("class");
		at1.value = "linkvalue";
		e1.setAttributeNode(at1);
		e1.innerHTML = val;
		ret.appendChild(e1);
		return ret;
	}
	this.addLinks = function(mes){
		var txt = document.createElement("div");
		if (mes.filename !== null) txt.appendChild(setSpawnElem("filename" , mes.filename));
		if (mes.dtchange != null) txt.appendChild(setSpawnElem("dtchange" , mes.dtchange.toLocaleString()));
		if (mes.dtoriginal != null) txt.appendChild(setSpawnElem("dtoriginal", mes.dtoriginal.toLocaleString()));
		if (mes.dtdigital != null) txt.appendChild(setSpawnElem('dtdigital', mes.dtdigital.toLocaleString()));
		if (mes.author !== null) txt.appendChild(setSpawnElem('author', mes.author));
		if (mes.title !== null)	 txt.appendChild(setSpawnElem('title', mes.title));
		if (mes.gpslat !== null) txt.appendChild(setSpawnElem('gpslat', mes.gpslat.toString()));
		if (mes.gpslon !== null) txt.appendChild(setSpawnElem('gpslon', mes.gpslon.toString()));
		if (mes.gpsalt !== null) txt.appendChild(setSpawnElem('gpsalt', mes.gpsalt.toString()));
		if (mes.gpsdate !== null) txt.appendChild(setSpawnElem('gpsdate', mes.gpsdate.toLocaleString()));
		if (mes.error !== null)  txt.appendChild(setSpawnElem('meserror', mes.error));
		if (txt.hasChildNodes()){
			var s = new XMLSerializer(); 
			var ln = link.create(s.serializeToString(txt).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/>/g , "&gt;").replace(/</g , "&lt;") , this.xmlelem , "text/html");
			if (!image) image = [];
			image[image.length] = ln;			
		}
		if (mes.base64src != null){
			var ln = link.create(mes.base64src,this.xmlelem , "image/jpeg");
			if (!image) image = [];
			image[image.length] = ln;			
		}
	}
	
	this.map = function(m) {
		if (icon) {
			var myLatlng = new google.maps.LatLng(lat, lon);
			var image = {
				url : icon,
				// This marker is 20 pixels wide by 32 pixels tall.
				scaledSize : new google.maps.Size(21, 22),
				// The origin for this image is 0,0.
				origin : new google.maps.Point(0, 0),
				// The anchor for this image is the base of the flagpole at
				// 0,32.
				anchor : new google.maps.Point(7, 22)
			};

			marquer = new google.maps.Marker({
				position : myLatlng,
				title : name,
				icon : image,
				map : m
			});
		}
	}
	waypoint.sort = function(a, b) {
		if (!a.getTime() || !b.getTime()) {
			return (a.getOrd() < b.getOrd()) ? -1
					: ((a.getOrd() == b.getOrd()) ? 0 : 1);
		}
		if (a.getTime() == b.getTime()) {
			return (a.getOrd() < b.getOrd()) ? -1
					: ((a.getOrd() == b.getOrd()) ? 0 : 1);
		}
		if (a.getTime() < b.getTime())
			return -1;
		return 1;
	}
	this.getPoints = function() {
		var ret = [];
		ret[0] = new pointloc(lat, lon);

		if (rtpoints)
			for (var i = 0; i < rtpoints.length; i++) {
				ret[i + 1] = new pointloc(rtpoints[i].lat, rtpoints[i].lon);
			}
		return ret;
	}
	this.mindistance = function(p1 , d , defp){
		var p2 = new pointloc(this.lat , this.lon);
		var d1 = distance(p1 , p2);
		if (d1 < d) {
			p2.distance = d1;
			p2.wp = this;
			return p2;
		} 
		return p1;
	}
}
var route = function(ele) {
	var w;
	var name = getNodesValue(ele, "http://www.topografix.com/GPX/1/1", "name");
	var desc = getNodesValue(ele, "http://www.topografix.com/GPX/1/1", "desc");
	var link = ((w = ele.getElementsByTagNameNS(
			"http://www.topografix.com/GPX/1/1", "link")).length > 0) ? new link(
			w)
			: null;
	var color = getNodesValue(ele,
			"http://www.garmin.com/xmlschemas/GpxExtensions/v3", "DisplayColor");
	var rtepoint = null;
	w = ele
			.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1",
					"rtept");
	var latmax = -180;
	var latmin = 180;
	var lonmax = -180;
	var lonmin = 180;
	var time;
	for (var i = 0; i < w.length; i++) {
		if (i == 0)
			rtepoint = [];
		rtepoint[i] = new waypoint();
		rtepoint[i].init(w[i], i);
		if (latmax < rtepoint[i].getMaxLat())
			latmax = rtepoint[i].getMaxLat();
		if (latmin < rtepoint[i].getMinLat())
			latmin = rtepoint[i].getMinLat();
		if (lonmax < rtepoint[i].getMaxLon())
			lonmax = rtepoint[i].getMaxLon();
		if (lonmin < rtepoint[i].getMinLon())
			lonmin = rtepoint[i].getMinLon();
		if (rtepoint[i].getTime())
			time = rtepoint[i].getTime();
		else if (time)
			rtepoint[i].setTime(time);
	}
	if (rtepoint.length)
		rtepoint.sort(waypoint.sort);
	this.getMaxLat = function() {
		return this.latmax;
	}
	this.getMaxLon = function() {
		return this.lonmax;
	}
	this.getMinLat = function() {
		return this.latmin;
	}
	this.getMinLon = function() {
		return this.lonmin;
	}
	this.mapRoute = function(m) {
		var point = 0;
		var mp;
		if (!rtepoint)
			return;
		for (var i = 0; i < rtepoint.length; i++) {
			rtepoint[i].map(m)
			var p = rtepoint[i].getPoints();
			for (var j = 0; j < p.length; j++) {
				if (!point)
					mp = [];
				mp[point] = new google.maps.LatLng(p[j].lat, p[j].lon);
				point++;
			}
		}
		var sc, so;
		if (color) {
			sc = getColor(color);
			so == color == "Transparent" ? 0. : 1.;
		} else {
			sc = "#FF00FF";
			so = 1.;
		}

		var flightPath = new google.maps.Polyline({
			path : mp,
			geodesic : true,
			strokeColor : sc,
			strokeOpacity : so,
			strokeWeight : 4.,
			map : m
		});
	}
	this.mindistance = function(p1 , d , defp){
		var pd = defp;
		var d2 = d;
		for (var i = 0; i < rtpoint.length ; i++){
			d2 = rtpoint[i].mindistance(p1 , d2 , pd);
			if (d2) {
				d2 = pd.distance;
			}
		}
		return d2 ;
	}
}
var segment = function() {
	this.pt = [];
}
var track = function(ele) {
	track.sort = function(a, b) {
		if (!a.time || !b.time) {
			return (a.ord < b.ord) ? -1 : ((a.ord == b.ord) ? 0 : 1);
		}
		if (a.time == b.time) {
			return (a.ord < b.ord) ? -1 : ((a.ord == b.ord) ? 0 : 1);
		}
		if (a.time < b.time)
			return -1;
		return 1
	}
	var w;
	var latmax = -180;
	var latmin = 180;
	var lonmax = -180;
	var lonmin = 180;
	var name = getNodesValue(ele, "http://www.topografix.com/GPX/1/1", "name");
	var desc = getNodesValue(ele, "http://www.topografix.com/GPX/1/1", "desc");
	var link = ((w = ele.getElementsByTagNameNS(
			"http://www.topografix.com/GPX/1/1", "link")).length > 0) ? new link(
			w)
			: null;
	var color = getNodesValue(ele,
			"http://www.garmin.com/xmlschemas/GpxExtensions/v3", "DisplayColor");
	var seg = null;
	w = ele.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1",
			"trkseg");
	for (var i = 0; i < w.length; i++) {
		var ww = w[i].getElementsByTagNameNS(
				"http://www.topografix.com/GPX/1/1", "trkpt");
		var j;
		var time;
		for (var j = 0; j < ww.length; j++) {
			if (j == 0) {
				if (i == 0)
					seg = [];
				seg[i] = new segment();
			}
			seg[i].pt[j] = new waypoint();
			seg[i].pt[j].init(ww[j], j);
			if (latmax < seg[i].pt[j].getMaxLat())
				latmax = seg[i].pt[j].getMaxLat();
			if (latmin < seg[i].pt[j].getMinLat())
				latmin = seg[i].pt[j].getMinLat();
			if (lonmax < seg[i].pt[j].getMaxLon())
				lonmax = seg[i].pt[j].getMaxLon();
			if (lonmin < seg[i].pt[j].getMinLon())
				lonmin = seg[i].pt[j].getMinLon();
			if (seg[i].pt[j].getTime())
				time = seg[i].pt[j].getTime();
			else if (time)
				seg[i].pt[j].setTime(time);

		}
		if (j) {
			seg[i].pt.sort(waypoint.sort);
			if (seg[i].pt[j - 1].getTime())
				seg[i].time = seg[i].pt[j - 1].getTime();
			seg[i].ord = i;
		}
	}
	// if (seg) seg.sort(track.sort);
	this.getMaxLat = function() {
		return this.latmax;
	}
	this.getMaxLon = function() {
		return this.lonmax;
	}
	this.getMinLat = function() {
		return this.latmin;
	}
	this.getMinLon = function() {
		return this.lonmin;
	}
	this.mapTrack = function(m) {
		var point = 0;
		var mp;
		if (!seg)
			return;
		for (var i = 0; i < seg.length; i++) {
			for (var j = 0; j < seg[i].pt.length; j++) {
				seg[i].pt[j].map(m)
				var p = seg[i].pt[j].getPoints();
				for (var k = 0; k < p.length; k++) {
					if (!point)
						mp = [];
					mp[point] = new google.maps.LatLng(p[k].lat, p[k].lon);
					point++;
				}
			}
		}
		var sc, so;
		if (color) {
			sc = getColor(color);
			so == color == "Transparent" ? 0. : 1.;
		} else {
			sc = "#FF00FF";
			so = 1.;
		}

		var flightPath = new google.maps.Polyline({
			path : mp,
			geodesic : true,
			strokeColor : sc,
			strokeOpacity : so,
			strokeWeight : 4.,
			map : m
		});
	}
	this.mindistance = function(p1 , d , defp){
		var pd = defp;
		var d2 = d;
		if (!seg)
			return pd;
		for (var i = 0; i < seg.length; i++) {
			for (var j = 0; j < seg[i].pt.length; j++) {
				d2 = seg[i].pt[j].mindistance(p1 , d2 , pd);
				if (d2) {
					d2 = pd.distance;
				}
			}
		}
		return d2 ;
	}

}
