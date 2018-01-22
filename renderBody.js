module.exports = function(tweets) {
  return `<body>
           <ol>${tweets.map(renderTweet).join('\n')}</ol>
         </body>`;
};

function renderTweet(d) {
  const time = d.created_at ? d.created_at.substr(8, 8) : 'When?';
  const user = d.user ? d.user.screen_name : 'Who?';
  const text = d.full_text;
  let image = '';

  function addImage(img) {
    const size = img.sizes.small;
    image += `<img src="${img.media_url}:small" width="${size.w /
      2}" height="${img.sizes.small.h / 2}" />`;
  }

  if (d.entities && d.entities.media) {
    d.entities.media.filter(img => img.type === 'photo').forEach(addImage);
  } else if (
    d.retweeted_status &&
    d.retweeted_status.entities &&
    d.retweeted_status.entities.media
  ) {
    d.retweeted_status.entities.media
      .filter(img => img.type === 'photo')
      .forEach(addImage);
  }

  const data = JSON.stringify(d).replace(/'/g, '');
  return `<li><a href='/mark?id=${
    d.id_str
  }'>${time}</a> <b onclick='const data = ${data};console.log(data)'>${user}</b> ${text} ${image}</li>`;
}
