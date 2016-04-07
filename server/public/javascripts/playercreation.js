var newPlayerForm = document.getElementById('new-player-form');
var newPlayerMessages = document.getElementById('new-player-messages');

var updatePlayerMessage = function(message, html) {
  general.removeChildren(newPlayerMessages);
  if(message) {
    newPlayerMessages.textContent = message;
  } else {
    newPlayerMessages.innerHTML = html;
  }
}

newPlayerForm.onsubmit = function(e) {
  e.preventDefault();

  var formData = new FormData(newPlayerForm);
  var action = newPlayerForm.getAttribute('action');

  general.makeRequest(action, 'POST', formData, null, null).then(function(request) {
    var parsed;
    try {
      parsed = JSON.parse(request.responseText);
    } catch (e) {
      parsed = null;
    }
    if(parsed && 'hash' in parsed){
      if(parsed.hash !== null) {
        window.location.hash = parsed.hash;
      }
      updatePlayerMessage(null, '<div>Doc created!</div><pre>' + JSON.stringify(parsed.doc, null, 2) + '</pre>');

    } else {
      updatePlayerMessage('unrecognized error');
      return Promise.reject('unrecognized error');
    }

  }).catch(function(err) {
    alert("error");
    var parsed;
    try {
      parsed = JSON.parse(err.responseText);
      console.log(parsed);
      updatePlayerMessage(parsed.message, parsed.html);

    } catch (e) {}
    console.log(err);
  });

  return false;
};
