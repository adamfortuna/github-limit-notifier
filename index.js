// node index.js --mins=5 --used=500
// Will hit the GitHub API every 5 minutes and only send a notification
// if more than 500 API calls were used.
// Note: 5 minutes / 500 used are the defaults as well

var argv = require('optimist').argv,
    Notification = require('node-notifier'),
    request = require('request'),
    token = require('./token.js'),
    notifier = new Notification();

var minutesBetweenRequests = argv.mins ? +argv.mins*60000 : 60000*5;
var used = argv.used ? argv.used : 500;

if(argv.match) {
  challenges = filterForMatch(argv.match, challenges);
}


var options = {
  "url": "https://api.github.com/rate_limit",
  "headers": {
    "Authorization": "token "+token,
    "User-Agent": "request"
  }
}

function makeRequest() {
  request(options, function (error, response, body) {
    if (error) {
      console.log(new Date() + ' | Error: ' + JSON.stringify(error));
      notifier.notify({ message: 'Error : ' + body });
    } else {
      try {
        var res = JSON.parse(body),
            remaining = res.rate.remaining;
            limit = res.rate.remaining,
            used = limit - remaining;
        console.log(new Date() + " | Limit: " + limit + " | Remaining: " + remaining + " | Used: " + used);
        if(remaining < 12000) {
          notifier.notify({ message: remaining + '/'+ limit + ' used ('+used+').' });
        }
      } catch(e) {
        notifier.notify({ message: 'Unable to parse : ' + body });
      }
    }

    setTimeout(makeRequest, minutesBetweenRequests);
  });
}

console.log('Checking GitHub every ' + minutesBetweenRequests/60000 + ' minutes. Notifications if more than ' + used + ' API calls are made.');
makeRequest();
