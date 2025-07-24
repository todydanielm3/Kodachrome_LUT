# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Kodachrome LUT Gallery**! Sua ajuda é muito bem-vinda.

## 🌟 Como Contribuir

### 1. **Issues e Bug Reports**
- 🐛 **Bugs**: Use o template de bug report
- 💡 **Features**: Use o template de feature request  
- 📝 **Documentação**: Melhorias na docs são sempre bem-vindas
- 🎨 **UI/UX**: Sugestões de design e usabilidade

### 2. **Pull Requests**
- 🔧 **Correções**: Bug fixes e melhorias
- ✨ **Features**: Novas funcionalidades
- 📚 **Docs**: Atualizações na documentação
- 🧪 **Testes**: Adição de testes

## 🚀 Processo de Desenvolvimento

### Setup Inicial
```bash
# 1. Fork o repositório no GitHub
# 2. Clone seu fork
git clone https://github.com/SEU-USERNAME/kodachrome-lut-gallery.git
cd kodachrome-lut-gallery

# 3. Adicione o repositório original como upstream
git remote add upstream https://github.com/daniel8moraes/kodachrome-lut-gallery.git

# 4. Instale dependências
npm install

# 5. Configure ambiente Python
python3 -m venv .venv
source .venv/bin/activate
pip install pillow-lut pillow
```

### Fluxo de Trabalho
```bash
# 1. Crie uma branch para sua feature
git checkout -b feature/nome-da-sua-feature

# 2. Faça suas alterações
# ... código ...

# 3. Teste localmente
npm run dev
netlify dev  # Em outro terminal

# 4. Commit suas mudanças
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 5. Push para seu fork
git push origin feature/nome-da-sua-feature

# 6. Abra um Pull Request no GitHub
```

## 📝 Padrões de Código

### JavaScript
```javascript
// ✅ Bom
const processImage = async (imageData) => {
    try {
        const result = await apiCall(imageData);
        return result;
    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        throw error;
    }
};

// ❌ Evitar
function processImage(imageData) {
    // sem error handling
    return apiCall(imageData);
}
```

### CSS
```css
/* ✅ Bom - BEM naming */
.gallery-item {
    display: flex;
    flex-direction: column;
}

.gallery-item__image {
    width: 100%;
    border-radius: 8px;
}

.gallery-item--selected {
    border: 2px solid #007bff;
}

/* ❌ Evitar */
.item {
    /* muito genérico */
}
```

### Python (Functions)
```python
# ✅ Bom
def process_image_with_lut(image_data: bytes, lut_path: str) -> bytes:
    """
    Processa imagem aplicando LUT específico.
    
    Args:
        image_data: Dados da imagem em bytes
        lut_path: Caminho para o arquivo LUT
        
    Returns:
        Imagem processada em bytes
        
    Raises:
        ValueError: Se os dados da imagem forem inválidos
    """
    try:
        image = Image.open(io.BytesIO(image_data))
        lut = load_cube_file(lut_path)
        processed = image.filter(lut)
        
        buffer = io.BytesIO()
        processed.save(buffer, format='JPEG', quality=85)
        return buffer.getvalue()
        
    except Exception as e:
        raise ValueError(f"Erro ao processar imagem: {e}")
```

## 🧪 Testes

### Frontend
```bash
# Teste manual
npm run dev
# Verificar se interface carrega corretamente
# Testar upload de imagem
# Testar seleção de LUTs
# Testar responsividade
```

### Backend
```bash
# Teste das functions
netlify dev
# Testar /api/get-luts
# Testar /api/process-image
# Verificar logs de erro
```

### Checklist de Testes
- [ ] **Upload** de diferentes formatos de imagem
- [ ] **Seleção** múltipla de LUTs
- [ ] **Download** do ZIP funciona
- [ ] **Responsividade** em mobile
- [ ] **Performance** não degradou
- [ ] **Acessibilidade** mantida

## 📋 Templates de Issues

### Bug Report
```markdown
**Descrição do Bug**
Descrição clara e concisa do problema.

**Para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Desktop:**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]

**Mobile:**
- Device: [ex: iPhone 12]
- OS: [ex: iOS 14]
- Browser: [ex: Safari]
```

