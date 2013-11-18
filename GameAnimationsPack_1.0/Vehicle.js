var controllerEnt = context.data;

function clickStart(clickEventData) {
  getEntFields({
    ent: clickEventData.from_ent,
    fields: ['display_name'],
    callback: 'processRacerInfo',
    callback_data: { ent: clickEventData.from_ent, user: clickEventData.from }
  });
}

function processRacerInfo(entFieldsData) {
  directMessage({
    ent: controllerEnt,
    channel: 'raceTrack',
    message: 'joinedRace',
    data: {
      ent: entFieldsData.ent,
      user: entFieldsData.user,
      name: entFieldsData.display_name,
      pos: getPos(),
      rot: getRot()
    }
  });
  
  customizerSet({name: 'Hidden', value: true});
}

handlerCreate({
  name: 'clickStart',
  channel: 'direct',
  message: 'clickStart'
});