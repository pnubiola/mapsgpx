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

var mapsgpxmess = function(){
	this.filename = null;
	this.orientation = 1;
	this.dtchange = null;
	this.dtoriginal = null;
	this.dtdigital = null;
	this.author = null;
	this.title = null;
	this.gpslat = null;
	this.gpslon = null;
	this.gpsalt = null;
	this.gpsdate = null;
	this.base64src = null;
	this.error = null;
}

var mess_en = new mapsgpxmess();
mess_en.filename = "File Name";
mess_en.orientation = "Orientation";
mess_en.dtchange = "Changed Date";
mess_en.dtoriginal = "Original Date";
mess_en.dtdigital = "Digital Date";
mess_en.author = "Author";
mess_en.title = "Description";
mess_en.gpslat = "Latitude";
mess_en.gpslon = "Longitude";
mess_en.gpsalt = "Altitude";
mess_en.gpsdate = "GPS Date";
mess_en.base64src = "Source";
mess_en.error = "Error";

var mess_ca = new mapsgpxmess();
mess_ca.filename = "Nom del Fitxer";
mess_ca.orientation = "Orientació";
mess_ca.dtchange = "Data del canvi";
mess_ca.dtoriginal = "Data de la imatge original";
mess_ca.dtdigital = "Data de la digitalització";
mess_ca.author = "Autor";
mess_ca.title = "Descripció";
mess_ca.gpslat = "Latitud";
mess_ca.gpslon = "Longitud";
mess_ca.gpsalt = "Altitud";
mess_ca.gpsdate = "Data del gps";
mess_ca.base64src = "Codi font";
mess_ca.error = "Error";

var mess_fr = new mapsgpxmess();
mess_fr.filename = "Nom du Fichier";
mess_fr.orientation = "Orientation";
mess_fr.dtchange = "Date du change";
mess_fr.dtoriginal = "Date de l'image originale";
mess_fr.dtdigital = "Date de numérisation";
mess_fr.author = "Auter";
mess_fr.title = "Description";
mess_fr.gpslat = "Latitude";
mess_fr.gpslon = "Longitude";
mess_fr.gpsalt = "Altitude";
mess_fr.gpsdate = "Date du gps";
mess_fr.base64src = "source";
mess_fr.error = "Erreur";

var mess_es = new mapsgpxmess();
mess_ca.filename = "Nombre del Archivo";
mess_ca.orientation = "Orientación";
mess_ca.dtchange = "Fecha del cambio";
mess_ca.dtoriginal = "Fecha de la imagen original";
mess_ca.dtdigital = "Fecha de la digitalitzación";
mess_ca.author = "Autor";
mess_ca.title = "Descripción";
mess_ca.gpslat = "Latitud";
mess_ca.gpslon = "Longitud";
mess_ca.gpsalt = "Altitud";
mess_ca.gpsdate = "Fecha del gps";
mess_ca.base64src = "Código fuente";
mess_ca.error = "Error";

translate_lang = new Object();
translate_lang.en = mess_en;
translate_lang.ca = mess_ca;
translate_lang.fr = mess_fr;
translate_lang.es = mess_es;

var translates = ["ca" , "en" , "fr" , "es"];