const fs = require('node:fs/promises');
const path = require('node:path');
const { storageDirectory } = require('../storageConfig');

const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return toPublicDocument(document);
}

function findByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .map(toPublicDocument);
}

async function findByIdAndOwner(id, owner) {
  const document = documents.get(id);
  if (!document || document.owner !== owner) {
    return null;
  }

  const filePath = path.join(storageDirectory, document.storageName);
  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }

  return {
    ...toPublicDocument(document),
    filePath,
  };
}

function removeStoredFile(filePath) {
  return fs.unlink(filePath);
}

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

module.exports = { save, findByOwner, findByIdAndOwner, removeStoredFile };