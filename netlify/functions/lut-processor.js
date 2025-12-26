const fs = require('fs');
const path = require('path');

/**
 * Parser para arquivos LUT .cube
 * Lê e parseia arquivos LUT no formato .cube
 */
class LUTParser {
  constructor(lutPath) {
    this.lutPath = lutPath;
    this.size = 0;
    this.data = [];
  }

  parse() {
    const content = fs.readFileSync(this.lutPath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Ignorar comentários e linhas vazias
      if (trimmed.startsWith('#') || trimmed === '') continue;
      
      // Capturar tamanho da LUT
      if (trimmed.startsWith('LUT_3D_SIZE')) {
        this.size = parseInt(trimmed.split(/\s+/)[1]);
        continue;
      }

      // Capturar valores RGB
      const values = trimmed.split(/\s+/).map(v => parseFloat(v));
      if (values.length === 3 && !isNaN(values[0])) {
        this.data.push(values);
      }
    }

    return this;
  }

  /**
   * Aplica a LUT em um pixel RGB
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {Array} [r, g, b] transformados
   */
  apply(r, g, b) {
    if (this.data.length === 0) return [r, g, b];

    // Normalizar RGB para 0-1
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    // Calcular índices na LUT 3D
    const scale = this.size - 1;
    const rIndex = Math.min(Math.floor(rNorm * scale), scale - 1);
    const gIndex = Math.min(Math.floor(gNorm * scale), scale - 1);
    const bIndex = Math.min(Math.floor(bNorm * scale), scale - 1);

    // Calcular posição no array 1D
    const index = rIndex + gIndex * this.size + bIndex * this.size * this.size;

    // Obter valor da LUT
    if (index >= 0 && index < this.data.length) {
      const lutValue = this.data[index];
      return [
        Math.round(lutValue[0] * 255),
        Math.round(lutValue[1] * 255),
        Math.round(lutValue[2] * 255)
      ];
    }

    return [r, g, b];
  }
}

/**
 * Aplica LUT em um buffer de imagem Sharp
 * @param {Sharp} image - Imagem Sharp
 * @param {string} lutPath - Caminho do arquivo .cube
 * @returns {Promise<Sharp>} Imagem com LUT aplicado
 */
async function applyLUT(image, lutPath) {
  const lut = new LUTParser(lutPath).parse();
  
  // Obter dados brutos da imagem
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Aplicar LUT pixel por pixel
  const pixels = new Uint8Array(data.length);
  
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const [newR, newG, newB] = lut.apply(r, g, b);
    
    pixels[i] = newR;
    pixels[i + 1] = newG;
    pixels[i + 2] = newB;
    
    // Preservar alpha channel se existir
    if (info.channels === 4) {
      pixels[i + 3] = data[i + 3];
    }
  }

  // Criar nova imagem com pixels transformados
  const sharp = require('sharp');
  return sharp(Buffer.from(pixels), {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  });
}

module.exports = { LUTParser, applyLUT };
