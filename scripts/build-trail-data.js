const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

const generatedTrails = [
  {
    id: "ak",
    label: "Alföld",
    title: "Alföldi Kéktúra",
    code: "AK",
    checkpointPrefix: "AKPH",
    version: "2026-09-03",
    source: "ak_teljes_bh_20260903.gpx",
  },
  {
    id: "rpddk",
    label: "DDK",
    title: "Rockenbauer Pál Dél-dunántúli Kéktúra",
    code: "DDK",
    checkpointPrefix: "DDKPH",
    version: "2026-08-06",
    source: "rpddk_teljes_bh_20260806.gpx",
  },
];

const trailData = {
  okt: buildOktData(),
};

generatedTrails.forEach((trail) => {
  trailData[trail.id] = buildGpxTrail(trail);
});

fs.writeFileSync(
  path.join(root, "trail-route-data.js"),
  `window.TRAIL_ROUTE_DATA = ${JSON.stringify(trailData)};\n`,
);

Object.values(trailData).forEach((trail) => {
  const total = trail.segments.reduce((sum, segment) => sum + segment.distance, 0);
  console.log(
    `${trail.code}: ${trail.segments.length} segments, ${trail.stamps.length} stamps, ${total.toFixed(1)} km`,
  );
});

function buildOktData() {
  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const segmentCsv = appSource.match(/const segmentCsv = `([\s\S]*?)`;/)?.[1];
  if (!segmentCsv) throw new Error("Could not find OKT segmentCsv");

  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "okt-route-data.js"), "utf8"), context);
  const routeData = context.window?.OKT_ROUTE_DATA || context.OKT_ROUTE_DATA;
  if (!routeData) throw new Error("Could not load OKT route data");

  const routeById = new Map(routeData.segments.map((segment) => [segment.id, segment]));
  const stampByName = new Map(routeData.stamps.map((stamp) => [normalizeText(stamp.name), stamp]));
  const segments = segmentCsv
    .trim()
    .split("\n")
    .map((row) => {
      const [section, number, from, to, distance, up, down, time] = row.split(",");
      const id = `okt-${String(number).padStart(3, "0")}`;
      const routeSegment = routeById.get(id);
      return {
        id,
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
        points: routeSegment?.points || [],
        elevationSamples: (routeSegment?.elevation || []).map(([sampleDistance, altitude]) => ({
          distance: sampleDistance,
          altitude,
        })),
      };
    });

  const stampDistances = new Map();
  let cumulativeDistance = 0;
  segments.forEach((segment) => {
    if (!stampDistances.has(segment.fromId)) {
      stampDistances.set(segment.fromId, {
        id: segment.fromId,
        name: segment.from,
        cumulativeDistance,
        nextDistance: segment.distance,
      });
    }
    cumulativeDistance += segment.distance;
    if (!stampDistances.has(segment.toId)) {
      stampDistances.set(segment.toId, {
        id: segment.toId,
        name: segment.to,
        cumulativeDistance,
        nextDistance: 0,
      });
    }
  });

  const stamps = Array.from(stampDistances.values()).map((stamp, index) => {
    const routeStamp = stampByName.get(normalizeText(stamp.name));
    return {
      ...stamp,
      index,
      lat: routeStamp?.lat ?? null,
      lng: routeStamp?.lng ?? null,
      altitude: routeStamp?.altitude ?? 0,
    };
  });

  return {
    id: "okt",
    label: "OKT",
    title: "Országos Kéktúra",
    code: "OKT",
    version: routeData.version || "2026-09-10",
    geometrySource: "Bundled GPX",
    bounds: routeData.bounds,
    segments,
    stamps,
  };
}

function buildGpxTrail(trail) {
  const gpx = fs.readFileSync(path.join(root, trail.source), "utf8");
  const track = parseTrack(gpx);
  const cumulative = cumulativeDistances(track);
  const stamps = parseWaypoints(gpx, trail)
    .map((stamp, index) => {
      const nearest = nearestTrackIndex(stamp, track);
      return {
        ...stamp,
        routeIndex: nearest,
        routeDistance: cumulative[nearest],
        originalIndex: index,
      };
    })
    .sort((a, b) => a.routeDistance - b.routeDistance || a.originalIndex - b.originalIndex);

  stamps.forEach((stamp, index) => {
    stamp.index = index;
    stamp.cumulativeDistance = 0;
    delete stamp.originalIndex;
  });

  const segments = [];
  for (let index = 0; index < stamps.length - 1; index += 1) {
    const from = stamps[index];
    const to = stamps[index + 1];
    const start = Math.min(from.routeIndex, to.routeIndex);
    const end = Math.max(from.routeIndex, to.routeIndex);
    const points = downsample(track.slice(start, end + 1).map((point) => [round(point.lat, 6), round(point.lng, 6)]), 18);
    const elevationSamples = downsampleElevation(track.slice(start, end + 1), cumulative.slice(start, end + 1), cumulative[start]);
    const distance = round((cumulative[end] - cumulative[start]) / 1000, 1);
    const { up, down } = elevationGain(track.slice(start, end + 1));
    const number = index + 1;
    const sectionNumber = Math.max(1, Math.ceil((from.codeNumber || number) / 10));
    const minutes = estimateMinutes(distance, up);

    segments.push({
      id: `${trail.id}-${String(number).padStart(3, "0")}`,
      section: `${trail.code}-${String(sectionNumber).padStart(2, "0")}`,
      number,
      from: from.name,
      to: to.name,
      fromId: from.id,
      toId: to.id,
      distance,
      up,
      down,
      minutes,
      reverseMinutes: estimateReverseMinutes(distance, down),
      points,
      elevationSamples,
    });

    from.nextDistance = distance;
    to.cumulativeDistance = round((cumulative[end] - cumulative[stamps[0].routeIndex]) / 1000, 1);
  }

  if (stamps.length) stamps[stamps.length - 1].nextDistance = 0;

  return {
    id: trail.id,
    label: trail.label,
    title: trail.title,
    code: trail.code,
    version: trail.version,
    geometrySource: "Bundled GPX",
    bounds: boundsFor(track),
    segments,
    stamps: stamps.map(({ routeIndex, routeDistance, codeNumber, ...stamp }) => stamp),
  };
}

