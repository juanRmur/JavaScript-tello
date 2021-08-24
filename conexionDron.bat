@echo off
cd .\conexionDron
echo Conectandose al WIFI del dron...
netsh wlan connect name=TELLO-XXXXXX
timeout /T 5 /nobreak
npm start