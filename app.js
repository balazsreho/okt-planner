const oktDataVersion = "2026-09-10";
const storageKey = "okt-planner-state-v2";
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

const segments = parseSegments(segmentCsv);
const stamps = buildStamps(segments);
const segmentById = new Map(segments.map((segment) => [segment.id, segment]));
const stampById = new Map(stamps.map((stamp) => [stamp.id, stamp]));
const state = loadState();
const highlightedLayers = new Map();
const stampMarkers = new Map();
const segmentCards = new Map();
const selectInputs = new Map();
const stampInputs = new Map();
const sectionProgressLabels = new Map();
let baseRouteLayer;
let stampLayerGroup;
let tileLayer;
let map;
let geometrySource = "Overview geometry";
let trailRenderer;

document.addEventListener("DOMContentLoaded", init);
window.addEventListener("load", registerServiceWorker);

function init() {
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

  assignOverviewGeometry();
  applyBundledRouteData();
  state.selectedSegments = normalizeSelection(state.selectedSegments);
  if (state.stamped.length) syncCompletedSegmentsFromStamps();
  renderMap();
  renderLists();
  bindControls();
  updateUi();
  refreshMapLayout(false);
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

function loadState() {
  const fallback = {
    selectedSegments: [],
    completedSegments: [],
    stamped: [],
  };

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(storageKey)) };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
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
  baseRouteLayer = L.polyline(
    segments.map((segment) => segment.points),
    {
      color: "#1261b3",
      renderer: trailRenderer,
      weight: 4,
      opacity: 0.72,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    },
  ).addTo(map);

  map.on("click", selectNearestSegment);

  stamps.forEach((stamp) => {
    const marker = L.circleMarker([stamp.lat, stamp.lng], {
      radius: 6,
      color: "#ffffff",
      fillColor: "#1261b3",
      fillOpacity: 1,
      weight: 2,
      bubblingMouseEvents: false,
    }).addTo(map);

    marker.bindPopup(`<strong>${stamp.name}</strong><br>${stamp.altitude} m`);
    stampMarkers.set(stamp.id, marker);
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
              <span class="eyebrow">${segment.section} · ${segment.number}/159</span>
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
            <span data-section-progress="${group.section}">${getSectionProgressLabel(group)}</span>
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
  document.querySelectorAll("[data-segment-id]").forEach((card) => {
    segmentCards.set(card.dataset.segmentId, card);
  });
  document.querySelectorAll("[data-select-segment]").forEach((input) => {
    selectInputs.set(input.dataset.selectSegment, input);
  });
  document.querySelectorAll("[data-stamp]").forEach((input) => {
    stampInputs.set(input.dataset.stamp, input);
  });
  document.querySelectorAll("[data-section-progress]").forEach((label) => {
    sectionProgressLabels.set(label.dataset.sectionProgress, label);
  });

  segmentList.addEventListener("change", (event) => {
    const selectId = event.target.dataset.selectSegment;
    if (selectId) {
      const didChange = setSegmentSelected(selectId, event.target.checked);
      saveState();
      if (didChange) updateSummaryAndProfile();
    }
  });

  stampList.addEventListener("change", (event) => {
    const stampId = event.target.dataset.stamp;
    if (!stampId) return;
    setMembership(state.stamped, stampId, event.target.checked);
    syncCompletedSegmentsFromStamps();
    saveState();
    updateUi();
  });
}

function bindControls() {
  document.querySelector("#deselectButton").addEventListener("click", deselectAllSegments);
  document.querySelector("#exportButton").addEventListener("click", exportProgress);
  document.querySelector("#planTab").addEventListener("click", () => switchTab("plan"));
  document.querySelector("#progressTab").addEventListener("click", () => switchTab("progress"));
  window.addEventListener("load", () => refreshMapLayout(false));
  window.addEventListener("resize", () => refreshMapLayout(false));
  initBottomSheet();
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
    return [Math.round(viewport * 0.28), Math.round(viewport * 0.48), Math.round(viewport * 0.84)];
  };

  const setSheetHeight = (height) => {
    const [minHeight, , maxHeight] = getSnapHeights();
    const clamped = Math.max(minHeight, Math.min(maxHeight, height));
    document.documentElement.style.setProperty("--sheet-height", `${clamped}px`);
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
    document.querySelector("#profileMeta").textContent = `Stats ${oktDataVersion} · offline geometry`;
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

  document.querySelector("#selectedDistance").textContent = `${selectedTotals.distance.toFixed(1)} km`;
  document.querySelector("#selectedTime").textContent = formatMinutes(selectedTotals.minutes);
  document.querySelector("#selectedReturnTime").textContent = formatMinutes(selectedTotals.reverseMinutes);
  document.querySelector("#selectedElevation").textContent = `${selectedTotals.up} / ${selectedTotals.down} m`;
  document.querySelector("#completedDistance").textContent = `${completedTotals.distance.toFixed(1)} km completed`;
  document.querySelector("#remainingDistance").textContent = `${Math.max(allTotals.distance - completedTotals.distance, 0).toFixed(1)} km remaining`;
  document.querySelector("#progressRing").textContent = `${donePercent}%`;
  document.querySelector("#progressRing").style.setProperty("--progress", `${donePercent}%`);

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
  const input = stampInputs.get(stampId);
  if (input) input.checked = stampedIds.has(stampId);
  stampMarkers.get(stampId)?.setStyle({
    fillColor: stampedIds.has(stampId) ? "#1f9d66" : "#1261b3",
  });
}

function updateSectionProgressLabels() {
  getSectionGroups().forEach((group) => {
    const label = sectionProgressLabels.get(group.section);
    if (label) label.textContent = getSectionProgressLabel(group);
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

function syncCompletedSegmentsFromStamps() {
  const stampedIds = new Set(state.stamped);
  state.completedSegments = segments
    .filter((segment) => stampedIds.has(slugify(segment.from)) && stampedIds.has(slugify(segment.to)))
    .map((segment) => segment.id);
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
    upsertHighlightedLayer(segment, completedIds.has(segmentId) ? "#1f9d66" : "#f0a202");
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
  upsertHighlightedLayer(segment, completed ? "#1f9d66" : "#f0a202");
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
      <text x="450" y="88" text-anchor="middle" fill="#657386" font-size="16" font-weight="700">Select one or more segments</text>
    `;
    document.querySelector("#profileTitle").textContent = "No selected segment";
    document.querySelector("#profileMeta").textContent = `Stats ${oktDataVersion}`;
    return;
  }

  dock?.classList.remove("empty");
  mapPane?.classList.remove("elevation-empty");
  const pad = { top: 18, right: 28, bottom: 30, left: 44 };
  const plotWidth = width - pad.left - pad.right;
  const plotHeight = height - pad.top - pad.bottom;
  const profile = buildProfile(profileSegments);
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
        `<circle cx="${xScale(point.distance).toFixed(1)}" cy="${yScale(point.altitude).toFixed(1)}" r="3.6" fill="#fff" stroke="#1261b3" stroke-width="2"><title>${point.stamp} · ${Math.round(point.altitude)} m</title></circle>`,
    )
    .join("");

  svg.innerHTML = `
    ${grid}
    <path d="${fillD}" fill="rgba(18, 97, 179, 0.14)"></path>
    <path d="${d}" fill="none" stroke="#1261b3" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"></path>
    ${stampsMarkup}
  `;

  const title = `${profileSegments.length} selected segment${profileSegments.length > 1 ? "s" : ""}`;
  document.querySelector("#profileTitle").textContent = title;
  document.querySelector("#profileMeta").textContent = `${geometrySource} · stats ${oktDataVersion} · ${Math.round(minAlt)}-${Math.round(maxAlt)} m`;
}

function buildGridLines(minAlt, maxAlt, maxDistance, xScale, yScale, pad, plotWidth, plotHeight) {
  const altitudeStep = Math.max(50, Math.ceil((maxAlt - minAlt) / 4 / 50) * 50);
  const distanceStep = maxDistance > 180 ? 200 : maxDistance > 80 ? 50 : maxDistance > 30 ? 10 : 5;
  let markup = "";

  for (let altitude = minAlt; altitude <= maxAlt; altitude += altitudeStep) {
    const y = yScale(altitude).toFixed(1);
    markup += `<line x1="${pad.left}" y1="${y}" x2="${pad.left + plotWidth}" y2="${y}" stroke="#d9e1e8" />`;
    markup += `<text x="${pad.left - 8}" y="${Number(y) + 4}" text-anchor="end" fill="#657386" font-size="11">${altitude} m</text>`;
  }

  for (let distance = 0; distance <= maxDistance + 0.001; distance += distanceStep) {
    const x = xScale(distance).toFixed(1);
    markup += `<line x1="${x}" y1="${pad.top}" x2="${x}" y2="${pad.top + plotHeight}" stroke="#eef3f7" />`;
    markup += `<text x="${x}" y="${pad.top + plotHeight + 19}" text-anchor="middle" fill="#657386" font-size="11">${Math.round(distance)} km</text>`;
  }

  return markup;
}

function buildProfile(profileSegments) {
  const profile = [];
  let distance = 0;
  profileSegments.forEach((segment, segmentIndex) => {
    const samples = segment.elevationSamples.length
      ? segment.elevationSamples
      : generateElevationSamples(segment, getStampByName(segment.from).altitude, getStampByName(segment.to).altitude);
    samples.forEach((sample, sampleIndex) => {
      if (segmentIndex > 0 && sampleIndex === 0) return;
      profile.push({
        distance: distance + sample.distance,
        altitude: sample.altitude,
        stamp: sampleIndex === 0 ? segment.from : sampleIndex === samples.length - 1 ? segment.to : null,
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

  if (nearestSegment && nearestDistance <= 22) toggleSegment(nearestSegment.id);
}

function pointToSegmentDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return Math.hypot(point.x - start.x, point.y - start.y);

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

function switchTab(tab) {
  document.querySelector("#planTab").classList.toggle("active", tab === "plan");
  document.querySelector("#progressTab").classList.toggle("active", tab === "progress");
  document.querySelector("#planView").classList.toggle("active", tab === "plan");
  document.querySelector("#progressView").classList.toggle("active", tab === "progress");
  refreshMapLayout(false);
}

function exportProgress() {
  const completedNames = state.completedSegments.map((id) => {
    const segment = segmentById.get(id);
    return `${segment.from} - ${segment.to}`;
  });
  const stampedNames = state.stamped.map((id) => stamps.find((stamp) => stamp.id === id)?.name).filter(Boolean);
  const text = [
    "OKT planner export",
    `Data version: ${oktDataVersion}`,
    `Completed segments: ${completedNames.join(", ") || "none"}`,
    `Stamped places: ${stampedNames.join(", ") || "none"}`,
  ].join("\n");

  navigator.clipboard?.writeText(text);
  alert(text);
}

function fitMap() {
  const bounds = L.latLngBounds(segments.flatMap((segment) => segment.points));
  map.fitBounds(bounds, { padding: [36, 36] });
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
      if (index === 0) group.stamps.push(getStampByName(segment.from));
      groups.push(group);
    }

    group.to = segment.to;
    group.segments.push(segment);
    group.stamps.push(getStampByName(segment.to));
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
  return stamp.nextDistance > 0 ? `${stamp.nextDistance.toFixed(1)} km` : "Finish";
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