function parseWaypoints(gpx, trail) {
  return [...gpx.matchAll(/<wpt lat="([^"]+)" lon="([^"]+)">([\s\S]*?)<\/wpt>/g)].map((match, index) => {
    const body = match[3];
    const name = textContent(body, "name");
    const desc = textContent(body, "desc");
    const codeMatch = desc.match(new RegExp(`${trail.checkpointPrefix}_(\\d+)(?:_([A-Z0-9]+))?`));
    const code = codeMatch ? `${trail.checkpointPrefix}_${codeMatch[1]}${codeMatch[2] ? `_${codeMatch[2]}` : ""}` : `${trail.code}_${index + 1}`;
    return {
      id: slugify(code),
      name,
      code,
      codeNumber: codeMatch ? Number(codeMatch[1]) : index + 1,
      lat: round(Number(match[1]), 6),
      lng: round(Number(match[2]), 6),
      altitude: Math.round(Number(textContent(body, "ele")) || 0),
      cumulativeDistance: 0,
      nextDistance: 0,
    };
  });
}

function parseTrack(gpx) {
  return [...gpx.matchAll(/<trkpt lat="([^"]+)" lon="([^"]+)">([\s\S]*?)<\/trkpt>/g)].map((match) => ({
    lat: Number(match[1]),
    lng: Number(match[2]),
    ele: Number(textContent(match[3], "ele")) || 0,
  }));
}

function textContent(body, tag) {
  return body.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] || "";
}

function cumulativeDistances(points) {
  const distances = [0];
  for (let index = 1; index < points.length; index += 1) {
    distances[index] = distances[index - 1] + haversine(points[index - 1], points[index]);
  }
  return distances;
}

function nearestTrackIndex(stamp, track) {
  let bestIndex = 0;
  let bestDistance = Infinity;
  track.forEach((point, index) => {
    const distance = haversine(stamp, point);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function elevationGain(points) {
  let up = 0;
  let down = 0;
  for (let index = 1; index < points.length; index += 1) {
    const delta = points[index].ele - points[index - 1].ele;
    if (delta > 1) up += delta;
    if (delta < -1) down += Math.abs(delta);
  }
  return { up: Math.round(up), down: Math.round(down) };
}

function downsample(points, maxCount) {
  if (points.length <= maxCount) return points;
  const sampled = [];
  for (let index = 0; index < maxCount; index += 1) {
    sampled.push(points[Math.round((index / (maxCount - 1)) * (points.length - 1))]);
  }
  return sampled;
}

function downsampleElevation(points, distances, baseDistance) {
  const samples = points.map((point, index) => ({
    distance: round((distances[index] - baseDistance) / 1000, 2),
    altitude: round(point.ele, 1),
  }));
  return downsample(samples, 36);
}

function boundsFor(points) {
  return points.reduce(
    (bounds, point) => [
      [Math.min(bounds[0][0], point.lat), Math.min(bounds[0][1], point.lng)],
      [Math.max(bounds[1][0], point.lat), Math.max(bounds[1][1], point.lng)],
    ],
    [
      [Infinity, Infinity],
      [-Infinity, -Infinity],
    ],
  );
}

function haversine(a, b) {
  const radius = 6371000;
  const phi1 = toRadians(a.lat);
  const phi2 = toRadians(b.lat);
  const deltaPhi = toRadians(b.lat - a.lat);
  const deltaLambda = toRadians(b.lng - a.lng);
  const h =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function parseTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function estimateMinutes(distance, upMeters) {
  const flatMinutes = (distance / 4) * 60;
  const climbMinutes = (upMeters / 600) * 60;
  return Math.max(1, Math.round((flatMinutes + climbMinutes) / 5) * 5);
}

function estimateReverseMinutes(distance, reverseUpMeters) {
  const flatMinutes = (distance / 4) * 60;
  const climbMinutes = (reverseUpMeters / 600) * 60;
  return Math.max(1, Math.round((flatMinutes + climbMinutes) / 5) * 5);
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function round(value, precision = 0) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
