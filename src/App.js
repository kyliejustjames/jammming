import React, { useState, useEffect, use } from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResults from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import Spotify from './spotify';
import './App.css';
import styles from './components/App/App.module.css';
import spotify from './spotify';

let appInit = false;

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState('My Awesome Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(spotify.isAuthenticated());

  useEffect(() => {
    // Check to make sure we haven't already initialized. For rationale, see:
    // https://react.dev/learn/you-might-not-need-an-effect#initializing-the-application
    if (appInit) {
      return;
    }
    appInit = true;
    // On page load, let's see if we were redirected here from Spotify's oath API.
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    // We were redirected here from Spotify so handle code accordingly
    if (code) {
      console.log('getting access token');
      spotify.getAccessToken(code).then(() => {
        // We are authorized
        setIsAuthorized(true);
        // Clear querystring
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, []);

  /** 
   * Attempt to authenticate with spotify. Will redirect user to spotify's oath login page, 
   * which will ask for permission and redirect them here with a code.
   */
  const authenticateWithSpotify = () => {
    spotify.redirectToSpotifyForAuthCode();
  }

  const searchSpotify = (term) => {
    Spotify.search(term).then(results => {
      setSearchResults(results);
    });
  };

  const addTrack = (track) => {
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks([...playlistTracks, track]);
  };

  const removeTrack = (track) => {
    setPlaylistTracks(playlistTracks.filter(savedTrack => savedTrack.id !== track.id));
  };

  const handleNameChange = (newName) => {
    setPlaylistName(newName);
  };

  const savePlaylist = () => {
    const trackUris = playlistTracks.map(track => track.uri);
    Spotify.savePlaylist(playlistName, trackUris)
      .then(() => {
        setPlaylistName('New Playlist');
        setPlaylistTracks([]);
      });
  };

  const loginScreen = (
    <div className={styles.appContainer}>
      <h1>Jammming</h1>
      <p>To get started, log in to spotify.</p>
      <button onClick={authenticateWithSpotify}>Log in to spotify</button>
    </div>
  );

  const app = (
    <div className={styles.appContainer}>
      <h1>Jammming</h1>
      <div className="App-playlist">
        <SearchBar onSearch={searchSpotify} />
        <div className="App-results">
          <SearchResults searchResults={searchResults} onAddTrack={addTrack} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemoveTrack={removeTrack}
            onNameChange={handleNameChange}
          />
        </div>
      </div>
    </div>
  );

  return isAuthorized ? app : loginScreen;
}

export default App;