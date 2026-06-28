@echo off
cd /d A:\Projects\Escapade
git add -A
git commit -m "feat: goals, dark mode, weather, PWA, public events, location fix, check-ins, landing page"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo Done!
