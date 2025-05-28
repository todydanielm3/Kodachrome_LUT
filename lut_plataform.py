import os
import io
import zipfile
import pathlib
import streamlit as st
from PIL import Image, ImageOps
from pillow_lut import load_cube_file

# ─────────────────────────── STREAMLIT CONFIG ───────────────────────────
st.set_page_config(
    page_title="Kodachrome LUT", layout="centered", initial_sidebar_state="collapsed"
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
        .lut-slider { width: 100%; }
        @media (max-width: 600px) {
            .block-container { padding: 1rem; }
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# ──────────────────── TÍTULO E INSTRUÇÕES ────────────────────
st.title("📼 Kodachrome LUT Preview")
st.write("Envie uma imagem e deslize para ver o efeito de cada LUT em tempo real.")

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

# ──────────────────── SLIDER DE LUTs ────────────────────
lut_names = [f.name for f in lut_files]
index = st.slider(
    "🎞️ Escolha o LUT", 0, len(lut_files)-1, 0, format=None, key="lut_slider"
)
selected_lut_path = str(lut_files[index])
lut = load_cube_file(selected_lut_path)
selected_name = lut_names[index]

# Exibição lado a lado
st.subheader(f"LUT: {selected_name}")
col1, col2 = st.columns(2)
col1.image(base_img, caption="Original", use_column_width=True)
col2.image(base_img.filter(lut), caption=selected_name, use_column_width=True)

# ──────────────────── PROCESSAR E BAIXAR ────────────────────
if st.button("⚙️ Processar e Baixar ZIP com Todos LUTs"):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for p in lut_files:
            lut_temp = load_cube_file(str(p))
            proc = base_img.filter(lut_temp)
            tmp = io.BytesIO()
            proc.save(tmp, format="JPEG")
            name = uploaded_image.name.rsplit('.',1)[0]
            lut_clean = p.name.rsplit('.',1)[0].replace(' ', '_')
            zf.writestr(f"{name}_{lut_clean}.jpg", tmp.getvalue())
    buf.seek(0)
    st.download_button(
        "📥 Baixar todas as versões", data=buf,
        file_name=f"{uploaded_image.name.rsplit('.',1)[0]}_all_luts.zip",
        mime="application/zip"
    )

# ──────────────────── RODAPÉ SIMPLES ────────────────────
st.markdown("---")
st.write("**Minimal Retro Edition**")
