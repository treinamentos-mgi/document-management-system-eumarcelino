const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const express = require('express');
const multer = require('multer');
const { storageDirectory } = require('../storageConfig');
const documentController = require('../controllers/documentController');

fs.mkdirSync(storageDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: storageDirectory,
    filename: (req, file, callback) => callback(null, randomUUID()),
  }),
});

const router = express.Router();

router.post(
  '/upload',
  documentController.requireOwner,
  upload.single('file'),
  documentController.uploadDocument,
);
router.get('/documents', documentController.requireOwner, documentController.listDocuments);
router.get(
  '/documents/:id/download',
  documentController.requireOwner,
  documentController.downloadDocument,
);

module.exports = router;