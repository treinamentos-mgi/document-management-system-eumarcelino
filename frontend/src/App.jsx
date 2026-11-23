import { useEffect, useState } from 'react';
import { listDocuments, uploadDocument } from './services/documentApi.js';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadDocuments() {
    setIsLoading(true);
    setError('');

    try {
      setDocuments(await listDocuments());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function loadInitialDocuments() {
      try {
        const result = await listDocuments();
        if (isActive) {
          setDocuments(result);
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadInitialDocuments();
    return () => {
      isActive = false;
    };
  }, []);

  async function handleUpload(file) {
    setError('');
    setNotice('');
    setIsUploading(true);

    try {
      const newDocument = await uploadDocument(file);
      setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);
      setNotice(`${newDocument.originalName} enviado com sucesso.`);
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  function handleDownloadError(message) {
    setError(message);
    setNotice('');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="DMS, início">
          <span className="brand-mark" aria-hidden="true">D</span>
          <span className="brand-name">DMS</span>
        </a>
        <div className="topbar-meta">
          <span className="status-dot" aria-hidden="true" />
          <span>Área de documentos</span>
        </div>
      </header>

      <main className="workspace" id="top">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">ARQUIVO DIGITAL <span> / </span> 01</p>
            <h1 id="page-title">Documentos</h1>
          </div>
          <div className="heading-count" aria-live="polite">
            <strong>{documents.length.toString().padStart(2, '0')}</strong>
            <span>{documents.length === 1 ? 'arquivo' : 'arquivos'}</span>
          </div>
        </section>

        {error && <div className="feedback feedback-error" role="alert">{error}</div>}
        {notice && <div className="feedback feedback-success" role="status">{notice}</div>}

        <div className="workspace-grid">
          <aside className="upload-panel" aria-labelledby="upload-title">
            <div className="panel-heading">
              <span className="section-index">01</span>
              <h2 id="upload-title">Adicionar arquivo</h2>
            </div>
            <UploadComponent onUpload={handleUpload} isUploading={isUploading} />
            <div className="local-note">
              <span className="local-note-mark" aria-hidden="true">●</span>
              <span>Armazenamento local</span>
            </div>
          </aside>

          <section className="library-panel" aria-labelledby="library-title">
            <div className="library-heading">
              <div className="panel-heading">
                <span className="section-index">02</span>
                <h2 id="library-title">Biblioteca</h2>
              </div>
              <button
                className="text-button refresh-button"
                type="button"
                onClick={loadDocuments}
                disabled={isLoading}
              >
                {isLoading ? 'Atualizando...' : 'Atualizar lista'}
              </button>
            </div>
            <DocumentList
              documents={documents}
              isLoading={isLoading}
              onDownloadError={handleDownloadError}
            />
          </section>
        </div>
      </main>

      <footer className="page-footer">
        <span>DMS <span className="footer-divider">/</span> Workspace</span>
        <span>Gestão documental</span>
      </footer>
    </div>
  );
}
