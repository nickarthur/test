var assets = {};

var racers = {};
var racerFound = false;

var waitTime = clamp(getParam('Wait Time'), 3, 20);
var startTime = clamp(getParam('Start Time'), 3, 10);
var raceTime = clamp(getParam('Race Time'), 10, 900);

function joinedRace(vehicleData) {
  error(vehicleData.name + ' joined the race');
  
  racers[vehicleData.ent] = {
    user: vehicleData.user,
    name: vehicleData.name,
    time_finished: 0
  };
  
  setTransform({ ent: vehicleData.ent, pos: vehicleData.pos, rot: vehicleData.rot });
  
  animAddSequencer({ ent: vehicleData.ent, movemod: 'Waiting Movemod' });
  
  if (!racerFound) {
    racerFound = true;
    error('Starting waiting countdown...');
    timerCreate({name: 'countdownWait', period: 1});
  }
}

function finishedRace(vehicleData) {
  animClearSequencer({ ent: vehicleData.ent });
  racers[vehicleData.ent].time_finished = vehicleData.time_finished;
}

function stopRace(vehicleData) {
  if (vehicleData.timedout) {
    error('Race timed out');
    
    for (var racer in racers) {
      if (racers[racer].time_finished === 0) {
        animClearSequencer({ ent: racer });
        
        tell({
          ent: racer,
          message: 'Sorry. You didn\'t complete the race in time.'
        });
      }
    }
  } else {
    error('All players finished the race');
  }
  
  getGlobalState({
    state_key: 'Racetrack Key',
    keys: ['results_total'],
    callback: 'processResults',
    callback_data: { current_racers: racers }
  });
}

function objectToArray(obj) {
  var arr = [];
  for (var key in obj) {
    arr.push([obj[key].user, obj[key].name, obj[key].time_finished]);
  }
  return arr;
}

function arrayToObject(arr) {
  var obj = {};
  for (var i = 0; i < arr.length; i++) {
    obj[arr[i][0]] = { name: arr[i][1], time_finished: arr[i][2] };
  }
  return obj;
}

function processResults(globalStateData) {
  directMessage({
    ent: assets.scoreboard,
    channel: 'raceTrack',
    message: 'clickDisable'
  });
  
  // Convert the total race results object into an array for sorting by time
  var resultsTotalArray = objectToArray(globalStateData.results_total);
  arraySort(resultsTotalArray, 'sortByTime');
  
  // Convert the current race results object into an array for sorting by time
  var resultsCurrentArray = objectToArray(globalStateData.current_racers);
  arraySort(resultsCurrentArray, 'sortByTime');
  
  // Look for players with the same name and update their time into the total
  // results if they have scored a better time.
  for (var i = 0; i < resultsTotalArray.length; i++) {
    for (var j = 0; j < resultsCurrentArray.length; j++) {
      if (resultsTotalArray[i][0] === resultsCurrentArray[j][0] &&
        resultsTotalArray[i][2] < resultsCurrentArray[j][2]) {
        resultsTotalArray[i][2] = resultsCurrentArray[j][2];
      }
    }
  }
  
  error('Recording user data...');
  
  setGlobalState({
    state_key: 'Racetrack Key',
    data: {
      results_total: arrayToObject(resultsTotalArray),
      results_current: arrayToObject(resultsCurrentArray)
    },
    callback: 'resultsUpdated'
  });
}

function sortByTime(a, b) {
  return (a[2] < b[2] ? -1 : (a[2] > b[2] ? 1 : 0));
}

function resultsUpdated() {
  error('Results recorded');
  
  waitTime = clamp(getParam('Wait Time'), 3, 20);
  startTime = clamp(getParam('Start Time'), 3, 10);
  raceTime = clamp(getParam('Race Time'), 10, 900);
  
  racers = {};
  racerFound = false;
  
  directMessage({
    ent: assets.scoreboard,
    channel: 'raceTrack',
    message: 'clickEnable'
  });
  
  directMessage({
    ent: assets.startline,
    channel: 'raceTrack',
    message: 'resetStartLine'
  });
  
  error('Race reset');
}

function countdownWait() {
  if (waitTime-- === 0) {
    timerDestroy('countdownWait');
    
    getGlobalState({
      state_key: 'Racetrack Key',
      keys: ['startline', 'finishline', 'scoreboard'],
      callback: 'updateAssets'
    });
  }
}

function updateAssets(globalStateData) {
  assets = globalStateData;
  error(stringify(assets));
  
  error('Starting race countdown...');
  
  directMessage({
    ent: assets.startline,
    channel: 'raceTrack',
    message: 'disableVehicles'
  });
  
  timerCreate({name: 'countdownStart', period: 1});
}

function countdownStart() {
  if (startTime > 0) {
    error(startTime + '...');
    startTime--;
  } else {
    for (var racer in racers) {
      animAddSequencer({ movemod: 'Racing Movemod', ent: racer });
    }
    error('GO!');
    waitTime = clamp(getParam('Start Time'), 3, 10);
    timerDestroy('countdownStart');
    
    directMessage({
      ent: assets.finishline,
      channel: 'raceTrack',
      message: 'startRace',
      data: { racers: keys(racers), timeoutTime: raceTime }
    });
  }
}

handlerCreate({
  name: 'joinedRace',
  channel: 'raceTrack',
  message: 'joinedRace'
});

handlerCreate({
  name: 'finishedRace',
  channel: 'raceTrack',
  message: 'finishedRace'
});

handlerCreate({
  name: 'stopRace',
  channel: 'raceTrack',
  message: 'stopRace'
});

setGlobalState({
  state_key: 'Racetrack Key',
  data: { controller: getSelfEnt() }
});