const trails = window.TRAIL_ROUTE_DATA || {};
const defaultTrailId = trails.okt ? "okt" : Object.keys(trails)[0];
const activeTrailStorageKey = "kekkor-active-trail";
const stateStoragePrefix = "kekkor-planner-state";
const travelSettingsStorageKey = "kekkor-travel-settings";
const trailPalettes = {
  okt: { color: "#1261b3", dark: "#083e7d", rgb: "18, 97, 179" },
  ak: { color: "#23864a", dark: "#145c33", rgb: "35, 134, 74" },
  rpddk: { color: "#d6a100", dark: "#735600", rgb: "214, 161, 0" },
};
const daySuggestionBands = [
  { key: "easy", label: "Easy", minDistance: 8, idealDistance: 12, maxDistance: 16 },
  { key: "normal", label: "Normal", minDistance: 16, idealDistance: 20, maxDistance: 25 },
  { key: "long", label: "Long", minDistance: 24, idealDistance: 30, maxDistance: 36 },
];
const transitousPlanUrl = "https://api.transitous.org/api/v6/plan";
const nominatimSearchUrl = "https://nominatim.openstreetmap.org/search";
const budapestOrigin = {
  name: "Budapest-Keleti",
  lat: 47.5003,
  lng: 19.0839,
};
const fallbackPalette = trailPalettes.okt;
const officialRouteUrl =
  "https://turistaterkepek.hu/server/rest/services/orszagos_kektura/kekturahu/MapServer/1/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson";
const officialStampUrl =
  "https://turistaterkepek.hu/server/rest/services/orszagos_kektura/kekturahu/MapServer/0/query?where=1%3D1&outFields=*&returnGeometry=true&outSR=4326&f=geojson";
const useLiveOfficialGeometry = false;

const segmentCsv = `
01,1,Írott-kő,Hét-forrás,8.2,125,570,2:10
01,2,Hét-forrás,Kőszeg,4.9,95,255,1:20
01,3,Kőszeg,Tömörd,15.8,130,180,4:10
01,4,Tömörd,Ablánci malom,9.8,70,110,2:30
01,5,Ablánci malom,Szeleste,12.4,90,110,3:10
01,6,Szeleste,Bögöt,7.7,35,25,2:00
01,7,Bögöt,Csényeújmajor,7.4,5,10,1:50
01,8,Csényeújmajor,Sárvár,5.5,5,10,1:20
02,9,Sárvár,Gérce,10.1,90,70,2:40
02,10,Gérce,Rózsáskerti erdészház,2.5,25,20,0:40
02,11,Rózsáskerti erdészház,Hidegkúti vadászház,4.7,20,35,1:10
02,12,Hidegkúti vadászház,Káld,6.6,75,80,1:50
02,13,Káld,Hosszúpereszteg,10.9,90,105,2:50
02,14,Hosszúpereszteg,Szajki erdészház,5.8,35,30,1:30
02,15,Szajki erdészház,Ötvös,15.3,55,55,4:00
02,16,Ötvös,Kisvásárhely,8.0,25,50,2:00
02,17,Kisvásárhely,Sümeg,8.7,35,5,2:10
03,18,Sümeg,Sarvaly erdészház,6.4,80,45,1:40
03,19,Sarvaly erdészház,Zalaszántó,14.4,345,355,4:10
03,20,Zalaszántó,Rezi,7.1,235,175,2:10
03,21,Rezi,Gyöngyösi csárda,2.6,15,155,0:40
03,22,Gyöngyösi csárda,Hévíz,7.2,55,75,1:50
03,23,Hévíz,Keszthely,6.9,55,55,1:50
04,24,Keszthely,Vállus,13.4,345,225,4:00
04,25,Vállus,Lesenceistvánd,6.8,190,290,2:00
04,26,Lesenceistvánd,Tapolca,9.1,25,30,2:20
05,27,Tapolca,Szent György-hegy,6.0,160,10,1:50
05,28,Szent György-hegy,Szigliget,7.8,205,300,2:20
05,29,Szigliget,Badacsonytördemic,3.4,15,75,0:50
06,30,Badacsonytördemic,Badacsony,4.3,405,80,1:40
06,31,Badacsony,Káptalantóti,9.1,165,475,2:30
06,32,Káptalantóti,Csobánc,4.0,255,30,1:20
06,33,Csobánc,Szentbékkálla,9.5,240,420,2:50
06,34,Szentbékkálla,Balatonhenye,8.7,260,210,2:40
06,35,Balatonhenye,Csicsói erdészház,6.2,170,75,1:50
06,36,Csicsói erdészház,Nagyvázsony,7.9,80,140,2:10
07,37,Nagyvázsony,Kab-hegy,9.6,375,95,3:00
07,38,Kab-hegy,Úrkút,5.6,20,150,1:30
07,39,Úrkút,Városlőd,9.5,120,230,2:40
08,40,Városlőd,Németbánya,10.2,180,150,2:50
08,41,Németbánya,Bakonybél,8.8,180,245,2:30
08,42,Bakonybél,Kőris-hegy,7.1,460,15,2:30
08,43,Kőris-hegy,Borzavár,8.8,145,450,2:30
08,44,Borzavár,Zirc,5.2,140,165,1:30
09,45,Zirc,Bakonynána,10.0,130,205,2:40
09,46,Bakonynána,Jásd,6.2,100,175,1:40
09,47,Jásd,Csőszpuszta,4.1,240,35,1:20
09,48,Csőszpuszta,Kisgyón,6.7,65,285,1:50
09,49,Kisgyón,Bakonykúti,11.7,220,240,3:20
09,50,Bakonykúti,Fehérvárcsurgó,9.6,220,265,2:40
09,51,Fehérvárcsurgó,Bodajk,9.5,245,245,2:50
10,52,Bodajk,Csókakő,8.5,180,40,2:30
10,53,Csókakő,Gánt,14.2,265,340,4:00
10,54,Gánt,Mindszentpuszta,5.7,185,70,1:40
10,55,Mindszentpuszta,Kőhányás,7.4,195,205,2:10
10,56,Kőhányás,Várgesztes,4.9,95,140,1:20
10,57,Várgesztes,Szárliget,15.5,450,495,4:40
11,58,Szárliget,Somlyóvár,13.1,385,225,3:50
11,59,Somlyóvár,Koldusszállás,7.9,130,320,2:10
11,60,Koldusszállás,Bánya-hegyi erdészház,11.5,360,130,3:30
11,61,Bánya-hegyi erdészház,Gerecse üdülő,4.3,130,80,1:20
11,62,Gerecse üdülő,Pusztamarót,2.5,10,155,0:40
11,63,Pusztamarót,Péliföldszentkereszt,8.2,225,405,2:20
11,64,Péliföldszentkereszt,Mogyorósbánya,5.4,205,210,1:40
11,65,Mogyorósbánya,Tokodi pincék,2.7,125,155,0:50
11,66,Tokodi pincék,Tokod,3.4,175,180,1:10
11,67,Tokod,Nagy-Gete,2.8,335,10,1:20
11,68,Nagy-Gete,Dorog,7.4,95,415,2:00
12,69,Dorog,Klastrompuszta,10.6,365,185,3:10
12,70,Klastrompuszta,Piliscsaba,7.9,165,240,2:20
13,71,Piliscsaba,Zsíros-hegy,13.9,500,335,4:20
13,72,Zsíros-hegy,Hűvösvölgy,9.8,145,315,2:40
14,73,Hűvösvölgy,Hármashatár-hegy,8.0,420,165,2:40
14,74,Hármashatár-hegy,Virágos-nyereg,1.7,50,170,0:30
14,75,Virágos-nyereg,Rozália téglagyár,4.4,55,290,1:10
15,76,Rozália téglagyár,Kevély-nyereg,6.7,405,105,2:20
15,77,Kevély-nyereg,Pilisszentkereszt,11.9,285,370,3:30
15,78,Pilisszentkereszt,Dobogókő,4.2,370,15,1:40
16,79,Dobogókő,Sikárosi erdészház,6.4,35,405,1:40
16,80,Sikárosi erdészház,Pilisszentlászló,4.1,125,90,1:10
16,81,Pilisszentlászló,Pap-réti erdészház,3.1,190,75,1:10
16,82,Pap-réti erdészház,Nagy-Villám,8.5,240,380,2:30
16,83,Nagy-Villám,Visegrád,2.6,20,255,0:40
17,84,Nagymaros,Julianus-kilátó,4.4,400,25,1:40
17,85,Julianus-kilátó,Törökmező turistaház,6.5,105,345,1:50
17,86,Törökmező turistaház,Kisinóci turistaház,9.5,335,245,3:00
17,87,Kisinóci turistaház,Nagy-Hideg-hegy,5.7,580,55,2:20
17,88,Nagy-Hideg-hegy,Csóványos,3.0,225,140,1:10
17,89,Csóványos,Nógrád,11.9,95,815,3:10
18,90,Nógrád,Lokó-pihenő,4.4,245,85,1:30
18,91,Lokó-pihenő,Magyarkút,3.9,10,240,1:00
18,92,Magyarkút,Katalinpuszta,5.5,160,90,1:40
18,93,Katalinpuszta,Naszály,7.9,580,145,3:00
18,94,Naszály,Ősagárd,7.1,110,485,2:00
18,95,Ősagárd,Felsőpetény,6.7,130,225,1:50
18,96,Felsőpetény,Alsópetény,4.4,80,50,1:10
18,97,Alsópetény,Romhány,6.9,225,280,2:10
18,98,Romhány,Kétbodony,2.8,55,35,0:50
18,99,Kétbodony,Becske,10.3,285,240,3:00
19,100,Becske,Szandaváralja,6.0,265,245,2:00
19,101,Szandaváralja,Cserhátsurány,10.1,250,310,3:00
19,102,Cserhátsurány,Nógrádsipek,10.5,320,290,3:10
19,103,Nógrádsipek,Hollókő,11.7,450,345,3:40
19,104,Hollókő,Bableves csárda,10.1,290,285,3:00
19,105,Bableves csárda,Tepke,3.5,240,0,1:20
19,106,Tepke,Nagybárkány,10.1,240,585,3:00
19,107,Nagybárkány,Mátraverebély,12.4,345,390,3:40
20,108,Mátraverebély,Ágasvár turistaház,8.3,550,90,3:00
20,109,Ágasvár turistaház,Mátraszentistván,4.2,195,105,1:20
20,110,Mátraszentistván,Galyatető,5.0,295,95,1:40
20,111,Galyatető,Vércverés,3.6,65,300,1:00
20,112,Vércverés,Vörösmarty fogadó,3.1,105,165,0:55
20,113,Vörösmarty fogadó,Mátraháza,2.0,110,35,0:40
21,114,Mátraháza,Kékestető,3.6,345,45,1:30
21,115,Kékestető,Hármashatár erdészház,5.7,90,470,1:30
21,116,Hármashatár erdészház,Sirok,16.8,595,1065,5:10
22,117,Sirok,Rozsnakpuszta,6.4,265,200,2:00
22,118,Rozsnakpuszta,Szarvaskő,11.6,320,320,3:30
23,119,Szarvaskő,Telekessy vendégház,7.2,455,305,2:30
23,120,Telekessy vendégház,Bélapátfalva,3.8,65,120,1:00
23,121,Bélapátfalva,Cserepes-kői-barlang,9.9,660,205,3:30
23,122,Cserepes-kői-barlang,Bánkút,11.2,480,400,3:40
23,123,Bánkút,Mályinka,8.0,120,675,2:10
23,124,Mályinka,Uppony,9.7,170,270,2:40
23,125,Uppony,Putnok,13.0,305,355,3:40
24,126,Putnok,Kelemér,11.3,285,225,3:20
24,127,Kelemér,Gömörszőlős,2.3,35,15,0:40
24,128,Gömörszőlős,Zádorfalva,5.5,95,105,1:30
24,129,Zádorfalva,Aggtelek,13.1,320,215,3:50
24,130,Aggtelek,Jósvafő,6.2,225,340,1:50
24,131,Jósvafő,Derenk,12.5,340,215,3:40
24,132,Derenk,Szabó-pallag erdészház,7.0,285,135,2:10
24,133,Szabó-pallag erdészház,Bódvaszilas,4.6,40,360,1:10
25,134,Bódvaszilas,Bódvarákó,4.6,30,35,1:10
25,135,Bódvarákó,Martonyi kolostorrom,4.1,315,75,1:30
25,136,Martonyi kolostorrom,Tornabarakony,9.7,195,400,2:50
25,137,Tornabarakony,Rakacaszend,3.9,80,95,1:10
25,138,Rakacaszend,Irota,9.0,185,185,2:30
25,139,Irota,Felsővadász,6.7,125,145,1:50
25,140,Felsővadász,Abaújszolnok,5.7,185,170,1:40
25,141,Abaújszolnok,Baktakék,5.1,115,130,1:30
25,142,Baktakék,Fancsal,3.2,110,75,1:00
25,143,Fancsal,Encs,6.5,55,115,1:40
25,144,Encs,Gibárt,3.4,0,5,0:50
25,145,Gibárt,Hernádcéce,5.2,75,45,1:30
25,146,Hernádcéce,Boldogkőváralja,4.0,55,50,1:10
26,147,Boldogkőváralja,Regéc,14.9,490,245,4:30
26,148,Regéc,Istvánkúti vadászház,8.3,330,230,2:40
26,149,Istvánkúti vadászház,Eszkála erdészház,7.4,180,210,2:10
26,150,Eszkála erdészház,Makkoshotyka,9.8,145,465,2:40
26,151,Makkoshotyka,Cirkáló-tanya,2.8,100,60,0:50
26,152,Cirkáló-tanya,Nagy-nyugodó,8.6,400,235,2:50
27,153,Nagy-nyugodó,Vágáshuta,10.7,395,555,3:20
27,154,Vágáshuta,Nagyhuta,5.5,160,120,1:40
27,155,Nagyhuta,Füzérradvány,8.3,90,135,2:10
27,156,Füzérradvány,Füzér,14.4,575,400,4:30
27,157,Füzér,Nagy-Milic,5.1,580,60,2:10
27,158,Nagy-Milic,Bodó-rét,4.0,20,280,1:00
27,159,Bodó-rét,Hollóháza,4.4,30,340,1:10
`;

