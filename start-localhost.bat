@echo off
chcp 65001 >nul
cd /d "C:\xampp\htdocs\zavedeev\Yrprod_kurs\frontend"
echo Запуск сайта ЯРПРОДСНАБСЕРВИС...
npm start -- --host localhost

pause