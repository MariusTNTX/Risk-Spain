let errorDiv = document.getElementById('error');

try {
  /* RENDER MAP */
  STORAGE.map = L.map('map').setView([40.1, -2.2], 6);
  L.tileLayer(ENV.tileLayer.link, { attribution: ENV.tileLayer.attribution }).addTo(STORAGE.map);

  DB.init();
  
  /* RENDER LINKS */
  DB.links.forEach(link => renderLinkLine(link));

  /* RENDER LOCATIONS */
  DB.locations.forEach(location => renderLocationCircle(location, STORAGE));

  STORAGE.map.on('click', (e) => {
    console.log('map event', e);
  });

  initialiceTimer();

  document.getElementById('print')?.addEventListener('click', () => {
    console.log('STORAGE.eventList', STORAGE.eventList);
    console.log('DB.communities', DB.communities.getAll());
    console.log('DB.provinces', [...DB.provinces.getAll()].sort((a, b) => b.totalDefaultTroops - a.totalDefaultTroops));
    console.log('DB.locations', [...DB.locations.getAll()].sort((a, b) => b.population - a.population));
    console.log('DB.states', [...DB.states.getAll()].sort((a, b) => b.totalDefaultTroops - a.totalDefaultTroops));
    console.log('DB.relationships', DB.relationships.getAll());
    console.log('DB.links', DB.links.getAll());
  });
} catch (error) {
  errorDiv.innerHTML = error.stack;
}