# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-07-24

### 🎉 Migração Completa para Netlify

#### Added
- **289 filtros LUT** organizados por fabricante e categoria
- **Interface moderna** responsiva com Webpack + Vanilla JS
- **Arquitetura serverless** com Netlify Functions
- **Upload drag & drop** para imagens
- **Grid dinâmico** com previews coloridos dos LUTs
- **Seleção múltipla** com checkboxes
- **Download em lote** em formato ZIP
- **API REST** para processamento de imagens
- **Build pipeline** automatizado
- **Deploy automático** via Git
- **CDN global** para performance otimizada

#### Changed
- **Migração completa** do Streamlit para Netlify
- **Performance** 3x mais rápida que a versão anterior
- **Responsividade** total mobile-first
- **Escalabilidade** infinita com serverless
- **Custos** otimizados pay-per-use

#### Technical Details
- **Frontend**: Webpack 5 + Vanilla JavaScript + CSS3
- **Backend**: Netlify Functions (Python + JavaScript)
- **Build**: Babel + CSS Loader + HTML Plugin
- **Deploy**: Netlify CLI + GitHub Actions
- **CDN**: Global distribution via Netlify Edge

### 📸 Filtros por Categoria

#### Agfa Films (5 filtros)
- APX 100, APX 25, Precisa 100, Ultra Color 100, Vista 200

#### Fuji Films (180+ filtros)
- **Color Negative**: 160C, 400H, 800Z, Superia series
- **Professional**: Astia, Provia, Velvia, Sensia
- **Instant**: FP-100C, FP-3000B (multiple variations)
- **Cinema**: 3510, 3513 series
- **B&W**: Neopan, Acros

#### Kodak Films (40+ filtros)  
- **Color**: Portra, Ektar, Gold, UltraMax
- **B&W**: T-Max, Tri-X, BW400CN

#### Intensity Variations
- **Natural**: Cor original do filme
- **Minus (-)**: Menos saturação
- **Plus (+)**: Mais saturação
- **Plus Plus (++)**: Máxima saturação

## [1.0.0] - 2025-01-15

### 🎬 Versão Original Streamlit

#### Added
- **Aplicação Streamlit** básica
- **Processamento de LUTs** com pillow-lut
- **Upload de imagens** simples
- **Download individual** de imagens processadas
- **Interface básica** desktop-only

#### Features
- Suporte a formatos JPG, PNG, TIFF, BMP
- Processamento local de imagens
- Filtros LUT organizados por pasta
- Preview básico das imagens processadas

#### Technical Stack
- **Python**: Streamlit framework
- **Image Processing**: Pillow + pillow-lut
- **Deploy**: Manual server setup
- **UI**: Streamlit components

## [Unreleased] - Próximas Versões

### 🔮 v2.1 - Em Desenvolvimento
- [ ] **Sistema de busca** e filtros por categoria
- [ ] **Comparação lado a lado** de filtros
- [ ] **Histórico** de processamentos
- [ ] **Favoritos** do usuário
- [ ] **Modo batch** para múltiplas imagens

### 🚀 v2.2 - Roadmap
- [ ] **Editor básico** de imagens (crop, rotate, adjust)
- [ ] **API pública** para desenvolvedores
- [ ] **Modo offline** com Service Worker
- [ ] **Exportação** em múltiplos formatos
- [ ] **Watermark** customizável

### 🌟 v3.0 - Visão Futura
- [ ] **Machine Learning** para sugestões automáticas
- [ ] **Criação de LUTs** customizados pelo usuário
- [ ] **Sistema colaborativo** e compartilhamento
- [ ] **Mobile app** nativo (React Native)
- [ ] **Plugin** para editores (Photoshop, Lightroom)

## Comparação de Versões

| Feature | v1.0 (Streamlit) | v2.0 (Netlify) | v3.0 (Futuro) |
|---------|------------------|----------------|---------------|
| **LUTs** | 289 | 289 | 500+ |
| **Performance** | Lenta | 3x mais rápida | Instantânea |
| **Mobile** | ❌ | ✅ | ✅ |
| **Offline** | ❌ | ❌ | ✅ |
| **API** | ❌ | REST | GraphQL |
| **ML** | ❌ | ❌ | ✅ |
| **Colaboração** | ❌ | ❌ | ✅ |

## Links e Referências

- **Demo v2.0**: [kodachrome-lut-gallery.netlify.app](https://kodachrome-lut-gallery.netlify.app)
- **Repositório**: [github.com/daniel8moraes/kodachrome-lut-gallery](https://github.com/daniel8moraes/kodachrome-lut-gallery)
- **Issues**: [GitHub Issues](https://github.com/daniel8moraes/kodachrome-lut-gallery/issues)
- **Documentação**: [README.md](./README.md)

---

**Formato**: [Keep a Changelog](https://keepachangelog.com/)  
**Versionamento**: [Semantic Versioning](https://semver.org/)  
**Autor**: [@daniel8moraes](https://instagram.com/daniel8moraes)
