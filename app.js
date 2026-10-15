const state = {
  theme: 'light',
  range: '7d',
  campus: 'North Lake Campus',
  demoActive: true,
  tick: 0,
};

const overviewData = {
  summary: [
    { label: 'Electricity', value: 8450, unit: 'kWh', delta: '+8.4%', meta: 'vs baseline', spark: [28, 32, 45, 37, 50, 60, 66] },
    { label: 'Water', value: 18420, unit: 'L', delta: '-3.1%', meta: 'overnight down', spark: [58, 62, 54, 60, 53, 52, 59] },
    { label: 'Paper', value: 9600, unit: 'Sheets', delta: '+2.0%', meta: 'dept usage', spark: [22, 30, 29, 36, 40, 38, 39] },
    { label: 'Utility spend', value: 84600, unit: '$', delta: '-5.7%', meta: 'per month', spark: [44, 50, 48, 42, 46, 40, 36] },
    { label: 'Carbon', value: 1472, unit: 'kg CO₂e', delta: '-6.8%', meta: 'reduction', spark: [28, 34, 31, 38, 35, 33, 30] },
  ],
  status: [
    { label: 'Buildings monitored', value: 18, detail: 'Across 4 active campuses' },
    { label: 'Rooms with readings', value: 922, detail: '97.8% coverage' },
    { label: 'Active alerts', value: 6, detail: '2 critical, 3 medium' },
    { label: 'Pending actions', value: 12, detail: '5 due this week' },
    { label: 'Last sync', value: '09:42', detail: '2 min ago' },
  ],
  trend: {
    electricity: [32, 54, 51, 63, 60, 75, 80, 92, 78, 88, 96, 109],
    water: [18, 17, 20, 24, 23, 21, 28, 26, 31, 29, 27, 34],
    paper: [14, 15, 17, 18, 22, 20, 19, 21, 24, 29, 27, 23],
  },
  buildings: [
    { id: 'A', name: 'Block A', x: 20, y: 26, w: 150, h: 90, status: 'green', rooms: ['A01', 'A06', 'A09'], energy: '94%' },
    { id: 'B', name: 'Block B', x: 210, y: 18, w: 120, h: 90, status: 'amber', rooms: ['B02', 'B08'], energy: '72%' },
    { id: 'C', name: 'Central Lab', x: 385, y: 34, w: 170, h: 110, status: 'red', rooms: ['C03', 'C11'], energy: '66%' },
    { id: 'D', name: 'Library', x: 120, y: 150, w: 160, h: 105, status: 'green', rooms: ['D04', 'D10'], energy: '91%' },
    { id: 'E', name: 'Admin', x: 320, y: 170, w: 150, h: 92, status: 'gray', rooms: ['E07'], energy: 'N/A' },
  ],
  alerts: [
    { id: 'AL-402', resource: 'Electricity', location: 'Block B / 2F', deviation: '+24%', severity: 'high', status: 'open', reason: 'Night HVAC overrun' },
    { id: 'WT-118', resource: 'Water', location: 'Central Lab / 3F', deviation: '+31%', severity: 'high', status: 'assigned', reason: 'Leak-like overnight flow' },
    { id: 'PP-809', resource: 'Paper', location: 'Admissions', deviation: '+14%', severity: 'medium', status: 'acknowledged', reason: 'Printing spike after exam cycle' },
    { id: 'EL-611', resource: 'Electricity', location: 'Library / 1F', deviation: '+8%', severity: 'low', status: 'resolved', reason: 'Lighting schedule drift' },
  ],
  recommendations: [
    { title: 'Review overnight HVAC schedules', effort: 'Medium', savings: '$4.2k-$6.1k' },
    { title: 'Inspect leak-prone water lines', effort: 'High', savings: '$1.8k-$2.9k' },
    { title: 'Enable duplex printing policy', effort: 'Low', savings: '$1.1k-$1.7k' },
  ],
  impact: [
    { label: 'Electricity emissions', value: '1,472 kg', sub: 'CO₂e / month' },
    { label: 'Water footprint', value: '620 kg', sub: 'CO₂e proxy' },
    { label: 'Utility spend', value: '$84.6k', sub: 'before savings' },
    { label: 'Saved this cycle', value: '$16.9k', sub: 'estimated' },
  ],
  report: [
    { title: 'Executive summary', desc: 'Campus efficiency improved 8.9% since last review', status: 'Ready' },
    { title: 'Resource comparison', desc: 'Building-wise electricity and water deviation by floor', status: 'Ready' },
    { title: 'Audit trail', desc: 'Anomaly logs, actions, and intervention evidence', status: 'Draft' },
  ],
};

