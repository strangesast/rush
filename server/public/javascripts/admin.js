var initializeButton = document.getElementById('initialize-game');

initializeButton.onclick = function(evt) {
  //function(url, method, data, updateFunc, alternativeEncoding) {
  var initURL = initializeButton.getAttribute('init-url');
  initializeButton.disabled = true;
  general.makeRequest(initURL, 'GET', null, null).then(function(request) {
    var parsed = JSON.parse(request.responseText);
    console.log(parsed);
  }).catch(function(request) {
    var parsed = JSON.parse(request.responseText);
    console.log(parsed);
  }).then(function() {
    initializeButton.disabled = false;
  });
};

var msToTime = function (duration) {
  var milliseconds = parseInt((duration%1000)/100)
      , seconds = parseInt((duration/1000)%60)
      , minutes = parseInt((duration/(1000*60))%60)
      , hours = parseInt((duration/(1000*60*60))%24);
  
  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;
  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

var gameTime = document.getElementById('game-time');
if(gameTime) {
  var startTime = new Date(Number(gameTime.getAttribute('start-time')));
  var endTime = new Date(Number(gameTime.getAttribute('end-time')));
  setInterval(function() {
    var diff = endTime - startTime || Date.now() - startTime;
    gameTime.textContent = msToTime(diff);
  }, 100);
}

var gameTime = document.getElementById('game-time');
var gameTimeStart = document.getElementById('game-time-start');
var gameTimeStop = document.getElementById('game-time-stop');

var team0Score = document.getElementById('team0-score');
var team0ScoreUp = document.getElementById('team0-score-up');
var team0ScoreDown = document.getElementById('team0-score-down');

var team1Score = document.getElementById('team1-score');
var team1ScoreUp = document.getElementById('team1-score-up');
var team1ScoreDown = document.getElementById('team1-score-down');

var submitAction = function(url, tag, type, value, oldvalue) {
  var type = type || "update";
  return general.makeRequest(url, 'POST', JSON.stringify({'actions' : [{
    type: type,
    tag: tag,
    value: value,
    oldvalue: oldvalue
  }]}), null, 'application/json').then(function(request) {
    return JSON.parse(request.responseText);
  }).then(function(parsed) {
    if('actions' in parsed) {
      parsed.actions.forEach(function(elem) {
        var domelement;
        if(domelement = document.querySelector('[name=' + elem.tag + ']')) {
          domelement.textContent = elem.value;
        }
      });
    }
  });
};

if(gameTime && team0Score && team1Score) {
  var prom = Promise.resolve();
  gameTimeStart.addEventListener('click', function(evt) {
    prom = submitAction(gameTime.getAttribute('action-url'), 'endtime', 'update', Date.now(), gameTime.getAttribute('end-time'));
  });
  gameTimeStop.addEventListener('click', function(evt) {
    prom = submitAction(gameTime.getAttribute('action-url'), 'starttime', 'update', Date.now(), gameTime.getAttribute('start-time'));
  });
  team0ScoreUp.addEventListener('click', function(evt) {
    var cscore = team0Score.textContent;
    prom = submitAction(gameTime.getAttribute('action-url'), 'team0score', 'update', Number(cscore) + 1, Number(cscore));
  });
  team0ScoreDown.addEventListener('click', function(evt) {
    var cscore = team0Score.textContent;
    prom = submitAction(gameTime.getAttribute('action-url'), 'team0score', 'update', Math.min(Number(cscore) - 1, 0), Number(cscore));
  });
  team1ScoreUp.addEventListener('click', function(evt) {
    var cscore = team1Score.textContent;
    prom = submitAction(gameTime.getAttribute('action-url'), 'team1score', 'update', Number(cscore) + 1, Number(cscore))
  });
  team1ScoreDown.addEventListener('click', function(evt) {
    var cscore = team1Score.textContent;
    prom = submitAction(gameTime.getAttribute('action-url'), 'team1score', 'update', Math.min(Number(cscore) + 1, 0), Number(cscore));
  });

  prom.then(function(result) {
    if(result) {
      console.log(result);
    }
  });
}
