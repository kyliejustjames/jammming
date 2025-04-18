import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar/SearchBar';
import SearchResults from './components/SearchResults/SearchResults';
import Playlist from './components/Playlist/Playlist';
import Spotify from './spotify';
import './App.css';
import styles from './components/App/App.module.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState('My Awesome Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([]);

  useEffect(() => {
    Spotify.getAccessToken();
  }, []);

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

  return (
    <div className={styles.appContainer}>
      <h1>Jammming</h1>
      <div className="App-playlist">
        <SearchBar onSearch={searchSpotify} />
        <div className="App-results">
          <SearchResults searchResults={searchResults} onAdd={addTrack} />
          <Playlist
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={handleNameChange}
          />
        </div>
        <button onClick={savePlaylist}>Save To Spotify</button>
      </div>
    </div>
  );
}

export default App;