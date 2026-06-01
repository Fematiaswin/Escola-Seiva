# 🌱 Escola Seiva — Plataforma LMS

Plataforma de cursos online da Igreja Seiva. Desenvolvida com Next.js 14, Prisma, NextAuth e integração com Asaas para pagamentos.

---

## 🚀 Stack

| Camada        | Tecnologia                     |
|---------------|-------------------------------|
| Framework     | Next.js 14 (App Router)        |
| Linguagem     | TypeScript (strict mode)       |
| Banco de dados| PostgreSQL + Prisma ORM        |
| Autenticação  | NextAuth.js (JWT)              |
| Pagamentos    | Asaas API                      |
| Estilização   | Tailwind CSS + CSS custom      |
| Deploy        | Hostinger / Vercel             |
| PWA           | next-pwa (offline básico)      |

---

## 📦 Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/escola-seiva.git
cd escola-seiva

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores reais

# 4. Configure o banco de dados
npm run db:push       # cria as tabelas
npm run db:seed       # popula com dados de exemplo

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## 🔑 Credenciais padrão (após seed)

| Perfil | E-mail                        | Senha      |
|--------|-------------------------------|------------|
| Admin  | admin@igrejaseiva.com.br      | admin123   |
| Aluno  | aluno@demo.com                | aluno123   |

> ⚠️ Altere as senhas antes de ir para produção!

---

## 🗂 Estrutura de pastas

```
escola-seiva/
├── app/
│   ├── admin/            # Painel administrativo (protegido: role ADMIN)
│   │   ├── page.tsx      # Dashboard com métricas
│   │   ├── cursos/       # CRUD de cursos, módulos e aulas
│   │   ├── alunos/       # Listagem de alunos
│   │   └── financeiro/   # Histórico de pagamentos
│   ├── aluno/            # Área do aluno (protegido: autenticado)
│   │   ├── dashboard/    # Progresso, continuar estudando
│   │   └── cursos/       # Player de aulas com tracking
│   ├── api/
│   │   ├── admin/        # APIs protegidas (ADMIN)
│   │   ├── auth/         # NextAuth + registro
│   │   ├── checkout/     # Criação de pagamentos Asaas
│   │   ├── student/      # APIs do aluno (progress, courses)
│   │   └── webhooks/     # Webhook Asaas (liberação automática)
│   ├── cursos/           # Listagem e detalhe públicos
│   ├── login/            # Autenticação
│   ├── cadastro/         # Registro de novo aluno
│   └── sobre/            # Página institucional
├── components/
│   ├── admin/            # Sidebar admin
│   ├── aluno/            # Sidebar aluno, VideoPlayer
│   ├── Header.tsx        # Header público com autenticação
│   ├── CheckoutForm.tsx  # Formulário de compra
│   └── Providers.tsx     # SessionProvider wrapper
├── lib/
│   ├── auth.ts           # NextAuth config + RBAC
│   ├── asaas.ts          # Integração Asaas API
│   ├── prisma.ts         # PrismaClient singleton
│   └── video.ts          # Parser YouTube/Vimeo
├── prisma/
│   ├── schema.prisma     # Modelos + índices
│   └── seed.ts           # Dados de exemplo
├── middleware.ts          # Proteção de rotas por role
└── types/
    └── next-auth.d.ts    # Tipos estendidos (role, id)
```

---

## 🔒 Segurança implementada

- ✅ Autenticação JWT via NextAuth
- ✅ Middleware de proteção de rotas (RBAC)
- ✅ Validação Zod em todas as APIs
- ✅ Senha hasheada com bcrypt (12 rounds)
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Webhook com validação de token
- ✅ Sem exposição de dados sensíveis no client

---

## 💳 Fluxo de pagamentos

```
Aluno acessa /cursos/[slug]
    → Preenche CheckoutForm
    → POST /api/checkout/create
        → Cria Payment(status: PENDING) no DB
        → Cria pagamento na API Asaas
        → Redireciona para URL de pagamento
    → Aluno paga via PIX/boleto/cartão
    → Asaas envia webhook POST /api/webhooks/asaas
        → Valida token do webhook
        → Atualiza Payment(status: CONFIRMED)
        → Cria StudentCourse(accessStatus: ACTIVE) ← acesso liberado
    → Aluno acessa /aluno/cursos
```

---

## 🌐 Deploy na Hostinger

### Pré-requisitos
- Plano com suporte a Node.js 18+
- Banco PostgreSQL (Hostinger ou externo)

### Passos
1. Faça build local: `npm run build`
2. Configure as variáveis de ambiente no painel da Hostinger
3. Defina `DATABASE_URL` apontando para seu PostgreSQL
4. Rode `npx prisma migrate deploy` após o deploy
5. Configure o webhook no painel Asaas: `https://seudominio.com/api/webhooks/asaas`

### Variáveis obrigatórias em produção
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://seudominio.com
NEXTAUTH_SECRET=<chave aleatória forte>
ASAAS_BASE_URL=https://www.asaas.com/api/v3
ASAAS_API_KEY=$aact_...
WEBHOOK_SECRET=<segredo configurado no Asaas>
NEXT_PUBLIC_APP_URL=https://seudominio.com
```

---

## 📋 Checklist de produção

### Banco de dados
- [ ] Migrar de SQLite para PostgreSQL
- [ ] Rodar `prisma migrate deploy` após cada deploy
- [ ] Configurar backup automático do banco

### Segurança
- [ ] Alterar senha do admin padrão
- [ ] Definir `NEXTAUTH_SECRET` forte (≥32 chars)
- [ ] Configurar `WEBHOOK_SECRET` no Asaas e no `.env`
- [ ] Checar se HTTPS está ativo no domínio
- [ ] Remover dados de seed em produção

### Asaas
- [ ] Trocar `ASAAS_BASE_URL` para produção
- [ ] Usar `ASAAS_API_KEY` de produção
- [ ] Cadastrar URL do webhook no painel Asaas
- [ ] Testar fluxo completo de pagamento

### PWA
- [ ] Adicionar ícones reais (192px e 512px) em `/public`
- [ ] Testar instalação no Android e iOS
- [ ] Adicionar screenshots em `/public` para o manifest

### SEO
- [ ] Atualizar `NEXT_PUBLIC_APP_URL` com domínio real
- [ ] Gerar og-image.png (1200×630)
- [ ] Submeter sitemap no Google Search Console

---

## 🔮 Próximas versões (backlog)

| Feature                       | Prioridade |
|-------------------------------|------------|
| Certificado PDF de conclusão  | Alta       |
| Notificações por e-mail       | Alta       |
| Sistema de comentários/fórum  | Média      |
| Quizzes e avaliações          | Média      |
| Cupons de desconto            | Média      |
| Relatórios avançados          | Baixa      |
| App React Native              | Baixa      |
| Integração Google/Apple login | Baixa      |
| Dark mode completo            | Baixa      |

---

## 🛠 Scripts disponíveis

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run start        # inicia servidor de produção
npm run lint         # ESLint
npm run db:push      # sincroniza schema sem migration
npm run db:migrate   # cria nova migration
npm run db:seed      # popula banco com dados de exemplo
npm run db:studio    # abre Prisma Studio no browser
```

---

Feito com 🌱 pela equipe Escola Seiva.
