import './styles.css';

class KodachromeLUTGallery {
    constructor() {
        this.selectedLUTs = new Set();
        this.lutNames = [];
        
        this.initializeApp();
    }

    async initializeApp() {
        // Para demonstração, vamos carregar uma lista dos LUTs disponíveis
        await this.loadAvailableLUTs();
        this.initializeEventListeners();
    }

    async loadAvailableLUTs() {
        // Para demonstração, carregar todos os LUTs dinamicamente
        try {
            // Tentar carregar lista dos LUTs via API
            const response = await fetch('/api/get-luts');
            if (response.ok) {
                const data = await response.json();
                this.lutNames = data.luts;
                this.totalLUTs = this.lutNames.length;
            } else {
                throw new Error('API não disponível');
            }
        } catch (error) {
            // Fallback: usar lista estática ampliada
            this.lutNames = this.getStaticLUTList();
            this.totalLUTs = 289; // Total real de LUTs no projeto
        }
        
        console.log(`Carregados ${this.lutNames.length} LUTs de um total de ${this.totalLUTs} disponíveis`);
    }

    getStaticLUTList() {
        // Lista expandida baseada nos LUTs reais disponíveis
        return [
            // Agfa Films
            'agfa_apx_100', 'agfa_apx_25', 'agfa_precisa_100', 'agfa_ultra_color_100', 'agfa_vista_200',
            
            // Fuji Color Films
            'fuji_160c', 'fuji_160c_-', 'fuji_160c_+', 'fuji_160c_++',
            'fuji_400h', 'fuji_400h_-', 'fuji_400h_+', 'fuji_400h_++',
            'fuji_800z', 'fuji_800z_-', 'fuji_800z_+', 'fuji_800z_++',
            'fuji_superia_100', 'fuji_superia_100_-', 'fuji_superia_100_+', 'fuji_superia_100_++',
            'fuji_superia_200', 'fuji_superia_200_-', 'fuji_superia_200_+', 'fuji_superia_200_++',
            'fuji_superia_400', 'fuji_superia_400_-', 'fuji_superia_400_+', 'fuji_superia_400_++',
            'fuji_superia_800', 'fuji_superia_800_-', 'fuji_superia_800_+', 'fuji_superia_800_++',
            'fuji_superia_1600', 'fuji_superia_1600_-', 'fuji_superia_1600_+', 'fuji_superia_1600_++',
            
            // Fuji Professional Films
            'fuji_astia_100_generic', 'fuji_astia_100f',
            'fuji_provia_100_generic', 'fuji_provia_100f', 'fuji_provia_400f', 'fuji_provia_400x',
            'fuji_velvia_50', 'fuji_velvia_100',
            'fuji_sensia_100',
            
            // Fuji Black & White
            'fuji_neopan_1600', 'fuji_neopan_1600_-', 'fuji_neopan_1600_+', 'fuji_neopan_1600_++',
            'fuji_neopan_acros_100',
            
            // Fuji Instant Films
            'fuji_fp_100c', 'fuji_fp-100c', 'fuji_fp-100c_--', 'fuji_fp-100c_-', 'fuji_fp-100c_+', 
            'fuji_fp-100c_++', 'fuji_fp-100c_++_alt', 'fuji_fp-100c_+++', 'fuji_fp-100c_alt',
            'fuji_fp-100c_cool', 'fuji_fp-100c_cool_--', 'fuji_fp-100c_cool_-', 'fuji_fp-100c_cool_+', 'fuji_fp-100c_cool_++',
            'fuji_fp-100c_negative', 'fuji_fp-100c_negative_--', 'fuji_fp-100c_negative_-', 'fuji_fp-100c_negative_+',
            'fuji_fp-100c_negative_++', 'fuji_fp-100c_negative_++_alt', 'fuji_fp-100c_negative_+++',
            'fuji_fp-3000b', 'fuji_fp-3000b_--', 'fuji_fp-3000b_-', 'fuji_fp-3000b_+', 'fuji_fp-3000b_++', 'fuji_fp-3000b_+++',
            'fuji_fp-3000b_hc', 'fuji_fp-3000b_negative', 'fuji_fp-3000b_negative_--', 'fuji_fp-3000b_negative_-',
            'fuji_fp-3000b_negative_+', 'fuji_fp-3000b_negative_++', 'fuji_fp-3000b_negative_+++', 'fuji_fp-3000b_negative_early',
            
            // Fuji Cinema Films
            'fuji_3510_constlclip', 'fuji_3510_constlmap', 'fuji_3510_cuspclip',
            'fuji_3513_constlclip', 'fuji_3513_constlmap', 'fuji_3513_cuspclip',
            
            // Kodak Color Films
            'kodak_ektar_100', 'kodak_ektar_100_-', 'kodak_ektar_100_+', 'kodak_ektar_100_++',
            'kodak_gold_100', 'kodak_gold_100_-', 'kodak_gold_100_+', 'kodak_gold_100_++',
            'kodak_gold_200', 'kodak_gold_200_-', 'kodak_gold_200_+', 'kodak_gold_200_++',
            'kodak_ultramax_400', 'kodak_ultramax_400_-', 'kodak_ultramax_400_+', 'kodak_ultramax_400_++',
            
            // Kodak Professional Films
            'kodak_portra_160', 'kodak_portra_160_-', 'kodak_portra_160_+', 'kodak_portra_160_++',
            'kodak_portra_400', 'kodak_portra_400_-', 'kodak_portra_400_+', 'kodak_portra_400_++',
            'kodak_portra_800', 'kodak_portra_800_-', 'kodak_portra_800_+', 'kodak_portra_800_++',
            
            // Kodak Black & White
            'kodak_bw400cn', 'kodak_bw400cn_-', 'kodak_bw400cn_+', 'kodak_bw400cn_++',
            'kodak_tmax_100', 'kodak_tmax_400', 'kodak_tmax_3200',
            'kodak_tri-x_400',
            
            // Exemplos adicionais (representando os outros LUTs)
            'kodachrome_vintage_1', 'kodachrome_vintage_2', 'kodachrome_vintage_3',
            'cinema_log_1', 'cinema_log_2', 'cinema_log_3',
            'vintage_fade_1', 'vintage_fade_2', 'vintage_fade_3',
            'film_emulation_1', 'film_emulation_2', 'film_emulation_3'
        ];
    }

