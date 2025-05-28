import os
import io
import zipfile
import pathlib
import streamlit as st
from PIL import Image, ImageOps
from pillow_lut import load_cube_file

# ───────────────────────────  STREAMLIT CONFIG  ───────────────────────────
st.set_page_config(
    page_title="Kodachrome LUT", layout="centered", initial_sidebar_state="collapsed"
)

# ───────────────────────────  ESTILO MÍNIMALISTA & RESPONSIVO ───────────────────────────
st.markdown(
    """
    <style>
        body { background: #fafafa; color: #333; font-family: 'Helvetica Neue', sans-serif; }
        .block-container { padding: 1rem 2rem 2rem 2rem; max-width: 640px; margin: auto; }
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

# ───────────────────────────  TÍTULO E INSTRUÇÕES ───────────────────────────
st.title("📼 Kodachrome LUT")
st.write("Envie suas imagens e escolha um LUT para aplicar. Faça o download em ZIP.")

# ───────────────────────────  CARREGAMENTO DE LUTs ───────────────────────────
BASE_DIR = pathlib.Path(__file__).parent.resolve()
LUT_DIR  = BASE_DIR / "luts"
if not LUT_DIR.exists():
    st.error("Pasta de LUTs não encontrada.")
    st.stop()
lut_files = sorted(p.name for p in LUT_DIR.glob("*.cube"))
if not lut_files:
    st.error("Nenhum LUT encontrado em 'luts/'.")
    st.stop()

# ───────────────────────────  UPLOAD & SELEÇÃO ───────────────────────────
uploaded_images = st.file_uploader(
    "⬆️ Selecione imagens", type=["jpg","jpeg","png","tif","bmp"], accept_multiple_files=True
)
selected_lut = st.selectbox("🎞️ Selecione um LUT", lut_files)
# opcional: upload de LUT local
uploaded_lut = st.file_uploader("(Opcional) Envie seu .cube", type=["cube"] )

# Carrega LUT
try:
    if uploaded_lut:
        lut = load_cube_file(io.BytesIO(uploaded_lut.read()))
        lut_name = uploaded_lut.name
    else:
        lut = load_cube_file(str(LUT_DIR/selected_lut))
        lut_name = selected_lut
except Exception as e:
    st.error(f"Erro ao carregar LUT: {e}")
    st.stop()

# ───────────────────────────  PRÉ-VISUALIZAÇÃO ───────────────────────────
if uploaded_images:
    st.subheader("Pré-visualização")
    for img_file in uploaded_images:
        try:
            img = ImageOps.exif_transpose(Image.open(img_file)).convert("RGB")
            w, h = img.size
            disp = img.rotate(90, expand=True) if h > w else img
            col1, col2 = st.columns(2)
            col1.image(disp, caption="Original", use_column_width=True)
            col2.image(disp.filter(lut), caption=lut_name, use_column_width=True)
        except Exception as e:
            st.warning(f"Não foi possível processar {img_file.name}: {e}")

# ───────────────────────────  PROCESSAR & DOWNLOAD ───────────────────────────
if uploaded_images:
    if st.button("⚙️ Processar & Baixar ZIP"):
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            for img_file in uploaded_images:
                img = ImageOps.exif_transpose(Image.open(img_file)).convert("RGB")
                w, h = img.size
                img = img.rotate(90, expand=True) if h > w else img
                proc = img.filter(lut)
                tmp = io.BytesIO()
                proc.save(tmp, format="JPEG")
                name = img_file.name.rsplit('.',1)[0]
                cname = lut_name.rsplit('.',1)[0].replace(' ', '_')
                zf.writestr(f"{name}_{cname}.jpg", tmp.getvalue())
        buf.seek(0)
        st.download_button(
            "📥 Baixar imagens processadas",
            data=buf,
            file_name="kodachrome_output.zip",
            mime="application/zip"
        )

# ───────────────────────────  RODAPÉ ───────────────────────────
st.markdown("---")
st.write("**Retro Edition**")
