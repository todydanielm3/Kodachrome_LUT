# 🎨 Guia de Estilo - Kodachrome LUT Gallery

Este documento define os padrões visuais e de código do projeto, inspirado no design minimalista e elegante do site Acervo Café.

---

## 📐 Design System

### Filosofia de Design

O design do Kodachrome LUT Gallery segue os princípios:

1. **Minimalismo** - Menos é mais, foco no conteúdo
2. **Elegância** - Tipografia sofisticada e espaçamentos generosos
3. **Naturalidade** - Cores terrosas que remetem ao analógico
4. **Suavidade** - Transições e animações delicadas
5. **Funcionalidade** - Cada elemento tem um propósito

---

## 🎨 Paleta de Cores

### Cores Principais

```css
/* Tons Terrosos */
--color-primary: #3d3026      /* Marrom Escuro - Elegância */
--color-secondary: #6b5d52    /* Marrom Médio - Sofisticação */
--color-accent: #8b7355       /* Bege Escuro - Destaque sutil */
--color-light: #f5f1ed        /* Bege Claro - Suavidade */
--color-cream: #faf8f5        /* Creme - Pureza */
--color-white: #ffffff        /* Branco - Limpeza */
```

### Cores de Texto

```css
--text-primary: #2d2520       /* Texto principal */
--text-secondary: #6b5d52     /* Texto secundário */
--text-light: #9b8b7e         /* Texto discreto */
```

### Cores de Estado

```css
--color-success: #5a7247      /* Verde Musgo - Sucesso */
--color-error: #a64a3d        /* Terracota - Erro */
--color-hover: #4a3d32        /* Marrom Hover */
```

### Aplicação das Cores

**Backgrounds:**
- Fundo principal: `--color-cream`
- Cards/Modais: `--color-white`
- Hero/Footer: `--color-primary`

**Texto:**
- Títulos: `--text-primary`
- Corpo: `--text-secondary`
- Labels: `--text-light`

**Interações:**
- Botões primários: `--color-primary`
- Hover: `--color-hover`
- Success: `--color-success`

---

## 📝 Tipografia

### Famílias de Fonte

```css
/* Títulos e Headlines */
font-family: 'Cormorant Garamond', serif;
/* Serifada, elegante, clássica */

/* Corpo de Texto */
font-family: 'Montserrat', sans-serif;
/* Sans-serif, moderna, legível */
```

### Escala Tipográfica

```css
/* Headlines */
h1: 4rem (64px)      /* Hero titles */
h2: 3rem (48px)      /* Section titles */
h3: 2rem (32px)      /* Subsections */
h4: 1.5rem (24px)    /* Card titles */

/* Body */
body: 1rem (16px)    /* Texto base */
small: 0.85rem (14px) /* Metadados */
```

### Pesos de Fonte

```css
light: 300    /* Textos suaves */
regular: 400  /* Texto padrão */
medium: 500   /* Ênfase leve */
semibold: 600 /* Títulos */
bold: 700     /* Destaques */
```

### Altura de Linha

```css
headings: 1.3    /* Títulos compactos */
body: 1.7        /* Leitura confortável */
ui: 1.5          /* Elementos UI */
```

---

## 📏 Espaçamentos

### Sistema Modular

```css
--spacing-xs: 0.5rem  /* 8px  - Interno */
--spacing-sm: 1rem    /* 16px - Pequeno */
--spacing-md: 2rem    /* 32px - Médio */
--spacing-lg: 4rem    /* 64px - Grande */
--spacing-xl: 6rem    /* 96px - Extra Grande */
```

### Aplicação

**Padding interno:**
- Botões: `1.25rem 3rem`
- Cards: `1.5rem`
- Containers: `var(--spacing-md)`

**Margin entre elementos:**
- Pequeno: `var(--spacing-sm)`
- Médio: `var(--spacing-md)`
- Grande: `var(--spacing-lg)`

**Seções:**
- Entre seções: `var(--spacing-xl)`
- Dentro de seções: `var(--spacing-lg)`

---

## 🎭 Sombras

### Níveis de Elevação

```css
/* Sutil - Cards, inputs */
--shadow-sm: 0 2px 8px rgba(61, 48, 38, 0.08)

/* Médio - Cards hover, dropdowns */
--shadow-md: 0 4px 16px rgba(61, 48, 38, 0.12)

/* Alto - Modais, botões floating */
--shadow-lg: 0 8px 32px rgba(61, 48, 38, 0.16)
```

### Uso

- **SM**: Estados normais, elementos estáticos
- **MD**: Hover states, elementos interativos
- **LG**: Elementos flutuantes, destaque máximo

---

## 🎯 Componentes

### Botões

```css
/* Primário */
background: var(--color-primary)
color: white
border-radius: 50px
padding: 1.25rem 3rem
font-weight: 600

/* Hover */
background: var(--color-hover)
transform: translateY(-2px)
```

### Cards

