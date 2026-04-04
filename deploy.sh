#!/bin/bash
# TIMA GRUPO — Deploy to GitHub (triggers Netlify auto-deploy)
# Usage: bash deploy.sh
#    or: bash deploy.sh "mi mensaje de commit"

cd "$(dirname "$0")"

MSG="${1:-update: $(date '+%Y-%m-%d %H:%M')}"

echo "=== Tima RRHH — Deploy ==="
echo ""

git add -A
echo "Fichiers stages."

git commit -m "$MSG

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"

if [ $? -eq 0 ]; then
  echo ""
  echo "Pushing to GitHub..."
  git push origin main
  echo ""
  echo "Deploy OK. Netlify publiera automatiquement."
else
  echo ""
  echo "Rien a commiter."
fi
