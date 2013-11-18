function clickStart(clickEventData) {
  getGlobalState({
    state_key: 'Racetrack Key',
    keys: ['results_total','results_current'],
    callback: 'processResults',
    callback_data: { clicker: clickEventData.from_ent }
  });
}

function processResults(globalStateData) {
  var result;
  var resultsArray = [];
  
  var tableHTML = '<table><tr><td><table><tr><th>Player</th><th>Time</th></tr>';
  
  for (result in globalStateData.results_total) {
    tableHTML += '<tr><td>' + globalStateData.results_total[result].name +
      '</td><td>' + globalStateData.results_total[result].time + '</td></tr>';
  }
  
  tableHTML += '</table></td><td><table><tr><th>Player</th><th>Time</th></tr>';
  
  for (result in globalStateData.results_current) {
    tableHTML += '<tr><td>' + globalStateData.results_current[result].name +
      '</td><td>' + globalStateData.results_current[result].time + '</td></tr>';
  }
  
  tableHTML += '</table></td></tr></table>';
  
  controllerHTMLCreate({
    ent: globalStateData.clicker,
    title: 'Race Results',
    html: tableHTML,
    listeners: [{ id: "my_listener" }]
  });
}

function sortByTime(a, b) {
  return (a[1] < b[1] ? -1 : (a[1] > b[1] ? 1 : 0));
}

function clickDisable() {
  handlerSetDisabled({ name: 'clickStart', disabled: true });
}

function clickEnable() {
  handlerSetDisabled({ name: 'clickStart', disabled: false });
}

handlerCreate({
  name: 'clickStart',
  channel: 'direct',
  message: 'clickStart'
});

handlerCreate({
  name: 'clickDisable',
  channel: 'raceTrack',
  message: 'clickDisable'
});

handlerCreate({
  name: 'clickEnable',
  channel: 'raceTrack',
  message: 'clickEnable'
});

setGlobalState({
  state_key: 'Racetrack Key',
  data: { scoreboard: getSelfEnt() }
});