const summaryGrid = document.getElementById('summaryGrid');
const activityList = document.getElementById('activityList');
const alertsTable = document.getElementById('alertsTable');
const recommendationsEl = document.getElementById('recommendations');
const ecoBrief = document.getElementById('ecoBrief');
const statusStack = document.getElementById('statusStack');
const impactGrid = document.getElementById('impactGrid');
const reportPreview = document.getElementById('reportPreview');
const campusMap = document.getElementById('campusMap');
const facilityDetail = document.getElementById('facilityDetail');
const campusSelect = document.getElementById('campusSelect');
const syncStamp = document.getElementById('syncStamp');
const alertCounter = document.getElementById('alertCounter');

const activityFeed = [
  { title: 'New meter reading received', time: '2 min ago', source: 'Building B 2F' },
  { title: 'Water-use anomaly requires inspection', time: '14 min ago', source: 'Central Lab' },
  { title: 'Resource report prepared for monthly review', time: '35 min ago', source: 'Campus exec' },
  { title: 'Sustainability recommendation completed', time: '1 hr ago', source: 'Library lighting' },
  { title: 'Consumption exceeded configured target', time: '1 hr ago', source: 'Admin block' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function drawSparkline(values, color) {
  const width = 200;
  const height = 36;
  const step = width / (values.length - 1);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / (max - min || 1)) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  return `
    <svg class="sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
      <polyline fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
    </svg>
  `;
}

function renderSummary() {
  summaryGrid.innerHTML = overviewData.summary.map((item, index) => {
    const color = ['#1fb87f', '#75d4ff', '#b6f766', '#8ec8ff', '#5be0cc'][index % 5];
    const value = item.unit === '$' ? formatCurrency(item.value) : `${formatNumber(item.value)} ${item.unit}`;
    return `
      <article class="summary-item">
        <div class="label">
          <span>${item.label}</span>
          <span class="delta ${item.delta.startsWith('-') ? 'negative' : ''}">${item.delta}</span>
        </div>
        <div class="summary-value">${value}</div>
        <div class="summary-meta">
          <span>${item.meta}</span>
          <span>${item.unit === '$' ? 'per month' : 'selected range'}</span>
        </div>
        ${drawSparkline(item.spark, color)}
      </article>
    `;
  }).join('');
}

function renderStatus() {
  statusStack.innerHTML = overviewData.status.map((item) => `
    <div class="status-line">
      <div class="meta">
        <span class="status-label">${item.label}</span>
        <span class="status-value">${item.value}</span>
      </div>
      <small>${item.detail}</small>
    </div>
  `).join('');
}

function renderActivity() {
  activityList.innerHTML = activityFeed.map((event) => `
    <li>
      <span class="dot"></span>
      <div class="event-meta">
        <span class="event-title">${event.title}</span>
        <span class="event-time">${event.source}</span>
      </div>
      <span class="event-time">${event.time}</span>
    </li>
  `).join('');
}

function renderAlerts() {
  const rows = overviewData.alerts.map((alert) => `
    <tr>
      <td>${alert.id}</td>
      <td>${alert.resource}</td>
      <td>${alert.location}</td>
      <td>${alert.deviation}</td>
      <td><span class="severity-badge ${alert.severity}">${alert.severity}</span></td>
      <td>${alert.status}</td>
    </tr>
  `).join('');

  alertsTable.innerHTML = rows;
  alertCounter.textContent = String(overviewData.alerts.length).padStart(2, '0');
}

function renderRecommendations() {
  recommendationsEl.innerHTML = overviewData.recommendations.map((item) => `
    <div class="reco-item">
      <div>
        <strong>${item.title}</strong>
        <span>Effort: ${item.effort}</span>
      </div>
      <span>${item.savings}</span>
    </div>
  `).join('');

  ecoBrief.innerHTML = `Block B used 24% more electricity than its established weekday baseline. Review air-conditioning schedules and compare overnight cooling load against the configured target. The alert is supported by a 31% water deviation in Central Lab and a 14% paper spike in Admissions, suggesting that operational drift is concentrated in the late-day window.`;
}

function renderScorecard() {
  const scorecard = document.getElementById('scorecard');
  scorecard.innerHTML = `
    <div class="score-ring"><span>86</span></div>
    <div class="score-metrics">
      <div class="score-metric"><span>Electricity target</span><strong>92%</strong></div>
      <div class="score-metric"><span>Water target</span><strong>80%</strong></div>
      <div class="score-metric"><span>Paper target</span><strong>88%</strong></div>
      <div class="score-metric"><span>Data completeness</span><strong>96%</strong></div>
    </div>
  `;
}

function renderImpact() {
  impactGrid.innerHTML = overviewData.impact.map((item) => `
    <div class="impact-box">
      <span>${item.label}</span>
      <div class="value">${item.value}</div>
      <small>${item.sub}</small>
    </div>
  `).join('');
}

function renderReportPreview() {
  reportPreview.innerHTML = overviewData.report.map((item) => `
    <div class="preview-item">
      <div>
        <strong>${item.title}</strong>
        <span>${item.desc}</span>
      </div>
      <span class="status-pill">${item.status}</span>
    </div>
  `).join('');
}

function renderCampusMap() {
  const buildingCards = overviewData.buildings.map((building) => `
    <div class="building" data-name="${building.name}" style="left:${building.x}px; top:${building.y}px; width:${building.w}px; height:${building.h}px; background: ${building.status === 'green' ? 'rgba(19, 118, 92, 0.8)' : building.status === 'amber' ? 'rgba(176, 136, 28, 0.8)' : building.status === 'red' ? 'rgba(178, 60, 55, 0.82)' : 'rgba(105, 125, 128, 0.8)'};">
      <div class="name">${building.name}</div>
    </div>
  `).join('');

  const roomTags = [
    { type: 'green', x: 84, y: 44 },
    { type: 'amber', x: 286, y: 62 },
    { type: 'red', x: 472, y: 84 },
    { type: 'green', x: 182, y: 198 },
    { type: 'gray', x: 380, y: 214 },
  ].map((tag) => `<span class="room-tag ${tag.type}" style="left:${tag.x}px; top:${tag.y}px;">${tag.type === 'green' ? 'G' : tag.type === 'amber' ? 'A' : tag.type === 'red' ? 'R' : 'N'}</span>`).join('');

  campusMap.innerHTML = `
    <div class="map-grid"></div>
    ${buildingCards}
    ${roomTags}
  `;

  const activeBuilding = overviewData.buildings[2];
  facilityDetail.innerHTML = `
    <div class="building-card">
      <h4>${activeBuilding.name}</h4>
      <div>Current efficiency: <strong>${activeBuilding.energy}</strong></div>
      <div class="stats">
        <div class="stat-box"><span>Electricity</span><strong>1,210 kWh</strong></div>
        <div class="stat-box"><span>Water</span><strong>3,860 L</strong></div>
        <div class="stat-box"><span>Paper</span><strong>850 sheets</strong></div>
        <div class="stat-box"><span>Alerts</span><strong>2 active</strong></div>
      </div>
    </div>
  `;
}

function renderTrendChart() {
  const svg = document.getElementById('trendChart');
  const width = 700;
  const height = 220;
  const padding = 24;
  const dataSets = [
    { values: overviewData.trend.electricity, color: '#39d79f' },
    { values: overviewData.trend.water, color: '#75d4ff' },
    { values: overviewData.trend.paper, color: '#b6f766' },
  ];

  const maxVal = Math.max(...dataSets.flatMap(set => set.values));
  const minVal = Math.min(...dataSets.flatMap(set => set.values));
  const xStep = (width - padding * 2) / (dataSets[0].values.length - 1);

  const axis = Array.from({ length: 5 }, (_, index) => {
    const y = padding + (index * (height - padding * 2)) / 4;
    return `<line x1="${padding}" x2="${width - padding}" y1="${y}" y2="${y}" stroke="rgba(120, 138, 132, 0.18)" />`;
  }).join('');

  const labels = Array.from({ length: 12 }, (_, index) => {
    const x = padding + index * xStep;
    const label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index];
    return `<text x="${x}" y="${height - 8}" fill="rgba(90,106,99,0.8)" font-size="11" text-anchor="middle">${label}</text>`;
  }).join('');

  const lines = dataSets.map((set) => {
    const points = set.values.map((value, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((value - minVal) / ((maxVal - minVal) || 1)) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    return `<polyline fill="none" stroke="${set.color}" stroke-width="3" points="${points}" stroke-linecap="round" stroke-linejoin="round" />`;
  }).join('');

  svg.innerHTML = `${axis}${labels}${lines}`;
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.body.classList.toggle('theme-dark', state.theme === 'dark');
  const button = document.getElementById('themeToggle');
  button.textContent = state.theme === 'dark' ? 'Dark mode' : 'Light mode';
}

function setRange(range) {
  state.range = range;
  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.range === range);
  });
  syncStamp.textContent = range === '30d' ? '8 min ago' : range === '90d' ? '22 min ago' : '2 min ago';
}

