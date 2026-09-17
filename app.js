const trails = window.TRAIL_ROUTE_DATA || {};
const defaultTrailId = trails.okt ? "okt" : Object.keys(trails)[0];
const activeTrailStorageKey = "kekkor-active-trail";
const stateStoragePrefix = "kekkor-planner-state";
const travelSettingsStorageKey = "kekkor-travel-settings";
const progressShareHashKey = "progress";
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
const photonSearchUrl = "https://photon.komoot.io/api/";
const analyticsMeasurementId = "G-124Z07M0NK";
const analyticsConsentStorageKey = "kekkor-analytics-consent";
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
let pendingProgressImport = null;
let travelOptionGroups = null;
let addressSuggestionTimer = null;
let addressSuggestionController = null;
let addressSuggestions = [];
let activeAddressSuggestionIndex = -1;
let pendingTravelOrigin = null;
const addressSuggestionCache = new Map();
let analyticsConsent = loadAnalyticsConsent();
let analyticsLoaded = false;
let lastTrackedView = null;

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
    attributionControl: false,
    renderer: trailRenderer,
    zoomAnimation: false,
    fadeAnimation: false,
    markerZoomAnimation: false,
    zoomSnap: 0.25,
  }).setView([47.16, 19.5], 7);

  L.control.zoom({ position: "topright" }).addTo(map);
  L.control.attribution({ position: "topright", prefix: false }).addTo(map);
  tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 1,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  stampLayerGroup = L.layerGroup().addTo(map);
  initOneFingerMapZoom();

  loadTrail(activeTrailId);
  state.selectedSegments = normalizeSelection(state.selectedSegments);
  if (state.stamped.length) syncCompletedSegmentsFromStamps();
  renderMap();
  renderLists();
  bindControls();
  initAnalytics();
  setInitialView();
  initTravelControls();
  syncTravelSettingsUi();
  updateUi();
  initProgressSharing();
  refreshMapLayout(true);
  if (useLiveOfficialGeometry) loadOfficialGeometry();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

function loadAnalyticsConsent() {
  try {
    const value = localStorage.getItem(analyticsConsentStorageKey);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function hasAnalyticsPrivacySignal() {
  return navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
}

function canSendAnalytics() {
  const isLocal = ["", "localhost", "127.0.0.1", "::1"].includes(location.hostname);
  return location.protocol === "https:" && !isLocal && !navigator.webdriver && !hasAnalyticsPrivacySignal();
}

function initAnalytics() {
  document.querySelector("#analyticsToggle")?.addEventListener("click", () => {
    setAnalyticsConsent(analyticsConsent !== "granted");
  });
  document.querySelector("#allowAnalytics")?.addEventListener("click", () => setAnalyticsConsent(true));
  document.querySelector("#declineAnalytics")?.addEventListener("click", () => setAnalyticsConsent(false));

  if (hasAnalyticsPrivacySignal()) {
    window[`ga-disable-${analyticsMeasurementId}`] = true;
  } else if (analyticsConsent === "granted") {
    loadGoogleAnalytics();
  } else if (analyticsConsent === null) {
    document.querySelector("#analyticsConsent").hidden = false;
  }
  syncAnalyticsUi();
}

function setAnalyticsConsent(isGranted) {
  analyticsConsent = isGranted ? "granted" : "denied";
  try {
    localStorage.setItem(analyticsConsentStorageKey, analyticsConsent);
  } catch {
    // Consent still applies for this session when storage is unavailable.
  }
  document.querySelector("#analyticsConsent").hidden = true;

  if (isGranted && !hasAnalyticsPrivacySignal()) {
    loadGoogleAnalytics();
    trackAppView(document.documentElement.dataset.view || "plan", true);
  } else {
    disableGoogleAnalytics();
  }
  syncAnalyticsUi();
}

function loadGoogleAnalytics() {
  if (analyticsConsent !== "granted" || !canSendAnalytics()) return;
  window[`ga-disable-${analyticsMeasurementId}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  if (analyticsLoaded) {
    window.gtag("consent", "update", { analytics_storage: "granted" });
    return;
  }

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  window.gtag("consent", "update", { analytics_storage: "granted" });
  window.gtag("set", "ads_data_redaction", true);
  window.gtag("js", new Date());
  window.gtag("config", analyticsMeasurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: `${location.origin}${location.pathname}`,
  });

  const script = document.createElement("script");
  script.id = "googleAnalyticsScript";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsMeasurementId)}`;
  document.head.append(script);
  analyticsLoaded = true;
}

function disableGoogleAnalytics() {
  window[`ga-disable-${analyticsMeasurementId}`] = true;
  window.gtag?.("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
  });
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (!name.startsWith("_ga")) return;
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
  });
  lastTrackedView = null;
}

