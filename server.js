/* eslint-disable no-console */
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const inspect = require('util-inspect');
const oauth = require('oauth');

const key = require('./key');

const app = express();

const consumer = new oauth.OAuth(
  'https://twitter.com/oauth/request_token',
  'https://twitter.com/oauth/access_token',
  key.twitterConsumerKey,
  key.twitterConsumerSecret,
  '1.0A',
  'http://localhost:8080/sessions/callback',
  'HMAC-SHA1'
);

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
      console.log('Double check on 2nd step');
      console.log('------------------------');
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
  console.log('------------------------');
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
  consumer.get(
    `https://api.twitter.com/1.1/statuses/home_timeline.json?${[
      'exclude_replies=true',
      'include_rts=false',
      'count=200',
    ].join('&')}`,
    req.session.oauthAccessToken,
    req.session.oauthAccessTokenSecret,
    (error, data) => {
      if (error) {
        //console.log(error)
        res.redirect('/sessions/connect');
      } else {
        const parsedData = JSON.parse(data);
        const head = '<head><meta charset=utf-8><title>blah</title></head>';
        res.send(
          `<!doctype html><html lang=en>${head}<body>
             <p>${JSON.stringify(parsedData[4])}</p>
             <ol>${parsedData
               .map(d => {
                 const time = d.created_at.substr(8, 8);
                 const user = d.user.screen_name;
                 const text = d.text;
                 let image = '';

                 if (
                   d.entities.media &&
                   d.entities.media[0] &&
                   d.entities.media[0].type === 'photo'
                 )
                   image = `<img src="${
                     d.entities.media[0].media_url
                   }:small" />`;

                 return `<li><i>${time}</i> <b>${user}</b> ${text} ${image}</li>`;
               })
               .join('\n')}</ol>
           </body></html>`
        );
      }
    }
  );
});

app.get('*', (req, res) => {
  res.redirect('/home');
});

app.listen(8080, () => {
  console.log('App running on port 8080!');
});