let activeTrailId = localStorage.getItem(activeTrailStorageKey);
if (!trails[activeTrailId]) activeTrailId = defaultTrailId;

let activeTrail = trails[activeTrailId];
let segments = [];
let stamps = [];
let segmentById = new Map();
let stampById = new Map();
let state = loadState(activeTrailId);
let travelSettings = loadTravelSettings();
const highlightedLayers = new Map();
const stampMarkers = new Map();
const stampHitMarkers = new Map();
const segmentCards = new Map();
const selectInputs = new Map();
const stampInputs = new Map();
const sectionProgressLabels = new Map();
const sectionToggles = new Map();
let baseRouteLayer;
let stampLayerGroup;
let tileLayer;
let map;
let geometrySource = activeTrail?.geometrySource || "Bundled GPX";
let trailRenderer;
let isMapClickBound = false;

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", registerServiceWorker);

function init() {
  syncViewportMetrics(false);
  if (!window.L) {
    document.querySelector("#map").innerHTML =
      '<div class="map-error">Map library could not load. Check the CDN connection or run the app from a local server.</div>';
    return;
  }

  trailRenderer = L.svg({ padding: 0.35 });
  map = L.map("map", {
    zoomControl: false,
    renderer: trailRenderer,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
  }).setView([47.16, 19.5], 7);

  L.control.zoom({ position: "bottomright" }).addTo(map);
  tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 1,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  stampLayerGroup = L.layerGroup().addTo(map);

  loadTrail(activeTrailId);
  state.selectedSegments = normalizeSelection(state.selectedSegments);
  if (state.stamped.length) syncCompletedSegmentsFromStamps();
  renderMap();
  renderLists();
  bindControls();
  setInitialView();
  initTravelControls();
  syncTravelSettingsUi();
  updateUi();
  refreshMapLayout(true);
  if (useLiveOfficialGeometry) loadOfficialGeometry();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function parseSegments(csv) {
  return csv
    .trim()
    .split("\n")
    .map((row) => {
      const [section, number, from, to, distance, up, down, time] = row.split(",");
      return {
        id: `okt-${String(number).padStart(3, "0")}`,
        section: `OKT-${section}`,
        number: Number(number),
        from,
        to,
        fromId: slugify(from),
        toId: slugify(to),
        distance: Number(distance),
        up: Number(up),
        down: Number(down),
        minutes: parseTime(time),
        reverseMinutes: estimateReverseMinutes(Number(distance), Number(down)),
        points: [],
        elevationSamples: [],
      };
    });
}

function buildStamps(rows) {
  const stampDistances = new Map();
  let cumulativeDistance = 0;

  rows.forEach((segment) => {
    if (!stampDistances.has(segment.from)) stampDistances.set(segment.from, cumulativeDistance);
    cumulativeDistance += segment.distance;
    if (!stampDistances.has(segment.to)) stampDistances.set(segment.to, cumulativeDistance);
  });

  const names = Array.from(stampDistances.keys());
  return names.map((name, index) => ({
    id: slugify(name),
    name,
    index,
    cumulativeDistance: stampDistances.get(name),
    nextDistance: rows.find((segment) => segment.from === name)?.distance ?? 0,
    lat: null,
    lng: null,
    altitude: estimateAltitude(index, names.length),
  }));
}

function loadTrail(trailId) {
  activeTrailId = trails[trailId] ? trailId : defaultTrailId;
  activeTrail = trails[activeTrailId] || {
    version: "unknown",
    geometrySource: "Overview geometry",
    segments: parseSegments(segmentCsv),
    stamps: [],
  };

  segments = activeTrail.segments.map((segment) => ({
    ...segment,
    points: segment.points || [],
    elevationSamples: segment.elevationSamples || [],
  }));
  stamps = activeTrail.stamps?.length ? activeTrail.stamps.map((stamp) => ({ ...stamp })) : buildStamps(segments);
  segmentById = new Map(segments.map((segment) => [segment.id, segment]));
  stampById = new Map(stamps.map((stamp) => [stamp.id, stamp]));
  geometrySource = activeTrail.geometrySource || "Bundled GPX";
  state = loadState(activeTrailId);
  applyTrailTheme();
}

function switchTrail(trailId) {
  if (!trails[trailId] || trailId === activeTrailId) return;
  saveState();
  localStorage.setItem(activeTrailStorageKey, trailId);
  loadTrail(trailId);
  state.selectedSegments = normalizeSelection(state.selectedSegments);
  if (state.stamped.length) syncCompletedSegmentsFromStamps();
  renderMap();
  renderLists();
  syncTrailButtons();
  updateUi();
  refreshMapLayout(true);
}

function syncTrailButtons() {
  document.querySelectorAll("[data-trail]").forEach((button) => {
    const isActive = button.dataset.trail === activeTrailId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function getStorageKey(trailId = activeTrailId) {
  return `${stateStoragePrefix}-${trailId}`;
}

function getActiveDataVersion() {
  return activeTrail?.version || "unknown";
}

function getTrailPalette() {
  return trailPalettes[activeTrailId] || fallbackPalette;
}

function getTrailColor() {
  return getTrailPalette().color;
}

function getTrailRgb() {
  return getTrailPalette().rgb;
}

function applyTrailTheme() {
  const palette = getTrailPalette();
  document.documentElement.style.setProperty("--trail", palette.color);
  document.documentElement.style.setProperty("--trail-dark", palette.dark);
  document.documentElement.style.setProperty("--trail-rgb", palette.rgb);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette.color);
}

function assignOverviewGeometry() {
  const anchors = [
    [47.3529, 16.4339],
    [47.252, 16.94],
    [46.98, 17.29],
    [46.76, 17.25],
    [46.84, 17.73],
    [47.23, 18.12],
    [47.44, 18.63],
    [47.72, 18.88],
    [47.88, 19.07],
    [47.98, 19.55],
    [47.89, 20.02],
    [48.1, 20.62],
    [48.35, 21.18],
    [48.54, 21.46],
  ];
  stamps.forEach((stamp, index) => {
    const progress = index / (stamps.length - 1);
    const scaled = progress * (anchors.length - 1);
    const anchorIndex = Math.min(Math.floor(scaled), anchors.length - 2);
    const local = scaled - anchorIndex;
    const start = anchors[anchorIndex];
    const end = anchors[anchorIndex + 1];
    stamp.lat = lerp(start[0], end[0], local) + Math.sin(index * 1.7) * 0.035;
    stamp.lng = lerp(start[1], end[1], local) + Math.cos(index * 1.3) * 0.045;
  });

  segments.forEach((segment) => {
    const from = getStampByName(segment.from);
    const to = getStampByName(segment.to);
    const midLat = (from.lat + to.lat) / 2 + Math.sin(segment.number) * 0.018;
    const midLng = (from.lng + to.lng) / 2 + Math.cos(segment.number) * 0.024;
    segment.points = [
      [from.lat, from.lng],
      [midLat, midLng],
      [to.lat, to.lng],
    ];
    segment.elevationSamples = generateElevationSamples(segment, from.altitude, to.altitude);
  });
}

function loadState(trailId = activeTrailId) {
  const fallback = {
    selectedSegments: [],
    completedSegments: [],
    stamped: [],
    direction: "forward",
  };

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(getStorageKey(trailId))) };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(getStorageKey(), JSON.stringify(state));
}

function loadTravelSettings() {
  const fallback = {
    origin: { ...budapestOrigin, address: "Budapest-Keleti" },
    outboundTimeMode: "depart",
    returnTimeMode: "depart",
  };

  try {
    const saved = JSON.parse(localStorage.getItem(travelSettingsStorageKey));
    const origin = saved?.origin;
    const settings = {
      ...fallback,
      ...saved,
      origin: Number.isFinite(origin?.lat) && Number.isFinite(origin?.lng) ? origin : fallback.origin,
    };
    settings.outboundTimeMode = ["depart", "arrive"].includes(settings.outboundTimeMode) ? settings.outboundTimeMode : "depart";
    settings.returnTimeMode = ["depart", "arrive"].includes(settings.returnTimeMode) ? settings.returnTimeMode : "depart";
    return settings;
  } catch {
    return fallback;
  }
}

function saveTravelSettings() {
  localStorage.setItem(travelSettingsStorageKey, JSON.stringify(travelSettings));
}

function applyBundledRouteData() {
  const data = window.OKT_ROUTE_DATA;
  if (!data?.segments?.length) return;

  const routeById = new Map(data.segments.map((segment) => [segment.id, segment]));
  segments.forEach((segment) => {
    const routeSegment = routeById.get(segment.id);
    if (!routeSegment) return;
    segment.points = routeSegment.points;
    segment.elevationSamples = routeSegment.elevation.map(([distance, altitude]) => ({ distance, altitude }));
  });

  const stampsByName = new Map(data.stamps.map((stamp) => [normalizeText(stamp.name), stamp]));
  stamps.forEach((stamp) => {
    const routeStamp = stampsByName.get(normalizeText(stamp.name));
    if (!routeStamp) return;
    stamp.lat = routeStamp.lat;
    stamp.lng = routeStamp.lng;
    stamp.altitude = routeStamp.altitude;
  });

  geometrySource = "Bundled GPX";
}

function renderMap() {
  if (baseRouteLayer) {
    baseRouteLayer.remove();
    baseRouteLayer = null;
  }
  highlightedLayers.forEach((layer) => layer.remove());
  highlightedLayers.clear();
  stampLayerGroup?.clearLayers();
  stampMarkers.clear();
  stampHitMarkers.clear();

  baseRouteLayer = L.polyline(
    segments.map((segment) => segment.points),
    {
      color: getTrailColor(),
      renderer: trailRenderer,
      weight: 4,
      opacity: 0.72,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    },
  ).addTo(map);

  if (!isMapClickBound) {
    map.on("click", selectNearestSegment);
    isMapClickBound = true;
  }

  stamps.forEach((stamp, index) => {
    if (!Number.isFinite(stamp.lat) || !Number.isFinite(stamp.lng)) return;
    const popupOptions = { maxWidth: 320 };
    const popupContent = () => getStampPopupContent(stamp, index);
    const marker = L.circleMarker([stamp.lat, stamp.lng], {
      radius: 6,
      color: "#ffffff",
      fillColor: getTrailColor(),
      fillOpacity: 1,
      weight: 2,
      bubblingMouseEvents: false,
    }).addTo(stampLayerGroup);
    const hitMarker = L.circleMarker([stamp.lat, stamp.lng], {
      radius: 18,
      color: "#ffffff",
      opacity: 0,
      fillColor: "#ffffff",
      fillOpacity: 0.01,
      weight: 0,
      bubblingMouseEvents: false,
    }).addTo(stampLayerGroup);

    marker.bindPopup(popupContent, popupOptions);
    hitMarker.bindPopup(popupContent, popupOptions);
    stampMarkers.set(stamp.id, marker);
    stampHitMarkers.set(stamp.id, hitMarker);
  });
}

function renderLists() {
  const segmentList = document.querySelector("#segmentList");
  const stampList = document.querySelector("#stampList");
  const sectionGroups = getSectionGroups();

  segmentList.innerHTML = segments
    .map(
      (segment) => `
        <article class="segment-card" data-segment-id="${segment.id}">
          <div class="segment-main">
            <div>
              <span class="eyebrow">${segment.section} · ${segment.number}/${segments.length}</span>
              <strong>${segment.from} - ${segment.to}</strong>
            </div>
            <input type="checkbox" aria-label="Select ${segment.from} to ${segment.to}" data-select-segment="${segment.id}" />
          </div>
          <div class="segment-meta">
            <span class="pill">${segment.distance.toFixed(1)} km</span>
            <span class="pill">${formatMinutes(segment.minutes)}</span>
            <span class="pill">+${segment.up} m</span>
            <span class="pill">-${segment.down} m</span>
          </div>
        </article>
      `,
    )
    .join("");
  stampList.innerHTML = sectionGroups
    .map(
      (group) => `
        <section class="progress-section" data-progress-section="${group.section}">
          <header class="progress-section-header">
            <div>
              <span class="eyebrow">${group.section}</span>
              <strong>${group.from} - ${group.to}</strong>
            </div>
            <label class="section-toggle" aria-label="Complete all segments in ${group.section}">
              <input type="checkbox" data-section-toggle="${group.section}" />
              <span data-section-progress="${group.section}">${getSectionProgressLabel(group)}</span>
            </label>
          </header>
          ${group.stamps
            .map(
              (stamp) => `
                <article class="stamp-card">
                  <label>
                    <input type="checkbox" data-stamp="${stamp.id}" />
                    <strong>${stamp.name}</strong>
                  </label>
                  <span>${formatStampDistance(stamp)}</span>
                </article>
              `,
            )
            .join("")}
        </section>
      `,
    )
    .join("");

  segmentCards.clear();
  selectInputs.clear();
  stampInputs.clear();
  sectionProgressLabels.clear();
  sectionToggles.clear();
  document.querySelectorAll("[data-segment-id]").forEach((card) => {
    segmentCards.set(card.dataset.segmentId, card);
  });
  document.querySelectorAll("[data-select-segment]").forEach((input) => {
    selectInputs.set(input.dataset.selectSegment, input);
  });
  document.querySelectorAll("[data-stamp]").forEach((input) => {
    const inputs = stampInputs.get(input.dataset.stamp) || [];
    inputs.push(input);
    stampInputs.set(input.dataset.stamp, inputs);
  });
  document.querySelectorAll("[data-section-progress]").forEach((label) => {
    sectionProgressLabels.set(label.dataset.sectionProgress, label);
  });
  document.querySelectorAll("[data-section-toggle]").forEach((input) => {
    sectionToggles.set(input.dataset.sectionToggle, input);
  });

}

function bindControls() {
  document.querySelector("#planTab").addEventListener("click", () => switchTab("plan", true));
  document.querySelector("#travelTab").addEventListener("click", () => switchTab("travel", true));
  document.querySelector("#progressTab").addEventListener("click", () => switchTab("progress", true));
  document.querySelector("#moreTab").addEventListener("click", () => switchTab("more", true));
  document.querySelector(".elevation-header").addEventListener("click", fitSelectedSegments);
  document.querySelectorAll("[data-direction]").forEach((button) => {
    button.addEventListener("click", () => setDirection(button.dataset.direction));
  });
  document.querySelector("#travelButton").addEventListener("click", handleTravelRequest);
  document.querySelector("#travelPlanButton").addEventListener("click", () => switchTab("plan", true));
  document.querySelectorAll("[data-travel-time-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleTravelTimeMode(button.dataset.travelTimeToggle));
  });
  document.querySelector("#saveTravelOrigin").addEventListener("click", handleSaveTravelOrigin);
  document.addEventListener("click", handleSuggestionClick);
  map.on("popupopen", bindStampPopupControls);
  document.querySelector("#segmentList").addEventListener("change", handleSegmentListChange);
  document.querySelector("#stampList").addEventListener("change", handleStampListChange);
  document.querySelectorAll("[data-trail]").forEach((button) => {
    button.addEventListener("click", () => switchTrail(button.dataset.trail));
  });
  window.addEventListener("load", refreshViewportAfterResume);
  window.addEventListener("resize", refreshViewportAfterResume);
  window.addEventListener("pageshow", refreshViewportAfterResume);
  window.visualViewport?.addEventListener("resize", refreshViewportAfterResume);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshViewportAfterResume();
  });
  initBottomSheet();
  syncTrailButtons();
}

