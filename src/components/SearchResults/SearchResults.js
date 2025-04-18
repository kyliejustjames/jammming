import React from 'react';
import TrackList from '../Tracklist/Tracklist';
import styles from './SearchResults.module.css';

function SearchResults({ searchResults, onAddTrack }) {
  return (
    <div className={styles.searchResults}>
      <h2 className={styles.searchResultsTitle}>Results</h2>
      <TrackList
        tracks={searchResults}
        onAddTrack={onAddTrack}
        isRemoval={false}
      />
    </div>
  );
}

export default SearchResults;