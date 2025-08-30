let createNewTroopDeployment = () => {
  let totalTroops = BBDD.locations.reduce((total, location) => total += location.currentTroops, 0);
  console.log('totalTroops', totalTroops);
  let newTroops = [];
  for(let i = 0; i < totalTroops * ENV.newTroopsPerTroop; i++){
    newTroops.push(Math.floor(Math.random() * totalTroops) + 1);
  }
  console.log('newTroops', newTroops);
  let currentTroopsAccumulated = 0;
  BBDD.locations.map(location => {
    currentTroopsAccumulated += location.currentTroops;
    let originalNewTroopLength = newTroops.length;
    newTroops = newTroops.filter(troopNumber => troopNumber > currentTroopsAccumulated);
    if(originalNewTroopLength !== newTroops.length){
      location.currentTroops += originalNewTroopLength - newTroops.length;
      renderLocationCircle(location);
      console.log(`Add ${originalNewTroopLength - newTroops.length} troops to location`, location);
    }
    return location;
  });
  STORAGE.eventList['e' + (STORAGE.currentTic + ENV.ticsPerTroopDeployment)] = [createNewTroopDeployment];
};

/* STORAGE.eventList['e' + (STORAGE.currentTic + ENV.ticsPerTroopDeployment)] = [createNewTroopDeployment]; */

let intervalId = setInterval(() => {
  try {
    let eventsToExecute = STORAGE.eventList['e' + STORAGE.currentTic];
    if(!!eventsToExecute && eventsToExecute.length) {
      console.log('eventsToExecute at ', STORAGE.currentTic, eventsToExecute);
      eventsToExecute.map(executeEvent => executeEvent());
      delete STORAGE.eventList['e' + STORAGE.currentTic];
    }
    STORAGE.currentTic++;
  } catch (error) {
    clearInterval(intervalId);
  }
}, ENV.milisecondsPerTic);