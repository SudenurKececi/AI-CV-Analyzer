import os
import io
import json
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from openai import OpenAI
import fitz
from docx import Document

load_dotenv()

# Google'in OpenAI-uyumlu Gemini endpointi
client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)
MODEL = "gemini-3.5-flash"

app = FastAPI(title="CV Analiz API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_pdf(data: bytes) -> str:
    doc = fitz.open(stream=data, filetype="pdf")
    return "".join(p.get_text() for p in doc).strip()


def extract_docx(data: bytes) -> str:
    doc = Document(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip()).strip()


def gemini_json(prompt: str) -> dict:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    return json.loads(resp.choices[0].message.content)


def gemini_text(prompt: str) -> str:
    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return resp.choices[0].message.content.strip()


ANALYSIS_PROMPT = """Sen deneyimli bir IK uzmani ve kariyer danismanisın.
Asagidaki CV metnini detaylica analiz et ve YALNIZCA asagidaki JSON yapisinda yanit ver.

CV METNI:
{cv_text}

{job_section}

JSON YAPISI:
{{
  "genel_puan": <0-100>,
  "ozet": "<2-3 cumle>",
  "guclu_yonler": [{{"baslik":"","aciklama":""}}],
  "zayif_yonler": [{{"baslik":"","aciklama":"","oncelik":"yuksek|orta|dusuk"}}],
  "eksiklikler": [{{"alan":"","aciklama":"","oneri":""}}],
  "iyilestirme_onerileri": [{{"kategori":"","oneri":"","etki":"yuksek|orta|dusuk"}}],
  "ats_analizi": {{"puan":<0-100>,"sorunlar":[],"anahtar_kelimeler_eksik":[]}},
  "bolum_puanlari": {{"iletisim_bilgileri":<0-10>,"is_deneyimi":<0-10>,"egitim":<0-10>,"beceriler":<0-10>,"format_duzen":<0-10>}},
  "tahmini_sehir_ulke": "",
  "kariyer_seviyesi": "junior|mid|senior|executive|bilinmiyor"
}}"""

BASVURU_PROMPT = """Sen deneyimli bir kariyer danismanisın.
Asagidaki CV ve is ilanina gore kisisellestirilmis bir basvuru mesaji yaz.

CV:
{cv_text}

IS ILANI:
{is_ilani}

TON: {ton}
UZUNLUK: {uzunluk}

Sadece mesaj metnini yaz. Kalip cumlelerden kacin, somut deneyimlerle eslesir."""


@app.get("/")
def root():
    return {"mesaj": "CV Analiz API calisiyor", "model": MODEL}


@app.post("/analiz")
async def analiz_cv(dosya: UploadFile = File(...), is_ilani: str = Form(default="")):
    fname = dosya.filename.lower()
    if not (fname.endswith(".pdf") or fname.endswith(".docx")):
        raise HTTPException(400, "Sadece PDF ve DOCX desteklenmektedir.")

    data = await dosya.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(400, "Dosya 5MB'i gecemez.")

    try:
        cv_text = extract_pdf(data) if fname.endswith(".pdf") else extract_docx(data)
    except Exception as e:
        raise HTTPException(422, f"Dosya okunamadi: {e}")

    if len(cv_text) < 100:
        raise HTTPException(422, "CV metni cok kisa veya okunamiyor.")

    job_section = f"IS ILANI:\n{is_ilani}" if is_ilani.strip() else ""

    try:
        prompt = ANALYSIS_PROMPT.format(cv_text=cv_text[:6000], job_section=job_section)
        result = gemini_json(prompt)
    except json.JSONDecodeError:
        raise HTTPException(500, "Analiz sonucu islenirken hata olustu.")
    except Exception as e:
        raise HTTPException(500, f"Gemini hatasi: {e}")

    return JSONResponse({"basari": True, "dosya_adi": dosya.filename, "cv_text": cv_text[:4000], "analiz": result})


@app.post("/metin-analiz")
async def analiz_metin(cv_metni: str = Form(...), is_ilani: str = Form(default="")):
    if len(cv_metni.strip()) < 100:
        raise HTTPException(400, "CV metni cok kisa.")

    job_section = f"IS ILANI:\n{is_ilani}" if is_ilani.strip() else ""

    try:
        prompt = ANALYSIS_PROMPT.format(cv_text=cv_metni[:6000], job_section=job_section)
        result = gemini_json(prompt)
    except Exception as e:
        raise HTTPException(500, str(e))

    return JSONResponse({"basari": True, "analiz": result})


@app.post("/basvuru-mesaji")
async def basvuru_mesaji(
    cv_metni: str = Form(...),
    is_ilani: str = Form(...),
    ton: str = Form(default="profesyonel"),
    uzunluk: str = Form(default="orta"),
):
    if len(cv_metni.strip()) < 50:
        raise HTTPException(400, "CV metni cok kisa.")
    if len(is_ilani.strip()) < 20:
        raise HTTPException(400, "Is ilani cok kisa.")

    uzunluk_map = {"kisa": "2-3 kisa paragraf", "orta": "3-4 paragraf", "uzun": "4-5 detayli paragraf"}

    try:
        prompt = BASVURU_PROMPT.format(
            cv_text=cv_metni[:4000],
            is_ilani=is_ilani[:2000],
            ton=ton,
            uzunluk=uzunluk_map.get(uzunluk, "3-4 paragraf"),
        )
        mesaj = gemini_text(prompt)
    except Exception as e:
        raise HTTPException(500, f"Gemini hatasi: {e}")

    return JSONResponse({"basari": True, "mesaj": mesaj})
