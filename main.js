let errorDiv = document.getElementById('error');

try {
  /* RENDER MAP */
  STORAGE.map = L.map('map').setView([40.1, -2.2], 6);
  L.tileLayer(ENV.tileLayer.link, { attribution: ENV.tileLayer.attribution }).addTo(STORAGE.map);

  BBDD.init();
  
  /* RENDER LINKS */
  BBDD.links.forEach(link => renderLinkLine(link));

  /* RENDER LOCATIONS */
  BBDD.locations.forEach(location => renderLocationCircle(location, STORAGE));

  STORAGE.map.on('click', (e) => {
    console.log('map event', e);
  });

  initialiceTimer();

  document.getElementById('print')?.addEventListener('click', () => {
    console.log('STORAGE.eventList', STORAGE.eventList);
    console.log('BBDD.communities', BBDD.communities.getAll());
    console.log('BBDD.provinces', [...BBDD.provinces.getAll()].sort((a, b) => b.totalDefaultTroops - a.totalDefaultTroops));
    console.log('BBDD.locations', [...BBDD.locations.getAll()].sort((a, b) => b.population - a.population));
    console.log('BBDD.states', [...BBDD.states.getAll()].sort((a, b) => b.totalDefaultTroops - a.totalDefaultTroops));
    console.log('BBDD.relationships', BBDD.relationships.getAll());
    console.log('BBDD.links', BBDD.links.getAll());
  });
} catch (error) {
  errorDiv.innerHTML = error.stack;
}