# PulseDesk - Internal Helpdesk Platform

Uma plataforma moderna de helpdesk interno para organizações gerenciarem requests, com uma interface clean e intuitiva.

## Funcionalidades Implementadas

### 1. **Landing Page** 
- Design premium com bento grid de features
- Previews reais do inbox e request detail
- Call-to-action clara
- Design responsivo

### 2. **Autenticação**
- Sign In
- Sign Up
- Accept Invite (convites para workspace)
- Forgot Password / Reset Password
- Onboarding flow

### 3. **Dashboard Principal (Inbox)**
- Split view com lista de requests à esquerda
- Detalhes do request à direita
- Filtros por status, prioridade, assignee
- Busca global (Cmd+K)
- Contador de requests abertos

### 4. **Gerenciamento de Requests**
- Criar novo request (modal Cmd+N)
- Visualizar detalhes completo
- Comentários em tempo real
- Adicionar/remover attachments
- Atualizar status e prioridade
- Assinar/desassinar request

### 5. **My Tasks**
- Vista de tarefas atribuídas
- Filtros por status
- Kanban board visual
- Contador de pending tasks

### 6. **Views**
- Vistas salvas personalizadas
- Filtros avançados
- Busca dentro de views
- Suporte para múltiplas views

### 7. **Knowledge Base**
- Artigos de ajuda e documentação
- Busca de artigos
- Visualização individual de artigos
- Categorização

### 8. **Settings**
- **Workspace Settings**: Configurações gerais
- **Members**: Gerenciar membros, convites, remoção
- **Permissions**: Controle de roles (Admin/Member)
- **Appearance**: Tema e preferências visuais
- **Notifications**: Configuração de notificações
- **Billing**: Plano e faturas

### 9. **Componentes Auxiliares**
- Workspace Switcher: Trocar entre workspaces
- Profile Menu: Menu de usuário com logout
- Command Bar: Busca global e ações rápidas
- Status Badges: Visual de status (Novo, Em Progresso, Resolvido, Fechado)
- Priority Badges: Visual de prioridade (Baixa, Média, Alta, Urgente)

## Estrutura de Dados Mockados

### Usuarios
```typescript
{
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'member'
  team: string
}
```

### Requests
```typescript
{
  id: string
  title: string
  description: string
  status: 'new' | 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdBy: string
  assigneeId?: string
  createdAt: Date
  updatedAt: Date
  comments: Comment[]
  attachments: Attachment[]
  category: string
}
```

### Comentários
```typescript
{
  id: string
  author: string
  content: string
  timestamp: Date
  isInternal: boolean
  mentions: string[]
}
```

## Estrutura de Pastas

```
app/
├── page.tsx (Landing)
├── auth/
│   ├── layout.tsx
│   ├── sign-in/
│   ├── sign-up/
│   ├── accept-invite/
│   ├── forgot-password/
│   ├── reset-password/
├── onboarding/
│   └── page.tsx
├── app/
│   ├── layout.tsx (App wrapper)
│   ├── page.tsx (Inbox)
│   ├── my-tasks/
│   ├── views/
│   ├── knowledge/
│   │   └── [id]/
│   └── settings/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── members/
│       ├── permissions/
│       ├── appearance/
│       ├── notifications/
│       └── billing/
│
components/
├── app/
│   ├── sidebar.tsx
│   ├── command-bar.tsx
│   ├── new-request-modal.tsx
│   ├── request-list.tsx
│   ├── request-detail.tsx
│   ├── request-empty-state.tsx
│   ├── workspace-switcher.tsx
│   ├── profile-menu.tsx
│   ├── settings-nav.tsx
│   ├── status-badge.tsx
│   └── priority-badge.tsx
│
├── landing/
│   ├── inbox-preview.tsx
│   └── request-detail-preview.tsx
│
lib/
├── mock-data.ts (Dados mockados)
├── app-context.tsx (Context API do app)
├── date-utils.ts (Utilitários de data)
└── utils.ts (Utilitários gerais)
```

## Design System

### Cores
- **Primary**: #000000 (preto)
- **Neutrals**: Grays personalizados
- **Accents**: Azul, Amarelo, Verde, Vermelho (para status/prioridade)

### Typography
- **Headings**: Geist
- **Body**: Geist
- **Mono**: Geist Mono

### Componentes UI
Utiliza shadcn/ui com Tailwind CSS v4

## Como Usar

1. **Instalação**: Clone ou baixe o projeto
2. **Dependências**: `pnpm install`
3. **Desenvolvimento**: `pnpm dev`
4. **Build**: `pnpm build`

## Fluxo de Navegação

1. **Landing Page** → Sign Up/Sign In
2. **Onboarding** → Aceitar convite ou criar workspace
3. **Inbox** → Visualizar e gerenciar requests
4. **Detalhes** → Ver request completo com comentários
5. **Settings** → Configurar workspace e preferences

## Dados Mockados

Todos os dados são armazenados localmente via Context API (React). Não há persistência entre sessões. Os dados são carregados automaticamente ao iniciar a aplicação.

## Próximos Passos (Futuro)

- Integração com banco de dados real
- Autenticação com JWT/OAuth
- WebSockets para atualizações em tempo real
- Notificações push
- Mobile app
- Integrações com Slack, Teams, etc

## Notas Técnicas

- **Framework**: Next.js 16 com App Router
- **UI**: shadcn/ui + Tailwind CSS v4
- **State Management**: React Context API + SWR (optional)
- **Icons**: Lucide React
- **Dados**: Mockados (sem persistência)

---

Desenvolvido com Next.js 16, React 19.2 e Tailwind CSS v4