function cycleDemo() {
  if (!state.demoActive) return;
  state.tick += 1;
  const actions = [
    'New meter reading received',
    'Building consumption exceeded target',
    'Water-use anomaly requires inspection',
    'Sustainability recommendation completed',
    'Monthly resource report is ready',
  ];

  const newEvent = {
    title: actions[state.tick % actions.length],
    time: `${(state.tick * 3) % 60} min ago`,
    source: ['Block B / 2F', 'Central Lab', 'Admissions', 'Library', 'Campus exec'][state.tick % 5],
  };
  activityFeed.unshift(newEvent);
  activityFeed.splice(5);
  renderActivity();
}

function startDemo() {
  state.demoActive = true;
  if (!window.demoTimer) {
    window.demoTimer = setInterval(cycleDemo, 4500);
  }
}

function pauseDemo() {
  state.demoActive = false;
  if (window.demoTimer) {
    clearInterval(window.demoTimer);
    window.demoTimer = null;
  }
}

function resetDemo() {
  state.tick = 0;
  activityFeed.length = 0;
  activityFeed.push(...[
    { title: 'New meter reading received', time: '2 min ago', source: 'Building B 2F' },
    { title: 'Water-use anomaly requires inspection', time: '14 min ago', source: 'Central Lab' },
    { title: 'Resource report prepared for monthly review', time: '35 min ago', source: 'Campus exec' },
    { title: 'Sustainability recommendation completed', time: '1 hr ago', source: 'Library lighting' },
    { title: 'Consumption exceeded configured target', time: '1 hr ago', source: 'Admin block' },
  ]);
  renderActivity();
}

campusSelect.addEventListener('change', (event) => {
  state.campus = event.target.value;
  const campusName = state.campus;
  document.querySelector('.brand-tag').textContent = `${campusName} • live`;
});

document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.querySelectorAll('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => setRange(button.dataset.range));
});
document.getElementById('startDemo').addEventListener('click', startDemo);
document.getElementById('pauseDemo').addEventListener('click', pauseDemo);
document.getElementById('resetDemo').addEventListener('click', resetDemo);

renderSummary();
renderStatus();
renderTrendChart();
renderCampusMap();
renderActivity();
renderAlerts();
renderRecommendations();
renderScorecard();
renderImpact();
renderReportPreview();
startDemo();
