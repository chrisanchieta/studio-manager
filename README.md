<div align="center">

<h1>Studio Manager</h1>

<p>Sistema de gestão para salão de beleza — controle de funcionários, clientes, atendimentos e relatórios mensais.</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
</p>

</div>

---

## 📋 Sobre o Projeto

Aplicação fullstack desenvolvida para gerenciar as operações diárias de um estúdio de beleza. O sistema centraliza o controle de funcionários, clientes e atendimentos em uma interface elegante e responsiva, com relatórios mensais automáticos e autenticação segura.

### ✨ Destaques

- 🔐 **Autenticação JWT** — acesso protegido com token de 8 horas
- 📊 **Relatórios mensais** — dashboard que zera automaticamente todo mês
- 💰 **Cálculo de comissões** — ganhos por funcionário com filtro de período
- 🏆 **Ranking de clientes** — Top 3 mais atendidos do mês
- 📱 **Interface responsiva** — funciona em desktop e mobile

---

## 🚀 Tecnologias

<table>
  <tr>
    <td><strong>Backend</strong></td>
    <td><strong>Frontend</strong></td>
    <td><strong>Banco & Infra</strong></td>
  </tr>
  <tr>
    <td>
      Node.js + Express<br/>
      TypeScript<br/>
      JWT + bcryptjs<br/>
      tsup (build)
    </td>
    <td>
      React 18 + TypeScript<br/>
      Vite<br/>
      React Router DOM v6<br/>
      Axios
    </td>
    <td>
      MongoDB Atlas<br/>
      Mongoose<br/>
      Render (backend)<br/>
      Netlify (frontend)
    </td>
  </tr>
</table>

---

## 🏗️ Arquitetura

O backend segue o padrão de separação em camadas:

```
Controller → Service → Repository → Model
```

- **Controller** — recebe a requisição HTTP e delega ao service
- **Service** — contém as regras de negócio e validações
- **Repository** — responsável pelo acesso ao banco de dados
- **Model** — define o schema do Mongoose

---

## 📁 Estrutura do Projeto

```
studio-manager/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── repositories/
│       ├── models/
│       ├── middlewares/
│       │   └── auth-middleware.ts
│       ├── data/
│       │   └── database.ts
│       ├── utils/
│       │   └── http-helper.ts
│       ├── routes.ts
│       ├── app.ts
│       └── server.ts
│
└── frontend/
    └── src/
        ├── api/
        ├── services/
        ├── pages/
        │   ├── Login.tsx
        │   ├── Home.tsx
        │   ├── Dashboard.tsx
        │   ├── Employees.tsx
        │   ├── Clients.tsx
        │   └── Appointments.tsx
        ├── components/
        │   ├── Navbar.tsx
        │   ├── PrivateRoute.tsx
        │   ├── EmployeeEarnings.tsx
        │   └── ui/
        │       ├── Toast.tsx
        │       └── Confirm.tsx
        ├── routes/
        └── App.tsx
```

---

## ⚙️ Funcionalidades

<details>
<summary><strong>🔐 Autenticação</strong></summary>

- Login com usuário e senha
- Token JWT com expiração de 8 horas
- Todas as rotas da API protegidas
- Redirecionamento automático ao expirar sessão
- Senhas com hash bcrypt (salt rounds: 10)

</details>

<details>
<summary><strong>👥 Funcionários</strong></summary>

- Listar, cadastrar e excluir funcionários
- Campos: nome, função e percentual de comissão
- Cálculo de ganhos por período com filtro de datas
- Atalhos rápidos: este mês, este ano, últimos 30/90 dias

</details>

<details>
<summary><strong>👤 Clientes</strong></summary>

- Listar, cadastrar e excluir clientes
- Campos: nome e telefone
- Busca em tempo real por nome ou telefone
- Paginação de 5 em 5
- Ranking Top 3 clientes mais atendidos do mês (zera automaticamente)

</details>

<details>
<summary><strong>📅 Atendimentos</strong></summary>

- Registrar atendimentos vinculando cliente e funcionário
- Busca de cliente por nome com dropdown em tempo real
- Histórico completo paginado de 5 em 5
- Exclusão de atendimentos

</details>

<details>
<summary><strong>📊 Relatório / Dashboard</strong></summary>

- Dados filtrados pelo **mês atual** — zera no primeiro dia de cada mês
- Faturamento bruto e líquido (descontando comissões)
- Ticket médio por atendimento
- Funcionário destaque e procedimento mais realizado
- Gráfico de barras por funcionário com comissão a pagar
- Ranking dos procedimentos mais populares
- 5 atendimentos mais recentes do mês

</details>

---

## 🌐 Endpoints da API

**Base URL:** `https://studio-manager-5z6l.onrender.com/api/v1`

### 🔓 Auth (público)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/login` | Autentica e retorna JWT |

### 🔒 Funcionários (protegido)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/employees` | Lista todos |
| `POST` | `/employees` | Cria funcionário |
| `GET` | `/employees/:id` | Busca por ID |
| `GET` | `/employees/:id/earnings` | Ganhos totais |
| `GET` | `/employees/:id/earnings/date` | Ganhos por período (`?startDate=&endDate=`) |
| `GET` | `/employees/:id/appointments` | Atendimentos do funcionário |
| `DELETE` | `/employees/:id` | Remove funcionário |

### 🔒 Clientes (protegido)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/clients` | Lista todos |
| `GET` | `/clients/search` | Busca por nome/telefone (`?q=`) |
| `POST` | `/clients` | Cria cliente |
| `GET` | `/clients/:id` | Busca por ID |
| `GET` | `/clients/:clientId/appointments` | Histórico do cliente |
| `DELETE` | `/clients/:id` | Remove cliente |

### 🔒 Atendimentos (protegido)

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/appointments` | Lista todos |
| `POST` | `/appointments` | Cria atendimento |
| `GET` | `/appointments/:id` | Busca por ID |
| `DELETE` | `/appointments/:id` | Remove atendimento |

---

## 🚢 Deploy

| Serviço | Plataforma | URL |
|---------|-----------|-----|
| Frontend | Netlify | `https://veronica-bianco-studio.netlify.app` |
| Backend | Render | `https://studio-manager-5z6l.onrender.com` |
| Banco | MongoDB Atlas | M0 Free |

> ⚠️ O backend está no plano gratuito do Render — pode demorar até 50 segundos para responder após um período de inatividade.

---

## 🔒 Segurança

- Senhas armazenadas com **bcrypt** (salt rounds: 10)
- Tokens JWT com expiração de **8 horas**
- Todas as rotas protegidas exigem `Authorization: Bearer <token>`
- Variáveis sensíveis isoladas em `.env` — nunca versionadas
- `autoIndex` desativado em produção

---

<div align="center">
  <p>Desenvolvido por <strong>Christian A. Sangy</strong></p>
</div>
