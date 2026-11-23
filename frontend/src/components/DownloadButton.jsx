import { useState } from 'react';
import { downloadDocument } from '../services/documentApi.js';

export default function DownloadButton({ documentItem, onError }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      const fileBlob = await downloadDocument(documentItem.id);
      const objectUrl = URL.createObjectURL(fileBlob);
      const link = window.document.createElement('a');
      link.href = objectUrl;
      link.download = documentItem.originalName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      className="download-button"
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      aria-label={`Baixar ${documentItem.originalName}`}
    >
      {isDownloading ? 'Baixando...' : 'Baixar'}
    </button>
  );
}