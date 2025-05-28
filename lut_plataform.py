import os
import io
import zipfile
import pathlib
import streamlit as st
from PIL import Image, ImageOps
from pillow_lut import load_cube_file

# ───────────────── STREAMLIT CONFIG ─────────────────
st.set_page_config(
    page_title="Kodachrome LUT Gallery",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# ─────────── ESTILO MÍNIMALISTA & FIXED DOWNLOAD BUTTON ───────────
st.markdown(
    """
    <style>
        body { background: #fafafa; color: #333; font-family: 'Helvetica Neue', sans-serif; }
        .block-container { padding: 1rem 2rem; max-width: 720px; margin: auto; }
        h1 { text-align: center; font-weight: bold; margin-bottom: 0.5rem; }
        p { text-align: center; margin-top: 0; }
        .stButton > button { background-color: #222; color: #fff; border-radius: 4px; padding: 0.5rem 1rem; }
        .stButton > button:hover { background-color: #444; }
        img { border-radius: 4px; }
        .thumbnail { border: 1px solid #ddd; padding: 4px; margin: 4px; }
        .select-checkbox { text-align: center; }
        /* Estiliza o download button para ficar fixo */
        .stDownloadButton { 
            position: fixed !important;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
        }
        @media (max-width: 600px) {
            .block-container { padding: 0.5rem; }
        }
    </style>
    """,
    unsafe_allow_html=True
)

# ─────────── TÍTULO ───────────
st.title("📼 Kodachrome LUT Gallery")
st.write("Envie sua imagem e selecione as prévias desejadas. Download ficará disponível sempre visível.")

# ─── CARREGAR LUTs ───
BASE_DIR = pathlib.Path(__file__).parent.resolve()
LUT_DIR = BASE_DIR / "luts"
if not LUT_DIR.exists():
    st.error("Pasta de LUTs não encontrada.")
    st.stop()
lut_paths = sorted(LUT_DIR.glob("*.cube"))
if not lut_paths:
    st.error("Nenhum LUT encontrado.")
    st.stop()

# ─── UPLOAD DA IMAGEM ───
uploaded = st.file_uploader("⬆️ Selecione uma imagem", type=["jpg","jpeg","png","tif","bmp"])
if not uploaded:
    st.stop()

# Processar e gerar prévias
original = ImageOps.exif_transpose(Image.open(uploaded)).convert("RGB")
w, h = original.size
base_img = original.rotate(90, expand=True) if h > w else original

# ─── GALERIA DE LUTs ───
st.subheader("Selecione as prévias desejadas clicando na imagem")
selections = {}
cols_per_row = 3
for i, lut_path in enumerate(lut_paths):
    if i % cols_per_row == 0:
        cols = st.columns(cols_per_row)
    col = cols[i % cols_per_row]
    lut_name = lut_path.stem
    lut = load_cube_file(str(lut_path))
    img_lut = base_img.filter(lut)
    with col:
        # container para posicionamento relativo
        st.markdown(
            f'<div class="img-wrap" id="wrap_{i}" style="position:relative; display:inline-block; width:100%;">',
            unsafe_allow_html=True
        )
        # exibe imagem
        st.image(img_lut, use_container_width=True)
        # checkbox oculta abaixo da imagem, mas será reposicionado via CSS
        st.checkbox("Selecionar", key=f"chk_{i}", label_visibility="collapsed")
        # fecha container
        st.markdown('</div>', unsafe_allow_html=True)
        selections[lut_name] = st.session_state.get(f"chk_{i}", False)

# CSS para posicionar checkbox no canto da imagem
css_positions = ""
for i in range(len(lut_paths)):
    css_positions += f"div[data-testid=\"stCheckbox-chk_{i}\"]{{position:absolute!important; bottom:8px!important; right:8px!important; margin:0!important;}}"
st.markdown(f"<style>{css_positions}</style>", unsafe_allow_html=True)

# ─── BOTÃO FIXO DE DOWNLOAD ───
selected = [name for name, sel in selections.items() if sel]
if selected:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        base_name = uploaded.name.rsplit('.', 1)[0]
        for lut_name in selected:
            path = next(p for p in lut_paths if p.stem == lut_name)
            lut = load_cube_file(str(path))
            proc = base_img.filter(lut)
            tmp = io.BytesIO()
            proc.save(tmp, format="JPEG")
            zf.writestr(f"{base_name}_{lut_name}.jpg", tmp.getvalue())
    buf.seek(0)
    st.download_button(
        "📥 Baixar selecionados em ZIP",
        data=buf,
        file_name=f"{base_name}_luts.zip",
        mime="application/zip"
    )
else:
    # Mantém o espaço do botão, mas desabilitado
    st.download_button(
        "Selecione até um LUT para baixar",
        data=b"",
        file_name="",
        disabled=True
    )

# ─── RODAPÉ ───
st.markdown("---")
st.write("**Minimal Retro Edition**")
