import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:5984';

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

  // 1. Fonction de récupération des tweets
  const fetchTweets = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => data.rows.map(row => row.doc))
      .then(docs => {
        console.log(docs);     // 👈 Ajoute ceci
        setTweets(docs);
      })      
      .catch(err => console.error("Erreur fetch :", err));
  };

  // 2. Appel automatique au premier rendu
  useEffect(fetchTweets, []);

  // 3. Affichage des tweets
  return (
    <main>
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

export default App;
