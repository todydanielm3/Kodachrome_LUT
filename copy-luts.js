const fs = require('fs');
const path = require('path');

// Copiar diretório luts para dentro de netlify/functions para deploy
const sourceLuts = path.join(__dirname, 'luts');
const targetLuts = path.join(__dirname, 'netlify', 'functions', 'luts');

// Criar diretório de destino se não existir
if (!fs.existsSync(targetLuts)) {
  fs.mkdirSync(targetLuts, { recursive: true });
}

// Copiar todos os arquivos .cube
const lutFiles = fs.readdirSync(sourceLuts).filter(f => f.endsWith('.cube'));
console.log(`Copiando ${lutFiles.length} arquivos LUT para netlify/functions/luts...`);

lutFiles.forEach(file => {
  const source = path.join(sourceLuts, file);
  const target = path.join(targetLuts, file);
  fs.copyFileSync(source, target);
});

console.log('✓ LUTs copiados com sucesso!');