function syncAnalyticsUi() {
  const toggle = document.querySelector("#analyticsToggle");
  const status = document.querySelector("#analyticsStatus");
  const hasPrivacySignal = hasAnalyticsPrivacySignal();
  const isGranted = analyticsConsent === "granted" && !hasPrivacySignal;
  if (toggle) {
    toggle.setAttribute("aria-checked", String(isGranted));
    toggle.disabled = hasPrivacySignal;
  }
  if (!status) return;
  if (hasPrivacySignal) {
    status.textContent = "Disabled by your browser privacy preference.";
  } else if (analyticsConsent === "granted") {
    status.textContent = canSendAnalytics()
      ? "Anonymous usage analytics is enabled."
      : "Enabled for the published app; previews are not tracked.";
  } else {
    status.textContent = "Analytics is off.";
  }
}

function trackAppView(view, force = false) {
  if (analyticsConsent !== "granted" || !canSendAnalytics() || !window.gtag) return;
  if (!force && lastTrackedView === view) return;
  const titles = { plan: "Plan", travel: "Travel", progress: "Progress", more: "Settings" };
  const pageName = titles[view] || "Plan";
  window.gtag("event", "page_view", {
    page_title: `Kékkör Planner · ${pageName}`,
    page_location: `${location.origin}${location.pathname}#/${view}`,
    page_path: `/${view}`,
  });
  lastTrackedView = view;
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

function initProgressSharing() {
  refreshProgressShareUi();
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const token = hashParams.get(progressShareHashKey);
  if (!token) return;

  history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
  try {
    pendingProgressImport = decodeProgressShare(token);
    showProgressImportPrompt(pendingProgressImport);
  } catch {
    setProgressShareStatus("This progress link is invalid or uses an unsupported version.");
  }
}

function getTrailStampIds(trail) {
  if (trail.stamps?.length) return trail.stamps.map((stamp) => stamp.id || slugify(stamp.name));
  const names = [];
  trail.segments.forEach((segment) => {
    if (!names.includes(segment.from)) names.push(segment.from);
    if (!names.includes(segment.to)) names.push(segment.to);
  });
  return names.map(slugify);
}

function encodeMembership(ids, selectedValues) {
  const selected = new Set(selectedValues);
  const bytes = new Uint8Array(Math.ceil(ids.length / 8));
  ids.forEach((id, index) => {
    if (selected.has(id)) bytes[Math.floor(index / 8)] |= 1 << (index % 8);
  });
  return bytesToBase64Url(bytes);
}

function decodeMembership(ids, encoded) {
  const bytes = base64UrlToBytes(encoded);
  return ids.filter((id, index) => Boolean(bytes[Math.floor(index / 8)] & (1 << (index % 8))));
}

function bytesToBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) throw new Error("Invalid progress data.");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeProgressShare() {
  saveState();
  const progress = {};
  Object.entries(trails).forEach(([trailId, trail]) => {
    const savedState = loadState(trailId);
    const segmentIds = trail.segments.map((segment) => segment.id);
    const stampIds = getTrailStampIds(trail);
    if (!savedState.completedSegments.length && !savedState.stamped.length) return;
    progress[trailId] = [
      segmentIds.length,
      stampIds.length,
      encodeMembership(segmentIds, savedState.completedSegments),
      encodeMembership(stampIds, savedState.stamped),
    ];
  });
  const json = JSON.stringify({ v: 1, p: progress });
  return bytesToBase64Url(new TextEncoder().encode(json));
}

function decodeProgressShare(token) {
  const json = new TextDecoder().decode(base64UrlToBytes(token));
  const payload = JSON.parse(json);
  if (payload?.v !== 1 || !payload.p || typeof payload.p !== "object") throw new Error("Unsupported progress data.");

  const imported = {};
  let completedCount = 0;
  Object.entries(payload.p).forEach(([trailId, encoded]) => {
    const trail = trails[trailId];
    if (!trail || !Array.isArray(encoded) || encoded.length !== 4) return;
    const segmentIds = trail.segments.map((segment) => segment.id);
    const stampIds = getTrailStampIds(trail);
    if (encoded[0] !== segmentIds.length || encoded[1] !== stampIds.length) return;
    const completedSegments = decodeMembership(segmentIds, encoded[2]);
    const stamped = decodeMembership(stampIds, encoded[3]);
    imported[trailId] = { completedSegments, stamped };
    completedCount += completedSegments.length;
  });
  if (!Object.keys(imported).length && Object.keys(payload.p).length) throw new Error("Progress data does not match this trail version.");
  return { trails: imported, completedCount };
}

