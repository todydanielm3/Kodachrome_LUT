import os
import io
import zipfile
import streamlit as st
from PIL import Image, ImageOps
from pillow_lut import load_cube_file

# --- Configuração de estilo retro minimalista ---
st.markdown(
    """
    <style>
    body {
        background-color: #f5f1e0;
        color: #333;
        font-family: 'Courier New', monospace;
    }
    .reportview-container .main .block-container {
        padding: 2rem;
    }
    h1, h2 {
        font-family: 'Courier New', monospace;
        color: #444;
    }
    .sidebar .sidebar-content {
        background-color: #e8dfcb;
    }
    button {
        background-color: #d4b483;
        color: #222;
        border: none;
    }
    button:hover {
        background-color: #b5956b;
    }
    </style>
    """, unsafe_allow_html=True
)

st.title("📼 Kodachrome LUT Platform")
st.write("Navegue pelas pastas de LUTs e aplique filtros Kodachrome às suas imagens.")

# Caminho raiz dos LUTs
tree_root = "/Users/danielmoraes/coding/ninho_de_cobra/processamento-imagens/Kodachrome_LUT/Film-Luts/luts"

# Seleção de pasta de LUTs
subdirs = [d for d in os.listdir(tree_root) if os.path.isdir(os.path.join(tree_root, d))]
selected_folder = st.sidebar.selectbox("Escolha a pasta de LUTs", subdirs)
lut_folder = os.path.join(tree_root, selected_folder)

# Carrega LUTs disponíveis na pasta selecionada
lut_files = [f for f in os.listdir(lut_folder) if f.lower().endswith('.cube')]
selected_lut = st.sidebar.selectbox("Selecione o LUT", lut_files)
lut_path = os.path.join(lut_folder, selected_lut)
# Carrega LUT
lut = load_cube_file(lut_path)

# Upload de múltiplas imagens
uploaded_images = st.sidebar.file_uploader(
    "Selecione imagens", type=['jpg','jpeg','png','tif','bmp'], accept_multiple_files=True
)

# Pré-visualização automática com correção de orientação
if uploaded_images:
    st.header("Pré-visualização")
    for uploaded in uploaded_images:
        # Carrega e corrige orientação EXIF
        img = Image.open(uploaded)
        img = ImageOps.exif_transpose(img).convert("RGB")
        # Detecta orientação e ajusta para exibir corretamente
        w, h = img.size
        if h > w:
            # Vertical: rotaciona para manter visualização ajustada
            display_img = img.rotate(90, expand=True)
        else:
            display_img = img
        col1, col2 = st.columns(2)
        col1.image(display_img, caption=f"Original - {uploaded.name}", use_column_width=True)
        # Aplica LUT na imagem corrigida
        preview = display_img.filter(lut)
        col2.image(preview, caption=f"{selected_lut}", use_column_width=True)

# Botão de processamento em lote
if uploaded_images:
    if st.sidebar.button("Processar e Baixar ZIP"):
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zf:
            for uploaded in uploaded_images:
                img = Image.open(uploaded)
                img = ImageOps.exif_transpose(img).convert("RGB")
                # Ajusta orientação antes de aplicar LUT
                w, h = img.size
                if h > w:
                    img = img.rotate(90, expand=True)
                processed = img.filter(lut)
                buf = io.BytesIO()
                processed.save(buf, format='JPEG')
                filename = os.path.splitext(uploaded.name)[0] + f"_{selected_lut}.jpg"
                zf.writestr(filename, buf.getvalue())
        zip_buffer.seek(0)
        st.sidebar.download_button(
            "Baixar Imagens Processadas", data=zip_buffer,
            file_name="kodachrome_processed.zip", mime="application/zip"
        )

st.sidebar.markdown("---")
st.sidebar.write("Kodachrome LUT Platform • Retro Edition")
