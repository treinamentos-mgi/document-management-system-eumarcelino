---
name: Verificar integração da API DMS
description: 'Revisa o contrato entre o frontend React e os endpoints Express de documentos, executando validações focadas sem editar arquivos.'
argument-hint: 'Área para verificar (ex.: upload, listagem, download ou fluxo completo)'
agent: agent
---

# Verificar integração frontend-backend do DMS

Priorize esta área, se informada: `${input:area:fluxo completo}`.

Leia as implementações atuais do backend e do frontend antes de concluir. Compare:

- Rotas `/upload`, `/documents` e `/documents/:id/download` com o prefixo `/api` e o proxy do Vite.
- Cabeçalho demonstrativo `X-User-Id`, campo multipart `file` e formato dos metadados.
- Tratamento de respostas de erro e download do conteúdo binário.
- Restrições de armazenamento local e metadados em memória descritas em `.github/copilot-instructions.md`.

Não edite arquivos, não adicione dependências e não trate `X-User-Id` como autenticação real. Execute `cd backend && npm test` e `cd frontend && npm run build` quando as dependências estiverem disponíveis. Só teste uma API em execução se ela já estiver acessível; não faça upload de dados para o storage persistente do projeto.

Retorne um resumo curto com inconsistências confirmadas, validações executadas e lacunas que não puderam ser verificadas. Se o contrato estiver consistente, diga isso explicitamente.