function createProgressShareUrl() {
  const url = new URL(window.location.href);
  url.hash = `${progressShareHashKey}=${encodeURIComponent(encodeProgressShare())}`;
  return url.toString();
}

function refreshProgressShareUi() {
  const qrElement = document.querySelector("#progressQr");
  if (!qrElement) return;
  const url = createProgressShareUrl();
  if (typeof window.qrcode !== "function") {
    qrElement.textContent = "QR unavailable";
    return;
  }
  const code = window.qrcode(0, "M");
  code.addData(url);
  code.make();
  qrElement.innerHTML = code.createSvgTag({ scalable: true, margin: 0 });
  qrElement.querySelector("svg")?.setAttribute("aria-hidden", "true");
}

async function shareProgress() {
  const url = createProgressShareUrl();
  if (navigator.share) {
    try {
      await navigator.share({ title: "Kékkör progress", text: "Merge my Kékkör trail progress.", url });
      setProgressShareStatus("Progress link shared.");
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  await copyProgressLink(url);
}

async function copyProgressLink(url = createProgressShareUrl()) {
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    const input = document.createElement("textarea");
    input.value = url;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.append(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  setProgressShareStatus("Progress link copied.");
}

function setProgressShareStatus(message) {
  const status = document.querySelector("#progressShareStatus");
  if (status) status.textContent = message;
}

function showProgressImportPrompt(progressImport) {
  const trailCount = Object.keys(progressImport.trails).length;
  const summary = document.querySelector("#progressImportSummary");
  const dialog = document.querySelector("#progressImportDialog");
  if (summary) {
    summary.textContent = `${progressImport.completedCount} completed segment${progressImport.completedCount === 1 ? "" : "s"} across ${trailCount} trail${trailCount === 1 ? "" : "s"}. Existing progress on this device will be kept.`;
  }
  if (dialog?.showModal) {
    dialog.showModal();
  } else if (window.confirm(`${summary?.textContent || "Merge shared progress?"}`)) {
    mergeSharedProgress();
  }
}

function mergeSharedProgress() {
  if (!pendingProgressImport) return;
  Object.entries(pendingProgressImport.trails).forEach(([trailId, imported]) => {
    const savedState = loadState(trailId);
    savedState.completedSegments = Array.from(new Set([...savedState.completedSegments, ...imported.completedSegments]));
    savedState.stamped = Array.from(new Set([...savedState.stamped, ...imported.stamped]));
    localStorage.setItem(getStorageKey(trailId), JSON.stringify(savedState));
  });
  state = loadState(activeTrailId);
  updateUi();
  refreshProgressShareUi();
  setProgressShareStatus(`Merged ${pendingProgressImport.completedCount} completed segments.`);
  pendingProgressImport = null;
  document.querySelector("#progressImportDialog")?.close();
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
  document.querySelector("#travelResults").addEventListener("click", handleTravelOptionClick);
  document.querySelector("#travelResults").addEventListener("scroll", handleTravelCarouselScroll, true);
  document.querySelectorAll("[data-travel-time-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleTravelTimeMode(button.dataset.travelTimeToggle));
  });
  document.querySelector("#saveTravelOrigin").addEventListener("click", handleSaveTravelOrigin);
  initAddressAutocomplete();
  document.querySelector("#shareProgress").addEventListener("click", shareProgress);
  document.querySelector("#copyProgressLink").addEventListener("click", () => copyProgressLink());
  document.querySelector("#confirmProgressImport").addEventListener("click", mergeSharedProgress);
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

function initOneFingerMapZoom() {
  const container = map.getContainer();
  const doubleTapDelay = 350;
  const tapRadius = 32;
  const dragThreshold = 6;
  const pixelsPerZoomLevel = 88;
  let tapCandidate = null;
  let lastTap = null;
  let gesture = null;
  let suppressMapClickUntil = 0;

  const getContainerPoint = (event) => {
    const bounds = container.getBoundingClientRect();
    return L.point(event.clientX - bounds.left, event.clientY - bounds.top);
  };

  const stopGestureEvent = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const finishGesture = (event, wasCancelled = false) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    if (!wasCancelled && !gesture.didDrag) {
      map.setZoomAround(gesture.anchor, Math.min(gesture.startZoom + 1, map.getMaxZoom()), { animate: false });
    }
    if (gesture.wasDraggingEnabled) map.dragging.enable();
    if (gesture.wasTouchZoomEnabled) map.touchZoom.enable();
    if (container.hasPointerCapture?.(event.pointerId)) container.releasePointerCapture(event.pointerId);
    gesture = null;
    suppressMapClickUntil = performance.now() + 500;
    stopGestureEvent(event);
  };

  container.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse" || !event.isPrimary || event.button !== 0) return;
      const now = performance.now();
      const isSecondTap =
        lastTap &&
        now - lastTap.time <= doubleTapDelay &&
        Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) <= tapRadius;

      if (!isSecondTap) {
        if (lastTap && now - lastTap.time > doubleTapDelay) lastTap = null;
        tapCandidate = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          time: now,
        };
        return;
      }

      const point = getContainerPoint(event);
      gesture = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startZoom: map.getZoom(),
        anchor: map.containerPointToLatLng(point),
        didDrag: false,
        wasDraggingEnabled: map.dragging.enabled(),
        wasTouchZoomEnabled: map.touchZoom.enabled(),
      };
      lastTap = null;
      tapCandidate = null;
      map.dragging.disable();
      map.touchZoom.disable();
      container.setPointerCapture?.(event.pointerId);
      stopGestureEvent(event);
    },
    true,
  );

  container.addEventListener(
    "pointermove",
    (event) => {
      if (gesture && event.pointerId === gesture.pointerId) {
        const distance = event.clientY - gesture.startY;
        if (Math.abs(distance) >= dragThreshold) gesture.didDrag = true;
        if (gesture.didDrag) {
          const rawZoom = gesture.startZoom + distance / pixelsPerZoomLevel;
          const boundedZoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), rawZoom));
          const targetZoom = Math.round(boundedZoom * 4) / 4;
          if (targetZoom !== map.getZoom()) map.setZoomAround(gesture.anchor, targetZoom, { animate: false });
        }
        stopGestureEvent(event);
        return;
      }

      if (
        tapCandidate &&
        event.pointerId === tapCandidate.pointerId &&
        Math.hypot(event.clientX - tapCandidate.x, event.clientY - tapCandidate.y) > dragThreshold
      ) {
        tapCandidate = null;
      }
    },
    true,
  );

  container.addEventListener(
    "pointerup",
    (event) => {
      if (gesture) {
        finishGesture(event);
        return;
      }
      if (tapCandidate?.pointerId !== event.pointerId) return;
      const duration = performance.now() - tapCandidate.time;
      const distance = Math.hypot(event.clientX - tapCandidate.x, event.clientY - tapCandidate.y);
      if (duration <= 280 && distance <= dragThreshold) {
        lastTap = { time: performance.now(), x: event.clientX, y: event.clientY };
      }
      tapCandidate = null;
    },
    true,
  );

  container.addEventListener("pointercancel", (event) => finishGesture(event, true), true);
  ["click", "dblclick"].forEach((eventName) => {
    container.addEventListener(
      eventName,
      (event) => {
        if (performance.now() >= suppressMapClickUntil) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true,
    );
  });
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

function initAddressAutocomplete() {
  const input = document.querySelector("#travelOriginAddress");
  if (!input) return;
  input.addEventListener("input", handleAddressInput);
  input.addEventListener("keydown", handleAddressKeydown);
  input.addEventListener("focus", () => {
    if (addressSuggestions.length && input.value.trim().length >= 3) renderAddressSuggestions();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!event.target.closest(".address-setting")) hideAddressSuggestions();
  });
}

