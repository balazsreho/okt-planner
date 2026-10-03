/* Geometry helpers shared by the GPX builder, map, and regression checks. */
(function (root) {
  const R = 6371000;
  function bounds(points) {
    return points.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
  }
  function intersects(a, b) { return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]; }
  function simplify(points, tolerance) {
    if (points.length < 3 || tolerance === 0) return points;
    const sy = Math.PI * R / 180, sx = sy * Math.cos(points[0][0] * Math.PI / 180);
    const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1;
    const stack = [[0, points.length - 1]], squaredTolerance = tolerance * tolerance;
    while (stack.length) {
      const [first, last] = stack.pop();
      const a = points[first], b = points[last], dx = (b[1] - a[1]) * sx, dy = (b[0] - a[0]) * sy;
      const squaredLength = dx * dx + dy * dy;
      let best = squaredTolerance, chosen = -1;
      for (let i = first + 1; i < last; i++) {
        const px = (points[i][1] - a[1]) * sx, py = (points[i][0] - a[0]) * sy;
        const t = squaredLength ? Math.max(0, Math.min(1, (px * dx + py * dy) / squaredLength)) : 0;
        const distance = (px - t * dx) ** 2 + (py - t * dy) ** 2;
        if (distance > best) { best = distance; chosen = i; }
      }
      if (chosen !== -1) { keep[chosen] = 1; stack.push([first, chosen], [chosen, last]); }
    }
    return points.filter((_, i) => keep[i]);
  }
  function levelForZoom(zoom) { return zoom <= 9 ? 0 : zoom <= 11 ? 1 : zoom <= 13 ? 2 : zoom <= 15 ? 3 : 4; }
  function clippedLines(points, view) {
    const lines = []; let line = null;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      // Retain crossing edges even when both endpoints are outside the view.
      const edgeBounds = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
      if (intersects(edgeBounds, view)) {
        if (!line) { line = [a]; lines.push(line); }
        line.push(b);
      } else line = null;
    }
    return lines;
  }
  const api = { bounds, intersects, simplify, levelForZoom, clippedLines };
  if (typeof module !== 'undefined') module.exports = api;
  else root.RouteGeometry = api;
})(typeof window !== 'undefined' ? window : globalThis);
