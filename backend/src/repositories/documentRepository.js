const path = require('node:path');
const { storageDirectory } = require('../storageConfig');

const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .map(toPublicDocument);
}

function findByIdAndOwner(id, owner) {
  const document = documents.get(id);
  if (!document || document.owner !== owner) {
    return null;
  }

  return {
    ...toPublicDocument(document),
    filePath: path.join(storageDirectory, document.storageName),
  };
}

function toPublicDocument(document) {
  const { storageName, ...publicDocument } = document;
  return publicDocument;
}

module.exports = { save, findByOwner, findByIdAndOwner };