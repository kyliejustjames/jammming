import React from 'react';
import styles from './Track.module.css';


function Track({ track, onAdd, onRemove, isRemoval }) { 
  const handleAddClick = () => {
    onAdd(track); 
  };

  const handleRemoveClick = () => {
    onRemove(track);
  }


  return (
    <div className={styles.track}>
      <div className="Track-information">
        <h3>{track.name}</h3>
        <p>{track.artist} | {track.album}</p>
      </div>
      {isRemoval ? (
        <button className={styles.removeButton} onClick={handleRemoveClick}>
            -
        </button>
        ) : (
        <button className={styles.addButton} onClick={handleAddClick}>
            +
        </button>
        )}
    </div>
  );
}

export default Track;