const fs = require('node:fs/promises');
const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

async function createDocument(file, owner) {
  const document = {
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
  };

  try {
    documentRepository.save(document);
  } catch (error) {
    await fs.unlink(file.path).catch(() => {});
    throw error;
  }

  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

function listDocuments(owner) {
  return documentRepository.findByOwner(owner);
}

async function findDocumentForDownload(id, owner) {
  const document = documentRepository.findByIdAndOwner(id, owner);
  if (!document) {
    return null;
  }

  try {
    await fs.access(document.filePath);
    return document;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

module.exports = { createDocument, listDocuments, findDocumentForDownload };