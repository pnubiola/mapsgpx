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
