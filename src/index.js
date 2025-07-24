import './styles.css';
import Dropzone from 'dropzone';
import axios from 'axios';

// Configurar Dropzone
Dropzone.autoDiscover = false;

class KodachromeLUTGallery {
    constructor() {
        this.selectedLUTs = new Set();
        this.originalImage = null;
        this.processedImages = {};
        
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
        this.showLoading();
        
        try {
            // Converter arquivo para base64
            const base64Data = await this.fileToBase64(file);
            
            // Enviar para o backend
            const response = await axios.post('/api/process-image', {
                image_data: base64Data
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            this.originalImage = file;
            this.processedImages = response.data.processed_images;
            
            // Mostrar galeria
            this.showGallery(response.data.luts);
            
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            let errorMessage = 'Erro ao processar a imagem. Tente novamente.';
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

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('gallery-section').classList.add('hidden');
        document.getElementById('download-section').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showGallery(luts) {
        const gallery = document.getElementById('gallery');
        const gallerySection = document.getElementById('gallery-section');
        const downloadSection = document.getElementById('download-section');
        
        // Limpar galeria anterior
        gallery.innerHTML = '';
        this.selectedLUTs.clear();

        // Criar itens da galeria
        luts.forEach((lutName, index) => {
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
                <img src="data:image/jpeg;base64,${imageData}" alt="${lutName}" loading="lazy">
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

    updateDownloadButton() {
        const downloadBtn = document.getElementById('download-btn');
        const count = this.selectedLUTs.size;
        
        if (count > 0) {
            downloadBtn.textContent = `📥 Baixar ${count} imagem${count > 1 ? 's' : ''} selecionada${count > 1 ? 's' : ''} em ZIP`;
            downloadBtn.disabled = false;
        } else {
            downloadBtn.textContent = '📥 Selecione ao menos um LUT para baixar';
            downloadBtn.disabled = true;
        }
    }

    async downloadSelected() {
        if (this.selectedLUTs.size === 0) return;

        try {
            const selectedArray = Array.from(this.selectedLUTs);
            const response = await axios.post('/api/download-zip', {
                selected_luts: selectedArray,
                filename: this.originalImage.name
            }, {
                responseType: 'blob'
            });

            // Criar download
            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.originalImage.name.split('.')[0]}_luts.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            alert('Erro ao baixar o arquivo. Tente novamente.');
        }
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new KodachromeLUTGallery();
});