```css
background: var(--color-white)
border-radius: 12px
box-shadow: var(--shadow-sm)
overflow: hidden

/* Hover */
transform: translateY(-8px)
box-shadow: var(--shadow-lg)
```

### Inputs/Upload

```css
border: 2px dashed var(--color-accent)
border-radius: 16px
background: var(--color-white)
padding: var(--spacing-lg)

/* Hover/Active */
border-color: var(--color-primary)
background: rgba(61, 48, 38, 0.03)
```

---

## ⚡ Animações

### Princípios

1. **Sutileza** - Animações discretas, não chamativas
2. **Propósito** - Cada animação tem significado
3. **Performance** - Usar transform e opacity
4. **Acessibilidade** - Respeitar prefers-reduced-motion

### Durações

```css
quick: 0.15s      /* Micro-interactions */
normal: 0.3s      /* Transições padrão */
slow: 0.5s        /* Animações complexas */
```

### Easing

```css
/* Suave e natural */
cubic-bezier(0.4, 0, 0.2, 1)

/* Bounce sutil */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Transições Comuns

```css
/* Hover effects */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Transform apenas */
transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);

/* Opacity fade */
transition: opacity 0.3s ease;
```

---

## 📱 Responsividade

### Breakpoints

```css
/* Desktop First */
desktop: 1400px+     /* Design base */
laptop: 1024-1399px  /* Laptops */
tablet: 768-1023px   /* Tablets */
mobile: 480-767px    /* Mobile landscape */
small: 0-479px       /* Mobile portrait */
```

### Abordagem

1. **Desktop First** para design inicial
2. **Mobile First** para código CSS
3. **Touch Targets** mínimo 44x44px
4. **Tipografia** escalável com viewport units

---

## 🔍 Acessibilidade

### Contraste de Cores

- **AA Normal**: 4.5:1 mínimo
- **AA Large**: 3:1 mínimo
- Todas as combinações testadas e aprovadas

### Navegação

```css
/* Focus visível */
:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}

/* Skip links */
.skip-link {
    position: absolute;
    top: -40px;
}

.skip-link:focus {
    top: 0;
}
```

### Movimento

```css
/* Respeitar preferências */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## 💻 Código

### Nomenclatura CSS

```css
/* BEM-like */
.component-name              /* Bloco */
.component-name__element     /* Elemento */
.component-name--modifier    /* Modificador */

/* Estados */
.is-active
.is-hidden
.has-error
```

### Organização CSS

```css
/* 1. Variáveis */
:root { ... }

/* 2. Reset */
* { ... }

/* 3. Elementos base */
body, h1, p { ... }

/* 4. Layout */
.container, .grid { ... }

/* 5. Componentes */
.button, .card { ... }

/* 6. Utilities */
.hidden, .flex { ... }

/* 7. Responsive */
@media { ... }
```

### JavaScript

```javascript
// Camel case para variáveis
const selectedLUTs = new Set();

// Pascal case para classes
class KodachromeLUTGallery { }

// Constantes em UPPER_CASE
const MAX_FILE_SIZE = 10485760;

// Async/await para assíncrono
async handleFileUpload(file) { }
```

---

## 🎪 Exemplos de Uso

### Card de Imagem

```html
<div class="gallery-item">
    <div class="image-container">
        <img src="..." alt="..." loading="lazy">
        <div class="image-overlay">
            <label class="checkbox-label">
                <input type="checkbox">
                <span class="checkmark"></span>
            </label>
        </div>
    </div>
    <div class="image-caption">Nome do Filtro</div>
</div>
```

### Botão Primário

```html
<button class="download-btn">
    <svg>...</svg>
    <span>Baixar imagens</span>
</button>
```

### Seção com Header

```html
<section class="section">
    <div class="section-header">
        <h2 class="section-title">Título da Seção</h2>
        <p class="section-description">Descrição</p>
    </div>
    <div class="section-content">
        <!-- Conteúdo -->
    </div>
</section>
```

---

## ✅ Checklist de Qualidade

Ao adicionar ou modificar componentes, verificar:

- [ ] Cores seguem a paleta definida
- [ ] Tipografia usa as fontes corretas
- [ ] Espaçamentos usam variáveis CSS
- [ ] Sombras seguem o sistema de elevação
- [ ] Animações são suaves e têm propósito
- [ ] Responsivo em todos os breakpoints
- [ ] Contraste de cores adequado (AA)
- [ ] Navegação por teclado funciona
- [ ] Respeita prefers-reduced-motion
- [ ] Código bem comentado
- [ ] Performance otimizada

---

## 🔗 Referências

- **Inspiração**: [Acervo Café](https://www.acervocafe.com/)
- **Tipografia**: [Google Fonts](https://fonts.google.com/)
- **Acessibilidade**: [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- **CSS**: [MDN Web Docs](https://developer.mozilla.org/pt-BR/)

---

**Última atualização**: 20 de dezembro de 2025  
**Versão**: 3.0.0

---

<div align="center">

**[⬆ Voltar ao README](README.md)**

</div>
