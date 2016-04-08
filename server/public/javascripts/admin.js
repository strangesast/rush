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

