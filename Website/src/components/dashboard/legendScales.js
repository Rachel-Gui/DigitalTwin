// Published WebScene renderer stops, checked 2026-11-03.
// Continuous scales, not five category bins. Keep aligned with the source scenes.
export const legendScales = {
  "energy": {
    "field": "eui_base",
    "stops": [
      {
        "value": 78,
        "color": "#c65a18"
      },
      {
        "value": 85.25,
        "color": "#f36f20"
      },
      {
        "value": 92.5,
        "color": "#f7975e"
      },
      {
        "value": 99.75,
        "color": "#fbc09b"
      },
      {
        "value": 107,
        "color": "#fdd4ba"
      }
    ]
  },
  "retrofit": {
    "field": "priority_q",
    "stops": [
      {
        "value": 1.6,
        "color": "#c65a18"
      },
      {
        "value": 2.3000000000000003,
        "color": "#f36f20"
      },
      {
        "value": 3,
        "color": "#f7975e"
      },
      {
        "value": 3.7,
        "color": "#fbc09b"
      },
      {
        "value": 4.4,
        "color": "#fdd4ba"
      }
    ]
  },
  "renewable": {
    "field": "annual_roof",
    "stops": [
      {
        "value": 0,
        "color": "#fffcd4"
      },
      {
        "value": 276445,
        "color": "#ecb29e"
      },
      {
        "value": 552890,
        "color": "#d86868"
      },
      {
        "value": 829335,
        "color": "#9b3557"
      },
      {
        "value": 1105780,
        "color": "#420239"
      }
    ]
  }
};
