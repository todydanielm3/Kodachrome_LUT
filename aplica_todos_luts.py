import os
from tkinter import Tk, filedialog
from PIL import Image
from pillow_lut import load_cube_file

# Caminho da pasta com os LUTs
LUT_FOLDER = "/Users/danielmoraes/coding/ninho_de_cobra/processamento-imagens/Kodachrome_LUT/Film-Luts/luts/negative_color/"
OUTPUT_FOLDER = "luts_aplicados/negative_color"

def listar_luts(caminho):
    luts = {}
    for root, _, files in os.walk(caminho):
        for file in files:
            if file.lower().endswith(".cube"):
                nome = os.path.splitext(file)[0]
                luts[nome] = os.path.join(root, file)
    return luts

def aplicar_luts_em_imagem(imagem_path, luts):
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    imagem = Image.open(imagem_path).convert("RGB")

    for nome, caminho_lut in luts.items():
        try:
            lut = load_cube_file(caminho_lut)
            imagem_filtrada = imagem.filter(lut)
            saida_path = os.path.join(OUTPUT_FOLDER, f"{nome}.jpg")
            imagem_filtrada.save(saida_path)
            print(f"✅ LUT aplicado e salvo: {saida_path}")
        except Exception as e:
            print(f"❌ Erro com LUT {nome}: {e}")

if __name__ == "__main__":
    print("Selecione a imagem para aplicar os LUTs...")

    Tk().withdraw()  # Esconde a janela principal do Tkinter
    imagem_path = filedialog.askopenfilename(filetypes=[("Imagens", "*.jpg *.jpeg *.png *.tif *.bmp")])

    if not imagem_path:
        print("Nenhuma imagem selecionada.")
        exit()

    print(f"🖼 Imagem selecionada: {imagem_path}")
    luts_disponiveis = listar_luts(LUT_FOLDER)
    print(f"🔍 {len(luts_disponiveis)} LUTs encontrados.")
    aplicar_luts_em_imagem(imagem_path, luts_disponiveis)
    print(f"\n🎉 Fim. As imagens estão em: {os.path.abspath(OUTPUT_FOLDER)}")
