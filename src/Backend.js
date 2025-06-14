import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';

const API = 'http://localhost:5984';

export default function Backend() {
  this.credentials = {};

  const basicAuthentication = ({ force }) => {
    let { name, password } = this.credentials;
    if (!force && (!name || !password)) return {};
    return {
      Authorization: 'Basic ' + Buffer.from(`${name}:${password}`).toString('base64'),
    };
  };

  this.authenticate = ({ name, password }) => {
    this.credentials = { name, password };
    return fetch(API, {
      method: 'GET',
      headers: basicAuthentication({ force: true }),
    })
      .then((x) => x.json())
      .then((x) => {
        if (x.reason) {
          console.error(x.reason);
          this.credentials = {};
          return null;
        }
        return this.credentials.name;
      });
  };

  this.fetchTweets = () =>
    fetch(API)
      .then((x) => x.json())
      .then((x) => x.rows.map((y) => y.doc));

  this.postTweet = (text) => {
    let id = uuid();
    let user = this.credentials.name;
    return fetch(API + id, {
      method: 'PUT',
      headers: {
        ...basicAuthentication({ force: false }),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user, text, created_at: new Date().toUTCString() }),
    }).then(this.fetchTweets);
  };

  return this;
}
