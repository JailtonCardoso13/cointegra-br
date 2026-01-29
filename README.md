# COINTEGRA.BR - Sistema de Swing Trade Quantitativo

Sistema de análise de cointegração para identificar oportunidades de Long/Short na B3.

## 🚀 Deploy Rápido (Vercel - Recomendado)

### Opção 1: Deploy via GitHub (Mais Fácil)

1. **Crie uma conta no GitHub** (se não tiver): https://github.com

2. **Crie um novo repositório**:
   - Vá em https://github.com/new
   - Nome: `cointegra-br`
   - Deixe público
   - Clique "Create repository"

3. **Faça upload dos arquivos**:
   - Na página do repositório, clique em "uploading an existing file"
   - Arraste toda a pasta do projeto ou selecione os arquivos
   - Clique "Commit changes"

4. **Conecte com Vercel**:
   - Acesse https://vercel.com
   - Clique "Sign Up" e escolha "Continue with GitHub"
   - Autorize o acesso
   - Clique "Add New Project"
   - Selecione o repositório `cointegra-br`
   - Clique "Deploy"
   - Aguarde ~2 minutos

5. **Pronto!** Você receberá uma URL como: `https://cointegra-br.vercel.app`

---

### Opção 2: Deploy via CLI (Mais Rápido)

Se você tem Node.js instalado:

```bash
# 1. Instale a CLI da Vercel
npm install -g vercel

# 2. Na pasta do projeto, execute:
vercel

# 3. Siga as instruções (pressione Enter para aceitar os padrões)

# 4. Para deploy em produção:
vercel --prod
```

---

## 🔧 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

---

## ⚙️ Configuração da API Key

A API Key da Brapi já está configurada no código (`src/App.jsx`, linha 14).

Para alterar, edite a linha:
```javascript
API_KEY: 'sua_nova_api_key_aqui',
```

---

## 📊 Funcionalidades

- ✅ 94 pares de ações pré-configurados
- ✅ Cálculo de cointegração em tempo real (teste ADF)
- ✅ Z-Score e Bandas de Bollinger
- ✅ Half-life para estimar duração do trade
- ✅ Sistema de classificação por estrelas
- ✅ Simulador de operações
- ✅ Filtros por setor e qualidade
- ✅ Atualização automática durante pregão

---

## 🆘 Problemas Comuns

### "Failed to fetch" ou erros de CORS
- Certifique-se de que está acessando via HTTPS
- Verifique se a API Key está correta

### Dados não carregam
- A Brapi tem limite de requisições no plano gratuito
- Aguarde alguns minutos e tente novamente

---

## 📝 Licença

Uso educacional. Não constitui recomendação de investimento.
