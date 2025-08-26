function getDistance(loc1, loc2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function setNearestLocations(originLocation, length) {
  let relativeLocations = LOCATION_LIST.map(location => ({
    location, 
    distance: location !== originLocation ? getDistance(originLocation, location) : 0
  }));

  originLocation.nearestRelativeLocations = relativeLocations.sort((a, b) => a.distance - b.distance).slice(1, length + 1);
}

function renderLocationCircle(location) {
  if(location.circle){
    STORAGE.map.removeLayer(location.circle);
  }
  const popupContent = `
    <div class="popup-content">
      <b>Municipio</b>: ${location.name}<br/>
      <b>Provincia</b>: ${location.province}<br/>
      <b>Com. Aut.</b>: ${location.community}<br/>
      <b>Población</b>: ${location.population.toLocaleString('es-ES')} hab.<br/>
      <b>Altitud</b>: ${location.height.toFixed(0)} m<br/>
      <b>Coordenadas</b>: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}
    </div>
  `;
  location.circle = L.circle([location.latitude, location.longitude], {
    radius: Math.sqrt(location.population) * 6,
    color: "blue",
    weight: 2,
    fillOpacity: 0.2
  }).addTo(STORAGE.map).bindPopup(popupContent);

  location.circle.on("contextmenu", () => {
    if (!STORAGE.linkingStart) {
      STORAGE.linkingStart = location;
      location.circle.setStyle({ color: "magenta", fillColor: "magenta" });
    } else {
      if (STORAGE.linkingStart !== location) {
        createOrDeleteLink(STORAGE.linkingStart, location);
      } 
      STORAGE.linkingStart.circle.setStyle({ color: "blue", fillColor: "blue" });
      location.circle.setStyle({ color: "blue", fillColor: "blue" });
      STORAGE.linkingStart = null;
    }
  });
}

function createOrDeleteLink(locA, locB) {
  let linkToDelete = LINK_LIST.find(link => link.locations.includes(locA.id) && link.locations.includes(locB.id));
  if(linkToDelete) {
    STORAGE.map.removeLayer(linkToDelete.line);
    let index = LINK_LIST.indexOf(linkToDelete);
    if (index !== -1) {
      LINK_LIST.splice(index, 1);
    }
    return;
  }
  const link = { locations: [locA.id, locB.id], isMaritim: true };
  renderLinkLine(link);
  LINK_LIST.push(link);
  renderLocationCircle(locA);
  renderLocationCircle(locB);
}

function renderLinkLine(link) {
  const coords = link.locations.map(x => x.split('_').map(y => parseFloat(y)));
  link.distance = STORAGE.map.distance(...coords);
  link.line = L.polyline(coords, { color: link.isMaritim ? 'limegreen' : 'red', weight: 2 }).addTo(STORAGE.map);
}
