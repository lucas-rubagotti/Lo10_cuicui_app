import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';

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
      .then(docs => setTweets(docs.reverse())) // pour afficher les plus récents en haut
      .catch(err => console.error("Erreur fetch :", err));
  };

  const postTweet = (user, text) => {
    const id = uuid();
    const newTweet = {
      _id: id,
      user,
      text,
      created_at: new Date().toUTCString()
    };

    // Mise à jour optimiste :
    setTweets([newTweet, ...tweets]);

    fetch(API + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTweet)
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
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !text) return;
    postTweet(user, text);
    setUser('');
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
        placeholder="Quoi de neuf ?"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button type="submit">Publier</button>
    </form>
  );
}

export default App;
