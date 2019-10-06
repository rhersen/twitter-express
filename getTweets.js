const Twitter = require('twitter');
const config = require('./key');

const client = new Twitter({
  consumer_key: config.twitterConsumerKey,
  consumer_secret: config.twitterConsumerSecret,
  access_token_key: config.twitterAccessToken,
  access_token_secret: config.twitterAccessTokenSecret,
});

module.exports = function getTweets(since_id, handleResponse) {
  client.get(
    'statuses/home_timeline',
    {
      tweet_mode: 'extended',
      exclude_replies: 'true',
      include_rts: 'true',
      since_id,
      count: '200',
    },
    handleResponse
  );
};
