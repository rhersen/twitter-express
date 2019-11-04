import config from './key.js';
import faunadb from 'faunadb';

const q = faunadb.query;

const faunaClient = new faunadb.Client({
  secret: config.fauna,
});

async function lastRead() {
  try {
    const ret = await faunaClient.query(
      q.Get(q.Match(q.Index('all_last_read')))
    );
    console.log(ret);
    return ret;
  } catch (e) {
    console.error(e);
  }
}

async function mark(ref, id_str) {
  try {
    await faunaClient.query(q.Replace(ref, { data: { id_str } }));
  } catch (e) {
    console.error(e);
  }
}

export default { lastRead, mark };
