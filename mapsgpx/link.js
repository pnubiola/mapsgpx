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
	link.create = function(txt ,parent , type , fnm){
		var e = document.createElementNS("http://www.topografix.com/GPX/1/1" , "link");
		var w = document.createAttribute("href")
		w.value = txt;
		e.setAttributeNode(w);
		if (fnm !== undefined){
			w = document.createTextNode(fnm);
			var text = document.createElementNS("http://www.topografix.com/GPX/1/1" , "text");
			text.appendChild(w);
			e.appendChild(text);
		}
		w = document.createTextNode(type);
		var tp = document.createElementNS("http://www.topografix.com/GPX/1/1" , "type");
		tp.appendChild(w);
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
			att.value = href;
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

