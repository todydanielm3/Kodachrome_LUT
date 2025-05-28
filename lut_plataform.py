import os
import io
import zipfile
import pathlib
import streamlit as st
from PIL import Image, ImageOps
from pillow_lut import load_cube_file

# ───────────────────────────  STREAMLIT CONFIG  ───────────────────────────
st.set_page_config(
    page_title="Kodachrome LUT Platform", layout="wide", initial_sidebar_state="expanded"
)

# ───────────────────────────  ESTILO RETRÔ & RESPONSIVO ───────────────────────────
st.markdown(
    """
    <style>
        body{background:#f5f1e0;color:#333;font-family:'Courier New',monospace;}
        .block-container{padding:2rem;}
        h1,h2{color:#444;}
        .sidebar .sidebar-content{background:#e8dfcb;}
        button{background:#d4b483;color:#222;border:none;}
        button:hover{background:#b5956b;}
        @media (max-width: 600px) {
            .stSidebar {display: none;}
            .block-container {padding:1rem;}
            img {max-width:100% !important;height:auto !important;}
        }
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("📼 Kodachrome LUT Platform")
st.write("Envie imagens, escolha um LUT ou use o seu próprio arquivo `.cube`.")

# ───────────────────────────  PASTA ÚNICA COM LUTs  ───────────────────────────
BASE_DIR = pathlib.Path(__file__).parent.resolve()
LUT_DIR  = BASE_DIR / "luts"

if not LUT_DIR.exists():
    st.error(f"Pasta de LUTs não encontrada: {LUT_DIR}")
    st.stop()

lut_files = sorted(p.name for p in LUT_DIR.glob("*.cube"))
if not lut_files:
    st.error("Nenhum arquivo `.cube` encontrado na pasta `luts/`.")
    st.stop()

# ───────────────────────────  CONFIGURAÇÕES & UPLOAD  ───────────────────────────
with st.sidebar.expander("⚙️ Configurações"):
    uploaded_images = st.file_uploader(
        "⬆️ Envie imagens", type=["jpg","jpeg","png","tif","bmp"], accept_multiple_files=True
    )

    selected_lut_name = st.selectbox("🎞️ Escolha o LUT", lut_files)
    selected_lut_path = LUT_DIR / selected_lut_name

    uploaded_lut_file = st.file_uploader(
        "⬆️ (Opcional) Use LUT `.cube` local", type=["cube"], accept_multiple_files=False
    )

# Carrega o LUT (prioridade para upload local)
try:
    if uploaded_lut_file is not None:
        lut = load_cube_file(io.BytesIO(uploaded_lut_file.read()))
        lut_name = uploaded_lut_file.name
    else:
        lut = load_cube_file(str(selected_lut_path))
        lut_name = selected_lut_name
except Exception as e:
    st.error(f"Erro ao carregar LUT: {e}")
    st.stop()

# ───────────────────────────  PRÉ-VISUALIZAÇÃO  ───────────────────────────
if uploaded_images:
    st.header("Pré-visualização")
    for up in uploaded_images:
        try:
            img = ImageOps.exif_transpose(Image.open(up)).convert("RGB")
            w, h = img.size
            disp = img.rotate(90, expand=True) if h > w else img
            col1, col2 = st.columns(2, gap="small")
            col1.image(disp, caption=f"Original – {up.name}", use_column_width=True)
            col2.image(disp.filter(lut), caption=f"LUT – {lut_name}", use_column_width=True)
        except Exception as err:
            st.warning(f"Erro em {up.name}: {err}")

# ───────────────────────────  PROCESSAR & ZIP  ───────────────────────────
def gerar_zip(imagens, filtro, lut_nome) -> io.BytesIO:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        for up in imagens:
            img = ImageOps.exif_transpose(Image.open(up)).convert("RGB")
            w, h = img.size
            img = img.rotate(90, expand=True) if h > w else img
            proc = img.filter(filtro)
            tmp = io.BytesIO()
            proc.save(tmp, format="JPEG")
            tmp.seek(0)
            base = os.path.splitext(up.name)[0]
            lut_clean = lut_nome.rsplit(".", 1)[0].replace(" ", "_")
            zf.writestr(f"{base}_{lut_clean}.jpg", tmp.read())
    buf.seek(0)
    return buf

if uploaded_images and st.sidebar.button("⚙️ Processar & baixar ZIP"):
    zip_data = gerar_zip(uploaded_images, lut, lut_name)
    st.sidebar.download_button(
        "📥 Baixar imagens processadas",
        data=zip_data,
        file_name="kodachrome_processed.zip",
        mime="application/zip",
    )

st.sidebar.markdown("---")
st.sidebar.caption("Kodachrome LUT Platform • Retro Edition")
