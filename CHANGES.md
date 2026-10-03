Added official stamp-placement descriptions from the bundled GPX files for all three trails. Stamp popups list alternatives and link to their exact coordinates. Rebuild with `node scripts/build-trail-data.js` after replacing source GPX files.

Tap “My location” on the map and allow location access. Within 2 km of the active trail, a red marker shows your actual GPS position with an accuracy circle. A red vertical line shows the nearest route position on the elevation chart when that segment is selected. Reverse direction is supported. Tap “Stop location” to stop tracking. Location requires HTTPS (or localhost) and is not stored by this feature.

Validation: `node tests/location.test.js`; JavaScript syntax checks. Tests cover projection, the 2 km threshold, forward/reverse profile positions, selected route handling, all stamp descriptions, GPS marker updates, permission denial, and stopping tracking. Full browser/map integration still needs checking on a connected HTTPS host: this workspace could not reach the Leaflet CDN or start a local web server.

Service worker and asset versions updated to 65. These changes have not been pushed to GitHub.
