const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');

const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.DMS_STORAGE_DIR = storageDirectory;

const app = require('../src/app');
let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  fs.rmSync(storageDirectory, { recursive: true, force: true });
});

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa documentos somente para o usuário associado', async () => {
  const owner = 'test-user';
  const formData = new FormData();
  formData.append('file', new Blob(['conteúdo do documento']), 'documento.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': owner },
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201);
  const createdDocument = await uploadResponse.json();
  assert.deepStrictEqual(Object.keys(createdDocument).sort(), [
    'id',
    'originalName',
    'owner',
    'size',
    'uploadedAt',
  ]);
  assert.strictEqual(createdDocument.originalName, 'documento.txt');
  assert.strictEqual(createdDocument.owner, owner);

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': owner },
  });
  assert.strictEqual(listResponse.status, 200);
  assert.deepStrictEqual(await listResponse.json(), [createdDocument]);

  const otherOwnerResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'another-user' },
  });
  assert.deepStrictEqual(await otherOwnerResponse.json(), []);

  const unauthorizedDownload = await fetch(
    `${baseUrl}/documents/${createdDocument.id}/download`,
    { headers: { 'X-User-Id': 'another-user' } },
  );
  assert.strictEqual(unauthorizedDownload.status, 404);

  const downloadResponse = await fetch(
    `${baseUrl}/documents/${createdDocument.id}/download`,
    { headers: { 'X-User-Id': owner } },
  );
  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(await downloadResponse.text(), 'conteúdo do documento');
  assert.match(downloadResponse.headers.get('content-disposition'), /documento\.txt/);

  const [storedFileName] = fs.readdirSync(storageDirectory);
  fs.unlinkSync(path.join(storageDirectory, storedFileName));

  const missingFileResponse = await fetch(
    `${baseUrl}/documents/${createdDocument.id}/download`,
    { headers: { 'X-User-Id': owner } },
  );
  assert.strictEqual(missingFileResponse.status, 404);
});

test('valida usuário e arquivo obrigatório', async () => {
  const missingOwnerResponse = await fetch(`${baseUrl}/documents`);
  assert.strictEqual(missingOwnerResponse.status, 400);

  const missingFileResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'test-user' },
  });
  assert.strictEqual(missingFileResponse.status, 400);
});
