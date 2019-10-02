/* eslint-disable no-console */
const express = require('express');
const Twitter = require('twitter');

const config = require('./key');
const renderBody = require('./renderBody');

const faunadb = require('faunadb');
const q = faunadb.query;

const faunaClient = new faunadb.Client({
  secret: config.fauna,
});

let db;
const app = express();

const client = new Twitter({
  consumer_key: config.twitterConsumerKey,
  consumer_secret: config.twitterConsumerSecret,
  access_token_key: config.twitterAccessToken,
  access_token_secret: config.twitterAccessTokenSecret,
});

app.use(express.static('public'));

app.get('/mark', async (req, res) => {
  console.log('mark', req.query.id);
  try {
    await faunaClient.query(
      q.Replace(db.ref, { data: { id_str: req.query.id } })
    );
  } catch (e) {
    console.error(e);
  }
  res.redirect('/home');
});

app.get('/home', async (req, res) => {
  db = await lastRead();
  const params = {
    tweet_mode: 'extended',
    exclude_replies: 'true',
    include_rts: 'true',
    since_id: db.data.id_str,
    count: '200',
  };

  client.get('statuses/home_timeline', params, (error, data, response) => {
    console.log('got response');
    const content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
    const head = `
<head>
  <meta charset=utf-8>
  <meta name="viewport" content="${content}">
  <title>Twitter Express</title>
  <link rel = "stylesheet" type = "text/css" href = "s.css" />
</head>`;
    if (error) {
      console.log(error, response.body);
      if (error.statusCode === 429) {
        res.send(
          JSON.parse(error.data)
            .errors.map(error => error.message)
            .join()
        );
      } else {
        res.send(
          `<!doctype html><html lang=en>${head}<body><ul>${error.map(
            err => `<li>${err.message}</li>`
          )}</ul></body></html>`
        );
      }
    } else {
      const parsedData = data;
      parsedData.sort((t1, t2) => t1.id - t2.id);
      const body = renderBody(parsedData);
      res.send(`<!doctype html><html lang=en>${head}${body}</html>`);
    }
  });
});

app.get('*', (req, res) => {
  res.redirect('/home');
});

app.listen(2006, () => {
  console.log('App running on port 2006!');
});

async function lastRead() {
  try {
    const ret = await faunaClient.query(
      q.Get(q.Match(q.Index('all_last_read')))
    );
    console.log(ret);
    return ret;
  } catch (e) {
    console.error(e);
  }
}
