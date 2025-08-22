********````````# Requisitos do Backend - Task Manager

Este documento descreve os requisitos para implementação do backend que suportará o aplicativo Task Manager Frontend.

## 1. Visão Geral

O backend deve fornecer uma API RESTful para gerenciamento de tarefas, permitindo operações CRUD completas com suporte a paginação, ordenação e filtros.

## 2. Modelo de Dados

### Entidade: Task

```typescript
interface Task {
  id: string;           // Identificador único (UUID recomendado)
  title: string;        // Título da tarefa (obrigatório)
  description: string;   // Descrição detalhada (opcional)
  status: TaskStatus;    // Status atual da tarefa
  createdAt: string;     // Data de criação (ISO 8601)
  updatedAt: string;     // Data da última atualização (ISO 8601)
  updatedBy?: string;    // ID do usuário que fez a última atualização
}

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
```

## 3. Endpoints da API

### 3.1. Listar Tarefas

**GET** `/api/tasks`

**Parâmetros de Consulta:**
- `page`: Número da página (padrão: 0)
- `size`: Itens por página (padrão: 10)
- `sort`: Campo para ordenação (ex: `title,asc` ou `createdAt,desc`)
- `status`: Filtrar por status (PENDING, IN_PROGRESS, COMPLETED)
- `search`: Termo para busca em título e descrição

**Resposta de Sucesso (200 OK):**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Exemplo de Tarefa",
      "description": "Descrição detalhada da tarefa",
      "status": "PENDING",
      "createdAt": "2025-08-21T19:45:57-03:00",
      "updatedAt": "2025-08-21T19:45:57-03:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

### 3.2. Obter Tarefa por ID

**GET** `/api/tasks/{id}`

**Parâmetros de Rota:**
- `id`: ID da tarefa (UUID)

**Respostas:**
- 200 OK: Retorna a tarefa
- 404 Not Found: Tarefa não encontrada

### 3.3. Criar Tarefa

**POST** `/api/tasks`

**Corpo da Requisição:**
```json
{
  "title": "Nova Tarefa",
  "description": "Descrição opcional",
  "status": "PENDING"
}
```

**Respostas:**
- 201 Created: Retorna a tarefa criada
- 400 Bad Request: Dados inválidos

### 3.4. Atualizar Tarefa

**PUT** `/api/tasks/{id}`

**Parâmetros de Rota:**
- `id`: ID da tarefa (UUID)

**Corpo da Requisição:** (campos parciais permitidos)
```json
{
  "title": "Título Atualizado",
  "status": "IN_PROGRESS"
}
```

**Respostas:**
- 200 OK: Retorna a tarefa atualizada
- 400 Bad Request: Dados inválidos
- 404 Not Found: Tarefa não encontrada

### 3.5. Excluir Tarefa

**DELETE** `/api/tasks/{id}`

**Parâmetros de Rota:**
- `id`: ID da tarefa (UUID)

**Respostas:**
- 204 No Content: Tarefa excluída com sucesso
- 404 Not Found: Tarefa não encontrada

## 4. Validações

### Tarefa (Criação/Atualização)
- `title`: 
  - Obrigatório
  - String não vazia
  - Máximo de 255 caracteres
- `description`: 
  - Opcional
  - String
- `status`: 
  - Obrigatório
  - Deve ser um dos valores: PENDING, IN_PROGRESS, COMPLETED

## 5. Tratamento de Erros

Todas as respostas de erro devem seguir o formato:

```json
{
  "statusCode": number,
  "message": "Mensagem de erro descritiva",
  "errors": [
    {
      "field": "nomeDoCampo",
      "message": "Mensagem de erro específica do campo"
    }
  ],
  "timestamp": "2025-08-21T19:45:57-03:00",
  "path": "/api/tasks"
}
```

### Códigos de Status HTTP
- 200 OK: Requisição bem-sucedida
- 201 Created: Recurso criado com sucesso
- 204 No Content: Exclusão bem-sucedida
- 400 Bad Request: Dados inválidos
- 401 Unauthorized: Autenticação necessária
- 403 Forbidden: Acesso negado
- 404 Not Found: Recurso não encontrado
- 500 Internal Server Error: Erro inesperado no servidor

## 6. Segurança

### CORS
O backend deve incluir os seguintes headers nas respostas:
```
Access-Control-Allow-Origin: [domínio-do-frontend]
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Autenticação (Futuro)
- Implementar autenticação baseada em JWT
- Proteger endpoints sensíveis
- Registrar `updatedBy` com o ID do usuário autenticado

## 7. Documentação da API

Recomenda-se o uso de ferramentas como:
- Swagger/OpenAPI
- Postman Collection
- Documentação interativa

## 8. Exemplos de Uso

### Criar uma nova tarefa
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Reunião de Planejamento",
  "description": "Discutir os próximos passos do projeto",
  "status": "PENDING"
}
```

### Atualizar status de uma tarefa
```http
PUT /api/tasks/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Listar tarefas com filtros
```http
GET /api/tasks?status=IN_PROGRESS&sort=createdAt,desc&page=0&size=5
```

## 9. Considerações de Desempenho
- Implementar paginação em todas as consultas de lista
- Adicionar índices para campos frequentemente filtrados/ordenados
- Considerar cache para consultas frequentes
- Implementar rate limiting para evitar abusos

## 10. Monitoramento e Logs
- Registrar todas as requisições e erros
- Implementar health check endpoint (`/health`)
- Monitorar métricas de desempenho
- Configurar alertas para erros e problemas de desempenho********
````````
