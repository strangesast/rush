var newObjectForm = document.getElementById('new-object-form');

newObjectForm.onsubmit = function(e) {
  e.preventDefault();

  var formData = new FormData(newObjectForm);

  var action = newObjectForm.getAttribute('action');
  console.log(action);

  general.makeRequest(action, 'POST', formData, null, null).then(function(request) {
    var parsed;
    try {
      parsed = JSON.parse(request.responseText);
    } catch (e) {
      parsed = null;
    }
    if(parsed && 'hash' in parsed){
      window.location.hash = parsed.hash;
    } else {
      return Promise.reject('unrecognized error');
    }

  }).catch(function(err) {
    alert("error");
    console.log(err);
  });

  return false;
};
