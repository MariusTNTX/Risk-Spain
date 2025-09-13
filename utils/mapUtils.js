function renderLocationCircle(location) {
  if(location.circle){
    STORAGE.map.removeLayer(location.circle);
  }
  const popupContent = `
    <div class="popup-content">
      <b>Territorio</b>: ${location.name}<br/>
      <b>Estado</b>: ${location.currentState.name}<br/>
      <b>Tropas</b>: ${location.currentTroops} / ${location.maxTroops}<br/>
      <hr>
      <b>Provincia</b>: ${location.province.name}<br/>
      <b>Com. Aut.</b>: ${location.province.community.name}<br/>
      <b>Población</b>: ${location.population.toLocaleString('es-ES')} hab.<br/>
      <b>Altitud</b>: ${location.height.toFixed(0)} m<br/>
      <b>Coordenadas</b>: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}
    </div>
  `;
  location.circle = L.circle([location.latitude, location.longitude], {
    radius: Math.sqrt(location.currentTroops) * ENV.circle.radius,
    color: location.currentState.color || ENV.circle.defaultColor,
    weight: ENV.circle.weight,
    fillOpacity: ENV.circle.fillOpacity
  }).addTo(STORAGE.map).bindPopup(popupContent);

  location.circle.on("contextmenu", () => {
    if (!STORAGE.linkingStart) {
      STORAGE.linkingStart = location;
      location.circle.setStyle({ color: ENV.circle.selectedColor, fillColor: ENV.circle.selectedColor });
    } else {
      if (STORAGE.linkingStart !== location) {
        createOrDeleteLink(STORAGE.linkingStart, location);
      } 
      STORAGE.linkingStart.circle.setStyle({ 
        color: location.province.state.color || ENV.circle.defaultColor, 
        fillColor: location.province.state.color || ENV.circle.defaultColor 
      });
      location.circle.setStyle({ 
        color: location.province.state.color || ENV.circle.defaultColor, 
        fillColor: location.province.state.color || ENV.circle.defaultColor 
      });
      STORAGE.linkingStart = null;
    }
  });
}

function createOrDeleteLink(locA, locB) {
  let linkToDelete = DB.links.find(link => link.locations.includes(locA) && link.locations.includes(locB));
  if(linkToDelete) {
    STORAGE.map.removeLayer(linkToDelete.line);
    let index = DB.links.indexOf(linkToDelete);
    if (index !== -1) {
      DB.links.splice(index, 1);
    }
    return;
  }
  const link = { locations: [locA, locB], isMaritim: false };
  renderLinkLine(link);
  DB.links.push(link);
  renderLocationCircle(locA);
  renderLocationCircle(locB);
}

function renderLinkLine(link) {
  const coords = link.locations.map(l => ([ l.latitude, l.longitude ]));
  link.distance = STORAGE.map.distance(...coords);
  link.line = L.polyline(coords, { 
    color: link.isMaritim ? ENV.line.seaColor : ENV.line.landColor, 
    weight: ENV.line.weight 
  }).addTo(STORAGE.map);
}

function renderStatePolygons(state) {
  state.currentPolygons.forEach((area, i) => {
    if(area.geoJSON){
      area.geoJSON.clearLayers();
    } else {
      area.geoJSON = L.layerGroup().addTo(STORAGE.map);
    }
    const newGeoJSON = L.geoJSON(area.polygon, {
      style: { color: state.color, weight: ENV.statePolygon.weight, fillOpacity: ENV.statePolygon.fillOpacity }
    }).addTo(STORAGE.map).bindPopup(`
      <h2>${state.name}</h2>
      ${
        state.currentPolygons.length > 1 
        ? `<h3 style="text-align: center">Zona ${i + 1} de ${state.currentPolygons.length}</h3>` 
        : ''
      }
    `);
    area.geoJSON.addLayer(newGeoJSON);
    return area;
  });
}

function renderArmySquare(army) {
  if(army.polygon){
    STORAGE.map.removeLayer(army.polygon);
  }
  const position = army.currentRouteIndex % 2 ? army.currentElement.getCenter() : army.currentElement.getLatLng();
  const distance = Math.sqrt(army.currentTroops) * ENV.armyPolygon.size;
  const polygon = createSquarePolygon(position, distance);
  army.polygon = L.geoJSON(polygon, {
    style: { color: ENV.armyPolygon.color, fillColor: army.state.color, weight: ENV.armyPolygon.weight, fillOpacity: ENV.armyPolygon.fillOpacity }
  }).addTo(STORAGE.map).bindPopup(`
    <div class="popup-content">
      <b>Estado</b>: ${army.state.name}<br/>
      <b>Enemigo</b>: ${army.enemyState.name}<br/>
      <b>Tropas</b>: ${army.currentTroops} / ${army.originalTroops}<br/>
      <b>Origen</b>: ${army.departureLocation.name} (${army.departureLocation.province.name})<br/>
      <b>Destino Actual</b>: ${army.currentTargetLocation.name} (${army.currentTargetLocation.province.name})<br/>
      <b>En Batalla</b>: ${army.inBattle ? 'Si' : 'No'}
    </div>
  `);
}
