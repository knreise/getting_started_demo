Working map example of KNReiseAPI
=================================

Oppsett
-------
 - Hent inn KNreiseAPI med avhengigheter, samt Leaflet  med Bower, eller last ned alle nødvendige script manuelt. 
   
   ´´bower install´´


 - Vi skal lage et fullskjermskart som også tilpasser seg til mobile enheter. Det gjøres veldig enkelt. Alt vi trenger av HTML er en div-tagg som har en id vi kan bruke videre. 

   <div id="map"></div>

 - Av CSS trenger vi også minimalt:

	body {
	    padding: 0;
	    margin: 0;
	}
	html, body, #map {
	    height: 100%;
	}

	.leaflet-popup-content-wrapper {
    	max-height: 300px;
    	overflow: auto;
	}

 - Alt annet styrer vi i Javascript i main.js. Hopp inn i filen og følg kommentarene videre. 


License
-------
This library is licensed under the Apache Software License, Version 1.1, 
see LICENSE.md

Background
----------
This library is developed by Norkart on behalf of the Norwegian arts Council as
part of the ["Kultur- og naturreise demo"-project][knreise]

[knreise]: https://github.com/knreise/demonstratorer
[doc]: https://github.com/knreise/KNReiseAPI/blob/master/doc.md
[example]: http://knreise.github.io/KNReiseAPI/examples/api.html