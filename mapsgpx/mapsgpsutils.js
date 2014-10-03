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
