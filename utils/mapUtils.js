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
    radius: Math.sqrt(location.population) * ENV.circle.radius,
    color: location.province.state.color || ENV.circle.defaultColor,
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
  state.currentPolygons.map((polygon, i) => {
    L.geoJSON(polygon, {
      style: { color: state.color, weight: 2, fillOpacity: 0.1 }
    }).addTo(STORAGE.map).bindPopup(`${state.name}${state.currentPolygons.length > 1 ? ` (Zona ${i + 1})` : ''}`);
  })
}