function handleAddressInput(event) {
  const query = event.target.value.trim();
  if (pendingTravelOrigin?.label !== query) pendingTravelOrigin = null;
  window.clearTimeout(addressSuggestionTimer);
  addressSuggestionController?.abort();
  addressSuggestionController = null;
  activeAddressSuggestionIndex = -1;
  hideAddressSuggestions();

  if (query.length < 3) {
    addressSuggestions = [];
    return;
  }

  const cacheKey = query.toLocaleLowerCase("hu-HU");
  if (addressSuggestionCache.has(cacheKey)) {
    addressSuggestions = addressSuggestionCache.get(cacheKey);
    renderAddressSuggestions();
    return;
  }

  addressSuggestionTimer = window.setTimeout(() => fetchAddressSuggestions(query, cacheKey), 550);
}

async function fetchAddressSuggestions(query, cacheKey) {
  const input = document.querySelector("#travelOriginAddress");
  if (!input || input.value.trim() !== query) return;
  addressSuggestionController = new AbortController();
  const params = new URLSearchParams({
    q: query,
    limit: "8",
    lat: String(budapestOrigin.lat),
    lon: String(budapestOrigin.lng),
    zoom: "7",
    location_bias_scale: "0.55",
  });

  try {
    const response = await fetch(`${photonSearchUrl}?${params.toString()}`, {
      signal: addressSuggestionController.signal,
      headers: { Accept: "application/geo+json, application/json" },
    });
    if (!response.ok) throw new Error(`Suggestion search failed (${response.status}).`);
    const data = await response.json();
    const seenLabels = new Set();
    addressSuggestions = (data.features || [])
      .map(normalizePhotonResult)
      .filter((suggestion) => {
        if (!suggestion) return false;
        const key = suggestion.label.toLocaleLowerCase("hu-HU");
        if (seenLabels.has(key)) return false;
        seenLabels.add(key);
        return true;
      })
      .slice(0, 5);
    addressSuggestionCache.set(cacheKey, addressSuggestions);
    if (input.value.trim() === query) renderAddressSuggestions();
  } catch (error) {
    if (error.name !== "AbortError") hideAddressSuggestions();
  } finally {
    addressSuggestionController = null;
  }
}

