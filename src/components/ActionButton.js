import React from 'react';
import '../styles/ActionButton.css';

const ActionButton = ({ text, type = 'default', onClick }) => {
  return (
    <button className={`action-btn ${type}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default ActionButton;
