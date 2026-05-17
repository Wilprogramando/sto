# 🎵 Repertório da Igreja

Sistema profissional para gerenciar hinos, montar repertórios e gerar PDFs prontos para compartilhar no WhatsApp.

Construído em **React + TypeScript + Tailwind CSS + Vite**, com persistência 100% local (`localStorage`). Não exige internet nem servidor: tudo roda no navegador.

---

## ✨ Funcionalidades

- 📊 **Dashboard** com estatísticas, ações rápidas e próximo culto agendado
- 🎶 **Cadastro de Hinos** com nome, tom, cantor, categoria, letra completa e observações
- 📖 **Hinos da Harpa Cristã** com lookup automático por número (auto-preenche o nome a partir de uma base local editável)
- 📋 **Montar Repertório** arrastando/reordenando hinos, editando o tom de cada item para aquele culto
- 💾 **Repertórios Salvos** com filtros (futuros/passados), busca e duplicação
- 📄 **Geração de PDF profissional** (com ou sem letras) para o repertório completo ou para hinos individuais
- 📱 **Compartilhamento WhatsApp** via Web Share API (mobile) ou fallback wa.me (desktop)
- ⚙️ **Configurações** com nome da igreja, responsável e rodapé do PDF
- 💼 **Backup completo** em JSON (exportar/importar) — útil para mover entre dispositivos
- 🗑️ **Limpar todos os dados** com confirmação dupla (clique + digitação)

---

## 🚀 Instalação e execução local

### Pré-requisitos

- **Node.js 18+** (recomendado 20+)
- **npm** ou **pnpm** ou **yarn**

### Passos

```bash
# 1. Entre na pasta do projeto
cd repertorio-igreja

# 2. Instale as dependências
npm install

# 3. Rode em desenvolvimento (abre automaticamente em http://localhost:5173)
npm run dev

# 4. Para gerar a versão de produção (build estático)
npm run build

# 5. Para servir o build localmente
npm run preview
```

Depois do `npm run build`, a pasta `dist/` contém HTML/CSS/JS estáticos que podem ser hospedados em qualquer servidor (Vercel, Netlify, GitHub Pages, ou simplesmente abertos com um servidor estático local).

---

## 📁 Estrutura do projeto

```
repertorio-igreja/
├── index.html              # HTML raiz (Vite)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.tsx            # Entrada React
    ├── App.tsx             # Rotas + Providers
    ├── index.css           # Tailwind + animações
    ├── types/
    │   └── index.ts        # Tipos compartilhados
    ├── data/
    │   └── harpaBase.ts    # Base inicial da Harpa Cristã
    ├── services/
    │   ├── storage.ts      # localStorage + backup
    │   ├── pdf.ts          # Geração de PDF (jsPDF)
    │   └── whatsapp.ts     # Web Share + fallback wa.me
    ├── utils/
    │   └── helpers.ts      # Funções utilitárias
    ├── context/
    │   ├── AppContext.tsx  # Estado global da aplicação
    │   └── ToastContext.tsx# Notificações toast
    ├── components/
    │   ├── Layout.tsx      # Sidebar + menu mobile
    │   ├── Modal.tsx       # Modal e ConfirmModal
    │   ├── ui.tsx          # Button, Input, Card, Badge, etc.
    │   ├── FormHino.tsx    # Formulário de hinos (reutilizável)
    │   └── VisualizarHino.tsx
    └── pages/
        ├── DashboardPage.tsx
        ├── HinosPage.tsx
        ├── HarpaPage.tsx
        ├── MontarRepertorioPage.tsx
        ├── RepertoriosSalvosPage.tsx
        └── ConfiguracoesPage.tsx
```

---

## 💡 Dicas de uso

### Hinos da Harpa Cristã

A base local da Harpa Cristã vem com alguns hinos populares para você testar.
Para uma base completa, vá em **Hinos da Harpa → Gerenciar Base** e importe um arquivo:

- **JSON**: `[{ "numero": 1, "nome": "Chuvas de Graça" }, ...]`
- **CSV**: uma linha por hino, formato `numero,nome do hino`

Depois disso, ao cadastrar um hino e escolher o tipo "Harpa", basta digitar o número e o nome será preenchido automaticamente.

### Backup

Acesse **Configurações → Backup e Restauração** e clique em **Exportar Backup**.
O arquivo JSON salvo contém **todos** os seus dados (hinos, repertórios, configurações e base da Harpa).

Para restaurar, clique em **Importar Backup** e selecione o arquivo. ⚠️ A importação substitui os dados atuais.

### Onde os dados ficam?

Tudo é armazenado no `localStorage` do **seu navegador**, especificamente nas chaves:

- `repertorio_hinos`
- `repertorio_repertorios`
- `repertorio_configuracoes`
- `repertorio_harpa_base`

Limpar o cache/dados do navegador remove tudo. Por isso o backup JSON é importante para uso a longo prazo.

---

## 🛠️ Tecnologias

| Pacote | Função |
|---|---|
| `react` + `react-dom` | UI |
| `react-router-dom` | Rotas SPA |
| `typescript` | Tipagem estática |
| `tailwindcss` | Estilização utilitária |
| `vite` | Bundler e dev server |
| `jspdf` | Geração de PDFs no navegador |
| `lucide-react` | Ícones |
| `uuid` | Geração de IDs únicos |

---

## 📝 Licença

Uso livre. Distribuído sem garantias. Bom culto! 🙏