function normalizePhotonResult(feature, index) {
  const properties = feature?.properties || {};
  const [lng, lat] = feature?.geometry?.coordinates || [];
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const streetAddress = [properties.street, properties.housenumber].filter(Boolean).join(" ");
  const primary = streetAddress || properties.name || properties.city || properties.locality;
  if (!primary) return null;
  const locality = [properties.postcode, properties.city || properties.locality || properties.district]
    .filter(Boolean)
    .join(" ");
  const detailParts = [locality, properties.state, properties.country].filter(
    (part, partIndex, parts) => part && part !== primary && parts.indexOf(part) === partIndex,
  );
  const namePrefix = properties.name && properties.name !== primary ? properties.name : "";
  const label = [namePrefix, primary, ...detailParts].filter(Boolean).join(", ");

  return {
    id: `travel-origin-option-${index}`,
    label,
    primary: namePrefix || primary,
    secondary: [namePrefix ? primary : "", ...detailParts].filter(Boolean).join(", "),
    lat,
    lng,
  };
}

function renderAddressSuggestions() {
  const input = document.querySelector("#travelOriginAddress");
  const list = document.querySelector("#travelOriginSuggestions");
  if (!input || !list || !addressSuggestions.length) {
    hideAddressSuggestions();
    return;
  }

  list.replaceChildren(
    ...addressSuggestions.map((suggestion, index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.id = suggestion.id;
      option.className = "address-suggestion";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", String(index === activeAddressSuggestionIndex));
      option.dataset.suggestionIndex = String(index);
      const primary = document.createElement("strong");
      primary.textContent = suggestion.primary;
      option.append(primary);
      if (suggestion.secondary) {
        const secondary = document.createElement("span");
        secondary.textContent = suggestion.secondary;
        option.append(secondary);
      }
      option.addEventListener("click", () => selectAddressSuggestion(index));
      return option;
    }),
  );
  list.hidden = false;
  input.setAttribute("aria-expanded", "true");
  syncActiveAddressSuggestion();
}

function handleAddressKeydown(event) {
  if (event.key === "Escape") {
    hideAddressSuggestions();
    return;
  }
  if (event.key === "Enter" && !document.querySelector("#travelOriginSuggestions")?.hidden) {
    event.preventDefault();
    if (activeAddressSuggestionIndex >= 0) selectAddressSuggestion(activeAddressSuggestionIndex);
    else if (addressSuggestions.length) selectAddressSuggestion(0);
    return;
  }
  if (!addressSuggestions.length || !["ArrowDown", "ArrowUp"].includes(event.key)) return;
  event.preventDefault();
  const direction = event.key === "ArrowDown" ? 1 : -1;
  const nextIndex = activeAddressSuggestionIndex + direction;
  activeAddressSuggestionIndex = Math.max(0, Math.min(addressSuggestions.length - 1, nextIndex));
  renderAddressSuggestions();
}

