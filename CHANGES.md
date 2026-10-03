Added official stamp-placement descriptions from the bundled GPX files for all three trails. Stamp popups list alternatives and link to their exact coordinates. Rebuild with `node scripts/build-trail-data.js` after replacing source GPX files.

Tap “My location” on the map and allow location access. Within 2 km of the active trail, a red marker shows your actual GPS position with an accuracy circle. A red vertical line shows the nearest route position on the elevation chart when that segment is selected. Reverse direction is supported. Tap “Stop location” to stop tracking. Location requires HTTPS (or localhost) and is not stored by this feature.

Validation: `node tests/location.test.js`; JavaScript syntax checks. Tests cover projection, the 2 km threshold, forward/reverse profile positions, selected route handling, all stamp descriptions, GPS marker updates, permission denial, and stopping tracking. Full browser/map integration still needs checking on a connected HTTPS host: this workspace could not reach the Leaflet CDN or start a local web server.

Service worker and asset versions updated to 65. These changes have not been pushed to GitHub.

Version 66: position the mobile GPS control below the iPhone safe area, matching the zoom controls.

Version 67: compass direction arrow beside the GPS marker. iPhones show an Enable compass button to request sensor permission. North-referenced sensor readings drive the arrow; GPS movement heading is the fallback. Relative orientation readings are ignored. Tracking stop removes the arrow and sensor listeners. Automated heading, permission, and cleanup checks pass; physical iPhone compass testing remains to be done after deployment.

Version 68:
- Remaining distance, estimated hiking time, ascent, and descent appear above the elevation chart when the nearest GPS route position lies on the selected segments within 2 km. Stats follow forward/reverse direction. They exclude the approach from your actual position to the route. Partial ascent/descent is calculated from the segment elevation samples and scaled to the existing published totals; time remains an estimate.
- Location and compass default to enabled. Settings saves disabled choices and can reenable them. Browsers still control GPS and sensor permission; iOS may require tapping Enable compass / Allow compass access. Already permitted compass readings start automatically.
- Recommended stamp-popup hikes start collapsed under an accessible native details section.
- Added route-geometry.js and per-trail route-details JSON files generated from the original GPX. Detail tolerances are 80/25/8/2/0 metres at zoom <=9/<=11/<=13/<=15/>15. Only padded-viewport geometry reaches Leaflet; crossing edges are retained and separated offscreen paths are not joined. GPX details load for the active trail, with existing overview geometry as fallback. GPS projects onto full detail regardless of map zoom. Service worker caches the detail files for offline use.

Checks: node tests/features.test.js; node tests/location.test.js; syntax checks. Geometry preparation benchmark: whole OKT overview 2,243 points, Bakony regional view 434 points, walking-scale Városlőd view 182 points, versus 25,766 full route points. Desktop Node benchmark is not a measure of iPhone/Leaflet rendering; mobile smoothness remains to be checked. Browser launch was blocked by the execution sandbox.

Rebuild GPX artifacts: node scripts/build-trail-data.js. Benchmark: node scripts/benchmark-route-rendering.js.
