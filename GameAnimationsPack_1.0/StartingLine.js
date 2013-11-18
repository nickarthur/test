function spawnVehicles(globalStateData) {
  for (var i = 0; i < 4; i++) {
    spawn({
      prefab: 'Starter Vehicle Prefab',
      pos: getMarkerPos('Position ' + (i+1)),
      created_data: globalStateData.controller
    });
  }
}

function getGlobalKeys() {
  getGlobalState({
    state_key: 'Racetrack Key',
    keys: ['controller'],
    callback: 'spawnVehicles'
  });
}

function resetStartLine() {
  reset();
}

function disableVehicles() {
  resetSpawned();
}

handlerCreate({
  name: 'resetStartLine',
  channel: 'raceTrack',
  message: 'resetStartLine'
});

handlerCreate({
  name: 'disableVehicles',
  channel: 'raceTrack',
  message: 'disableVehicles'
});

setGlobalState({
  state_key: 'Racetrack Key',
  data: { startline: getSelfEnt() },
  callback: 'getGlobalKeys'
});