const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-match'));

const renderBody = require('../renderBody');

describe('renderBody', () => {
  it('empty', () => {
    expect(renderBody([{}]))
      .to.match(/<ul><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <hr .><.li><.ul>/)
      .and.capture(0)
      .equals('When?')
      .and.capture(1)
      .equals('Who?')
      .and.capture(2)
      .equals('undefined');
  });

  it('shows when, who and what', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          full_text: 'What',
          user: { screen_name: 'tjholowaychuk' },
        },
      ])
    )
      .to.match(/<ul><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <hr .><.li><.ul>/)
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('tjholowaychuk')
      .and.capture(2)
      .equals('What');
  });

  it('shows line breaks', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          full_text: 'line1\nline2\nline3',
          user: { screen_name: 'tjholowaychuk' },
        },
      ])
    )
      .to.match(/<ul><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <hr .><.li><.ul>/m)
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('tjholowaychuk')
      .and.capture(2)
      .equals('line1<br>line2<br>line3');
  });

  it('renders retweet', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          full_text: 'abbreviated',
          user: { screen_name: 'retweeter' },
          retweeted_status: {
            created_at: 'Thu Jan 11 06:28:27 +0000 2018',
            full_text: 'full',
            user: { screen_name: 'actual' },
          },
        },
      ])
    )
      .to.match(
        /<ul><li><a.*>(.*)<.a> <i>(.*)<.i> <b.*>(.*)<.b> (.*) <hr .><.li><.ul>/
      )
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('retweeter')
      .and.capture(2)
      .equals('actual')
      .and.capture(3)
      .equals('full');
  });

  it('renders quoted', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          full_text: 'abbreviated',
          user: { screen_name: 'retweeter' },
          quoted_status: {
            created_at: 'Thu Jan 11 06:28:27 +0000 2018',
            full_text: 'quote',
            user: { screen_name: 'actual' },
          },
        },
      ])
    )
      .to.match(
        /<ul><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <div class="quoted">(.*)<.div><hr .><.li><.ul>/
      )
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('retweeter')
      .and.capture(2)
      .equals('abbreviated')
      .and.capture(3)
      .equals('quote');
  });

  it('renders quote in retweet', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          full_text: 'abbreviated',
          user: { screen_name: 'retweeter' },
          retweeted_status: {
            created_at: 'Thu Jan 11 06:28:27 +0000 2018',
            full_text: 'full',
            quoted_status: {
              created_at: 'Thu Jan 11 06:28:27 +0000 2018',
              full_text: 'quote',
              user: { screen_name: 'actual' },
            },
            user: { screen_name: 'actual' },
          },
        },
      ])
    )
      .to.match(
        /<ul><li><a.*>(.*)<.a> <i>(.*)<.i> <b.*>(.*)<.b> (.*) <div class="quoted">(.*)<.div><hr .><.li><.ul>/
      )
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('retweeter')
      .and.capture(2)
      .equals('actual')
      .and.capture(3)
      .equals('full');
  });

  it('images', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          full_text: 'What',
          user: { screen_name: 'tjholowaychuk' },
          extended_entities: {
            media: [
              {
                media_url: 'http://pbs.twimg.com/1.jpg',
                type: 'photo',
                sizes: {
                  large: { w: 1574, h: 506, resize: 'fit' },
                  small: { w: 480, h: 280, resize: 'fit' },
                  thumb: { w: 150, h: 150, resize: 'crop' },
                },
              },
              {
                media_url: 'http://pbs.twimg.com/2.jpg',
                type: 'photo',
                sizes: {
                  large: { w: 1574, h: 506, resize: 'fit' },
                  small: { w: 480, h: 280, resize: 'fit' },
                  thumb: { w: 150, h: 150, resize: 'crop' },
                },
              },
            ],
          },
        },
      ])
    )
      .to.match(
        /<ul><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <div><a href="(.*)"><img src="(.*)" width="(.*)" height="(.*)" .><.a><a href="(.*)"><img src="(.*)" width="(.*)" height="(.*)" .><.a><.div><hr .><.li><.ul>/
      )
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('tjholowaychuk')
      .and.capture(2)
      .equals('What')
      .and.capture(3)
      .equals('http://pbs.twimg.com/1.jpg:large')
      .and.capture(4)
      .equals('http://pbs.twimg.com/1.jpg:small')
      .and.capture(5)
      .equals('240')
      .and.capture(6)
      .equals('140')
      .and.capture(7)
      .equals('http://pbs.twimg.com/2.jpg:large')
      .and.capture(8)
      .equals('http://pbs.twimg.com/2.jpg:small')
      .and.capture(9)
      .equals('240')
      .and.capture(10)
      .equals('140');
  });

  it('video', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          full_text: 'What',
          user: { screen_name: 'tjholowaychuk' },
          extended_entities: {
            media: [
              {
                media_url: 'http://pbs.twimg.com/1.jpg',
                type: 'video',
                sizes: {
                  large: { w: 1574, h: 506, resize: 'fit' },
                  small: { w: 480, h: 280, resize: 'fit' },
                  thumb: { w: 150, h: 150, resize: 'crop' },
                },
                video_info: {
                  duration_millis: 47076,
                  variants: [
                    { bitrate: 256000, url: 'https://video.com/0s.mp4' },
                    { bitrate: 1280000, url: 'https://video.com/1m.mp4' },
                    { bitrate: 832000, url: 'https://video.com/fs.mp4' },
                    { url: 'https://video.com/MAaJfD6YdY91wZ.m3u8' },
                  ],
                },
              },
            ],
          },
        },
      ])
    )
      .to.match(
        /<ul><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <div><a href="(.*)"><img src="(.*)" width="(.*)" height="(.*)" .><.a><a href="(.*)">(.*)<.a><.div><hr .><.li><.ul>/
      )
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('tjholowaychuk')
      .and.capture(2)
      .equals('What')
      .and.capture(3)
      .equals('http://pbs.twimg.com/1.jpg:large')
      .and.capture(4)
      .equals('http://pbs.twimg.com/1.jpg:small')
      .and.capture(5)
      .equals('240')
      .and.capture(6)
      .equals('140')
      .and.capture(7)
      .equals('https://video.com/1m.mp4')
      .and.capture(8)
      .equals('47076ms');
  });

  it('shows images from retweet', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          user: { screen_name: 'tjholowaychuk' },
          extended_entities: {
            media: [
              {
                media_url: 'http://pbs.twimg.com/1.jpg',
                type: 'photo',
                sizes: {
                  thumb: { w: 150, h: 150, resize: 'crop' },
                  small: { w: 480, h: 280, resize: 'fit' },
                },
              },
            ],
          },
          retweeted_status: {
            full_text: 'What',
            extended_entities: {
              media: [
                {
                  media_url: 'http://pbs.twimg.com/2.jpg',
                  type: 'photo',
                  sizes: {
                    thumb: { w: 150, h: 150, resize: 'crop' },
                    small: { w: 480, h: 280, resize: 'fit' },
                  },
                },
              ],
            },
          },
        },
      ])
    )
      .to.match(
        /<ul><li><a.*>(.*)<.a> <i>(.*)<.i> <b.*>.*<.b> (.*) <div>.*<img src="(.*)" width="(.*)" height="(.*)" .>.*<.div><hr .><.li><.ul>/
      )
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('tjholowaychuk')
      .and.capture(2)
      .equals('What')
      .and.capture(3)
      .equals('http://pbs.twimg.com/2.jpg:small')
      .and.capture(4)
      .equals('240')
      .and.capture(5)
      .equals('140');
  });

  it('one url', () => {
    expect(
      renderBody([
        {
          full_text: 'before https://t.co/url1',
          entities: {
            urls: [
              {
                url: 'https://t.co/url1',
                indices: [7, 24],
                display_url: 'johndcook.com/blog/2010/01/1…',
              },
            ],
          },
        },
      ])
    )
      .to.match(/<ul><li><a.*>.*<.a> <b.*>.*<.b> (.*) <hr .><.li><.ul>/)
      .and.capture(0)
      .equals(
        'before <a href="https://t.co/url1" target="_blank">johndcook.com/blog/2010/01/1…</a>'
      );
  });

  it('two urls', () => {
    expect(
      renderBody([
        {
          full_text: 'before https://t.co/url1 between https://t.co/url2',
          entities: {
            urls: [
              {
                url: 'https://t.co/url1',
                indices: [7, 24],
                display_url: 'johndcook.com/1…',
              },
              {
                url: 'https://t.co/url2',
                indices: [33, 50],
                display_url: 'johndcook.com/2…',
              },
            ],
          },
        },
      ])
    )
      .to.match(/<ul><li><a.*>.*<.a> <b.*>.*<.b> (.*) <hr .><.li><.ul>/)
      .and.capture(0)
      .equals(
        'before <a href="https://t.co/url1" target="_blank">johndcook.com/1…</a> between <a href="https://t.co/url2" target="_blank">johndcook.com/2…</a>'
      );
  });

  it('urls in retweet', () => {
    expect(
      renderBody([
        {
          full_text:
            'RT @GuardianBooks: A life in quotes: Ursula K Le Guin https://t.co/FEPOtUZuRd',
          entities: {
            urls: [{ url: 'https://t.co/FEPOtUZuRd', indices: [54, 77] }],
          },
          retweeted_status: {
            full_text:
              'A life in quotes: Ursula K Le Guin https://t.co/FEPOtUZuRd',
            entities: {
              urls: [{ url: 'https://t.co/FEPOtUZuRd', indices: [35, 58] }],
            },
          },
        },
      ])
    )
      .to.match(/<ul><li><a.*>.*<.a> <b.*>.*<.b> (.*) <hr .><.li><.ul>/)
      .and.capture(0)
      .equals(
        'A life in quotes: Ursula K Le Guin <a href="https://t.co/FEPOtUZuRd" target="_blank">https://t.co/FEPOtUZuRd</a>'
      );
  });
});
