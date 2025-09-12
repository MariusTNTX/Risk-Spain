function initialiceTimer() {
  addInitialEvents();
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
      console.error(error);
      clearInterval(intervalId);
    }
  }, ENV.milisecondsPerTic);
}