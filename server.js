/* eslint-disable no-console */
const express = require('express');
const Twitter = require('twitter');

const config = require('./key');
const renderBody = require('./renderBody');
const fauna = require('./fauna');

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
  const id_str = req.query.id;
  console.log('mark', id_str);
  await fauna.mark(db.ref, id_str);
  res.redirect('/');
});

app.get('/', async (req, res) => {
  db = await fauna.lastRead();
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

app.listen(2006, () => {
  console.log('App running on port 2006!');
});
