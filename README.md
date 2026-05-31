# 🧠 AI CV Analyzer

> Yapay zeka destekli CV analiz ve iyileştirme uygulaması. CV'nizi yükleyin, güçlü & zayıf yönlerinizi öğrenin, kişiselleştirilmiş başvuru mesajı oluşturun.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)

---

## ✨ Özellikler

- 📄 **PDF & DOCX** formatlarında CV yükleme (drag & drop)
- 🎯 **Genel puan** ve bölüm bazlı puanlama (0–100)
- ✅ Güçlü yönler, ❌ zayıf yönler, ⚠️ eksiklik tespiti
- 💡 Öncelikli **iyileştirme önerileri** (etki seviyesiyle)
- 🛡️ **ATS uyumluluk skoru** + eksik anahtar kelimeler
- 📊 Radar & bar grafik görselleştirmesi
- 🏷️ Kariyer seviyesi tespiti (Junior / Mid / Senior / Executive)
- 📝 **Kişiselleştirilmiş başvuru mesajı** oluşturma (ton & uzunluk seçimi)
- 🎯 İş ilanı ekleyerek pozisyona özel analiz

---

## 🖥️ Ekran Görüntüsü

```
┌─────────────────────────────────────────────┐
│  🧠 CV Analiz          GPT-4o Destekli       │
├─────────────────────────────────────────────┤
│                                             │
│   [ CV'nizi sürükleyin veya tıklayın ]      │
│         PDF veya DOCX • Maks 5MB            │
│                                             │
│   + İş ilanı ekle (opsiyonel)               │
│                                             │
│         ⚡ CV'mi Analiz Et                  │
└─────────────────────────────────────────────┘
```

---

## 🚀 Kurulum

### Gereksinimler
- Python 3.10+
- Node.js 18+
- Gemini API Key ([aistudio.google.com](https://aistudio.google.com/apikey))

### 1. Projeyi klonlayın
```bash
git clone https://github.com/kullanici/AI-CV-Analyzer.git
cd AI-CV-Analyzer
```

### 2. API key'i ayarlayın
`backend/` klasöründe `.env` dosyası oluşturun:
```env
GEMINI_API_KEY=AIza...buraya_keyiniz
```

### 3. Kurulum ve başlatma
```bash
# Kurulum (bir kez)
setup.bat

# Başlatma
start.bat
```

Uygulama açılır:
- 🌐 Frontend: http://localhost:3000
- ⚙️ Backend API: http://localhost:8000

---

## 📁 Proje Yapısı

```
CV-Analyzer/
├── backend/
│   ├── main.py          # FastAPI uygulaması
│   ├── requirements.txt
│   └── .env             # API key (git'e commit etmeyin!)
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Ana React bileşeni
│   │   └── App.css      # Stiller
│   └── package.json
├── start.bat            # Tek tıkla başlatma
├── setup.bat            # İlk kurulum
└── .gitignore
```

---

## 🔌 API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/` | API durumu ve model bilgisi |
| `POST` | `/analiz` | CV dosyası analizi (PDF/DOCX) |
| `POST` | `/metin-analiz` | Metin olarak CV analizi |
| `POST` | `/basvuru-mesaji` | Başvuru mesajı oluşturma |

---

## 🛠️ Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Backend | Python, FastAPI, Uvicorn |
| Frontend | React 18, Recharts, Lucide |
| AI | Google Gemini (OpenAI-compat. API) |
| PDF | PyMuPDF (fitz) |
| DOCX | python-docx |

---

## ⚙️ Yapılandırma

`backend/main.py` içinde modeli değiştirebilirsiniz:
```python
MODEL = "gemini-1.5-flash"   # Ücretsiz, hızlı
# MODEL = "gemini-2.0-flash" # Daha güncel
```

---

## 📄 Lisans

MIT License — dilediğiniz gibi kullanabilirsiniz.

---

<p align="center">
  <sub>Built with ❤️ using FastAPI + React + Gemini</sub>
</p>
