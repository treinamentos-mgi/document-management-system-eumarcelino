const path = require('node:path');
const documentService = require('../services/documentService');

function requireOwner(req, res, next) {
  const owner = req.get('X-User-Id')?.trim();
  if (!owner) {
    return res.status(400).json({ error: 'O cabeçalho X-User-Id é obrigatório.' });
  }

  req.owner = owner;
  return next();
}

async function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Envie um arquivo no campo "file".' });
  }

  const document = await documentService.createDocument(req.file, req.owner);
  return res.status(201).json(document);
}

function listDocuments(req, res) {
  return res.json(documentService.listDocuments(req.owner));
}

async function downloadDocument(req, res, next) {
  const document = await documentService.findDocumentForDownload(req.params.id, req.owner);
  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  const downloadName = path.basename(document.originalName.replace(/\\/g, '/')) || 'document';
  return res.download(document.filePath, downloadName, (error) => {
    if (!error) {
      return;
    }

    if (error.code === 'ENOENT' && !res.headersSent) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    if (!res.headersSent) {
      return next(error);
    }
  });
}

module.exports = { requireOwner, uploadDocument, listDocuments, downloadDocument };