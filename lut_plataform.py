import os
import io
import zipfile
import pathlib
import streamlit as st
from PIL import Image, ImageOps
from pillow_lut import load_cube_file

# ──────────────────── STREAMLIT CONFIG ────────────────────
st.set_page_config(
    page_title="Kodachrome LUT Preview", layout="centered", initial_sidebar_state="collapsed"
)

# ──────────────────── ESTILO MÍNIMALISTA & RESPONSIVO ────────────────────
st.markdown(
    """
    <style>
        body { background: #fafafa; color: #333; font-family: 'Helvetica Neue', sans-serif; }
        .block-container { padding: 1rem 2rem; max-width: 640px; margin: auto; }
        h1 { text-align: center; font-weight: bold; margin-bottom: 0.5rem; }
        p { text-align: center; margin-top: 0; }
        .stButton > button { background-color: #222; color: #fff; border-radius: 4px; padding: 0.5rem 1rem; }
        .stButton > button:hover { background-color: #444; }
        img { border-radius: 4px; }
        @media (max-width: 600px) {
            .block-container { padding: 1rem; }
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# ──────────────────── TÍTULO E INSTRUÇÕES ────────────────────
st.title("📼 Kodachrome LUT Preview")
st.write("Envie uma imagem e use os botões para navegar pelos LUTs.")

# ──────────────────── CARREGAMENTO DE LUTs ────────────────────
BASE_DIR = pathlib.Path(__file__).parent.resolve()
LUT_DIR  = BASE_DIR / "luts"
if not LUT_DIR.exists():
    st.error("Pasta de LUTs não encontrada.")
    st.stop()
lut_files = sorted([p for p in LUT_DIR.glob("*.cube")])
if not lut_files:
    st.error("Nenhum LUT encontrado em 'luts/'.")
    st.stop()
lut_names = [p.name for p in lut_files]

# ──────────────────── UPLOAD DA IMAGEM ────────────────────
uploaded_image = st.file_uploader(
    "⬆️ Selecione uma única imagem para pré-visualização", type=["jpg","jpeg","png","tif","bmp"]
)
if not uploaded_image:
    st.stop()

# Carrega e corrige orientação
img = ImageOps.exif_transpose(Image.open(uploaded_image)).convert("RGB")
w, h = img.size
base_img = img.rotate(90, expand=True) if h > w else img

# ──────────────────── CONTROLE DE ÍNDICE ────────────────────
if 'idx' not in st.session_state:
    st.session_state.idx = 0

col_nav = st.columns([1,1,1])
with col_nav[0]:
    if st.button("⟨ Anterior"):
        st.session_state.idx = (st.session_state.idx - 1) % len(lut_files)
with col_nav[1]:
    st.write(f"**{lut_names[st.session_state.idx]}**")
with col_nav[2]:
    if st.button("Próximo ⟩"):
        st.session_state.idx = (st.session_state.idx + 1) % len(lut_files)

# Carrega LUT atual
selected_path = str(lut_files[st.session_state.idx])
lut = load_cube_file(selected_path)
selected_name = lut_names[st.session_state.idx]

# Exibição lado a lado
st.subheader(selected_name)
col1, col2 = st.columns(2)
col1.image(base_img, caption="Original", use_column_width=True)
col2.image(base_img.filter(lut), caption=selected_name, use_column_width=True)

# ──────────────────── BOTÃO DE DOWNLOAD ────────────────────
if st.button("⚙️ Processar e Baixar ZIP com Todas Versões"):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        name = uploaded_image.name.rsplit('.',1)[0]
        for p, nm in zip(lut_files, lut_names):
            lut_temp = load_cube_file(str(p))
            proc = base_img.filter(lut_temp)
            tmp = io.BytesIO()
            proc.save(tmp, format="JPEG")
            zf.writestr(f"{name}_{nm.rsplit('.',1)[0].replace(' ', '_')}.jpg", tmp.getvalue())
    buf.seek(0)
    st.download_button(
        "📥 Baixar todas as versões", data=buf,
        file_name=f"{name}_all_luts.zip", mime="application/zip"
    )

# ──────────────────── RODAPÉ ────────────────────
st.markdown("---")
st.write("**Minimal Retro Edition**")
