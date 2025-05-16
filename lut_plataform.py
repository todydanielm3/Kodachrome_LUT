import os
import io
import zipfile
import pathlib
import streamlit as st
from PIL import Image, ImageOps
from pillow_lut import load_cube_file

# ─────────────────────────────────────────  ESTILO RETRÔ  ─────────────────────────────────────────
st.markdown(
    """
    <style>
    body{background:#f5f1e0;color:#333;font-family:'Courier New',monospace;}
    .block-container{padding:2rem;}
    h1,h2{color:#444;}
    .sidebar .sidebar-content{background:#e8dfcb;}
    button{background:#d4b483;color:#222;border:none;}
    button:hover{background:#b5956b;}
    </style>
    """,
    unsafe_allow_html=True,
)

st.title("📼 Kodachrome LUT Platform")
st.write("Navegue pelas pastas de LUTs ou envie o seu próprio arquivo `.cube`.")

# ────────────────────────────────  LOCALIZAÇÃO AUTOMÁTICA DOS LUTs  ───────────────────────────────
def localizar_pastas_lut(base_dir: pathlib.Path) -> dict[str, list[pathlib.Path]]:
    """Percorre recursivamente procurando arquivos .cube e devolve {pasta:[arquivos]}."""
    pastas: dict[str, list[pathlib.Path]] = {}
    for cube in base_dir.rglob("*.cube"):
        pasta = cube.parent.relative_to(base_dir)
        pastas.setdefault(str(pasta), []).append(cube)
    return pastas

# ponto de partida: diretório do script
BASE_DIR = pathlib.Path(__file__).parent.resolve()
pastas_lut = localizar_pastas_lut(BASE_DIR)

# se nada foi encontrado, instrui o usuário a fazer upload
if not pastas_lut:
    st.warning(
        "Nenhuma pasta com arquivos `.cube` foi encontrada no repositório.\n"
        "Envie manualmente um arquivo LUT abaixo ou verifique se as pastas de LUTs "
        "foram adicionadas ao Git."
    )

# ────────────────────────────────  SELEÇÃO / UPLOAD DO LUT  ───────────────────────────────
uploaded_lut_file = st.sidebar.file_uploader(
    "⬆️ (opcional) Envie um arquivo `.cube`",
    type=["cube"],
    accept_multiple_files=False,
    key="lut-uploader",
)

if uploaded_lut_file is not None:
    lut_name = uploaded_lut_file.name
    lut_bytes = uploaded_lut_file.read()
    lut = load_cube_file(io.BytesIO(lut_bytes))
else:
    if not pastas_lut:
        st.stop()  # nada para continuar
    pasta_escolhida = st.sidebar.selectbox("📂 Escolha a pasta de LUTs", sorted(pastas_lut.keys()))
    arquivos_cube = [p.name for p in sorted(pastas_lut[pasta_escolhida])]
    nome_lut = st.sidebar.selectbox("🎞️ Escolha o LUT", arquivos_cube)
    lut_path = next(p for p in pastas_lut[pasta_escolhida] if p.name == nome_lut)
    lut = load_cube_file(str(lut_path))
    lut_name = nome_lut

# ────────────────────────────────  UPLOAD DAS IMAGENS  ───────────────────────────────
uploaded_images = st.sidebar.file_uploader(
    "⬆️ Envie imagens", type=["jpg", "jpeg", "png", "tif", "bmp"], accept_multiple_files=True
)

# ────────────────────────────────  PRÉ-VISUALIZAÇÃO  ───────────────────────────────
if uploaded_images:
    st.header("Pré-visualização")
    for up in uploaded_images:
        try:
            img = Image.open(up)
            img = ImageOps.exif_transpose(img).convert("RGB")
            w, h = img.size
            display_img = img.rotate(90, expand=True) if h > w else img

            col1, col2 = st.columns(2)
            col1.image(display_img, caption=f"Original – {up.name}", use_column_width=True)
            col2.image(display_img.filter(lut), caption=f"LUT – {lut_name}", use_column_width=True)
        except Exception as err:
            st.error(f"Erro ao processar **{up.name}**: {err}")

# ────────────────────────────────  PROCESSAR & BAIXAR ZIP  ───────────────────────────────
def salvar_zip(imagens, filtro, nome_lut) -> io.BytesIO:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as zf:
        for up in imagens:
            img = ImageOps.exif_transpose(Image.open(up)).convert("RGB")
            w, h = img.size
            img = img.rotate(90, expand=True) if h > w else img
            proc = img.filter(filtro)

            temp = io.BytesIO()
            proc.save(temp, format="JPEG")
            temp.seek(0)

            base = os.path.splitext(up.name)[0]
            lut_clean = os.path.splitext(nome_lut)[0].replace(" ", "_")
            fname = f"{base}_{lut_clean}.jpg"
            zf.writestr(fname, temp.read())
    buffer.seek(0)
    return buffer

if uploaded_images and st.sidebar.button("⚙️ Processar & baixar ZIP"):
    zip_buf = salvar_zip(uploaded_images, lut, lut_name)
    st.sidebar.download_button(
        "📥 Baixar imagens processadas",
        data=zip_buf,
        file_name="kodachrome_processed.zip",
        mime="application/zip",
    )

st.sidebar.markdown("---")
st.sidebar.caption("Kodachrome LUT Platform • Retro Edition")
