# GreenPulse 2.0

An interactive, fictional-data sustainability command-center prototype for hackathon demonstrations.

## Run locally

From this folder, serve `dist` with any static server. For example:

```powershell
py -m http.server 4173 --directory dist
```

Then open `http://127.0.0.1:4173`.

## Included demo behavior

- Responsive dark/light command-center interface
- Resource/date filters and animated consumption chart
- Explainable seeded anomaly alerts with acknowledge/assign controls
- EcoMind deterministic recommendations and corrective-action feedback
- Interactive illustrative campus explorer
- Clearly labeled simulation controls and CSV audit export
- Print-friendly report action

All telemetry, costs, emissions, alerts, and locations in this prototype are fictional. It does not represent a live sensor integration.

## Production implementation notes

The requested production stack requires a server/API, database, authenticated roles, validated mutations, and a report generation service. This static demo intentionally keeps its state in the browser and labels simulated data explicitly; it is not presented as a completed secure telemetry backend.
