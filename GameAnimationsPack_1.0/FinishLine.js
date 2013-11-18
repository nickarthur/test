var controllerEnt;
var racers = {};
var startTime = 0;
var numOfRacers = 0;

function collisionStart(collisionData) {
  if (!racers[collisionData.from_ent].completed) {
    error('Player ' + collisionData.from_ent + ' crossed the finish line');
    
    racers[collisionData.from_ent].completed = true;
    
    numOfRacers--;
    
    directMessage({
      ent: controllerEnt,
      channel: 'raceTrack',
      message: 'finishedRace',
      data: {
        ent: collisionData.from_ent,
        time_finished: (now() - startTime) / 1000
      }
    });
  }
  
  if (numOfRacers === 0) {
    handlerDestroy('collisionStart');
    timerDestroy('timeoutRace');
    
    directMessage({
      ent: controllerEnt,
      channel: 'raceTrack',
      message: 'stopRace',
      data: { timedout: false }
    });
  }
}

function startRace(controllerData) {
  handlerCreate({
    name: 'collisionStart',
    channel: 'physics',
    message: 'collisionStart',
    ents: controllerData.racers
  });
  
  numOfRacers = 0;
  
  for (var i = 0; i < controllerData.racers.length; i++) {
    racers[controllerData.racers[i]] = { completed: false };
    numOfRacers++;
  }
  
  startTime = now();
  
  timerCreate({name: 'timeoutRace', delay: controllerData.timeoutTime});
}

function timeoutRace() {
  directMessage({
    ent: controllerEnt,
    channel: 'raceTrack',
    message: 'stopRace',
    data: { timedout: true }
  });
}

function updateController(globalStateData) {
  controllerEnt = globalStateData.controller;
}

handlerCreate({
  name: 'startRace',
  channel: 'raceTrack',
  message: 'startRace'
});

setGlobalState({
  state_key: 'Racetrack Key',
  data: { finishline: getSelfEnt() }
});

getGlobalState({
  state_key: 'Racetrack Key',
  keys: ['controller'],
  callback: 'updateController'
});