function syncActiveAddressSuggestion() {
  const input = document.querySelector("#travelOriginAddress");
  const list = document.querySelector("#travelOriginSuggestions");
  if (!input || !list) return;
  const options = list.querySelectorAll("[role='option']");
  options.forEach((option, index) => option.setAttribute("aria-selected", String(index === activeAddressSuggestionIndex)));
  const activeOption = options[activeAddressSuggestionIndex];
  if (activeOption) {
    input.setAttribute("aria-activedescendant", activeOption.id);
    activeOption.scrollIntoView({ block: "nearest" });
  } else {
    input.removeAttribute("aria-activedescendant");
  }
}

function selectAddressSuggestion(index) {
  const input = document.querySelector("#travelOriginAddress");
  const suggestion = addressSuggestions[index];
  if (!input || !suggestion) return;
  pendingTravelOrigin = suggestion;
  input.value = suggestion.label;
  hideAddressSuggestions();
  input.focus({ preventScroll: true });
}

function hideAddressSuggestions() {
  const input = document.querySelector("#travelOriginAddress");
  const list = document.querySelector("#travelOriginSuggestions");
  if (list) list.hidden = true;
  if (input) {
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }
  activeAddressSuggestionIndex = -1;
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
    let lat = pendingTravelOrigin?.label === query ? pendingTravelOrigin.lat : NaN;
    let lng = pendingTravelOrigin?.label === query ? pendingTravelOrigin.lng : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const params = new URLSearchParams({ q: query, format: "jsonv2", limit: "1" });
      const response = await fetch(`${nominatimSearchUrl}?${params.toString()}`, {
        headers: { "Accept-Language": "en" },
      });
      if (!response.ok) throw new Error(`Address search failed (${response.status}).`);
      const [match] = await response.json();
      lat = Number.parseFloat(match?.lat);
      lng = Number.parseFloat(match?.lon);
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Address not found. Try adding the city or postcode.");

    travelSettings.origin = { name: query, address: query, lat, lng };
    pendingTravelOrigin = null;
    hideAddressSuggestions();
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
  travelOptionGroups = null;
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
    travelOptionGroups = null;
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
    travelOptionGroups = null;
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
    const [outbound, inbound] = await Promise.all([
      fetchTransitItineraryOptions(travelSettings.origin, route.start, outboundAt, {
        arriveBy: travelSettings.outboundTimeMode === "arrive",
        label: "To trailhead",
      }),
      fetchTransitItineraryOptions(route.end, travelSettings.origin, returnAt, {
        arriveBy: travelSettings.returnTimeMode === "arrive",
        label: "Back home",
      }),
    ]);

    travelOptionGroups = { outbound, inbound, outboundAt, returnAt };
    results.dataset.routeKey = document.querySelector("#travelPanel")?.dataset.routeKey || "";
    results.innerHTML = renderTravelResults(outbound, inbound, outboundAt, returnAt);
    centerSelectedTravelOptions();
  } catch (error) {
    travelOptionGroups = null;
    results.innerHTML = `<span class="travel-error">${escapeHtml(error.message || "Could not fetch public transport right now.")}</span>`;
  } finally {
    button.disabled = false;
    button.textContent = "Find routes";
  }
}

async function fetchTransitItineraryOptions(from, to, dateTime, options = {}) {
  const params = new URLSearchParams({
    fromPlace: `${from.lat},${from.lng}`,
    toPlace: `${to.lat},${to.lng}`,
    time: toTransitousDateTime(dateTime),
    arriveBy: String(Boolean(options.arriveBy)),
    numItineraries: "3",
    timetableView: "true",
    radius: "2500",
    maxTravelTime: "720",
    detailedLegs: "false",
    detailedTransfers: "false",
  });
  params.append("directModes", "");

  const firstPage = await fetchTransitPage(params);
  const initial = firstPage.itineraries.map(normalizeTransitItinerary);
  const primary = selectClosestTransitOption(initial, dateTime, Boolean(options.arriveBy));
  if (!primary) {
    return { empty: true, label: options.label || "Travel", options: [], selectedIndex: -1, closestIndex: -1 };
  }

  const neighborCursor = options.arriveBy ? firstPage.nextPageCursor : firstPage.previousPageCursor;
  let neighbors = [];
  if (neighborCursor) {
    const neighborParams = new URLSearchParams(params);
    neighborParams.set("pageCursor", neighborCursor);
    try {
      const neighborPage = await fetchTransitPage(neighborParams);
      neighbors = neighborPage.itineraries.map(normalizeTransitItinerary);
    } catch {
      neighbors = [];
    }
  }

  const centered = buildCenteredTransitOptions([...initial, ...neighbors], primary, Boolean(options.arriveBy));
  return {
    label: options.label || "Travel",
    options: centered.options,
    selectedIndex: centered.selectedIndex,
    closestIndex: centered.selectedIndex,
  };
}

