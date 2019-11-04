import express from 'express';
import getTweets from './getTweets.js';
import renderBody from './renderBody.js';
import fauna from './fauna.js';

let db;
const app = express();

app.use(express.static('public'));

app.get('/mark', async (req, res) => {
  const id_str = req.query.id;
  console.log('mark', id_str);
  if (!db) {
    db = await fauna.lastRead(); // eslint-disable-line require-atomic-updates
  }
  await fauna.mark(db.ref, id_str);
  res.redirect('/');
});

app.get('/', async (req, res) => {
  const content = 'width=device-width, initial-scale=1.0, user-scalable=yes';
  const head = `
<head>
  <meta charset=utf-8>
  <meta name="viewport" content="${content}">
  <title>Twitter Express</title>
  <link rel = "stylesheet" type = "text/css" href = "s.css" />
</head>`;

  db = await fauna.lastRead();

  if (!db) {
    res.send(
      `<!doctype html><html lang=en>${head}<body><ul>could not read from database</ul></body></html>`
    );
  }

  getTweets(db.data.id_str, (error, data, response) => {
    console.log('got response');
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
