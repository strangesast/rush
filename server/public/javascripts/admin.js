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
