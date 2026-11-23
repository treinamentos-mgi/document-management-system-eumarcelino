import { useRef, useState } from 'react';
import formatFileSize from '../utils/formatFileSize.js';

export default function UploadComponent({ onUpload, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function selectFile(file) {
    if (file) {
      setSelectedFile(file);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || isUploading) {
      return;
    }

    const uploaded = await onUpload(selectedFile);
    if (uploaded) {
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label
        className={`drop-zone${isDragging ? ' is-dragging' : ''}${selectedFile ? ' has-file' : ''}`}
        htmlFor="document-file"
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="file-input"
          id="document-file"
          name="file"
          type="file"
          onChange={(event) => selectFile(event.target.files[0])}
          disabled={isUploading}
        />
        <span className="drop-icon" aria-hidden="true">+</span>
        {selectedFile ? (
          <span className="file-selection">
            <strong title={selectedFile.name}>{selectedFile.name}</strong>
            <small>{formatFileSize(selectedFile.size)}</small>
          </span>
        ) : (
          <span className="drop-copy">
            <strong>Solte seu arquivo aqui</strong>
            <small>ou selecione no dispositivo</small>
          </span>
        )}
      </label>
      <button className="primary-button" type="submit" disabled={!selectedFile || isUploading}>
        {isUploading ? <><span className="button-spinner" aria-hidden="true" /> Enviando...</> : 'Enviar arquivo'}
      </button>
    </form>
  );
}