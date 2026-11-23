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
    return documentRepository.save(document);
  } catch (error) {
    await documentRepository.removeStoredFile(file.path).catch(() => {});
    throw error;
  }
}

function listDocuments(owner) {
  return documentRepository.findByOwner(owner);
}

function findDocumentForDownload(id, owner) {
  return documentRepository.findByIdAndOwner(id, owner);
}

module.exports = { createDocument, listDocuments, findDocumentForDownload };