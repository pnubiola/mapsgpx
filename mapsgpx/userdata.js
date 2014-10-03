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
