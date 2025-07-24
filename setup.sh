#!/bin/bash

# Script de setup para deploy no Netlify
echo "🚀 Configurando projeto Kodachrome LUT Gallery para Netlify..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale Node.js 16+ antes de continuar."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão 16+ é necessária. Versão atual: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

# Instalar Netlify CLI se não estiver instalado
if ! command -v netlify &> /dev/null; then
    echo "📦 Instalando Netlify CLI..."
    npm install -g netlify-cli
fi

echo "✅ Netlify CLI instalado: $(netlify --version)"

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build do projeto"
    exit 1
fi

echo "✅ Build concluído com sucesso"

# Verificar se existem LUTs
if [ ! -d "luts" ] || [ -z "$(ls -A luts)" ]; then
    echo "⚠️  Pasta 'luts' vazia ou não encontrada. Certifique-se de ter arquivos .cube na pasta luts/"
fi

echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute 'netlify login' para fazer login na sua conta Netlify"
echo "2. Execute 'netlify deploy' para fazer deploy de teste"
echo "3. Execute 'netlify deploy --prod' para deploy em produção"
echo ""
echo "🔍 Para desenvolvimento local:"
echo "1. Execute 'npm run dev' em um terminal"
echo "2. Execute 'netlify dev' em outro terminal"
echo "3. Acesse http://localhost:8888"
echo ""
echo "📖 Consulte o README.md para mais informações"
