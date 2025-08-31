var ENV = {
  /* tileLayer: {
    link: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors, SRTM | © OpenTopoMap'
  }, */
  tileLayer: {
    link: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap'
  },
  circle: {
    radius: 6,
    defaultColor: 'blue',
    selectedColor: 'magenta',
    weight: 2,
    fillOpacity: 0.2
  },
  line: {
    landColor: 'gray', 
    seaColor: 'steelblue',
    weight: 2
  },
  milisecondsPerTic: 1000,
  troopsPerInhabitant: 1 / 500,
  minDefaultTroopsByLocation: 5,
  maxTroopsPerDefaultTroop: 2,
  ticsPerTroopDeployment: 24,
  newTroopsPerTroop: 1 / 1000,
  ticsPerRelationshipUpdate: 2,
  maxRelationshipScore: 100,
  inflexRelationshipScore: 50,
  averagePeaceRelationshipScore: 75,
  averageWarRelationshipScore: 25,
}