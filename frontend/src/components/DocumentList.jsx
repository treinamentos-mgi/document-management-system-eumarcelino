import DownloadButton from './DownloadButton.jsx';

export default function DocumentList({ documents, isLoading, onDownloadError }) {
  if (isLoading && documents.length === 0) {
    return <div className="list-state" role="status">Carregando documentos...</div>;
  }

  if (!isLoading && documents.length === 0) {
    return (
      <div className="list-state empty-state">
        <span className="empty-rule" aria-hidden="true" />
        <h3>Nenhum documento ainda</h3>
        <p>Sua biblioteca está vazia.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll" aria-busy={isLoading}>
      <table className="document-table">
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Enviado em</th>
            <th scope="col">Tamanho</th>
            <th scope="col"><span className="visually-hidden">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          {[...documents]
            .sort((left, right) => new Date(right.uploadedAt) - new Date(left.uploadedAt))
            .map((documentItem) => (
              <tr key={documentItem.id}>
                <td className="document-name-cell" data-label="Nome">
                  <span className="file-type" aria-hidden="true">{getFileType(documentItem.originalName)}</span>
                  <span className="document-name" title={documentItem.originalName}>{documentItem.originalName}</span>
                </td>
                <td data-label="Enviado em">
                  <time dateTime={documentItem.uploadedAt}>{formatDate(documentItem.uploadedAt)}</time>
                </td>
                <td data-label="Tamanho">{formatFileSize(documentItem.size)}</td>
                <td className="download-cell" data-label="">
                  <DownloadButton documentItem={documentItem} onError={onDownloadError} />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function getFileType(fileName) {
  const extension = fileName.split('.').pop();
  return extension && extension !== fileName ? extension.slice(0, 4).toUpperCase() : 'FILE';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}