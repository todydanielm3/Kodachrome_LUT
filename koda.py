import os
import tkinter as tk
from tkinter import filedialog, ttk
from PIL import Image, ImageTk, ImageCms
from pillow_lut import load_cube_file

# Caminho para LUTs
LUT_FOLDER = "/Users/danielmoraes/coding/ninho_de_cobra/processamento-imagens/Kodachrome_LUT/Film-Luts/luts/negative_old/"
ICC_PROFILE_PATH = "kodachrome_icc.icc"  # opcional, se tiver perfil ICC

def find_cube_luts(folder_path):
    lut_files = {}
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith('.cube'):
                name = os.path.splitext(file)[0]
                lut_files[name] = os.path.join(root, file)
    return lut_files

class KodachromeApp:
    def __init__(self, master):
        self.master = master
        master.title("Simulador Kodachrome II")
        master.geometry("1280x800")  # janela maior

        self.luts = find_cube_luts(LUT_FOLDER)

        self.load_button = tk.Button(master, text="Carregar Imagem", command=self.load_image)
        self.load_button.pack(pady=5)

        self.lut_selector = ttk.Combobox(master, values=list(self.luts.keys()))
        if self.luts:
            self.lut_selector.set(list(self.luts.keys())[0])
        self.lut_selector.pack(pady=5)

        self.apply_button = tk.Button(master, text="Aplicar LUT", command=self.apply_filter, state=tk.DISABLED)
        self.apply_button.pack(pady=5)

        self.icc_button = tk.Button(master, text="Aplicar Perfil ICC", command=self.apply_icc_profile, state=tk.DISABLED)
        self.icc_button.pack(pady=5)

        self.save_button = tk.Button(master, text="Salvar Imagem", command=self.save_image, state=tk.DISABLED)
        self.save_button.pack(pady=5)

        self.canvas = tk.Label(master)
        self.canvas.pack(padx=10, pady=10)

        self.original_image = None
        self.filtered_image = None

    def load_image(self):
        file_path = filedialog.askopenfilename()
        if file_path and os.path.isfile(file_path):
            self.original_image = Image.open(file_path).convert("RGB")
            self.filtered_image = None  # limpa filtro anterior
            self.display_comparison()
            self.apply_button.config(state=tk.NORMAL)
            self.icc_button.config(state=tk.NORMAL)

    def apply_filter(self):
        if self.original_image:
            selected_lut = self.lut_selector.get()
            lut_path = self.luts.get(selected_lut)
            if lut_path:
                try:
                    lut = load_cube_file(lut_path)
                    self.filtered_image = self.original_image.filter(lut)
                    self.display_comparison()
                    self.save_button.config(state=tk.NORMAL)
                except Exception as e:
                    print(f"Erro ao aplicar LUT: {e}")

    def apply_icc_profile(self):
        if self.original_image and os.path.exists(ICC_PROFILE_PATH):
            try:
                srgb_profile = ImageCms.createProfile("sRGB")
                kodachrome_profile = ImageCms.ImageCmsProfile(ICC_PROFILE_PATH)
                transform = ImageCms.buildTransform(srgb_profile, kodachrome_profile, "RGB", "RGB")
                self.filtered_image = ImageCms.applyTransform(self.original_image, transform)
                self.display_comparison()
                self.save_button.config(state=tk.NORMAL)
            except Exception as e:
                print(f"Erro ao aplicar ICC: {e}")

    def save_image(self):
        if self.filtered_image:
            file_path = filedialog.asksaveasfilename(defaultextension=".jpg")
            if file_path:
                self.filtered_image.save(file_path)

    def display_comparison(self):
        if self.original_image:
            target_width = 600
            original = self.original_image.resize(
                (target_width, int(target_width * self.original_image.height / self.original_image.width))
            )
            if self.filtered_image:
                filtered = self.filtered_image.resize(
                    (target_width, int(target_width * self.filtered_image.height / self.filtered_image.width))
                )
            else:
                filtered = original.copy()

            combined = Image.new("RGB", (original.width + filtered.width, original.height))
            combined.paste(original, (0, 0))
            combined.paste(filtered, (original.width, 0))

            tk_img = ImageTk.PhotoImage(combined)
            self.canvas.configure(image=tk_img)
            self.canvas.image = tk_img

# Executa a aplicação
if __name__ == "__main__":
    root = tk.Tk()
    app = KodachromeApp(root)
    root.mainloop()
