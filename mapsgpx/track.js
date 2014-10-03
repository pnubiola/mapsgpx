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
