/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const inspect = require('util-inspect');
const oauth = require('oauth');

const key = require('./key');
const renderBody = require('./renderBody');

const app = express();

const consumer = new oauth.OAuth(
  'https://twitter.com/oauth/request_token',
  'https://twitter.com/oauth/access_token',
  key.twitterConsumerKey,
  key.twitterConsumerSecret,
  '1.0A',
  'http://twitter.hersen.name/sessions/callback',
  'HMAC-SHA1'
);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(
  session({ secret: 'very secret', resave: false, saveUninitialized: true })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.get('/sessions/connect', (req, res) => {
  consumer.getOAuthRequestToken((error, oauthToken, oauthTokenSecret) => {
    if (error) {
      res.send(`Error getting OAuth request token : ${inspect(error)}`, 500);
    } else {
      req.session.oauthRequestToken = oauthToken;
      req.session.oauthRequestTokenSecret = oauthTokenSecret;
      console.log('in connect');
      console.log(`<<${req.session.oauthRequestToken}`);
      console.log(`<<${req.session.oauthRequestTokenSecret}`);
      res.redirect(
        `https://twitter.com/oauth/authorize?oauth_token=${
          req.session.oauthRequestToken
        }`
      );
    }
  });
});

app.get('/sessions/callback', (req, res) => {
  console.log('in callback');
  console.log(`>>${req.session.oauthRequestToken}`);
  console.log(`>>${req.session.oauthRequestTokenSecret}`);
  console.log(`>>${req.query.oauth_verifier}`);
  consumer.getOAuthAccessToken(
    req.session.oauthRequestToken,
    req.session.oauthRequestTokenSecret,
    req.query.oauth_verifier,
    (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
      if (error) {
        res.send(
          `Error getting OAuth access token : ${inspect(
            error
          )}[${oauthAccessToken}]` +
            `[${oauthAccessTokenSecret}]` +
            `[${inspect(results)}]`,
          500
        );
      } else {
        req.session.oauthAccessToken = oauthAccessToken;
        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

        res.redirect('/home');
      }
    }
  );
});

app.get('/home', (req, res) => {
  const timeline = `https://api.twitter.com/1.1/statuses/home_timeline.json?${[
    'tweet_mode=extended',
    'exclude_replies=true',
    'include_rts=true',
    'count=100',
  ].join('&')}`;

  consumer.get(
    timeline,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    (error, data) => {
      console.log('got response');
      if (error) {
        console.log(error);
        res.redirect('/sessions/connect');
      } else {
        const parsedData = JSON.parse(data);
        parsedData.sort((t1, t2) => t1.id - t2.id);
        const head =
          '<head><meta charset=utf-8><meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes"><title>blah</title><link rel = "stylesheet" type = "text/css" href = "s.css" /></head>\n</head>';
        const body = renderBody(parsedData);
        res.send(`<!doctype html><html lang=en>${head}${body}</html>`);
      }
    }
  );
});

app.get('*', (req, res) => {
  res.redirect('/home');
});

app.listen(2006, () => {
  console.log('App running on port 2006!');
});