### Feature Request
```markdown
**Descrição da Feature**
Descrição clara da funcionalidade proposta.

**Problema que Resolve**
Que problema esta feature resolve?

**Solução Proposta**
Como você imagina que funcione?

**Alternativas Consideradas**
Outras formas de resolver o problema?

**Mockups/Exemplos**
Wireframes ou exemplos visuais.
```

## 🎨 Diretrizes de Design

### Cores
```css
:root {
    --primary: #007bff;      /* Azul principal */
    --secondary: #6c757d;    /* Cinza secundário */
    --success: #28a745;      /* Verde sucesso */
    --danger: #dc3545;       /* Vermelho erro */
    --warning: #ffc107;      /* Amarelo aviso */
    --light: #f8f9fa;        /* Cinza claro */
    --dark: #343a40;         /* Cinza escuro */
}
```

### Typography
```css
/* Hierarquia de títulos */
h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 500; }

/* Corpo do texto */
body { font-family: 'Inter', sans-serif; }
p { line-height: 1.6; }
```

### Spacing
```css
/* Sistema de espaçamento em 8px */
.m-1 { margin: 0.5rem; }    /* 8px */
.m-2 { margin: 1rem; }      /* 16px */
.m-3 { margin: 1.5rem; }    /* 24px */
.m-4 { margin: 2rem; }      /* 32px */
```

## 📱 Responsividade

### Breakpoints
```css
/* Mobile first */
.container {
    width: 100%;
    padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        max-width: 720px;
        margin: 0 auto;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
    }
}
```

## 🔍 Code Review

### Checklist para Reviewers
- [ ] **Funcionalidade** funciona conforme esperado
- [ ] **Código** está limpo e legível
- [ ] **Performance** não foi impactada negativamente
- [ ] **Testes** estão passando
- [ ] **Documentação** foi atualizada se necessário
- [ ] **Acessibilidade** foi considerada
- [ ] **Responsividade** está funcionando

### Checklist para Autores
- [ ] **Self-review** do próprio código
- [ ] **Testes locais** executados
- [ ] **Lint** sem erros
- [ ] **Commits** bem organizados
- [ ] **Descrição** clara no PR
- [ ] **Screenshots** se mudanças visuais

## 🏷️ Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: adiciona filtro de busca por LUT"

# Bug fixes  
git commit -m "fix: corrige erro no upload de PNG"

# Documentação
git commit -m "docs: atualiza README com novas instruções"

# Refactoring
git commit -m "refactor: simplifica lógica de processamento"

# Performance
git commit -m "perf: otimiza carregamento de imagens"

# Testes
git commit -m "test: adiciona testes para API de LUTs"

# Build/CI
git commit -m "build: atualiza dependências do webpack"
```

## 🎯 Tipos de Contribuição

### 🐛 **Bug Fixes**
- Correção de erros existentes
- Melhorias de performance
- Fixes de compatibilidade

### ✨ **Features**
- Novas funcionalidades
- Melhorias de UX
- Integrações com APIs

### 📚 **Documentação**
- README, CHANGELOG
- Comentários no código
- Tutoriais e guias

### 🎨 **Design/UI**
- Melhorias visuais
- Responsividade
- Acessibilidade

### 🧪 **Testes**
- Testes unitários
- Testes de integração
- Testes E2E

### 📦 **Tooling**
- Build scripts
- CI/CD pipelines
- Dev tools

## 🏆 Reconhecimento

Contribuidores serão reconhecidos em:
- **README.md** - seção de contribuidores
- **CHANGELOG.md** - créditos por versão
- **Release notes** - agradecimentos especiais

## 📞 Dúvidas?

- 💬 **Issues**: Para dúvidas técnicas
- 📧 **Email**: contato@danielmoraes.dev
- 📷 **Instagram**: [@daniel8moraes](https://instagram.com/daniel8moraes)

## 📄 Código de Conduta

Este projeto adere ao [Contributor Covenant](https://www.contributor-covenant.org/). Esperamos que todos os participantes sigam essas diretrizes para manter um ambiente acolhedor e inclusivo.

---

**Obrigado por contribuir! 🙏**

Toda ajuda é valiosa, desde correções de typos até novas features. Juntos fazemos este projeto ainda melhor! 🚀
