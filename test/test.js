const expect = require('chai').expect;
const renderBody = require('../renderBody');

describe('renderBody', () => {
  it('empty', () => {
    expect(renderBody([{}])).to.match(
      /<ol><li><i>When.<.i> <b>Who.<.b> undefined <.li><.ol>/
    );
  });

  it('shows when, who and what', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          text: 'What',
          user: { screen_name: 'tjholowaychuk' },
        },
      ])
    ).to.match(/<ol><li><i>11 06:28<.i> <b>tjholowaychuk<.b> What <.li><.ol>/);
  });

  it('images', () => {
    expect(
      renderBody([
        {
          created_at: 'Thu Jan 11 06:28:27 +0000 2018',
          text: 'What',
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
    ).to.match(
      /<ol><li><i>11 06:28<.i> <b>tjholowaychuk<.b> What <img src="http:..pbs.twimg.com.1.jpg:small" width="240" height="140" .><img src="http:..pbs.twimg.com.2.jpg:small" width="240" height="140" .><.li><.ol>/
    );
  });
});
