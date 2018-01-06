const express = require('express');
const request = require('superagent');
const key = require('./key');

const app = express();

app.get('/tweets', async (_, outgoing) => {
  const uri = `https://api.twitter.com/1.1/statuses/user_timeline.json?${[
    'user_id=1841700720',
    'exclude_replies=true',
    'include_rts=false',
    'count=200',
    'since_id=446228899090137087',
  ].join('&')}`;
  try {
    const incoming = await request
      .get(uri)
      .set('authorization', `Bearer ${key()}`);
    outgoing.json(incoming.body);
  } catch (e) {
    outgoing.status(400).json(e.response.body);
  }
});

app.use(express.static(`${__dirname}/public`));

const port = 3747;
app.listen(port);
// eslint-disable-next-line no-console
console.log(`Listening on port ${port}`);
