STORAGE.errorDiv = document.getElementById('error');

try {
  /* RENDER MAP */
  STORAGE.map = L.map('map').setView([40.1, -2.2], 6);
  L.tileLayer(ENV.tileLayer.link, { attribution: ENV.tileLayer.attribution }).addTo(STORAGE.map);

  DB.init();

  document.getElementById('print')?.addEventListener('click', () => {
    console.log('STORAGE.eventList', STORAGE.eventList);
    console.log('DB.communities', DB.communities.getAll());
    console.log('DB.provinces', [...DB.provinces.getAll()].sort((a, b) => b.totalDefaultTroops - a.totalDefaultTroops));
    console.log('DB.locations', [...DB.locations.getAll()].sort((a, b) => b.population - a.population));
    console.log('DB.states', [...DB.states.getAll()].sort((a, b) => b.totalDefaultTroops - a.totalDefaultTroops));
    console.log('DB.relationships', DB.relationships.getAll());
    console.log('DB.armies', DB.armies.getAll());
    console.log('DB.links', DB.links.getAll());
    console.log('DB.links', DB.links.getRawData());
  });
  
  /* RENDER LINKS */
  DB.links.map(link => renderLinkLine(link));

  /* RENDER LOCATIONS */
  DB.locations.map(location => renderLocationCircle(location));

  STORAGE.map.on('click', (e) => {
    console.log('map event', e);
  });

  initialiceTimer();
} catch (error) {
  console.error(error);
  STORAGE.errorDiv.innerHTML += `<div>${error.stack}</div>`;
}