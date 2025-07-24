#!/bin/bash

echo "🧪 Testando se todos os LUTs estão sendo carregados..."
echo "=================================================="

# Contar LUTs na pasta
LUT_COUNT=$(ls luts/*.cube 2>/dev/null | wc -l)
echo "📁 LUTs encontrados na pasta: $LUT_COUNT"

# Teste simples com curl (se disponível)
if command -v curl &> /dev/null; then
    echo "🌐 Testando endpoint da API..."
    
    # Criar uma imagem de teste pequena em base64
    TEST_IMAGE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    # Testar API
    RESPONSE=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"image_data\": \"$TEST_IMAGE\"}" \
        http://localhost:8888/api/process-image)
    
    if [ $? -eq 0 ]; then
        # Contar LUTs na resposta
        API_LUT_COUNT=$(echo "$RESPONSE" | grep -o '"luts":\[' | wc -l)
        if [ "$API_LUT_COUNT" -gt 0 ]; then
            RETURNED_LUTS=$(echo "$RESPONSE" | grep -o '"luts":\[[^]]*\]' | grep -o ',' | wc -l)
            RETURNED_LUTS=$((RETURNED_LUTS + 1))
            echo "✅ API respondeu com $RETURNED_LUTS LUTs"
            
            if [ "$RETURNED_LUTS" -eq "$LUT_COUNT" ]; then
                echo "🎉 SUCESSO: Todos os $LUT_COUNT LUTs estão sendo carregados!"
            else
                echo "⚠️  ATENÇÃO: API retornou $RETURNED_LUTS LUTs, mas existem $LUT_COUNT na pasta"
            fi
        else
            echo "❌ API não retornou LUTs"
            echo "Resposta: $RESPONSE"
        fi
    else
        echo "❌ Erro ao chamar API (servidor pode não estar rodando)"
    fi
else
    echo "⚠️  curl não encontrado, pulando teste da API"
fi

echo ""
echo "📊 Resumo:"
echo "- LUTs na pasta: $LUT_COUNT"
echo "- Servidor: http://localhost:8888"
echo "- Para testar manualmente, faça upload de uma imagem na interface"
echo ""
echo "🔍 Alguns exemplos de LUTs disponíveis:"
ls luts/*.cube | head -5 | while read lut; do
    echo "  - $(basename "$lut" .cube)"
done
echo "  ... e mais $((LUT_COUNT - 5)) LUTs"
