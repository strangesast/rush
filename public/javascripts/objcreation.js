var newObjectForm = document.getElementById('new-object-form');
console.log(newObjectForm);

newObjectForm.onsubmit = function(e) {
  e.preventDefault();

  var formData = new FormData(newObjectForm);

  var action = newObjectForm.getAttribute('action');
  console.log(action);

  general.makeRequest(action, 'POST', formData, null, null).then(function(request) {
    var parsed;
    try {
      parsed = JSON.parse(request.responseText);
    } catch (e) {}
    console.log(parsed);
  }).catch(function(err) {
    console.log("error");
    console.log(err);
  });

  return false;
};
