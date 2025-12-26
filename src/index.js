import './styles.css';
import './animations.css';
import Dropzone from 'dropzone';
import axios from 'axios';

// Configurar Dropzone
Dropzone.autoDiscover = false;

class KodachromeLUTGallery {
    constructor() {
        this.selectedLUTs = new Set();
        this.originalImage = null;
        this.originalImageBase64 = null;
        this.processedImages = {};
        this.allLuts = [];
        
        this.initializeDropzone();
        this.initializeEventListeners();
    }

    initializeDropzone() {
        const dropzoneElement = document.getElementById('dropzone');
        const fileInput = document.getElementById('file-input');

        // Click handler for dropzone
        dropzoneElement.addEventListener('click', () => {
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

        dropzoneElement.addEventListener('dragleave', () => {
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

    initializeEventListeners() {
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.addEventListener('click', () => this.downloadSelected());
    }

    async handleFileUpload(file) {
        // Validar tipo de arquivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'image/bmp'];
        if (!validTypes.includes(file.type)) {
            alert('Tipo de arquivo não suportado. Use JPG, PNG, TIFF ou BMP.');
            return;
        }

        // Mostrar loading
        this.showLoading('Gerando previews dos filtros...');
        
        try {
            // Converter arquivo para base64
            const base64Data = await this.fileToBase64(file);
            this.originalImageBase64 = base64Data;
            
            // Chamar a function de preview (30 LUTs principais)
            const response = await axios.post('/.netlify/functions/preview-luts', {
                image_data: base64Data
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            this.originalImage = file;
            this.processedImages = response.data.previews;
            this.allLuts = response.data.all_luts; // Lista completa de todos os LUTs
            
            // Mostrar galeria com previews
            this.showGallery(Object.keys(response.data.previews), response.data.total_luts);
            
        } catch (error) {
            console.error('Erro ao gerar previews:', error);
            let errorMessage = 'Erro ao gerar previews. Tente novamente.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
            alert(errorMessage);
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

    showLoading(message = 'Processando...') {
        const loadingEl = document.getElementById('loading');
        const loadingText = loadingEl.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
        loadingEl.classList.remove('hidden');
        document.getElementById('gallery-section').classList.add('hidden');
        document.getElementById('download-section').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showGallery(previewLuts, totalLuts) {
        const gallery = document.getElementById('gallery');
        const gallerySection = document.getElementById('gallery-section');
        const downloadSection = document.getElementById('download-section');
        
        // Limpar galeria anterior
        gallery.innerHTML = '';
        this.selectedLUTs.clear();

        // Mostrar informação de previews
        const infoDiv = document.createElement('div');
        infoDiv.className = 'gallery-info';
        infoDiv.innerHTML = `
            <p>Mostrando <strong>${previewLuts.length} previews</strong> de <strong>${totalLuts} filtros</strong> disponíveis</p>
            <p class="hint">⚠️ <strong>Previews são demonstração</strong> - Os filtros LUT serão aplicados nas imagens baixadas em alta qualidade</p>
            <p class="hint">💡 Clique nos cards para selecionar os filtros desejados e depois clique em "Baixar"</p>
        `;
        gallery.appendChild(infoDiv);

        // Criar itens da galeria
        previewLuts.forEach((lutName, index) => {
            const item = this.createGalleryItem(lutName, index);
            gallery.appendChild(item);
        });

        // Mostrar seções
        gallerySection.classList.remove('hidden');
        downloadSection.classList.remove('hidden');
        
        this.updateDownloadButton();
    }

    createGalleryItem(lutName, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const imageData = this.processedImages[lutName];
        
        item.innerHTML = `
            <div class="image-container">
                <img src="${imageData}" alt="${lutName}" loading="lazy">
                <div class="checkbox-container">
                    <label class="checkbox-label">
                        <input type="checkbox" data-lut="${lutName}">
                        <span class="checkmark"></span>
                    </label>
                </div>
            </div>
            <div class="image-caption">${this.formatLutName(lutName)}</div>
        `;

        // Adicionar event listener para checkbox
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            if (e.target.checked) {
                this.selectedLUTs.add(lutName);
                item.classList.add('selected');
            } else {
                this.selectedLUTs.delete(lutName);
                item.classList.remove('selected');
            }
            this.updateDownloadButton();
        });

        // Click no card também seleciona
        item.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });

        return item;
    }

    formatLutName(lutName) {
        // Formatar nome do LUT para exibição (substituir _ por espaço e capitalizar)
        return lutName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    updateDownloadButton() {
        const downloadBtn = document.getElementById('download-btn');
        const count = this.selectedLUTs.size;
        const btnSpan = downloadBtn.querySelector('span');
        
        if (count > 0) {
            btnSpan.textContent = `Baixar ${count} imagem${count > 1 ? 's' : ''} selecionada${count > 1 ? 's' : ''}`;
            downloadBtn.disabled = false;
        } else {
            btnSpan.textContent = 'Selecione ao menos um filtro';
            downloadBtn.disabled = true;
        }
    }

    async downloadSelected() {
        if (this.selectedLUTs.size === 0) return;

        this.showLoading(`Processando ${this.selectedLUTs.size} filtros selecionados...`);

        try {
            const selectedArray = Array.from(this.selectedLUTs);
            
            // Chamar function para processar LUTs selecionados
            const response = await axios.post('/.netlify/functions/process-selected', {
                image_data: this.originalImageBase64,
                selected_luts: selectedArray
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Converter base64 do ZIP para blob
            const zipBase64 = response.data.zip_data;
            const zipBuffer = Uint8Array.from(atob(zipBase64), c => c.charCodeAt(0));
            const blob = new Blob([zipBuffer], { type: 'application/zip' });
            
            // Criar download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.originalImage.name.split('.')[0]}_luts.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            alert(`✅ ${response.data.processed_count} imagens baixadas com sucesso!`);

        } catch (error) {
            console.error('Erro ao processar e baixar:', error);
            let errorMessage = 'Erro ao processar. Tente novamente.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
            }
            alert(errorMessage);
        } finally {
            this.hideLoading();
        }
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new KodachromeLUTGallery();
});