async function fetchTransitPage(params) {
  const response = await fetch(`${transitousPlanUrl}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Transit search failed (${response.status}).`);
  }
  const data = await response.json();
  return {
    itineraries: data.itineraries || [],
    previousPageCursor: data.previousPageCursor || "",
    nextPageCursor: data.nextPageCursor || "",
  };
}

function normalizeTransitItinerary(itinerary) {
  return {
    duration: itinerary.duration,
    startTime: itinerary.startTime,
    endTime: itinerary.endTime,
    transfers: itinerary.transfers,
    steps: getTransitSteps(itinerary.legs || []),
    summary: summarizeTransitLegs(itinerary.legs || []),
  };
}

function selectClosestTransitOption(items, requestedTime, arriveBy) {
  const requested = requestedTime.getTime();
  const valid = items.filter((item) => Number.isFinite(getTransitOptionTime(item, arriveBy)));
  if (!valid.length) return null;
  const eligible = valid.filter((item) => (arriveBy ? getTransitOptionTime(item, true) <= requested : getTransitOptionTime(item, false) >= requested));
  const pool = eligible.length ? eligible : valid;
  return pool.reduce((best, item) => {
    const distance = Math.abs(getTransitOptionTime(item, arriveBy) - requested);
    const bestDistance = Math.abs(getTransitOptionTime(best, arriveBy) - requested);
    return distance < bestDistance ? item : best;
  });
}

function getTransitOptionTime(item, arriveBy) {
  const value = new Date(arriveBy ? item.endTime : item.startTime).getTime();
  return Number.isNaN(value) ? NaN : value;
}

function getTransitOptionKey(item) {
  return `${item.startTime}|${item.endTime}|${item.summary}`;
}

function buildCenteredTransitOptions(items, primary, arriveBy) {
  const unique = Array.from(new Map(items.map((item) => [getTransitOptionKey(item), item])).values()).sort(
    (a, b) => getTransitOptionTime(a, arriveBy) - getTransitOptionTime(b, arriveBy),
  );
  const primaryKey = getTransitOptionKey(primary);
  const primaryIndex = unique.findIndex((item) => getTransitOptionKey(item) === primaryKey);
  if (primaryIndex < 0) return { options: [primary], selectedIndex: 0 };

  const before = unique.slice(Math.max(0, primaryIndex - 2), primaryIndex);
  const after = unique.slice(primaryIndex + 1, primaryIndex + 3);
  const options = [...before, unique[primaryIndex], ...after];
  return { options, selectedIndex: before.length };
}

function renderTravelResults(outbound, inbound, outboundAt, returnAt) {
  const selectedOutbound = getSelectedTransitOption(outbound);
  const selectedInbound = getSelectedTransitOption(inbound);
  const tripSpan = getTripSpan(selectedOutbound, selectedInbound);
  const total = !tripSpan ? "" : `
    <div class="travel-total">
      <span>Trip span</span>
      <strong>${tripSpan}</strong>
    </div>
  `;
  return `
    ${renderTravelCarousel("outbound", outbound, outboundAt, travelSettings.outboundTimeMode === "arrive")}
    ${renderTravelCarousel("inbound", inbound, returnAt, travelSettings.returnTimeMode === "arrive")}
    ${total}
  `;
}

