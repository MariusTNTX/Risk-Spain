function initialiceTimer() {
  addInitialEvents();
  let intervalId = setInterval(() => {
    try {
      let eventsToExecute = STORAGE.eventList['e' + STORAGE.currentTic];
      if(!!eventsToExecute && eventsToExecute.length) {
        console.log('eventsToExecute at ', STORAGE.currentTic, eventsToExecute);
        eventsToExecute.map(executeEvent => _executeEvent());
        delete STORAGE.eventList['e' + STORAGE.currentTic];
      }
      STORAGE.currentTic++;
    } catch (error) {
      console.error(error);
      STORAGE.errorDiv.innerHTML += `<div>${error.stack}</div>`;
      clearInterval(intervalId);
    }
  }, ENV.milisecondsPerTic);
}