function setInitialView() {
  switchTab("plan");
}

function handleSegmentListChange(event) {
  const selectId = event.target.dataset.selectSegment;
  if (!selectId) return;
  const didChange = setSegmentSelected(selectId, event.target.checked);
  saveState();
  if (didChange) updateSummaryAndProfile();
}

function handleStampListChange(event) {
  const sectionId = event.target.dataset.sectionToggle;
  if (sectionId) {
    setSectionStamped(sectionId, event.target.checked);
    saveState();
    updateUi();
    return;
  }

  const stampId = event.target.dataset.stamp;
  if (!stampId) return;
  setMembership(state.stamped, stampId, event.target.checked);
  syncCompletedSegmentsFromStamps();
  saveState();
  updateUi();
}

function initBottomSheet() {
  const sheet = document.querySelector(".side-pane");
  const grabber = document.querySelector("#sheetGrabber");
  if (!sheet || !grabber) return;

  let startY = 0;
  let startHeight = 0;
  let didDrag = false;

  const getSnapHeights = () => {
    const viewport = window.innerHeight;
    return [getCompactSheetHeight(), Math.round(viewport * 0.48), Math.round(viewport * 0.84)];
  };

  const setSheetHeight = (height) => {
    const [minHeight, , maxHeight] = getSnapHeights();
    const clamped = Math.max(minHeight, Math.min(maxHeight, height));
    document.documentElement.style.setProperty("--sheet-height", `${clamped}px`);
    setSheetExpanded(clamped > minHeight + 24);
    return clamped;
  };

  const snapSheet = (height) => {
    const snaps = getSnapHeights();
    const closest = snaps.reduce((best, value) => (Math.abs(value - height) < Math.abs(best - height) ? value : best), snaps[0]);
    setSheetHeight(closest);
    refreshMapLayout(false);
  };

  const onPointerMove = (event) => {
    if (!sheet.classList.contains("dragging")) return;
    if (Math.abs(event.clientY - startY) > 4) didDrag = true;
    setSheetHeight(startHeight + startY - event.clientY);
  };

  const onPointerUp = (event) => {
    if (!sheet.classList.contains("dragging")) return;
    sheet.classList.remove("dragging");
    document.documentElement.classList.remove("sheet-dragging");
    grabber.releasePointerCapture?.(event.pointerId);
    snapSheet(sheet.getBoundingClientRect().height);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  grabber.addEventListener("pointerdown", (event) => {
    if (!window.matchMedia("(max-width: 860px)").matches) return;
    event.preventDefault();
    startY = event.clientY;
    startHeight = sheet.getBoundingClientRect().height;
    didDrag = false;
    sheet.classList.add("dragging");
    document.documentElement.classList.add("sheet-dragging");
    grabber.setPointerCapture?.(event.pointerId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  });

  grabber.addEventListener("click", () => {
    if (!window.matchMedia("(max-width: 860px)").matches) return;
    if (didDrag) return;
    const snaps = getSnapHeights();
    const current = sheet.getBoundingClientRect().height;
    const next = current < snaps[1] - 8 ? snaps[1] : current < snaps[2] - 8 ? snaps[2] : snaps[0];
    setSheetHeight(next);
    refreshMapLayout(false);
  });
}

function getCompactSheetHeight() {
  return Math.round(88 + getSafeAreaBottom());
}

function getSafeAreaBottom() {
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;visibility:hidden;height:env(safe-area-inset-bottom);";
  document.body.appendChild(probe);
  const value = Number.parseFloat(getComputedStyle(probe).height) || 0;
  probe.remove();
  return value;
}

function syncViewportMetrics(shouldRefreshMap = true) {
  const visualBottom = (window.visualViewport?.height || 0) + (window.visualViewport?.offsetTop || 0);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const viewportHeight = Math.round(
    Math.max(
      window.innerHeight,
      document.documentElement.clientHeight,
      visualBottom,
      isStandalone ? window.outerHeight : 0,
    ),
  );
  if (viewportHeight > 0) {
    document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
  }
  if (shouldRefreshMap && map) refreshMapLayout(false);
}

function refreshViewportAfterResume() {
  syncViewportMetrics();
  requestAnimationFrame(() => syncViewportMetrics());
  setTimeout(() => syncViewportMetrics(), 160);
  setTimeout(() => syncViewportMetrics(), 480);
}

function setSheetExpanded(isExpanded) {
  document.querySelector(".side-pane")?.classList.toggle("expanded", isExpanded);
}

function collapseBottomSheet() {
  if (!window.matchMedia("(max-width: 860px)").matches) return;
  document.documentElement.style.setProperty("--sheet-height", `${getCompactSheetHeight()}px`);
  setSheetExpanded(false);
  refreshMapLayout(false);
}

async function loadOfficialGeometry() {
  try {
    const [routeResponse, stampResponse] = await Promise.all([fetch(officialRouteUrl), fetch(officialStampUrl)]);
    if (!routeResponse.ok) throw new Error("Official route layer failed");
    const routeGeojson = await routeResponse.json();
    const stampGeojson = stampResponse.ok ? await stampResponse.json() : null;

    applyOfficialRoutes(routeGeojson);
    if (stampGeojson) applyOfficialStamps(stampGeojson);
    geometrySource = "Official MTSZ geometry";
    updateUi();
    refreshMapLayout(true);
  } catch (error) {
    geometrySource = "Overview geometry";
    document.querySelector("#profileMeta").textContent = `Stats ${getActiveDataVersion()} · offline geometry`;
  }
}

function applyOfficialRoutes(geojson) {
  const features = geojson.features || [];
  const unmatched = new Set(segments.map((segment) => segment.id));

  features.forEach((feature) => {
    const text = normalizeText(Object.values(feature.properties || {}).join(" "));
    const segment = segments.find(
      (item) =>
        unmatched.has(item.id) &&
        text.includes(normalizeText(item.from)) &&
        text.includes(normalizeText(item.to)),
    );
    const points = extractLinePoints(feature.geometry);
    if (!segment || points.length < 2) return;
    segment.points = points;
    unmatched.delete(segment.id);
  });
  syncBaseRouteLayer();
  refreshHighlightedLayers();
}

function applyOfficialStamps(geojson) {
  (geojson.features || []).forEach((feature) => {
    const text = Object.values(feature.properties || {}).join(" ");
    const stamp = stamps.find((item) => normalizeText(text).includes(normalizeText(item.name)));
    if (!stamp || feature.geometry?.type !== "Point") return;
    const [lng, lat] = feature.geometry.coordinates;
    stamp.lat = lat;
    stamp.lng = lng;
    stampMarkers.get(stamp.id)?.setLatLng([lat, lng]);
    stampHitMarkers.get(stamp.id)?.setLatLng([lat, lng]);
  });
}

function updateUi() {
  const selectedIds = new Set(state.selectedSegments);
  const completedIds = new Set(state.completedSegments);
  const stampedIds = new Set(state.stamped);

  segments.forEach((segment) => updateSegmentCardUi(segment.id, selectedIds, completedIds));
  stamps.forEach((stamp) => updateStampUi(stamp.id, stampedIds));
  updateSectionProgressLabels();
  refreshHighlightedLayers(selectedIds, completedIds);
  updateSummaryAndProfile();
}

function updateSummaryAndProfile() {
  const selectedIds = new Set(state.selectedSegments);
  const completedIds = new Set(state.completedSegments);
  const selected = segments.filter((segment) => selectedIds.has(segment.id));
  const completed = segments.filter((segment) => completedIds.has(segment.id));
  const selectedTotals = sumSegments(selected);
  const completedTotals = sumSegments(completed);
  const allTotals = sumSegments(segments);
  const donePercent = allTotals.distance ? Math.round((completedTotals.distance / allTotals.distance) * 100) : 0;
  const isReverse = state.direction === "reverse";

  document.querySelector("#selectedDistance").textContent = `${selectedTotals.distance.toFixed(1)} km`;
  document.querySelector("#selectedTimeLabel").textContent = isReverse ? "Reverse" : "Forward";
  document.querySelector("#selectedTime").textContent = formatMinutes(isReverse ? selectedTotals.reverseMinutes : selectedTotals.minutes);
  document.querySelector("#selectedReturnTimeLabel").textContent = isReverse ? "Forward est." : "Reverse est.";
  document.querySelector("#selectedReturnTime").textContent = formatMinutes(isReverse ? selectedTotals.minutes : selectedTotals.reverseMinutes);
  document.querySelector("#selectedElevation").textContent = isReverse
    ? `${selectedTotals.down} / ${selectedTotals.up} m`
    : `${selectedTotals.up} / ${selectedTotals.down} m`;
  document.querySelector("#completedDistance").textContent = `${completedTotals.distance.toFixed(1)} km completed`;
  document.querySelector("#remainingDistance").textContent = `${Math.max(allTotals.distance - completedTotals.distance, 0).toFixed(1)} km remaining`;
  document.querySelector("#progressRing").textContent = `${donePercent}%`;
  document.querySelector("#progressRing").style.setProperty("--progress", `${donePercent}%`);
  document.querySelector(".elevation-header").classList.toggle("is-clickable", selected.length > 0);
  document
    .querySelector(".elevation-header")
    .setAttribute("title", selected.length > 0 ? "Zoom to selected route" : "");
  syncDirectionControls();
  syncTravelPanel(selected, selectedTotals);

  renderElevation(selected);
}

function setSegmentSelected(segmentId, checked) {
  const before = new Set(state.selectedSegments);
  const nextSelection = getContiguousSelection(segmentId, checked);
  if (!nextSelection) {
    updateSegmentCardUi(segmentId);
    return false;
  }

  state.selectedSegments = nextSelection;
  updateChangedSelectedSegments(before, new Set(state.selectedSegments));
  return true;
}

function updateSegmentCardUi(segmentId, selectedIds = new Set(state.selectedSegments), completedIds = new Set(state.completedSegments)) {
  selectInputs.get(segmentId).checked = selectedIds.has(segmentId);
  const card = segmentCards.get(segmentId);
  card.classList.toggle("selected", selectedIds.has(segmentId));
  card.classList.toggle("done", completedIds.has(segmentId));
}

function updateStampUi(stampId, stampedIds = new Set(state.stamped)) {
  const inputs = stampInputs.get(stampId) || [];
  inputs.forEach((input) => {
    input.checked = stampedIds.has(stampId);
  });
  stampMarkers.get(stampId)?.setStyle({
    fillColor: stampedIds.has(stampId) ? "#1f9d66" : getTrailColor(),
  });
}

function updateSectionProgressLabels() {
  getSectionGroups().forEach((group) => {
    const label = sectionProgressLabels.get(group.section);
    if (label) label.textContent = getSectionProgressLabel(group);
    const toggle = sectionToggles.get(group.section);
    if (toggle) {
      const completedIds = new Set(state.completedSegments);
      const completeCount = group.segments.filter((segment) => completedIds.has(segment.id)).length;
      toggle.checked = completeCount === group.segments.length;
      toggle.indeterminate = completeCount > 0 && completeCount < group.segments.length;
    }
  });
}

function getContiguousSelection(segmentId, checked) {
  const selectedIndexes = state.selectedSegments
    .map((id) => segmentById.get(id)?.number - 1)
    .filter((index) => Number.isFinite(index))
    .sort((a, b) => a - b);
  const index = segmentById.get(segmentId)?.number - 1;
  if (!Number.isFinite(index)) return null;

  if (!selectedIndexes.length) return checked ? [segmentId] : [];

  const min = selectedIndexes[0];
  const max = selectedIndexes[selectedIndexes.length - 1];
  if (checked) {
    if (index >= min && index <= max) return state.selectedSegments;
    if (index === min - 1) return segmentIdsBetween(index, max);
    if (index === max + 1) return segmentIdsBetween(min, index);
    return null;
  }

  if (index === min && index === max) return [];
  if (index === min) return segmentIdsBetween(min + 1, max);
  if (index === max) return segmentIdsBetween(min, max - 1);
  return null;
}

function normalizeSelection(segmentIds) {
  const indexes = segmentIds
    .map((id) => segmentById.get(id)?.number - 1)
    .filter((index) => Number.isFinite(index))
    .sort((a, b) => a - b);
  if (!indexes.length) return [];

  let bestStart = indexes[0];
  let bestEnd = indexes[0];
  let currentStart = indexes[0];
  let currentEnd = indexes[0];

  for (let cursor = 1; cursor < indexes.length; cursor += 1) {
    if (indexes[cursor] === currentEnd + 1) {
      currentEnd = indexes[cursor];
    } else {
      if (currentEnd - currentStart > bestEnd - bestStart) {
        bestStart = currentStart;
        bestEnd = currentEnd;
      }
      currentStart = indexes[cursor];
      currentEnd = indexes[cursor];
    }
  }

  if (currentEnd - currentStart > bestEnd - bestStart) {
    bestStart = currentStart;
    bestEnd = currentEnd;
  }

  return segmentIdsBetween(bestStart, bestEnd);
}

function segmentIdsBetween(startIndex, endIndex) {
  return segments.slice(startIndex, endIndex + 1).map((segment) => segment.id);
}

function updateChangedSelectedSegments(before, after) {
  const changedIds = new Set([...before, ...after]);
  changedIds.forEach((segmentId) => {
    updateSegmentCardUi(segmentId);
    refreshHighlightedLayer(segmentId);
  });
}

function deselectAllSegments() {
  const before = new Set(state.selectedSegments);
  state.selectedSegments = [];
  updateChangedSelectedSegments(before, new Set());
  saveState();
  updateSummaryAndProfile();
}

function getStampPopupContent(stamp, stampIndex) {
  const title = escapeHtml(stamp.name);
  const altitude = Number.isFinite(stamp.altitude) ? `${stamp.altitude} m` : "";
  const forwardId = `popup-${activeTrailId}-${stampIndex}-forward`;
  const reverseId = `popup-${activeTrailId}-${stampIndex}-reverse`;
  const isReverse = state.direction === "reverse";

  return `
    <div class="stamp-popup" data-stamp-index="${stampIndex}">
      <strong>${title}</strong>
      <span>${altitude}</span>
      <div class="popup-direction-switch">
        <input class="popup-direction-input popup-dir-forward" id="${forwardId}" type="radio" name="popup-direction-${activeTrailId}-${stampIndex}" ${isReverse ? "" : "checked"} />
        <input class="popup-direction-input popup-dir-reverse" id="${reverseId}" type="radio" name="popup-direction-${activeTrailId}-${stampIndex}" ${isReverse ? "checked" : ""} />
        <div class="popup-direction" aria-label="Suggestion direction">
          <label class="popup-direction-label forward-label" for="${forwardId}">W-E</label>
          <label class="popup-direction-label reverse-label" for="${reverseId}">E-W</label>
        </div>
        ${renderPopupSuggestionPane(stampIndex, "forward")}
        ${renderPopupSuggestionPane(stampIndex, "reverse")}
      </div>
    </div>
  `;
}

function renderPopupSuggestionPane(stampIndex, direction) {
  const suggestions = getDaySuggestions(stampIndex, direction);
  const classes = `suggestion-list popup-suggestion-pane ${direction === "reverse" ? "reverse-pane" : "forward-pane"}`;
  if (!suggestions.length) {
    return `<div class="${classes}"><p class="suggestion-empty">No connected route in this direction.</p></div>`;
  }

  return `
    <div class="${classes}">
      ${suggestions
    .map(
      (suggestion) => `
        <button class="suggestion-card" type="button" data-suggestion-start="${suggestion.startIndex}" data-suggestion-end="${suggestion.endIndex}" data-suggestion-direction="${direction}" onclick="window.applyStampSuggestion(this); return false;">
          <span>
            <small>${escapeHtml(suggestion.label)}</small>
            <strong>${escapeHtml(suggestion.from)} - ${escapeHtml(suggestion.to)}</strong>
          </span>
          <span class="suggestion-stats">
            <span>${suggestion.totals.distance.toFixed(1)} km</span>
            <span>${formatMinutes(suggestion.minutes)}</span>
            <span>+${suggestion.up} / -${suggestion.down} m</span>
          </span>
        </button>
      `,
    )
    .join("")}
    </div>
  `;
}

function getDaySuggestions(startStampIndex, direction = state.direction) {
  if (!Number.isFinite(startStampIndex)) return [];
  const isReverse = direction === "reverse";
  const suggestions = [];
  const usedRanges = new Set();

  daySuggestionBands.forEach((band) => {
    const suggestion = getSuggestionsForBand(startStampIndex, band, isReverse).find((candidate) => {
      const rangeKey = `${candidate.startIndex}:${candidate.endIndex}`;
      return !usedRanges.has(rangeKey);
    });
    if (!suggestion) return;
    const rangeKey = `${suggestion.startIndex}:${suggestion.endIndex}`;
    usedRanges.add(rangeKey);
    suggestions.push(suggestion);
  });

  return suggestions;
}

function getSuggestionsForBand(startStampIndex, band, isReverse) {
  const candidates = [];
  let distance = 0;
  const maxDistance = band.maxDistance + 6;

  if (isReverse) {
    for (let cursor = startStampIndex - 1; cursor >= 0; cursor -= 1) {
      distance += segments[cursor].distance;
      const candidate = buildSuggestion(cursor, startStampIndex - 1, band, isReverse);
      if (candidate) candidates.push(candidate);
      if (distance > maxDistance) break;
    }
    return candidates.sort((a, b) => a.score - b.score);
  }

  for (let cursor = startStampIndex; cursor < segments.length; cursor += 1) {
    distance += segments[cursor].distance;
    const candidate = buildSuggestion(startStampIndex, cursor, band, isReverse);
    if (candidate) candidates.push(candidate);
    if (distance > maxDistance) break;
  }

  return candidates.sort((a, b) => a.score - b.score);
}

function buildSuggestion(startIndex, endIndex, band, isReverse) {
  const routeSegments = segments.slice(startIndex, endIndex + 1);
  if (!routeSegments.length) return null;
  const totals = sumSegments(routeSegments);
  const minutes = isReverse ? totals.reverseMinutes : totals.minutes;
  const up = isReverse ? totals.down : totals.up;
  const down = isReverse ? totals.up : totals.down;
  const distanceScore = Math.abs(totals.distance - band.idealDistance) * 3;
  const rangeScore =
    Math.max(band.minDistance - totals.distance, 0) * 12 + Math.max(totals.distance - band.maxDistance, 0) * 6;
  const timeScore = Math.max(minutes - 520, 0) / 30;
  const climbScore = Math.max(up - 900, 0) / 120;
  const score = distanceScore + rangeScore + timeScore + climbScore;
  const first = routeSegments[0];
  const last = routeSegments[routeSegments.length - 1];

  return {
    ...band,
    startIndex,
    endIndex,
    totals,
    minutes,
    up,
    down,
    score,
    from: isReverse ? last.to : first.from,
    to: isReverse ? first.from : last.to,
  };
}

function handleSuggestionClick(event) {
  const button = event.target.closest("[data-suggestion-start]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  applySuggestionButton(button);
}

function bindStampPopupControls(event) {
  const popupElement = event.popup?.getElement?.();
  if (!popupElement) return;

  popupElement.querySelectorAll("[data-suggestion-start]").forEach((button) => {
    button.addEventListener("click", (clickEvent) => {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
      applySuggestionButton(button);
    });
  });
}

function applySuggestionButton(button) {
  const startIndex = Number(button.dataset.suggestionStart);
  const endIndex = Number(button.dataset.suggestionEnd);
  if (!Number.isFinite(startIndex) || !Number.isFinite(endIndex)) return;

  const before = new Set(state.selectedSegments);
  if (["forward", "reverse"].includes(button.dataset.suggestionDirection)) {
    state.direction = button.dataset.suggestionDirection;
  }
  state.selectedSegments = segmentIdsBetween(startIndex, endIndex);
  updateChangedSelectedSegments(before, new Set(state.selectedSegments));
  saveState();
  updateSummaryAndProfile();
  map.closePopup();
  fitSelectedSegments();
}

window.applyStampSuggestion = applySuggestionButton;

function initTravelControls() {
  const startInput = document.querySelector("#travelStartTime");
  const returnInput = document.querySelector("#travelReturnTime");
  if (!startInput || !returnInput || startInput.value) return;
  const tomorrowMorning = new Date();
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(7, 0, 0, 0);
  const tomorrowEvening = new Date(tomorrowMorning);
  tomorrowEvening.setHours(18, 0, 0, 0);
  startInput.value = formatDateTimeLocal(tomorrowMorning);
  returnInput.value = formatDateTimeLocal(tomorrowEvening);
}

function toggleTravelTimeMode(leg) {
  const key = leg === "return" ? "returnTimeMode" : "outboundTimeMode";
  travelSettings[key] = travelSettings[key] === "arrive" ? "depart" : "arrive";
  saveTravelSettings();
  syncTravelSettingsUi();
  clearTravelResults("Choose your outbound and return times to find routes.");
}

function syncTravelSettingsUi() {
  const addressInput = document.querySelector("#travelOriginAddress");
  const status = document.querySelector("#travelOriginStatus");
  const startLabel = document.querySelector("#travelStartLabel");
  const returnLabel = document.querySelector("#travelReturnLabel");
  if (addressInput && document.activeElement !== addressInput) {
    addressInput.value = travelSettings.origin.address || travelSettings.origin.name || "";
  }
  if (status) status.textContent = `Routes start from ${getTravelOriginLabel()}.`;
  if (startLabel) {
    startLabel.textContent = travelSettings.outboundTimeMode === "arrive" ? "Arrive at trailhead" : "Leave home";
  }
  if (returnLabel) {
    returnLabel.textContent = travelSettings.returnTimeMode === "arrive" ? "Arrive home" : "Leave trail end";
  }
  document.querySelectorAll("[data-travel-time-toggle]").forEach((button) => {
    const isReturn = button.dataset.travelTimeToggle === "return";
    const mode = isReturn ? travelSettings.returnTimeMode : travelSettings.outboundTimeMode;
    const currentLabel = mode === "arrive" ? "Arrive by" : "Leave after";
    const nextLabel = mode === "arrive" ? "leave after" : "arrive by";
    button.querySelectorAll("[data-time-icon]").forEach((icon) => {
      icon.classList.toggle("is-hidden", icon.dataset.timeIcon !== mode);
    });
    button.setAttribute("aria-label", `${isReturn ? "Return" : "Outbound"} time: ${currentLabel}. Switch to ${nextLabel}.`);
    button.setAttribute("title", `Switch to ${nextLabel}`);
  });
}

async function handleSaveTravelOrigin() {
  const input = document.querySelector("#travelOriginAddress");
  const button = document.querySelector("#saveTravelOrigin");
  const status = document.querySelector("#travelOriginStatus");
  const query = input?.value.trim();
  if (!query || !button || !status) return;

  button.disabled = true;
  button.textContent = "Locating...";
  status.textContent = "Finding this address...";

  try {
    const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "1" });
    const response = await fetch(`${nominatimSearchUrl}?${params.toString()}`, {
      headers: { "Accept-Language": "en" },
    });
    if (!response.ok) throw new Error(`Address search failed (${response.status}).`);
    const [match] = await response.json();
    const lat = Number.parseFloat(match?.lat);
    const lng = Number.parseFloat(match?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Address not found. Try adding the city or postcode.");

    travelSettings.origin = { name: query, address: query, lat, lng };
    saveTravelSettings();
    syncTravelSettingsUi();
    clearTravelResults("Origin updated. Find routes again for the selected trail.");
  } catch (error) {
    status.textContent = error.message || "Could not locate this address.";
  } finally {
    button.disabled = false;
    button.textContent = "Set";
  }
}

function getTravelOriginLabel() {
  return travelSettings.origin.name || travelSettings.origin.address || "home";
}

function clearTravelResults(message) {
  const results = document.querySelector("#travelResults");
  if (!results) return;
  results.removeAttribute("data-route-key");
  results.textContent = message;
}

function syncTravelPanel(selected, selectedTotals) {
  const button = document.querySelector("#travelButton");
  const routeLabel = document.querySelector("#travelRouteLabel");
  const results = document.querySelector("#travelResults");
  const planButton = document.querySelector("#travelPlanButton");
  const panel = document.querySelector("#travelPanel");
  if (!button || !routeLabel || !results || !planButton || !panel) return;

  const canCheck = selected.length > 0 && selected.every((segment) => segment.points?.length);
  button.disabled = !canCheck;
  planButton.hidden = canCheck;
  panel.dataset.routeKey = getTravelRouteKey(selected, selectedTotals);
  if (!canCheck) {
    results.removeAttribute("data-route-key");
    results.textContent = `Select a route to estimate public transport from ${getTravelOriginLabel()}.`;
    routeLabel.textContent = "Select a route";
    return;
  }

  routeLabel.textContent = formatTravelRouteLabel(selected);

  if (!results.dataset.routeKey) {
    if (results.textContent.includes("Select a route")) {
      results.textContent = "Choose your outbound and return times to find routes.";
    }
  }

  if (results.dataset.routeKey && results.dataset.routeKey !== panel.dataset.routeKey) {
    results.textContent = "Check public transport for this selected route.";
    results.removeAttribute("data-route-key");
  }
}

function expandBottomSheetForTravel() {
  if (!window.matchMedia("(max-width: 860px)").matches) return;
  const height = Math.round(window.innerHeight * 0.56);
  document.documentElement.style.setProperty("--sheet-height", `${height}px`);
  setSheetExpanded(true);
}

function expandBottomSheetForLists() {
  if (!window.matchMedia("(max-width: 860px)").matches) return;
  const height = Math.round(window.innerHeight * 0.48);
  document.documentElement.style.setProperty("--sheet-height", `${height}px`);
  setSheetExpanded(true);
  refreshMapLayout(false);
}

async function handleTravelRequest() {
  const button = document.querySelector("#travelButton");
  const results = document.querySelector("#travelResults");
  const selected = getSelectedSegmentsInOrder();
  if (!selected.length || !button || !results) return;

  const route = getSelectedTravelRoute(selected);
  const outboundAt = parseTravelDateTime("#travelStartTime");
  const returnAt = parseTravelDateTime("#travelReturnTime");
  if (!route || !outboundAt || !returnAt) {
    results.textContent = "Pick a route and valid outbound and return times first.";
    return;
  }
  if (returnAt <= outboundAt) {
    results.textContent = "The return journey must be later than the outbound journey.";
    return;
  }

  button.disabled = true;
  button.textContent = "Searching...";
  results.innerHTML = `<span class="travel-muted">Looking for routes from ${escapeHtml(getTravelOriginLabel())}...</span>`;

  try {
    const outbound = await fetchTransitItinerary(
      travelSettings.origin,
      route.start,
      outboundAt,
      {
        arriveBy: travelSettings.outboundTimeMode === "arrive",
        label: "To trailhead",
      },
    );
    const inbound = await fetchTransitItinerary(route.end, travelSettings.origin, returnAt, {
      arriveBy: travelSettings.returnTimeMode === "arrive",
      label: "Back home",
    });

    results.dataset.routeKey = document.querySelector("#travelPanel")?.dataset.routeKey || "";
    results.innerHTML = renderTravelResults(outbound, inbound, outboundAt, returnAt);
  } catch (error) {
    results.innerHTML = `<span class="travel-error">${escapeHtml(error.message || "Could not fetch public transport right now.")}</span>`;
  } finally {
    button.disabled = false;
    button.textContent = "Find routes";
  }
}

async function fetchTransitItinerary(from, to, dateTime, options = {}) {
  const params = new URLSearchParams({
    fromPlace: `${from.lat},${from.lng}`,
    toPlace: `${to.lat},${to.lng}`,
    time: toTransitousDateTime(dateTime),
    arriveBy: String(Boolean(options.arriveBy)),
    numItineraries: "3",
    radius: "2500",
    maxTravelTime: "720",
    detailedLegs: "false",
    detailedTransfers: "false",
  });
  params.append("directModes", "");

  const response = await fetch(`${transitousPlanUrl}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Transit search failed (${response.status}).`);
  }

  const data = await response.json();
  const itinerary = data.itineraries?.[0] || null;
  if (!itinerary) {
    return {
      empty: true,
      label: options.label || "Travel",
    };
  }

  return {
    label: options.label || "Travel",
    duration: itinerary.duration,
    startTime: itinerary.startTime,
    endTime: itinerary.endTime,
    transfers: itinerary.transfers,
    steps: getTransitSteps(itinerary.legs || []),
    summary: summarizeTransitLegs(itinerary.legs || []),
  };
}

function renderTravelResults(outbound, inbound, outboundAt, returnAt) {
  const tripSpan = getTripSpan(outbound, inbound);
  const total = !tripSpan ? "" : `
    <div class="travel-total">
      <span>Trip span</span>
      <strong>${tripSpan}</strong>
    </div>
  `;
  return `
    ${renderTravelRow(outbound, outboundAt, travelSettings.outboundTimeMode === "arrive")}
    ${renderTravelRow(inbound, returnAt, travelSettings.returnTimeMode === "arrive")}
    ${total}
  `;
}

function getTripSpan(outbound, inbound) {
  if (outbound?.empty || inbound?.empty) return "";
  const start = new Date(outbound?.startTime);
  const end = new Date(inbound?.endTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return "";
  const totalMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (!days) return formatMinutes(totalMinutes);
  return `${days}d ${hours}h ${minutes}m`;
}

function renderTravelRow(item, requestedTime, arriveBy = false) {
  if (!item || item.empty) {
    const suffix = requestedTime ? ` ${arriveBy ? "by" : "after"} ${formatClock(requestedTime)}` : "";
    return `
      <div class="travel-row">
        <span class="travel-row-label">${escapeHtml(item?.label || "Travel")}</span>
        <strong>No route found</strong>
        <small>No public transport route found${suffix}.</small>
      </div>
    `;
  }

  return `
    <div class="travel-row">
      <span class="travel-row-label">${escapeHtml(item.label)}</span>
      <strong>${formatMinutes(Math.round(item.duration / 60))}</strong>
      <span>${formatClock(item.startTime)}-${formatClock(item.endTime)} · ${item.transfers} transfers</span>
      ${renderTransitSteps(item.steps, item.summary)}
    </div>
  `;
}

function formatTravelRouteLabel(selected) {
  const firstSegment = selected[0];
  const lastSegment = selected[selected.length - 1];
  if (!firstSegment || !lastSegment) return "Select a route";
  return state.direction === "reverse"
    ? `${lastSegment.to} -> ${firstSegment.from}`
    : `${firstSegment.from} -> ${lastSegment.to}`;
}

function summarizeTransitLegs(legs) {
  const names = legs
    .filter((leg) => leg.mode !== "WALK")
    .map((leg) => getTransitStepLabel(leg))
    .filter(Boolean);
  if (!names.length) return "Walk";
  return names.slice(0, 5).join(" -> ");
}

function getTransitSteps(legs) {
  return legs
    .filter((leg) => leg.mode !== "WALK")
    .map((leg) => ({
      mode: normalizeTransitMode(leg.mode),
      label: getTransitStepLabel(leg),
    }))
    .filter((step) => step.label)
    .slice(0, 5);
}

function getTransitStepLabel(leg) {
  return leg.displayName || leg.routeShortName || leg.routeLongName || formatMode(leg.mode);
}

function normalizeTransitMode(mode) {
  const value = String(mode || "").toUpperCase();
  if (value.includes("RAIL") || value === "TRAIN") return "rail";
  if (value.includes("SUBWAY") || value.includes("METRO")) return "subway";
  if (value.includes("TRAM")) return "tram";
  if (value.includes("BUS") || value.includes("COACH")) return "bus";
  if (value.includes("FERRY")) return "ferry";
  return "transit";
}

function renderTransitSteps(steps = [], summary = "") {
  if (!steps.length) {
    return `<small>${escapeHtml(summary || "Public transport")}</small>`;
  }

  return `
    <div class="travel-leg-strip" aria-label="${escapeHtml(summary || "Public transport")}">
      ${steps
    .map(
      (step) => `
        <span class="travel-leg-chip" data-mode="${escapeHtml(step.mode)}">
          <span class="travel-leg-icon" aria-hidden="true">${getTransitIcon(step.mode)}</span>
          <span class="travel-leg-name">${escapeHtml(step.label)}</span>
        </span>
      `,
    )
    .join("")}
    </div>
  `;
}

function getTransitIcon(mode) {
  const icons = {
    bus: `<svg viewBox="0 0 24 24" role="img"><path d="M6.5 4h11A2.5 2.5 0 0 1 20 6.5V16a2 2 0 0 1-1.4 1.9V20h-2v-2H7.4v2h-2v-2.1A2 2 0 0 1 4 16V6.5A2.5 2.5 0 0 1 6.5 4Zm.1 2A.6.6 0 0 0 6 6.6V11h12V6.6a.6.6 0 0 0-.6-.6H6.6ZM7 15.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm10 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"/></svg>`,
    ferry: `<svg viewBox="0 0 24 24" role="img"><path d="M5 10.5 8 5h8l3 5.5V15l-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3L7 15l-2 1.3v-5.8ZM9.2 7l-1.4 2.5h8.4L14.8 7H9.2ZM4 18.3l3-1.9 2 1.3 2-1.3 2 1.3 2-1.3 2 1.3 3-1.9v2.3l-3 1.9-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-3 1.9v-2.3Z"/></svg>`,
    rail: `<svg viewBox="0 0 24 24" role="img"><path d="M8 3h8a3 3 0 0 1 3 3v8.5a3 3 0 0 1-2.3 2.9l1.8 2.6h-2.4l-1.4-2h-5.4l-1.4 2H5.5l1.8-2.6A3 3 0 0 1 5 14.5V6a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v4h10V6a1 1 0 0 0-1-1H8Zm.8 10.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm6.4 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"/></svg>`,
    subway: `<svg viewBox="0 0 24 24" role="img"><path d="M7 3h10a2 2 0 0 1 2 2v10a3 3 0 0 1-2.4 2.9L18 20H6l1.4-2.1A3 3 0 0 1 5 15V5a2 2 0 0 1 2-2Zm0 2v5h10V5H7Zm2 10.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Zm6 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"/></svg>`,
    tram: `<svg viewBox="0 0 24 24" role="img"><path d="M11 3h2v2h4a2 2 0 0 1 2 2v8.2a2.8 2.8 0 0 1-2.2 2.7L18 20h-2.2l-1.1-2H9.3l-1.1 2H6l1.2-2.1A2.8 2.8 0 0 1 5 15.2V7a2 2 0 0 1 2-2h4V3ZM7 7v3h10V7H7Zm2 8.5a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm6 0a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z"/></svg>`,
    transit: `<svg viewBox="0 0 24 24" role="img"><path d="M12 3a7 7 0 0 1 7 7c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 7a2.5 2.5 0 0 0 0 5.5Z"/></svg>`,
  };
  return icons[mode] || icons.transit;
}

function formatMode(mode) {
  return String(mode || "Transit")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSelectedTravelRoute(selected) {
  const firstSegment = selected[0];
  const lastSegment = selected[selected.length - 1];
  const isReverse = state.direction === "reverse";
  const startStamp = getStampById(isReverse ? getSegmentToId(lastSegment) : getSegmentFromId(firstSegment));
  const endStamp = getStampById(isReverse ? getSegmentFromId(firstSegment) : getSegmentToId(lastSegment));
  if (!hasCoordinates(startStamp) || !hasCoordinates(endStamp)) return null;
  const totals = sumSegments(selected);

  return {
    start: { name: startStamp.name, lat: startStamp.lat, lng: startStamp.lng },
    end: { name: endStamp.name, lat: endStamp.lat, lng: endStamp.lng },
    minutes: isReverse ? totals.reverseMinutes : totals.minutes,
  };
}

function getSelectedSegmentsInOrder() {
  const selectedIds = new Set(state.selectedSegments);
  return segments.filter((segment) => selectedIds.has(segment.id));
}

function getTravelRouteKey(selected, selectedTotals) {
  if (!selected.length) return "";
  return [
    activeTrailId,
    state.direction,
    selected[0].id,
    selected[selected.length - 1].id,
    selectedTotals.distance.toFixed(1),
  ].join(":");
}

function parseTravelDateTime(selector) {
  const value = document.querySelector(selector)?.value;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasCoordinates(stamp) {
  return Number.isFinite(stamp?.lat) && Number.isFinite(stamp?.lng);
}

function formatDateTimeLocal(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toTransitousDateTime(date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, "0");
  const offsetMins = String(absOffset % 60).padStart(2, "0");
  return `${formatDateTimeLocal(date)}:00${sign}${offsetHours}:${offsetMins}`;
}

function formatClock(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("hu-HU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function setDirection(direction) {
  if (!["forward", "reverse"].includes(direction) || state.direction === direction) return;
  state.direction = direction;
  saveState();
  updateSummaryAndProfile();
}

function syncDirectionControls() {
  document.querySelectorAll("[data-direction]").forEach((button) => {
    const isActive = button.dataset.direction === state.direction;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function syncCompletedSegmentsFromStamps() {
  const stampedIds = new Set(state.stamped);
  state.completedSegments = segments
    .filter((segment) => stampedIds.has(getSegmentFromId(segment)) && stampedIds.has(getSegmentToId(segment)))
    .map((segment) => segment.id);
}

function setSectionStamped(sectionId, checked) {
  const group = getSectionGroups().find((item) => item.section === sectionId);
  if (!group) return;
  const stampedIds = new Set(state.stamped);
  const completedIds = new Set(state.completedSegments);
  const groupSegmentIds = new Set(group.segments.map((segment) => segment.id));
  const stampsNeededElsewhere = new Set();

  if (!checked) {
    state.completedSegments.forEach((segmentId) => {
      if (groupSegmentIds.has(segmentId)) return;
      const segment = segmentById.get(segmentId);
      if (!segment) return;
      stampsNeededElsewhere.add(getSegmentFromId(segment));
      stampsNeededElsewhere.add(getSegmentToId(segment));
    });
  }

  group.segments.forEach((segment) => {
    if (checked) completedIds.add(segment.id);
    else completedIds.delete(segment.id);
  });

  group.stamps.forEach((stamp) => {
    if (checked) stampedIds.add(stamp.id);
    else if (!stampsNeededElsewhere.has(stamp.id)) stampedIds.delete(stamp.id);
  });
  state.stamped = Array.from(stampedIds);
  state.completedSegments = Array.from(completedIds).sort((a, b) => {
    return (segmentById.get(a)?.number || 0) - (segmentById.get(b)?.number || 0);
  });
}

function syncBaseRouteLayer() {
  if (!baseRouteLayer) return;
  baseRouteLayer.setLatLngs(segments.map((segment) => segment.points));
}

function refreshHighlightedLayers(selectedIds = new Set(state.selectedSegments), completedIds = new Set(state.completedSegments)) {
  const wantedIds = new Set([...selectedIds, ...completedIds]);

  highlightedLayers.forEach((layer, segmentId) => {
    if (!wantedIds.has(segmentId)) {
      layer.remove();
      highlightedLayers.delete(segmentId);
    }
  });

  wantedIds.forEach((segmentId) => {
    const segment = segmentById.get(segmentId);
    if (!segment) return;
    upsertHighlightedLayer(segment, completedIds.has(segmentId) ? "#1f9d66" : getTrailColor());
  });
}

function refreshHighlightedLayer(segmentId) {
  const selected = state.selectedSegments.includes(segmentId);
  const completed = state.completedSegments.includes(segmentId);
  const existing = highlightedLayers.get(segmentId);

  if (!selected && !completed) {
    if (existing) {
      existing.remove();
      highlightedLayers.delete(segmentId);
    }
    return;
  }

  const segment = segmentById.get(segmentId);
  if (!segment) return;
  upsertHighlightedLayer(segment, completed ? "#1f9d66" : getTrailColor());
}

function upsertHighlightedLayer(segment, color) {
  const existing = highlightedLayers.get(segment.id);
  if (existing) {
    existing.setLatLngs(segment.points);
    existing.setStyle({ color });
    return;
  }

  highlightedLayers.set(
    segment.id,
    L.polyline(segment.points, {
      color,
      renderer: trailRenderer,
      weight: 8,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    }).addTo(map),
  );
}

function renderElevation(profileSegments) {
  const svg = document.querySelector("#elevationChart");
  const dock = svg.closest(".elevation-dock");
  const mapPane = document.querySelector(".map-pane");
  const width = 900;
  const height = 170;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  if (!profileSegments.length) {
    dock?.classList.add("empty");
    mapPane?.classList.add("elevation-empty");
    svg.innerHTML = `
      <line x1="44" y1="120" x2="872" y2="120" stroke="#d9e1e8" />
      <path d="M44 120 C 180 88, 260 112, 380 78 S 610 112, 760 70 S 835 92, 872 84" fill="none" stroke="#b9c8d6" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="8 8" />
      <text x="450" y="88" text-anchor="middle" fill="#657386" font-size="18" font-weight="800">Select one or more segments</text>
    `;
    document.querySelector("#profileTitle").textContent = "No selected segment";
    document.querySelector("#profileMeta").textContent = `Stats ${getActiveDataVersion()}`;
    return;
  }

  dock?.classList.remove("empty");
  mapPane?.classList.remove("elevation-empty");
  const pad = { top: 18, right: 28, bottom: 34, left: 50 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const isReverse = state.direction === "reverse";
  const profile = buildProfile(profileSegments, isReverse);
  const minAlt = Math.floor((Math.min(...profile.map((point) => point.altitude)) - 40) / 50) * 50;
  const maxAlt = Math.ceil((Math.max(...profile.map((point) => point.altitude)) + 40) / 50) * 50;
  const lastProfilePoint = profile[profile.length - 1];
  const maxDistance = Math.max(lastProfilePoint?.distance || 1, 1);
  const xScale = (km) => pad.left + (km / maxDistance) * plotWidth;
  const yScale = (altitude) => pad.top + ((maxAlt - altitude) / (maxAlt - minAlt || 1)) * plotHeight;
  const d = profile
    .map((point, index) => `${index ? "L" : "M"} ${xScale(point.distance).toFixed(1)} ${yScale(point.altitude).toFixed(1)}`)
    .join(" ");
  const fillD = `${d} L ${pad.left + plotWidth} ${pad.top + plotHeight} L ${pad.left} ${pad.top + plotHeight} Z`;
  const grid = buildGridLines(minAlt, maxAlt, maxDistance, xScale, yScale, pad, plotWidth, plotHeight);
  const stampsMarkup = profile
    .filter((point) => point.stamp)
    .map(
      (point) =>
        `<circle cx="${xScale(point.distance).toFixed(1)}" cy="${yScale(point.altitude).toFixed(1)}" r="3.6" fill="#fff" stroke="${getTrailColor()}" stroke-width="2"><title>${point.stamp} · ${Math.round(point.altitude)} m</title></circle>`,
    )
    .join("");

  svg.innerHTML = `
    ${grid}
    <path d="${fillD}" fill="rgba(${getTrailRgb()}, 0.14)"></path>
    <path d="${d}" fill="none" stroke="${getTrailColor()}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path>
    ${stampsMarkup}
  `;

  const firstSegment = profileSegments[0];
  const lastSegment = profileSegments[profileSegments.length - 1];
  const title = isReverse ? `${lastSegment.to} - ${firstSegment.from}` : `${firstSegment.from} - ${lastSegment.to}`;
  document.querySelector("#profileTitle").textContent = title;
  document.querySelector("#profileMeta").textContent = `${geometrySource} · stats ${getActiveDataVersion()} · ${Math.round(minAlt)}-${Math.round(maxAlt)} m`;
}

function buildGridLines(minAlt, maxAlt, maxDistance, xScale, yScale, pad, plotWidth, plotHeight) {
  const altitudeStep = Math.max(50, Math.ceil((maxAlt - minAlt) / 4 / 50) * 50);
  const distanceStep = maxDistance > 180 ? 200 : maxDistance > 80 ? 50 : maxDistance > 30 ? 10 : 5;
  let markup = "";

  for (let altitude = minAlt; altitude <= maxAlt; altitude += altitudeStep) {
    const y = yScale(altitude).toFixed(1);
    markup += `<line x1="${pad.left}" y1="${y}" x2="${pad.left + plotWidth}" y2="${y}" stroke="#d9e1e8" />`;
    markup += `<text x="${pad.left - 9}" y="${Number(y) + 5}" text-anchor="end" fill="#657386" font-size="14" font-weight="700">${altitude} m</text>`;
  }

  for (let distance = 0; distance <= maxDistance + 0.001; distance += distanceStep) {
    const x = xScale(distance).toFixed(1);
    markup += `<line x1="${x}" y1="${pad.top}" x2="${x}" y2="${pad.top + plotHeight}" stroke="#eef3f7" />`;
    markup += `<text x="${x}" y="${pad.top + plotHeight + 24}" text-anchor="middle" fill="#657386" font-size="14" font-weight="700">${Math.round(distance)} km</text>`;
  }

  return markup;
}

function buildProfile(profileSegments, isReverse = false) {
  const profile = [];
  let distance = 0;
  const orderedSegments = isReverse ? [...profileSegments].reverse() : profileSegments;
  orderedSegments.forEach((segment, segmentIndex) => {
    const samples = segment.elevationSamples.length
      ? segment.elevationSamples
      : generateElevationSamples(segment, getStampById(getSegmentFromId(segment)).altitude, getStampById(getSegmentToId(segment)).altitude);
    const orderedSamples = isReverse
      ? samples.map((sample) => ({ ...sample, distance: segment.distance - sample.distance })).reverse()
      : samples;
    orderedSamples.forEach((sample, sampleIndex) => {
      if (segmentIndex > 0 && sampleIndex === 0) return;
      profile.push({
        distance: distance + sample.distance,
        altitude: sample.altitude,
        stamp: sampleIndex === 0 ? (isReverse ? segment.to : segment.from) : sampleIndex === orderedSamples.length - 1 ? (isReverse ? segment.from : segment.to) : null,
      });
    });
    distance += segment.distance;
  });
  return profile;
}

function generateElevationSamples(segment, startAlt, endAlt) {
  const pointCount = Math.max(8, Math.ceil(segment.distance * 2));
  const relief = Math.max(20, (segment.up + segment.down) / 5);
  const samples = [];
  for (let index = 0; index < pointCount; index += 1) {
    const t = index / (pointCount - 1);
    const trend = lerp(startAlt, endAlt, t);
    const wave = Math.sin(t * Math.PI * 2 + segment.number * 0.7) * relief * 0.35;
    const climbShape = Math.sin(t * Math.PI) * (segment.up - segment.down) * 0.08;
    samples.push({
      distance: segment.distance * t,
      altitude: Math.max(80, trend + wave + climbShape),
    });
  }
  return samples;
}

function toggleSegment(segmentId) {
  const didChange = setSegmentSelected(segmentId, !state.selectedSegments.includes(segmentId));
  if (!didChange) return;
  saveState();
  updateSummaryAndProfile();
}

function selectNearestSegment(event) {
  const clickPoint = map.latLngToLayerPoint(event.latlng);
  let nearestSegment = null;
  let nearestDistance = Infinity;

  segments.forEach((segment) => {
    for (let index = 1; index < segment.points.length; index += 1) {
      const start = map.latLngToLayerPoint(segment.points[index - 1]);
      const end = map.latLngToLayerPoint(segment.points[index]);
      const distance = pointToSegmentDistance(clickPoint, start, end);
      if (distance < nearestDistance || (Math.abs(distance - nearestDistance) < 0.01 && nearestSegment && segment.number > nearestSegment.number)) {
        nearestDistance = distance;
        nearestSegment = segment;
      }
    }
  });

  if (nearestSegment && nearestDistance <= 22) {
    toggleSegment(nearestSegment.id);
    return;
  }

  if (state.selectedSegments.length) deselectAllSegments();
}

function pointToSegmentDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

function switchTab(tab, shouldExpand = false) {
  const view = ["plan", "travel", "progress", "more"].includes(tab) ? tab : "plan";
  document.documentElement.dataset.view = view;
  document.querySelector("#planTab").classList.toggle("active", view === "plan");
  document.querySelector("#travelTab").classList.toggle("active", view === "travel");
  document.querySelector("#progressTab").classList.toggle("active", view === "progress");
  document.querySelector("#moreTab").classList.toggle("active", view === "more");
  document.querySelectorAll(".bottom-nav .nav-item").forEach((button) => {
    if (button.classList.contains("active")) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  document.querySelector("#planView").classList.toggle("active", view === "plan");
  document.querySelector("#travelView").classList.toggle("active", view === "travel");
  document.querySelector("#progressView").classList.toggle("active", view === "progress");
  document.querySelector("#moreView").classList.toggle("active", view === "more");

  if (view === "travel") {
    if (state.selectedSegments.length) {
      expandBottomSheetForTravel();
    } else {
      expandBottomSheetForLists();
    }
    fitSelectedSegments();
    refreshMapLayout(false);
    return;
  }

  if (shouldExpand) expandBottomSheetForLists();
  refreshMapLayout(false);
}

function fitMap() {
  const bounds = L.latLngBounds(segments.flatMap((segment) => segment.points));
  map.fitBounds(bounds, { padding: [36, 36] });
}

function fitSelectedSegments() {
  const selected = segments.filter((segment) => state.selectedSegments.includes(segment.id));
  if (!selected.length) return;
  const points = selected.flatMap((segment) => segment.points);
  if (!points.length) return;
  const isMobile = window.matchMedia("(max-width: 860px)").matches;
  map.fitBounds(L.latLngBounds(points), {
    paddingTopLeft: isMobile ? [24, 72] : [42, 42],
    paddingBottomRight: isMobile ? [24, 280] : [42, 260],
  });
}

function refreshMapLayout(shouldFit) {
  const mapElement = document.querySelector("#map");
  const refresh = () => {
    const { width, height } = mapElement.getBoundingClientRect();
    if (width < 10 || height < 10) {
      setTimeout(() => refreshMapLayout(shouldFit), 80);
      return;
    }

    map.invalidateSize({ animate: false, pan: false });
    if (shouldFit) fitMap();
  };

  requestAnimationFrame(() => {
    refresh();
    setTimeout(refresh, 120);
    setTimeout(refresh, 360);
  });
}

function getStampByName(name) {
  return stamps.find((stamp) => stamp.name === name);
}

function getStampById(stampId) {
  return stampById.get(stampId) || stamps.find((stamp) => stamp.id === stampId) || stamps[0] || { altitude: 180 };
}

function getSegmentFromId(segment) {
  return segment.fromId || slugify(segment.from);
}

function getSegmentToId(segment) {
  return segment.toId || slugify(segment.to);
}

function getSectionGroups() {
  const groups = [];

  segments.forEach((segment, index) => {
    let group = groups[groups.length - 1];
    if (!group || group.section !== segment.section) {
      group = {
        section: segment.section,
        from: segment.from,
        to: segment.to,
        segments: [],
        stamps: [],
      };
      group.stamps.push(getStampById(getSegmentFromId(segment)));
      groups.push(group);
    }

    group.to = segment.to;
    group.segments.push(segment);
    group.stamps.push(getStampById(getSegmentToId(segment)));
  });

  return groups.map((group) => ({
    ...group,
    stamps: group.stamps.filter(Boolean),
  }));
}

function getSectionProgressLabel(group) {
  const completedIds = new Set(state.completedSegments);
  const total = sumSegments(group.segments);
  const done = sumSegments(group.segments.filter((segment) => completedIds.has(segment.id)));
  const percent = total.distance ? Math.round((done.distance / total.distance) * 100) : 0;
  return `${percent}% · ${done.distance.toFixed(1)} / ${total.distance.toFixed(1)} km`;
}

function sumSegments(items) {
  return items.reduce(
    (total, segment) => ({
      distance: total.distance + segment.distance,
      minutes: total.minutes + segment.minutes,
      reverseMinutes: total.reverseMinutes + segment.reverseMinutes,
      up: total.up + segment.up,
      down: total.down + segment.down,
    }),
    { distance: 0, minutes: 0, reverseMinutes: 0, up: 0, down: 0 },
  );
}

function setMembership(list, value, shouldContain) {
  const index = list.indexOf(value);
  if (shouldContain && index === -1) list.push(value);
  if (!shouldContain && index !== -1) list.splice(index, 1);
}

function formatMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${String(mins).padStart(2, "0")}`;
}

function formatStampDistance(stamp) {
  return `${Math.max(stamp.nextDistance, 0).toFixed(1)} km`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function parseTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function estimateReverseMinutes(distance, reverseUpMeters) {
  const flatMinutes = (distance / 4) * 60;
  const climbMinutes = (reverseUpMeters / 600) * 60;
  return Math.max(1, Math.round((flatMinutes + climbMinutes) / 5) * 5);
}

function estimateAltitude(index, total) {
  const t = index / Math.max(total - 1, 1);
  return Math.round(220 + Math.sin(t * Math.PI * 7) * 145 + Math.sin(t * Math.PI * 19) * 70 + t * 180);
}

function extractLinePoints(geometry) {
  if (!geometry) return [];
  if (geometry.type === "LineString") return geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.flatMap((line) => line.map(([lng, lat]) => [lat, lng]));
  }
  return [];
}

function normalizeText(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugify(value) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