function getSelectedTransitOption(group) {
  if (!group || group.empty) return null;
  return group.options[group.selectedIndex] || null;
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

function renderTravelCarousel(leg, group, requestedTime, arriveBy = false) {
  if (!group || group.empty || !group.options.length) {
    const suffix = requestedTime ? ` ${arriveBy ? "by" : "after"} ${formatClock(requestedTime)}` : "";
    return `
      <div class="travel-row">
        <span class="travel-row-label">${escapeHtml(group?.label || "Travel")}</span>
        <strong>No route found</strong>
        <small>No public transport route found${suffix}.</small>
      </div>
    `;
  }

  return `
    <section class="travel-option-group" data-travel-group="${leg}">
      <header class="travel-option-heading">
        <span class="travel-row-label">${escapeHtml(group.label)}</span>
        <small>Swipe for nearby times</small>
      </header>
      <div class="travel-carousel" data-travel-carousel="${leg}">
        ${group.options
          .map((item, index) => renderTravelOptionCard(leg, item, index, group.selectedIndex, group.closestIndex, requestedTime, arriveBy))
          .join("")}
      </div>
      <div class="travel-carousel-dots" aria-hidden="true">
        ${group.options.map((_, index) => `<span class="${index === group.selectedIndex ? "active" : ""}"></span>`).join("")}
      </div>
    </section>
  `;
}

function renderTravelOptionCard(leg, item, index, selectedIndex, closestIndex, requestedTime, arriveBy) {
  const isSelected = index === selectedIndex;
  const anchor = getTransitOptionTime(item, arriveBy);
  const requested = requestedTime.getTime();
  const relation = index === closestIndex ? "Closest" : Math.abs(anchor - requested) < 60000 ? "Requested" : anchor < requested ? "Earlier" : "Later";
  const day = formatTravelOptionDay(item, requestedTime, arriveBy);
  return `
    <button class="travel-option-card ${isSelected ? "selected" : ""}" type="button" data-travel-option="${leg}" data-option-index="${index}" aria-pressed="${isSelected}">
      <span class="travel-option-topline">
        <span>${relation}</span>
        ${day ? `<small>${day}</small>` : ""}
      </span>
      <strong>${formatClock(item.startTime)}-${formatClock(item.endTime)}</strong>
      <span>${formatMinutes(Math.round(item.duration / 60))} · ${item.transfers} transfer${item.transfers === 1 ? "" : "s"}</span>
      ${renderTransitSteps(item.steps, item.summary)}
    </button>
  `;
}

function formatTravelOptionDay(item, requestedTime, arriveBy) {
  const optionDate = new Date(arriveBy ? item.endTime : item.startTime);
  if (Number.isNaN(optionDate.getTime()) || optionDate.toDateString() === requestedTime.toDateString()) return "";
  return optionDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function handleTravelOptionClick(event) {
  const button = event.target.closest("[data-travel-option]");
  if (!button || !travelOptionGroups) return;
  const leg = button.dataset.travelOption;
  const group = travelOptionGroups[leg];
  const index = Number(button.dataset.optionIndex);
  if (!group || !Number.isInteger(index) || !group.options[index]) return;
  group.selectedIndex = index;
  const results = document.querySelector("#travelResults");
  results.innerHTML = renderTravelResults(
    travelOptionGroups.outbound,
    travelOptionGroups.inbound,
    travelOptionGroups.outboundAt,
    travelOptionGroups.returnAt,
  );
  centerSelectedTravelOptions(true);
}

function centerSelectedTravelOptions(smooth = false) {
  requestAnimationFrame(() => {
    document.querySelectorAll(".travel-carousel").forEach((carousel) => {
      const selected = carousel.querySelector(".travel-option-card.selected");
      if (!selected) return;
      carousel.scrollTo({
        left: selected.offsetLeft - (carousel.clientWidth - selected.offsetWidth) / 2,
        behavior: smooth ? "smooth" : "auto",
      });
    });
  });
}

function handleTravelCarouselScroll(event) {
  const carousel = event.target.closest?.(".travel-carousel");
  if (!carousel || carousel.dataset.dotFrame) return;
  carousel.dataset.dotFrame = "pending";
  requestAnimationFrame(() => {
    delete carousel.dataset.dotFrame;
    const cards = Array.from(carousel.querySelectorAll(".travel-option-card"));
    const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    const nearestIndex = cards.reduce((bestIndex, card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const best = cards[bestIndex];
      const bestCenter = best.offsetLeft + best.offsetWidth / 2;
      return Math.abs(cardCenter - viewportCenter) < Math.abs(bestCenter - viewportCenter) ? index : bestIndex;
    }, 0);
    carousel.closest(".travel-option-group")?.querySelectorAll(".travel-carousel-dots span").forEach((dot, index) => {
      dot.classList.toggle("active", index === nearestIndex);
    });
  });
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
  trackAppView(view);

  if (view === "more") refreshProgressShareUi();

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
