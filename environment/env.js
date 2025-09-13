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
    radius: 135,
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
  statePolygon: {
    weight: 2, 
    fillOpacity: 0.2
  },
  armyPolygon: {
    size: 0.5,
    color: 'black', 
    weight: 3, 
    fillOpacity: 0.3
  },
  milisecondsPerTic: 1000, /* Milisegundos que dura un tic de juego */
  troopsPerInhabitant: 1 / 500, /* Proporción de tropas por habitantes reales */
  minDefaultTroopsByLocation: 5, /* Tropas minimas por localización (aplicado en municipios pequeños) */
  maxTroopsPerDefaultTroop: 2, /* Proporción de tropas máximas por cada tropa por defecto */
  ticsPerTroopDeployment: 24, /* Tics necesarios para la generación de un nuevo grupo de tropas en el mundo */
  defaultTroopPercentPerTroopDeployment: 1 / 1000, /* Proporción de nuevas tropas por cada tropa por defecto del mundo */
  ticsPerRelationshipUpdate: 2, /* Tics necesarios para una actualización de las relaciones entre potencias */
  maxRelationshipScore: 100, /* Puntuación máxima de una relación entre dos potencias */
  inflexRelationshipScore: 50, /* Puntuación límite que determina la paz entre dos potencias (por debajo de esa puntuación se declara una guerra) */
  averagePeaceRelationshipScore: 75, /* Puntuación que se establece cuando dos potencias pasan de la guerra a la paz */
  averageWarRelationshipScore: 25, /* Puntuación que se establece cuando dos potencias pasan de la paz a la guerra */
  minStateTroopPercentPerArmy: 0.001, /* Proporción mínima de tropas (comparado con las tropas totales) que puede conformar un ejército de una potencia */
  maxStateTroopPercentPerArmy: 0.01, /* Proporción máxima de tropas (comparado con las tropas totales) que puede conformar un ejército de una potencia */
  minRecruitingTicPercentPerArmy: 0.1, /* Proporción mínima del tiempo de reclutamiento de tropas para un ejército en comparación con el tiempo que tardaría mediante regeneración natural */
  maxRecruitingTicPercentPerArmy: 0.5, /* Proporción máxima del tiempo de reclutamiento de tropas para un ejército en comparación con el tiempo que tardaría mediante regeneración natural */
  minRecruitableTroopPercent: 0.1, /* Proporción mínima de las tropas de una localización que no pueden ser reclutadas (destinadas sólo a defensa) */
  armyLandMetersPerTic: 3000, /* Metros terrestres máximos que recorre un ejército por tic */
  armySeaMetersPerTic: 10000, /* Metros marítimos máximos que recorre un ejército por tic */
  armyLocationRestTics: 6, /* Tics que ocupa un ejército en descansar cuando pasa por una localización */
  minDeadTroopsPerTic: 5, /* Número mínimo de tropas de un bando que deben morir por cada tic durante una batalla */
  ticsPerBattleTurn: 3, /* Tics que dura un turno en una batalla */
}