# Especificação - Document Management System

## 1. Objetivo

Construir uma aplicação web simples para que usuários enviem, consultem e baixem seus documentos, mantendo os arquivos no filesystem local e os metadados em memória.

## 2. Escopo

### Dentro do escopo

- Envio de um arquivo por requisição.
- Listagem dos documentos associados ao usuário da requisição.
- Download de um documento pelo identificador, respeitando a associação ao usuário.
- Interface web para envio, listagem e download.
- Persistência dos arquivos no disco local e dos metadados em memória durante a execução do backend.
- Exibição de erros compreensíveis na interface.

### Fora do escopo

- Armazenamento em nuvem ou em serviços externos.
- Banco de dados para metadados.
- Versionamento, compartilhamento ou edição de documentos.
- Cadastro de usuários, login, autorização robusta ou recuperação de senha.
- Garantia de persistência dos metadados após reiniciar o backend.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo pelo formulário web. |
| RF-02 | O sistema valida que a requisição contém um arquivo e informa erros de upload ao usuário. |
| RF-03 | O sistema grava o arquivo no armazenamento local usando `multer` com `diskStorage`. |
| RF-04 | Após um upload bem-sucedido, o sistema registra e retorna os metadados do documento. |
| RF-05 | O usuário pode listar os metadados dos documentos associados à sua identidade de requisição. |
| RF-06 | O usuário pode baixar um documento associado à sua identidade de requisição pelo identificador. |
| RF-07 | A interface apresenta estados de carregamento, lista vazia e falha nas operações. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos são armazenados exclusivamente no filesystem local da aplicação, na pasta `backend/storage` por padrão. |
| RNF-02 | O diretório de armazenamento pode ser configurado por variável de ambiente, mantendo o padrão local. |
| RNF-03 | Os metadados são mantidos em memória; reiniciar o processo limpa os metadados e não deve ser apresentado como armazenamento durável. |
| RNF-04 | O nome original do arquivo é preservado nos metadados, mas não é usado como nome físico de destino. |
| RNF-05 | Erros de entrada, ausência de documento e falhas de leitura ou escrita são tratados nos limites HTTP e apresentados de forma compreensível. |
| RNF-06 | O backend segue a separação `routes -> controllers -> services -> repositories`, sem lógica de negócio nas rotas. |
| RNF-07 | O frontend usa React e acessa a API por `fetch` no prefixo `/api`, conforme o proxy do Vite. |
| RNF-08 | A configuração operacional é feita por variáveis de ambiente quando aplicável; segredos não são necessários nesta fase. |

## 5. Modelo de dados

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único e opaco do documento. |
| `originalName` | string | Nome original fornecido pelo cliente, usado para exibição e nome do download. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Data e hora do upload em formato ISO 8601. |
| `owner` | string | Identificador do usuário associado à requisição. |
| `storageName` | string | Nome interno gerado pelo servidor para localizar o arquivo no disco; não precisa ser exposto na API. |

Os metadados são mantidos em memória pelo repositório durante a vida do processo. O arquivo físico deve ser gravado com um nome interno gerado pelo servidor para evitar colisões e não confiar em caminhos informados pelo cliente.

### Identidade do usuário nesta fase

O seed não define autenticação. Para viabilizar a associação simples de documentos durante o exercício, a API usa o cabeçalho `X-User-Id` como identificador demonstrativo. Ele não comprova identidade e não deve ser considerado mecanismo de segurança. A adoção de autenticação real fica fora do escopo desta versão; a origem desse contexto poderá ser substituída sem alterar as regras de armazenamento.

## 6. Contratos de API

Todas as rotas de documentos são disponibilizadas pelo backend e consumidas pelo frontend sob o prefixo `/api` configurado no proxy do Vite. As rotas abaixo descrevem os caminhos no backend.

### `POST /upload`

- Cabeçalho: `X-User-Id: <identificador>`.
- Entrada: `multipart/form-data` com um arquivo no campo `file`.
- Sucesso: `201 Created`, corpo JSON com `id`, `originalName`, `size`, `uploadedAt` e `owner`.
- Erros: `400 Bad Request` para arquivo ausente ou requisição inválida; `413 Payload Too Large` se houver limite configurado e excedido; `500 Internal Server Error` para falha inesperada de armazenamento.

### `GET /documents`

- Cabeçalho: `X-User-Id: <identificador>`.
- Sucesso: `200 OK`, corpo JSON com uma lista de metadados pertencentes ao usuário.
- Lista vazia: `200 OK` com lista vazia.
- Erros: `400 Bad Request` se o contexto de usuário estiver ausente; `500 Internal Server Error` para falha inesperada.

### `GET /documents/:id/download`

- Cabeçalho: `X-User-Id: <identificador>`.
- Sucesso: `200 OK`, conteúdo binário do arquivo e cabeçalho de download com o nome original.
- Erros: `400 Bad Request` para identificador inválido ou contexto de usuário ausente; `404 Not Found` se o documento não existir, não pertencer ao usuário ou o arquivo não estiver disponível; `500 Internal Server Error` para outras falhas de leitura.

### Formato de erro

As respostas de erro da API devem usar JSON consistente, por exemplo `{ "error": "Descrição do problema" }`, sem expor caminhos internos do servidor.

## 7. Decisões arquiteturais

- Backend em Node.js e Express, usando CommonJS.
- `routes/` registra endpoints e delega aos controllers.
- `controllers/` valida a entrada HTTP, chama os serviços e monta respostas.
- `services/` aplica as regras de upload, associação por usuário e acesso a documentos.
- `repositories/` gerencia os metadados em memória e o acesso aos arquivos locais.
- Uploads usam `multer` com `diskStorage`; não usar provedores externos.
- O diretório padrão de arquivos é `backend/storage`; a configuração pode sobrescrevê-lo por variável de ambiente.
- Frontend em React com componentes funcionais; chamadas ao backend usam `fetch` pelo prefixo `/api`.
- A identidade `X-User-Id` é somente uma convenção didática. Ela não substitui autenticação nem deve ser usada como controle de acesso em produção.
- Como arquivos persistem no disco, mas metadados não, uma reinicialização pode deixar arquivos sem registro. Recuperação e limpeza desses arquivos não fazem parte desta versão.

## 8. Plano de execução

1. Implementar repositório de metadados em memória e armazenamento local com nomes internos gerados pelo servidor.
2. Implementar upload com `multer`, validações, associação do usuário e respostas de erro.
3. Implementar listagem filtrada pela identidade associada à requisição.
4. Implementar download por identificador, verificando associação e tratando arquivo ausente.
5. Criar a interface React para enviar arquivos, listar documentos, baixar documentos e apresentar estados de carregamento, vazio e erro.
6. Integrar frontend e backend via proxy `/api` e validar os fluxos completos localmente.
7. Adicionar testes automatizados para upload, listagem, download, validações e falhas relevantes; executar a suíte e o build do frontend.
8. Atualizar a documentação de execução e configuração do projeto.
