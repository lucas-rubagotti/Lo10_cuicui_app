import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { Buffer } from 'buffer';

const API = 'http://127.0.0.1:5984/';

function App() {
  return (
    <>
      <header>
        <h1>Cuicui !</h1>
      </header>
      <Feed />
    </>
  );
}

function Feed() {
  const [tweets, setTweets] = useState([]);

  const fetchTweets = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => data.rows.map(row => row.doc))
      .then(docs => setTweets(docs.reverse()))
      .catch(err => console.error("Erreur fetch :", err));
  };

  const postTweet = (user, password, text) => {
    const id = uuid();
    const created_at = new Date().toUTCString();

    const tweet = {
      _id: id,
      user,
      text,
      created_at
    };

    // Optimiste
    setTweets([tweet, ...tweets]);

    fetch(API + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64')
      },
      body: JSON.stringify(tweet)
    })
      .then(fetchTweets)
      .catch(fetchTweets);
  };

  useEffect(fetchTweets, []);

  return (
    <main>
      <FutureTweet postTweet={postTweet} />
      {tweets.map(tweet => (
        <Tweet key={tweet._id} data={tweet} />
      ))}
    </main>
  );
}

function Tweet({ data }) {
  const { user, text, created_at } = data;
  return (
    <article className="tweet">
      <div className="user">👤 {user}</div>
      <div className="timestamp">🕒 {created_at}</div>
      <div className="text">{text}</div>
    </article>
  );
}

function FutureTweet({ postTweet }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !password || !text) return;
    postTweet(user, password, text);
    setUser('');
    setPassword('');
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Qui êtes-vous ?"
        value={user}
        onChange={e => setUser(e.target.value)}
      />
      <input
        placeholder="Quel est votre mot de passe ?"
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
      />
      <input
        placeholder="Quoi de neuf ?"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button type="submit">Publier</button>
    </form>
  );
}

export default App;
