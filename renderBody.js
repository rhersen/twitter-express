module.exports = function(tweets) {
  return `<body>
           <ol>${tweets.map(renderTweet).join('\n')}</ol>
         </body>`;
};

function renderTweet(d) {
  const rs = d.retweeted_status;
  let image = '';

  addImages(rs || d);

  const time = d.created_at ? d.created_at.substr(8, 8) : 'When?';
  const data = JSON.stringify(d).replace(/'/g, '');
  const user =
    rs && rs.user ? rs.user.screen_name : d.user ? d.user.screen_name : 'Who?';
  const a = `<a href='/mark?id=${d.id_str}'>${time}</a>`;
  const i =
    rs && d.user && d.user.screen_name ? ` <i>${d.user.screen_name}</i> ` : ' ';
  const b = `<b onclick='const data = ${data};console.log(data)'>${user}</b>`;
  const text = rs ? rs.full_text : d.full_text;

  return `<li>${a}${i}${b} ${text} ${image}</li>`;

  function addImages(d) {
    if (d.extended_entities && d.extended_entities.media) {
      d.extended_entities.media.filter(isPhoto).forEach(addImage);
    }
  }

  function addImage(img) {
    const size = img.sizes.small;
    const width = size.w / 2;
    const height = size.h / 2;
    const src = `${img.media_url}:small`;
    image += `<img src="${src}" width="${width}" height="${height}" />`;
  }
}

function isPhoto(img) {
  return img.type === 'photo';
}
