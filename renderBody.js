module.exports = function(tweets) {
  return `<body>
           <ul>${tweets.map(renderTweet).join('\n')}</ul>
         </body>`;
};

function renderTweet(tweet) {
  const retweet = tweet.retweeted_status;

  const time = tweet.created_at ? tweet.created_at.substr(8, 8) : 'When?';
  const data = JSON.stringify(tweet).replace(/'/g, '');
  const user = getUser(retweet, tweet);
  const image = getImages(retweet || tweet);

  const a = `<a href='/mark?id=${tweet.id_str}'>${time}</a>`;
  const i = getRetweeter(retweet, tweet);
  const b = `<b onclick='const data = ${data};console.log(data)'>${user}</b>`;
  const text = getText(retweet, tweet);
  const images = image && `<div>${image}</div>`;
  const quote = getQuote(retweet || tweet);

  return `<li>${a}${i}${b} ${text} ${images}${quote}<hr /></li>`;

  function getImages(d) {
    if (!d.extended_entities || !d.extended_entities.media) {
      return '';
    }

    return d.extended_entities.media
      .filter(isPhoto)
      .map(getImage)
      .join('');

    function isPhoto(img) {
      return (
        img.type === 'photo' ||
        img.type === 'video' ||
        img.type === 'animated_gif'
      );
    }

    function getImage(image) {
      const size = image.sizes.small;
      const width = size.w / 2;
      const height = size.h / 2;
      const small = `${image.media_url}:small`;
      const large = `${image.media_url}:large`;
      const img = `<img src="${small}" width="${width}" height="${height}" />`;
      const duration = getVideoLink(image.video_info, image.type);
      return `<a href="${large}">${img}</a>${duration}`;
    }

    function getVideoLink(info, imageType) {
      if (!info || !info.variants || !info.variants.length) return '';
      const best = info.variants.reduce(maxBitrate);
      const duration = info.duration_millis
        ? `${info.duration_millis}ms`
        : imageType;
      return `<a href="${best.url}">${duration}</a>`;
    }

    function maxBitrate(prev, cur) {
      return bitrate(cur) > bitrate(prev) ? cur : prev;
    }

    function bitrate(variant) {
      return variant.bitrate || 0;
    }
  }
}

function getUser(retweet, d) {
  return retweet && retweet.user
    ? retweet.user.screen_name
    : d.user
    ? d.user.screen_name
    : 'Who?';
}

function getRetweeter(retweet, d) {
  return retweet && d.user && d.user.screen_name
    ? ` <i>${d.user.screen_name}</i> `
    : ' ';
}

function getText(retweetStatus, tweetStatus) {
  const data = retweetStatus || tweetStatus;

  return data.entities
    ? data.entities.urls.reduce(replaceUrlWithLink, fullText(data))
    : fullText(data);

  function replaceUrlWithLink(text, url) {
    return text.replace(
      url.url,
      `<a href="${url.url}" target="_blank">${url.display_url || url.url}</a>`
    );
  }
}

function getQuote(d) {
  return d.quoted_status
    ? `<div class="quoted">${fullText(d.quoted_status)}</div>`
    : '';
}

function fullText(data) {
  return data.full_text && data.full_text.replace(/\n/g, '<br>');
}
