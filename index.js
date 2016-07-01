module.exports = function(robot) {
  var event = {
    'summary': 'Google I/O 2015',
    'location': '800 Howard St., San Francisco, CA 94103',
    'description': 'A chance to hear more about Google\'s developer products.',
    'start': {
      'dateTime': '2016-06-16T09:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'end': {
      'dateTime': '2016-06-16T17:00:00-07:00',
      'timeZone': 'America/Los_Angeles',
    },
    'recurrence': [
      'RRULE:FREQ=DAILY;COUNT=2'
    ],
    'attendees': [
      {'email': 'lpage@example.com'},
      {'email': 'sbrin@example.com'},
    ],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10},
      ],
    },
  };

  var fs = require('fs');
  var readline = require('readline');
  var google = require('googleapis');
  var googleAuth = require('google-auth-library');


  var SCOPES = ['https://www.googleapis.com/auth/calendar'];
  var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
      process.env.USERPROFILE) + '/.credentials/';
  var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   *
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
  	var auth = new googleAuth();
  	var clientSecret = credentials.installed.client_secret;
  	var clientId = credentials.installed.client_id;
  	var redirectUrl = credentials.installed.redirect_uris[0];

  	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  	// Check if we have previously stored a token.
  	fs.readFile(TOKEN_PATH, function(err, token) {
  	if (err) {
  	  //getNewToken(oauth2Client, callback);
      return "erro: " + err;
  	} else {
  	  oauth2Client.credentials = JSON.parse(token);
  	  return callback(oauth2Client);
  	}
  	});
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback to call with the authorized
   *     client.
   */
  function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        callback(oauth2Client);
      });
    });
  }

  /**
   * Store token to disk be used in later program executions.
   *
   * @param {Object} token The token to store to disk.
   */
  function storeToken(token) {
    try {
      fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
      if (err.code != 'EEXIST') {
        throw err;
      }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
  }

  /**
   * Lists the next 10 events on the user's primary calendar.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listEvents(auth) {
    var calendar = google.calendar('v3');
    var result;
    calendar.events.list({
      auth: auth,
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime'
    }, function(err, response) {
      if (err) {
        //console.log('The API returned an error: ' + err);
        return 'The API returned an error: ' + err;
      }
      var events = response.items;
      if (events.length == 0) {
        //console.log('No upcoming events found.');
        return 'No upcoming events found.';
      } else {
        //console.log('Upcoming 10 events:');
        result = 'Upcoming 10 events:\n';
        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          var start = event.start.dateTime || event.start.date;
          //console.log('%s - %s', start, event.summary);
          result+= start + " - " + event.summary +'\n';
        }
        return result;
      }
    });
  }

  function createEvento(auth){
  	var calendar = google.calendar('v3');
  	calendar.events.insert({
  	  auth: auth,
  	  calendarId: 'primary',
  	  resource: event,
  	}, function(err, event) {
  	  if (err) {
  	    //console.log('There was an error contacting the Calendar service: ' + err);
  	    return 'There was an error contacting the Calendar service: ' + err;
  	  }
  	  //console.log('Event created: %s', event.htmlLink);
      return 'Event created: ' + event.htmlLink;
  	});
  }


  robot.respond(/hello Nestor/, function(msg, done) {
    msg.reply("hello back", done);
  });

  robot.respond("/crie um evento (.*)/i", function(msg, done){
    msg.reply("Criando evento...").then(function(){
      /*
      msg.send("Coisas em msg.match");

      for (var message in msg.match){
        msg.send(message);
      }

      msg.send(msg.match[1]);

      msg.send("Fim das coisas em msg.match");
      msg.send(JSON.stringify(event),done);
      */
      msg.send("mentira",done);

    });
  });

  var resultado;

  function processClientSecrets(err, content) {
    if (err) {
      //console.log('Error loading client secret file: ' + err);
      return 'Error loading client secret file: ' + err;
    }
    // Authorize a client with the loaded credentials, then call the
    // Google Calendar API.
    resultado = authorize(JSON.parse(content), listEvents);
    return resultado;
  }


  robot.respond("/liste eventos/i", function(msg, done){
    var retorno = "";
    // Load client secrets from a local file.
    retorno = fs.readFile('client_secret.json', processClientSecrets);
    if(retorno instanceof String){
      msg.reply(retorno, done);
    }
    else{
      msg.reply("algo de errado nao está certo " + resultado + " " + typeof(resultado));
      msg.reply("Something went wrong " + typeof(retorno), done);
    }
  });
};
