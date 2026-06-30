from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from faster_whisper import WhisperModel
import edge_tts
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Cargando modelo neuronal en el backend...")
model = WhisperModel("small", device="cpu", compute_type="int8")
print("¡Modelo cargado y listo para escuchar!")

# --- FASE 1: ESCUCHAR (Speech-to-Text) ---
@app.post("/api/transcribir")
async def transcribir_audio(audio: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        segments, info = model.transcribe(tmp_path, beam_size=5, language="es", vad_filter=True)
        texto_final = "".join([segment.text for segment in segments])
        print(f"Texto detectado: {texto_final.strip()}")
        return {"texto": texto_final.strip()}
    finally:
        os.remove(tmp_path)


# ==========================================
# --- FASE 3: HABLAR ---
# ==========================================

# 1. Agregamos el parámetro 'voz' a la petición
class TextoPeticion(BaseModel):
    texto: str
    voz: str

def eliminar_archivo(path: str):
    try:
        os.remove(path)
    except Exception:
        pass

@app.post("/api/hablar")
async def generar_voz(peticion: TextoPeticion, background_tasks: BackgroundTasks):
    tmp, tmp_path = tempfile.mkstemp(suffix=".mp3")
    os.close(tmp) 

    # 2. Usamos la voz que el usuario eligió desde la UI
    comunicador = edge_tts.Communicate(peticion.texto, peticion.voz)
    await comunicador.save(tmp_path)
    
    background_tasks.add_task(eliminar_archivo, tmp_path)
    return FileResponse(tmp_path, media_type="audio/mpeg")