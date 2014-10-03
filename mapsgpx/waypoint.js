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
	var wpmap = null;
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
	
	this.info = function(){
		
	}
	this.map = function(m) {
		if (icon) {
			wpmap = m;
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
			google.maps.event.addListener(marquer, 'click', this.info);

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

