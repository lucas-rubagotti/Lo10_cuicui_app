import { useState, useEffect } from 'react';
import Backend from './Backend';

const backend = new Backend();

function App() {
  return (
    <>
      <ReactNotifications />
      <header>
        <h1>Cuicui !</h1>
      </header>
      <Authenticated />
      <Feed />
    </>
  );
}

function Authenticated() {
  const [name, setName] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, password } = Object.fromEntries(new FormData(e.target).entries());
    backend.authenticate({ name, password }).then((result) => {
      if (result) {
        setName(result);
        Store.addNotification({
          title: 'Connexion réussie',
          message: `Bienvenue ${result}`,
          type: 'success',
          insert: 'top',
          container: 'top-right',
          dismiss: { duration: 2000 },
        });
      } else {
        Store.addNotification({
          title: 'Erreur de connexion',
          message: 'Identifiants incorrects',
          type: 'danger',
          insert: 'top',
          container: 'top-right',
          dismiss: { duration: 3000 },
        });
      }
    });
  };

  if (name) return <div className="authenticated">Connecté : {name}</div>;

  return (
    <form onSubmit={handleSubmit} className="authenticated">
      <input placeholder="nom d'utilisateur" name="name" required />
      <input placeholder="mot de passe" name="password" type="password" required />
      <button type="submit">Se connecter</button>
    </form>
  );
}

function Feed() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    backend.fetchTweets().then(setTweets);
  }, []);

  const handlePost = (text) => {
    backend.postTweet(text)
      .then(setTweets)
      .catch(() => {
        Store.addNotification({
          title: 'Erreur',
          message: 'Veuillez vous connecter pour publier',
          type: 'warning',
          insert: 'top',
          container: 'top-right',
          dismiss: { duration: 3000 },
        });
      });
  };

  return (
    <main>
      <FutureTweet onPost={handlePost} />
      {tweets.map((tweet) => (
        <Tweet key={tweet._id} data={tweet} />
      ))}
    </main>
  );
}

function FutureTweet({ onPost }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() === '') return;
    onPost(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Quoi de neuf ?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit">Publier</button>
    </form>
  );
}

function Tweet({ data }) {
  const { user, text, created_at } = data;
  return (
    <article className="tweet">
      <div className="user">{user}</div>
      <div className="timestamp">{created_at}</div>
      <div className="text">{text}</div>
    </article>
  );
}

export default App;
