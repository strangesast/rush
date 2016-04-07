var newTeamForm = document.getElementById('new-team-form');
var newTeamMessages = document.getElementById('new-team-messages');

var updateTeamMessage = function(message, html) {
  general.removeChildren(newTeamMessages);
  if(message) {
    newTeamMessages.textContent = message;
  } else {
    newTeamMessages.innerHTML = html;
  }
}

newTeamForm.onsubmit = function(e) {
  e.preventDefault();

  var formData = new FormData(newTeamForm);
  var action = newTeamForm.getAttribute('action');

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
      updateTeamMessage(null, '<div>Doc created!</div><pre>' + JSON.stringify(parsed.doc, null, 2) + '</pre>');

    } else {
      updateTeamMessage('unrecognized error');
      return Promise.reject('unrecognized error');
    }

  }).catch(function(err) {
    alert("error");
    var parsed;
    try {
      parsed = JSON.parse(err.responseText);
      console.log(parsed);
      updateTeamMessage(parsed.message, parsed.html);

    } catch (e) {}
    console.log(err);
  });

  return false;
};
