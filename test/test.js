const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-match'));

const renderBody = require('../renderBody');

describe('renderBody', () => {
  it('empty', () => {
    expect(renderBody([{}]))
      .to.match(/<ol><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <.li><.ol>/)
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
      .to.match(/<ol><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <.li><.ol>/)
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('tjholowaychuk')
      .and.capture(2)
      .equals('What');
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
        // /<ol><li>.*11 06:28<..> <i>retweeter<.i> <b.*>actual<.b> full <.li><.ol>/
        /<ol><li><a.*>(.*)<.a> <i>(.*)<.i> <b.*>(.*)<.b> (.*) <.li><.ol>/
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
          entities: {
            media: [
              {
                media_url: 'http://pbs.twimg.com/1.jpg',
                type: 'photo',
                sizes: {
                  thumb: { w: 150, h: 150, resize: 'crop' },
                  small: { w: 480, h: 280, resize: 'fit' },
                },
              },
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
      ])
    )
      .to.match(
        /<ol><li><a.*>(.*)<.a> <b.*>(.*)<.b> (.*) <img src="(.*)" width="(.*)" height="(.*)" .><img src="(.*)" width="(.*)" height="(.*)" .><.li><.ol>/
      )
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('tjholowaychuk')
      .and.capture(2)
      .equals('What')
      .and.capture(3)
      .equals('http://pbs.twimg.com/1.jpg:small')
      .and.capture(4)
      .equals('240')
      .and.capture(5)
      .equals('140')
      .and.capture(6)
      .equals('http://pbs.twimg.com/2.jpg:small')
      .and.capture(7)
      .equals('240')
      .and.capture(8)
      .equals('140');
  });

  it('shows images from retweet', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          user: { screen_name: 'tjholowaychuk' },
          retweeted_status: {
            full_text: 'What',
            entities: {
              media: [
                {
                  media_url: 'http://pbs.twimg.com/1.jpg',
                  type: 'photo',
                  sizes: {
                    thumb: { w: 150, h: 150, resize: 'crop' },
                    small: { w: 480, h: 280, resize: 'fit' },
                  },
                },
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
        /<ol><li><a.*>(.*)<.a> <i>(.*)<.i> <b.*>.*<.b> (.*) <img src="(.*)" width="(.*)" height="(.*)" .><img src="(.*)" width="(.*)" height="(.*)" .><.li><.ol>/
      )
      .and.capture(0)
      .equals('11 06:28')
      .and.capture(1)
      .equals('tjholowaychuk')
      .and.capture(2)
      .equals('What')
      .and.capture(3)
      .equals('http://pbs.twimg.com/1.jpg:small')
      .and.capture(4)
      .equals('240')
      .and.capture(5)
      .equals('140')
      .and.capture(6)
      .equals('http://pbs.twimg.com/2.jpg:small')
      .and.capture(7)
      .equals('240')
      .and.capture(8)
      .equals('140');
  });
});
