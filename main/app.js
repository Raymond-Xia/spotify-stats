var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'CLIENT_ID'; // Your client id
var client_secret = 'CLIENT_SECRET'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var TOKEN = 'TOKEN'; // Your user-top-view token

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        TOKEN = body.access_token,
        refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + TOKEN },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: TOKEN,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/top/tracks/short', function(req, res) {
  console.log(TOKEN);
  var token = TOKEN;
  authOptions = {
    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };
  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var items = body.items;
      res.send({
        'items': items
      });
    }
  });
  
});

app.get('/top/tracks/medium', function(req, res) {
  var token = TOKEN;
  authOptions = {
    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=medium_term',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };
  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var items = body.items;
      res.send({
        'items': items
      });
    }
  });
});
  
app.get('/top/tracks/long', function(req, res) {
  var token = TOKEN;
  authOptions = {
    url: 'https://api.spotify.com/v1/me/top/tracks?time_range=long_term',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };
  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var items = body.items;
      res.send({
        'items': items
      });
    }
  });
});

app.get('/top/artists/short', function(req, res) {
  var token = TOKEN;
  authOptions = {
    url: 'https://api.spotify.com/v1/me/top/artists?time_range=short_term',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };
  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var items = body.items;
      res.send({
        'items': items
      });
    }
  });
  
});

app.get('/top/artists/medium', function(req, res) {
  var token = TOKEN;
  authOptions = {
    url: 'https://api.spotify.com/v1/me/top/artists?time_range=medium_term',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };
  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var items = body.items;
      res.send({
        'items': items
      });
    }
  });
  
});

app.get('/top/artists/long', function(req, res) {
  var token = TOKEN;
  authOptions = {
    url: 'https://api.spotify.com/v1/me/top/artists?time_range=long_term',
    headers: { 'Authorization': 'Bearer ' + token },
    json: true
  };
  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var items = body.items;
      res.send({
        'items': items
      });
    }
  });
  
});

console.log('Listening on 8888');
app.listen(8888);
