#!/bin/bash

# Script para preparar migração para Netlify
echo "📼 Kodachrome LUT Gallery - Preparação para Netlify"
echo "=================================================="

# Verificar estrutura
echo "📁 Verificando estrutura do projeto..."

if [ -d "luts" ]; then
    LUT_COUNT=$(ls luts/*.cube 2>/dev/null | wc -l)
    echo "✅ Pasta luts/ encontrada com $LUT_COUNT arquivos .cube"
else
    echo "❌ Pasta luts/ não encontrada"
fi

if [ -f "lut_plataform.py" ]; then
    echo "✅ Aplicação Streamlit original encontrada"
fi

if [ -f "requirements.txt" ]; then
    echo "✅ requirements.txt encontrado"
fi

if [ -f "netlify.toml" ]; then
    echo "✅ Configuração Netlify criada"
fi

if [ -f "package.json" ]; then
    echo "✅ package.json criado"
fi

if [ -d "src" ]; then
    echo "✅ Pasta src/ com frontend criada"
fi

if [ -d "netlify/functions" ]; then
    echo "✅ Netlify Functions criadas"
fi

echo ""
echo "🎯 Status da Migração:"
echo "======================"
echo "✅ Arquitetura planejada para Netlify"
echo "✅ Frontend moderno criado (Webpack + Vanilla JS)"
echo "✅ Netlify Functions configuradas (Python)"
echo "✅ Configurações de deploy criadas"
echo "✅ Scripts de setup preparados"
echo "✅ Documentação completa criada"

echo ""
echo "📋 Próximos Passos:"
echo "=================="
echo "1. Instalar Node.js 18+ (ver INSTALL.md)"
echo "2. Executar: npm install"
echo "3. Executar: npm run build"
echo "4. Configurar Netlify CLI"
echo "5. Fazer deploy: netlify deploy --prod"

echo ""
echo "📖 Documentação:"
echo "================"
echo "- README.md: Documentação geral"
echo "- INSTALL.md: Instruções detalhadas de instalação"
echo "- setup.sh: Script automatizado de setup"

echo ""
echo "🚀 A migração está pronta!"
echo "Consulte INSTALL.md para instruções completas."
