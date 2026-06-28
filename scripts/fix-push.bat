@echo off
cd /d A:\Projects\Escapade
git add -A
git commit -m "fix: use createServerSupabaseClient in goals API routes"
git push origin main
echo Done!
