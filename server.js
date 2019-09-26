/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const inspect = require('util-inspect');
const oauth = require('oauth');

const config = require('./key');
const renderBody = require('./renderBody');

const faunadb = require('faunadb');
const q = faunadb.query;

var client = new faunadb.Client({
  secret: config.fauna,
});

let db;
const app = express();

const consumer = new oauth.OAuth(
  'https://twitter.com/oauth/request_token',
  'https://twitter.com/oauth/access_token',
  config.twitterConsumerKey,
  config.twitterConsumerSecret,
  '1.0A',
  `${config.host}/sessions/callback`,
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
        `https://twitter.com/oauth/authorize?oauth_token=${req.session.oauthRequestToken}`
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

app.get('/mark', async (req, res) => {
  console.log('mark', req.query.id);
  try {
    await client.query(q.Replace(db.ref, { data: { id_str: req.query.id } }));
  } catch (e) {
    console.error(e);
  }
  res.redirect('/home');
});

app.get('/home', async (req, res) => {
  db = await lastRead();
  const params = [
    'tweet_mode=extended',
    'exclude_replies=true',
    'include_rts=true',
    `since_id=${db.data.id_str}`,
    'count=200',
  ];
  const timeline = '/1.1/statuses/home_timeline.json';

  consumer.get(
    `https://api.twitter.com${timeline}?${params.join('&')}`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    (error, data) => {
      console.log('got response');
      if (error) {
        console.log(error);
        if (error.statusCode === 429) {
          res.send(
            JSON.parse(error.data)
              .errors.map(error => error.message)
              .join()
          );
        } else {
          res.redirect('/sessions/connect');
        }
      } else {
        const parsedData = JSON.parse(data);
        parsedData.sort((t1, t2) => t1.id - t2.id);
        const content =
          'width=device-width, initial-scale=1.0, user-scalable=yes';
        const head = `
<head>
  <meta charset=utf-8>
  <meta name="viewport" content="${content}">
  <title>Twitter Express</title>
  <link rel = "stylesheet" type = "text/css" href = "s.css" />
</head>`;
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

async function lastRead() {
  try {
    const ret = await client.query(q.Get(q.Match(q.Index('all_last_read'))));
    console.log(ret);
    return ret;
  } catch (e) {
    console.error(e);
  }
}
