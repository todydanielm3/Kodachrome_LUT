import cv2
import numpy as np
import os
from tkinter import filedialog, Tk, Button, Label, ttk
from PIL import Image
from pillow_lut import load_cube_file
from tqdm import tqdm

# Caminho padrão para LUTs
LUT_FOLDER = "/Users/danielmoraes/coding/ninho_de_cobra/processamento-imagens/Kodachrome_LUT/Film-Luts/luts/colorslide"

def listar_luts(caminho):
    luts = {}
    for arquivo in os.listdir(caminho):
        if arquivo.endswith(".cube"):
            nome = os.path.splitext(arquivo)[0]
            luts[nome] = os.path.join(caminho, arquivo)
    return luts

class VideoLUTApp:
    def __init__(self, master):
        self.master = master
        master.title("Aplicar LUT em Vídeo")

        self.video_path = None
        self.luts = listar_luts(LUT_FOLDER)

        Button(master, text="Selecionar Vídeo", command=self.load_video).pack(pady=5)

        self.lut_selector = ttk.Combobox(master, values=list(self.luts.keys()))
        if self.luts:
            self.lut_selector.set(list(self.luts.keys())[0])
        self.lut_selector.pack(pady=5)

        Button(master, text="Processar Vídeo", command=self.process_video).pack(pady=10)

        self.status = Label(master, text="Selecione um vídeo e um LUT.")
        self.status.pack(pady=10)

    def load_video(self):
        self.video_path = filedialog.askopenfilename(filetypes=[("Vídeo", "*.mp4 *.mov *.avi *.mkv")])
        if self.video_path:
            self.status.config(text=f"Vídeo selecionado:\n{os.path.basename(self.video_path)}")

    def process_video(self):
        if not self.video_path:
            self.status.config(text="Por favor, selecione um vídeo.")
            return

        selected_lut_name = self.lut_selector.get()
        if not selected_lut_name or selected_lut_name not in self.luts:
            self.status.config(text="Por favor, selecione um LUT válido.")
            return

        output_path = filedialog.asksaveasfilename(defaultextension=".mp4",
                                                   filetypes=[("MP4 Video", "*.mp4")],
                                                   title="Salvar vídeo como")

        if not output_path:
            return

        self.status.config(text="Processando vídeo...")

        # Abre vídeo e LUT
        lut = load_cube_file(self.luts[selected_lut_name])
        cap = cv2.VideoCapture(self.video_path)

        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        for _ in tqdm(range(total_frames), desc="Aplicando LUT"):
            ret, frame = cap.read()
            if not ret:
                break
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_frame = Image.fromarray(frame_rgb).filter(lut)
            filtered = cv2.cvtColor(np.array(pil_frame), cv2.COLOR_RGB2BGR)
            out.write(filtered)

        cap.release()
        out.release()
        self.status.config(text=f"Vídeo salvo em:\n{output_path}")

if __name__ == "__main__":
    root = Tk()
    root.geometry("450x250")
    app = VideoLUTApp(root)
    root.mainloop()
