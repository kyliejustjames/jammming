import React, { useState } from 'react';
import styles from './SearchBar.module.css';

function SearchBar({ onSearch }) {
  const [term, setTerm] = useState(''); 
  const handleTermChange = (event) => {
    setTerm(event.target.value);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(term); 
  };

  return (
    <div className={styles.searchBar} >
      <input 
        className={styles.searchInput}
        placeholder="Enter A Song, Album, or Artist" 
        onChange={handleTermChange} />
      <button className={styles.searchButton} onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchBar;