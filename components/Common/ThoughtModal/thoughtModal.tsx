import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ThoughtModalProps } from './thoughtModalProps';
import ThoughtModalView from './thoughtModalView';
import './thoughtModal.css';

const ThoughtModal: React.FC<ThoughtModalProps> = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState('');

  // Sync state when modal opens and manage body scroll lock
  useEffect(() => {
    if (props.isOpen) {
      setText(props.initialThoughts || '');
      // Automatically enter edit mode if there are no thoughts
      setIsEditing(!props.initialThoughts);
      
      // Lock background scroll
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [props.isOpen, props.initialThoughts]);

  const handleSave = () => {
    props.onSave(text);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (!props.initialThoughts) {
      props.onClose();
    } else {
      setText(props.initialThoughts);
      setIsEditing(false);
    }
  };

  if (!props.isOpen) return null;

  // Render to portal to escape parent transforms (like .track-row:hover translate)
  return createPortal(
    <ThoughtModalView 
      {...props}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      text={text}
      setText={setText}
      handleSave={handleSave}
      handleCancel={handleCancel}
    />,
    document.body
  );
};

export default ThoughtModal;