@echo off
echo CV Analiz Kurulum Scripti
echo.

:: .env kontrolü
if not exist "backend\.env" (
  copy backend\.env.example backend\.env 2>nul || (
    echo OPENAI_API_KEY= > backend\.env
  )
  echo [!] backend\.env dosyasi olusturuldu.
  echo     Lutfen OPENAI_API_KEY degerini doldurun.
  echo.
)

:: Python paketleri
echo [1/2] Python paketleri yukleniyor...
cd backend
pip install -r requirements.txt
cd ..

:: Node paketleri
echo [2/2] Node paketleri yukleniyor...
cd frontend
npm install
cd ..

echo.
echo Kurulum tamamlandi!
echo Baslатmak icin: start.bat
pause
