function addEvent(extraTics, functionToExecute) {
  let eventFunctions = STORAGE.eventList['e' + (STORAGE.currentTic + extraTics)];
  if(Array.isArray(eventFunctions)) {
    STORAGE.eventList['e' + (STORAGE.currentTic + extraTics)].push(functionToExecute);
  } else {
    STORAGE.eventList['e' + (STORAGE.currentTic + extraTics)] = [functionToExecute];
  }
}

function addInitialEvents(){
  addEvent(ENV.ticsPerTroopDeployment, DB.locations.createNewTroopDeployment);
  addEvent(ENV.ticsPerRelationshipUpdate, DB.relationships.updateRelationships);
}
