const fs = require('node:fs');
const { performance } = require('node:perf_hooks');
const geometry = require('../route-geometry.js');
const detail = Object.values(JSON.parse(fs.readFileSync('route-details-okt.json')));
const allFull = detail.reduce((n,s) => n + s.levels[4].length,0);
const scenarios = [
  {name:'Whole-trail overview',zoom:7,view:[46.5,16.0,48.8,22.0]},
  {name:'Bakony region',zoom:11,view:[47.0,17.2,47.5,18.2]},
  {name:'Walking near Városlőd',zoom:16,view:[47.125,17.625,47.17,17.68]},
];
for(const scenario of scenarios) {
  const level = geometry.levelForZoom(scenario.zoom);
  const run = () => detail.flatMap(segment => geometry.intersects(segment.bounds,scenario.view) ? geometry.clippedLines(segment.levels[level],scenario.view) : []);
  for(let i=0;i<10;i++) run();
  const timings=[];
  for(let i=0;i<100;i++){const before=performance.now();run();timings.push(performance.now()-before);}
  timings.sort((a,b)=>a-b);
  const points=run().reduce((sum,line)=>sum+line.length,0);
  console.log(`${scenario.name}: ${points}/${allFull} points; median ${timings[50].toFixed(2)} ms; p95 ${timings[95].toFixed(2)} ms (geometry preparation only)`);
}
