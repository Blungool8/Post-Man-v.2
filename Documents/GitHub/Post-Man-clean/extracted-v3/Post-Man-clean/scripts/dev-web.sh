#!/bin/bash
# Script Bash per sviluppo rapido Web
# Avvia Expo Web con hot-reload per sviluppo UI/UX veloce

echo -e "\033[0;36m🌐 Avvio Post-Man - Modalità Web\033[0m"
echo -e "\033[0;36m======================================\033[0m"
echo ""
echo -e "\033[0;32m✨ Vantaggi Web:\033[0m"
echo -e "   \033[0;90m• Hot-reload istantaneo\033[0m"
echo -e "   \033[0;90m• DevTools browser integrati\033[0m"
echo -e "   \033[0;90m• Iterazioni UI rapide\033[0m"
echo ""
echo -e "\033[0;33m⚠️  Limitazioni Web:\033[0m"
echo -e "   \033[0;90m• GPS non disponibile (usa mock)\033[0m"
echo -e "   \033[0;90m• react-native-maps simulata\033[0m"
echo ""
echo -e "\033[0;34m🔧 Aprirà automaticamente: http://localhost:8081\033[0m"
echo ""

# Esegui npm run web
npm run web
