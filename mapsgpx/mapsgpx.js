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
		if (wayp)
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
		var wp = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "wpt");
		var att = xmldata.createAttribute("lat");
		att.value = mes.gpslat.toString();
		wp.setAttributeNode(att);
		att = xmldata.createAttribute("lon");
		att.value = mes.gpslon.toString();
		wp.setAttributeNode(att);
		var w;
		if (mes.gpsalt){
			w = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "ele");
			w.innerHtml = mes.gpsalt.toString();
			wp.appendChild(w);
		}
		if (mes.gpsdate){
			w = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "time");
			w.innerHtml = mes.gpsdate.toISOString();
			wp.appendChild(w);
		}else if(mes.dtoriginal){
			w = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "time");
			w.innerHtml = mes.dtoriginal.toISOString();
			wp.appendChild(w);			
		}else if(mes.dtchange){
			w = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "time");
			w.innerHtml = mes.dtchange.toISOString();
			wp.appendChild(w);			
		}else if(mes.dtdigital){
			w = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "time");
			w.innerHtml = mes.dtdigital.toISOString();
			wp.appendChild(w);			
		}
		if (mes.author){
			w = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "name");
			w.innerHtml = mes.author;
			wp.appendChild(w);
		}		
		if (mes.title){
			w = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "desc");
			w.innerHtml = mes.title;
			wp.appendChild(w);
		}		
		w = xmldata.createElementNS("http://www.topografix.com/GPX/1/1" , "sym");
		w.innerHtml = "Pin, Red";
		wp.appendChild(w);
		var rx = /^(rte|trk|extensions)$/g;
		var k = xmldata.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1","gpx")[0].firstElementChild;
		while (k && !rx.test(k.tagname)) k = k.nextElementSibling;
		wp = xmldata.getElementsByTagNameNS("http://www.topografix.com/GPX/1/1","gpx")[0].insertBefore(wp , k);
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
