var wrapperElement = document.getElementById('wrapper');
var transitionInProgress = false;

var hashChangeListenerEvent = function(evt) {
  var hashUrl = window.location.hash.slice(1);
  loadByHash(hashUrl);
};

window.addEventListener('popstate', hashChangeListenerEvent);

// call function after disabling hash listener
var disableHashChangeAndDo = function(func) {
  window.removeEventListener('popstate', hashChangeListenerEvent);
  func();
  window.addEventListener('popstate', hashChangeListenerEvent);
};

var changeHashWithoutEvent = function(hash) {
  return disableHashChangeAndDo(function() {
    return window.location.replace('#' + hash.split('#').join(''));
  });
};

// when doc loads, load correct hash content
document.addEventListener('DOMContentLoaded', function() {
  var hashUrl = window.location.hash.slice(1);
  if(hashUrl === ""){
    changeHashWithoutEvent('#/index');
  }
  loadByHash(hashUrl);
  wrapperElement.classList.remove('loading');
});

// load content at hash url
var loadByHash = function(raw_hashUrl) {
  // clean up trailing / leading '/'s
  var hashUrl = raw_hashUrl.split('/').filter(function(e){return e;}).join('/');
  var newHashUrl = hashUrl;

  if(hashUrl === "") {
    hashUrl = 'index';
  }
  // check that a view aleady exists
  var existingElement = wrapperElement.querySelector('[hash-url="' + hashUrl + '"]');
  console.log(hashUrl);

  var promise = Promise.resolve();
  if(!(existingElement && existingElement.hasAttribute('static'))) {
    var fullUrl = '/hash/' + hashUrl;
    var parsed;
    promise = general.makeRequest(fullUrl, 'GET').then(function(request) {
      parsed = JSON.parse(request.responseText);
      if('redirect' in parsed) {
        window.location.href = parsed.redirect;
      }
      newHashUrl = parsed.hash;
      console.log(newHashUrl);
      return parsed.html;

    }).catch(function(request) {
      // create 4XX / 5XX html
      try {
        parsed = JSON.parse(request.responseText);
      } catch (e) {}
      if(parsed && parsed.html) {
        return parsed.html;
      } else if(request.responseText) {
        return "<div><pre>" + request.responseText + "</pre></div>";
      } else {
        console.log(request);
        return "<div><h1>4XX/5XX Error</h1></div>";
      }

    }).then(function(html) {
      var div = general.createElementWithProp('div', {'hash-url': newHashUrl, 'class':'outer'});
      div.innerHTML = html;

      if(existingElement) {
        if(existingElement.hasAttribute('static')) {
          div.setAttribute('static', '');
        }
        wrapperElement.replaceChild(div, existingElement);
      } else {
        wrapperElement.appendChild(div);
      }

      // probably 'dangerous', and holy balls gross
      var scripts = div.getElementsByTagName('script');
      for(var i=0; i < scripts.length; i++) {
        var script = scripts[i];
        if(script.src) {
          general.makeRequest(script.src, 'GET').then(function(request) {
            script.removeAttribute('src');
            script.innerHTML = request.responseText;
            eval(script.innerHTML)
          });
        } else {
          eval(script.innerHTML);
        }
      }
    });
  }
  promise.then(function() {
    setActiveTo(newHashUrl, true, false);
  });
};

var transition = function(firstElement, secondElement, transformType) {
  var i0 = Array.prototype.indexOf.call(wrapperElement.children, firstElement);
  var i1 = Array.prototype.indexOf.call(wrapperElement.children, secondElement);
  var transformType = transformType || (i0 > i1 ? 'slide' : 'sliderev');
  transitionInProgress = true;
  var f, s;
  return new Promise(function(resolve, reject) {
    return setTimeout(function() {
      f = firstElement.firstChild.getBoundingClientRect();
      s = secondElement.firstChild.getBoundingClientRect();
      var transform, inverseTransform;
      switch (transformType) {
        case "scale":
          inverseTransform = "scale(" + f.width / s.width + ", " + f.height / s.height + ")";
          transform = "scale(" + s.width / f.width + ", " + s.height / f.height + ")";
          break;
        case "slide":
          transform = "translateX(" + (f.left + f.width) + "px)";
          inverseTransform = "translateX(" + (-s.left - s.width) + "px)";
          break;
        case "sliderev":
          transform = "translateX(" + (-f.left - f.width) + "px)";
          inverseTransform = "translateX(" + (s.left + s.width) + "px)";
          break;

      }
      secondElement.firstChild.style.transform = inverseTransform;
      return setTimeout(function() {
        secondElement.classList.remove('ready');
        secondElement.classList.add('transitioning');
        secondElement.classList.add('active');
      
        firstElement.classList.add('transitioning');
        firstElement.classList.remove('active');

        firstElement.firstChild.style.transform = transform;
        secondElement.firstChild.style.transform = "";

        return setTimeout(function() {
          firstElement.firstChild.style.transform = "";
          firstElement.classList.remove('transitioning');
          secondElement.classList.remove('transitioning');
          transitionInProgress = false;
          return resolve();
        }, 500);
      }, 50);
    }, 50);
  });
};

var getTransitionType = function(rev) {
  //scale, slide
  //var value = transitionTypeElement.value;
  var value = "slide";
  if(rev && value === "slide") {
    return "sliderev";
  }
  return value;
};

var setActiveTo = function(loc, animate, _long) {
  var selector = '[hash-url="' + loc + '"]';
  var div = wrapperElement.querySelector('[hash-url="' + loc + '"]');
  if(!div) {
    return;
  }
  var oldDiv = wrapperElement.querySelector('.active');
  var loadingDiv = wrapperElement.querySelector('[hash-url="loading"]');

  if(div == oldDiv) {
    return;
  }
  if(!oldDiv) {
    // if nothing is active, set loc to active
    div.classList.add('active');

  } else if(animate && _long) {
    // if long running request / etc, load transition prior to loading next
    transition(oldDiv, loadingDiv).then(function() {
      setTimeout(function() {
        transition(loadingDiv, div);
      }, 1000);
    });
  } else if(animate) {
    transition(oldDiv, div);

  } else if (div !== oldDiv) {
    oldDiv.classList.remove('active');
    div.classList.add('active');
  }
};

var gameSelect = document.getElementById('game-select');
var gameNoun = document.getElementById('game-noun');
gameSelect.addEventListener('change', function(evt) {
  var newval;
  switch(gameSelect.value) {
    case "soccer":
      newval = "game";
      break;
    case "frisbe":
      newval = "game";
      break;
    case "swimming":
      newval = "meet";
      break;
    default: 
      newval = "game";
  }
  gameNoun.textContent = newval;
});

var startButton = document.getElementById('start-button');
startButton.addEventListener('click', function(evt) {
  var val;
  if(val=gameSelect.value) {
    window.location.hash = '/' + val + '/new';
  } else {
    alert("invalid game type");
  }
});
