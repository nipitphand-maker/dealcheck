(function () {
  var lang = (navigator.language || '').toLowerCase();
  if (lang.startsWith('th')) return;
  var p = location.pathname;
  if (p === '/' || p === '/index.html') location.replace('/en/');
  else if (p === '/landing' || p === '/landing.html') location.replace('/en/landing');
})();