    initializeEventListeners() {
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.addEventListener('click', () => this.downloadSelected());
        
        // Inicializar upload
        this.initializeUpload();
        
        // Mostrar LUTs automaticamente para demonstração
        this.showLUTList();
    }

    initializeUpload() {
        const dropzoneElement = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-input');

        if (!dropzoneElement || !fileInput) {
            console.warn('Elementos de upload não encontrados');
            return;
        }

        // Click handler for dropzone
        dropzoneElement.addEventListener('click', (e) => {
            e.preventDefault();
            fileInput.click();
        });

        // File input change handler
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and drop handlers
        dropzoneElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzoneElement.classList.add('dragover');
        });

        dropzoneElement.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropzoneElement.classList.remove('dragover');
        });

        dropzoneElement.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzoneElement.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    async handleFileUpload(file) {
        console.log('Arquivo selecionado:', file.name);
        
        // Validar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp'];
        if (!validTypes.includes(file.type)) {
            alert('Tipo de arquivo não suportado. Use JPG, PNG, TIFF ou BMP.');
            return;
        }

        // Mostrar loading
        this.showLoading();
        
        try {
            // Converter arquivo para base64
            const base64Data = await this.fileToBase64(file);
            
            // Tentar enviar para o backend
            try {
                const response = await fetch('/.netlify/functions/process-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        image_data: base64Data,
                        selected_luts: this.lutNames.slice(0, 20) // Processar apenas os primeiros 20 para demo
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    this.originalImage = file;
                    this.processedImages = data.processed_images;
                    
                    // Atualizar galeria com imagens processadas
                    this.showProcessedGallery(data.luts || this.lutNames.slice(0, 20));
                } else {
                    throw new Error('Erro na API');
                }
            } catch (apiError) {
                console.warn('API não disponível, usando modo demonstração:', apiError);
                
                // Fallback: mostrar preview da imagem original
                this.originalImage = file;
                this.showImagePreview(file);
            }
            
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            alert('Erro ao processar a imagem. Tente novamente.');
        } finally {
            this.hideLoading();
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    showImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            
            // Atualizar título para mostrar que uma imagem foi carregada
            const gallerySection = document.getElementById('gallery-section');
            const title = gallerySection.querySelector('h2');
            title.textContent = `Imagem carregada: ${file.name} - Selecione os LUTs desejados`;
            
            // Remover mensagem de info se existir
            const infoMessage = gallerySection.querySelector('.info-message');
            if (infoMessage) {
                infoMessage.remove();
            }
            
            // Atualizar placeholders para mostrar a imagem original
            const gallery = document.getElementById('gallery');
            const items = gallery.querySelectorAll('.gallery-item');
            
            items.forEach(item => {
                const placeholderImage = item.querySelector('.placeholder-image');
                if (placeholderImage) {
                    placeholderImage.style.backgroundImage = `url(${imageUrl})`;
                    placeholderImage.style.backgroundSize = 'cover';
                    placeholderImage.style.backgroundPosition = 'center';
                    
                    const placeholderText = placeholderImage.querySelector('.placeholder-text');
                    if (placeholderText) {
                        placeholderText.innerHTML = `
                            <span class="lut-name">${placeholderText.querySelector('.lut-name').textContent}</span>
                            <small>Imagem original</small>
                        `;
                    }
                }
            });
            
            // Adicionar mensagem explicativa
            const previewMessage = document.createElement('div');
            previewMessage.className = 'preview-message';
            previewMessage.innerHTML = `
                <p><strong>📸 Imagem carregada com sucesso!</strong></p>
                <p>Visualização: Sua imagem está sendo exibida em cada filtro LUT.</p>
                <p>Selecione os filtros desejados e clique em download para processar.</p>
                <p><em>Nota: Para ver os efeitos reais dos filtros, é necessário processamento no servidor.</em></p>
            `;
            
            gallerySection.insertBefore(previewMessage, gallerySection.querySelector('.gallery'));
        };
        
        reader.readAsDataURL(file);
    }

    showProcessedGallery(luts) {
        const gallerySection = document.getElementById('gallery-section');
        const title = gallerySection.querySelector('h2');
        title.textContent = `Imagem processada: ${this.originalImage.name} - ${luts.length} filtros aplicados`;
        
        // Remover mensagens anteriores
        const existingMessages = gallerySection.querySelectorAll('.info-message, .preview-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Atualizar galeria com imagens processadas
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        this.selectedLUTs.clear();

        luts.forEach((lutName, index) => {
            const item = this.createProcessedGalleryItem(lutName, index);
            gallery.appendChild(item);
        });
        
        this.updateDownloadButton();
    }

    createProcessedGalleryItem(lutName, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const imageData = this.processedImages && this.processedImages[lutName];
        
        item.innerHTML = `
            <div class="image-container">
                ${imageData ? 
                    `<img src="data:image/jpeg;base64,${imageData}" alt="${lutName}" loading="lazy">` :
                    `<div class="placeholder-image" style="background: linear-gradient(45deg, ${this.generateColorFromName(lutName)}, ${this.adjustColor(this.generateColorFromName(lutName))});">
                        <div class="placeholder-text">
                            <span class="lut-name">${lutName}</span>
                            <small>Processado</small>
                        </div>
                    </div>`
                }
                <div class="image-overlay">
                    <label class="checkbox-label">
                        <input type="checkbox" data-lut="${lutName}">
                        <span class="checkmark"></span>
                    </label>
                </div>
            </div>
            <div class="image-caption">${lutName}</div>
        `;

        // Adicionar event listener para checkbox
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedLUTs.add(lutName);
            } else {
                this.selectedLUTs.delete(lutName);
            }
            this.updateDownloadButton();
        });

        return item;
    }

    showLUTList() {
        const gallerySection = document.getElementById('gallery-section');
        const downloadSection = document.getElementById('download-section');
        
        // Atualizar título para mostrar quantidade total
        const title = gallerySection.querySelector('h2');
        title.textContent = `LUTs Disponíveis (${this.totalLUTs} filtros)`;
        
        // Mostrar galeria com LUTs
        this.showGallery(this.lutNames);
        
        // Mostrar seções
        gallerySection.classList.remove('hidden');
        downloadSection.classList.remove('hidden');
        
        // Adicionar informação sobre upload
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-message';
        infoDiv.innerHTML = `
            <p><strong>ℹ️ Demonstração dos LUTs disponíveis</strong></p>
            <p>Esta é uma visualização dos ${this.totalLUTs} filtros LUT disponíveis.</p>
            <p>Para ver os efeitos reais, faça upload de uma imagem acima.</p>
            <p>Você pode selecionar quais filtros deseja aplicar usando os checkboxes.</p>
        `;
        
        gallerySection.insertBefore(infoDiv, gallerySection.querySelector('.gallery'));
    }

    showGallery(luts) {
        const gallery = document.getElementById('gallery');
        
        // Limpar galeria anterior
        gallery.innerHTML = '';
        this.selectedLUTs.clear();

        // Criar itens da galeria
        luts.forEach((lutName, index) => {
            const item = this.createGalleryItem(lutName, index);
            gallery.appendChild(item);
        });
        
        this.updateDownloadButton();
    }

    createGalleryItem(lutName, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        // Usar uma imagem placeholder ou placeholder colorido
        const placeholderColor = this.generateColorFromName(lutName);
        
        item.innerHTML = `
            <div class="image-container">
                <div class="placeholder-image" style="background: linear-gradient(45deg, ${placeholderColor}, ${this.adjustColor(placeholderColor)});">
                    <div class="placeholder-text">
                        <span class="lut-name">${lutName}</span>
                        <small>Faça upload para ver o efeito</small>
                    </div>
                </div>
                <div class="image-overlay">
                    <label class="checkbox-label">
                        <input type="checkbox" data-lut="${lutName}">
                        <span class="checkmark"></span>
                    </label>
                </div>
            </div>
            <div class="image-caption">${lutName}</div>
        `;

        // Adicionar event listener para checkbox
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedLUTs.add(lutName);
            } else {
                this.selectedLUTs.delete(lutName);
            }
            this.updateDownloadButton();
        });

        return item;
    }

    generateColorFromName(name) {
        // Gerar cor baseada no nome do LUT
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            const char = name.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        const r = Math.abs(hash % 255);
        const g = Math.abs((hash >> 8) % 255);
        const b = Math.abs((hash >> 16) % 255);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    adjustColor(color) {
        // Escurecer a cor para o gradiente
        const rgb = color.match(/\d+/g);
        const r = Math.max(0, parseInt(rgb[0]) - 50);
        const g = Math.max(0, parseInt(rgb[1]) - 50);
        const b = Math.max(0, parseInt(rgb[2]) - 50);
        return `rgb(${r}, ${g}, ${b})`;
    }

    updateDownloadButton() {
        const downloadBtn = document.getElementById('download-btn');
        const count = this.selectedLUTs.size;
        
        if (count > 0) {
            downloadBtn.textContent = `📥 ${count} LUT${count > 1 ? 's' : ''} selecionado${count > 1 ? 's' : ''} (${this.totalLUTs} disponíveis)`;
            downloadBtn.disabled = false;
        } else {
            downloadBtn.textContent = `📥 Selecione LUTs (${this.totalLUTs} disponíveis)`;
            downloadBtn.disabled = true;
        }
    }

    downloadSelected() {
        if (this.selectedLUTs.size === 0) return;

        const selectedArray = Array.from(this.selectedLUTs);
        alert(`Demonstração: Você selecionou ${selectedArray.length} LUTs:\n\n${selectedArray.slice(0, 10).join('\n')}${selectedArray.length > 10 ? '\n... e mais ' + (selectedArray.length - 10) + ' LUTs' : ''}\n\nPara funcionalidade completa, faça upload de uma imagem primeiro.`);
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new KodachromeLUTGallery();
});
