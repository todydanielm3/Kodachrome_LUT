# Instruções de Instalação e Deploy - Kodachrome LUT Gallery

## 🔧 Pré-requisitos

### 1. Instalar Node.js

**Ubuntu/Debian:**
```bash
# Atualizar sistema
sudo apt update

# Instalar Node.js via NodeSource (recomendado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

**Arch Linux:**
```bash
sudo pacman -S nodejs npm
```

**Via NVM (recomendado para desenvolvimento):**
```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar terminal ou:
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts
nvm use --lts
```

### 2. Verificar Instalação
```bash
node --version  # Deve mostrar v18.x.x ou superior
npm --version   # Deve mostrar 9.x.x ou superior
```

## 🚀 Setup do Projeto

### 1. Instalar Dependências
```bash
cd /home/daniel-moraes/coding/Kodachrome_LUT
npm install
```

### 2. Instalar Netlify CLI
```bash
npm install -g netlify-cli
```

### 3. Build do Projeto
```bash
npm run build
```

## 🌐 Deploy no Netlify

### Opção 1: Netlify CLI (Recomendado)

1. **Login no Netlify:**
   ```bash
   netlify login
   ```

2. **Deploy de teste:**
   ```bash
   netlify deploy
   ```

3. **Deploy para produção:**
   ```bash
   netlify deploy --prod
   ```

### Opção 2: Via Interface Web

1. **Conectar repositório:**
   - Faça push do código para GitHub/GitLab/Bitbucket
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "Add new site" > "Import an existing project"
   - Conecte seu repositório

2. **Configurar build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Deploy:**
   - Clique em "Deploy site"

## 🛠️ Desenvolvimento Local

1. **Terminal 1 - Frontend:**
   ```bash
   npm run dev
   ```

2. **Terminal 2 - Functions:**
   ```bash
   netlify dev
   ```

3. **Acessar:** http://localhost:8888

## 📁 Estrutura de Arquivos

```
Kodachrome_LUT/
├── src/                    # Frontend
│   ├── index.html         # HTML principal
│   ├── index.js           # JavaScript principal
│   └── styles.css         # Estilos CSS
├── netlify/
│   └── functions/         # Netlify Functions (Python)
│       ├── process-image.py
│       ├── download-zip.py
│       └── requirements.txt
├── luts/                  # Arquivos LUT (.cube)
├── dist/                  # Build output (gerado)
├── node_modules/          # Dependências (gerado)
├── netlify.toml          # Configuração Netlify
├── package.json          # Dependências Node.js
├── webpack.config.js     # Configuração Webpack
├── .babelrc             # Configuração Babel
├── .gitignore           # Arquivos ignorados pelo Git
├── setup.sh             # Script de setup
└── README.md            # Documentação
```

## 🔍 Verificações Importantes

### 1. Verificar LUTs
```bash
# Deve mostrar arquivos .cube
ls -la luts/ | grep .cube
```

### 2. Testar Build Local
```bash
# Deve gerar pasta dist/ sem erros
npm run build
ls -la dist/
```

### 3. Testar Functions Local
```bash
# Instalar Python dependencies para desenvolvimento local
pip install pillow-lut pillow
```

## ❗ Troubleshooting

### Erro: "command not found: node"
- Instale Node.js conforme instruções acima

### Erro: "command not found: npm"
- Node.js não foi instalado corretamente
- Reinstale usando uma das opções acima

### Erro no build: "webpack command not found"
- Execute: `npm install`
- Se persistir: `npm install -g webpack-cli`

### Functions não funcionam
- Verifique se os arquivos LUT estão na pasta `luts/`
- Verifique logs no painel do Netlify

### Performance lenta
- As functions do Netlify têm cold start
- Primeira execução pode demorar mais

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do Netlify
2. Consulte a documentação do Netlify
3. Verifique se todas as dependências estão instaladas

## 🎯 Resultado Final

Após o deploy bem-sucedido, você terá:
- ✅ URL pública da aplicação
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Functions serverless funcionando
- ✅ Upload e processamento de imagens
- ✅ Download de ZIP com imagens processadas

A aplicação estará disponível em uma URL como: `https://seu-site.netlify.app`
