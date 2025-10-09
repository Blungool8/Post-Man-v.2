#!/bin/bash
# Script Bash per sviluppo generale con menu interattivo
# Avvia Expo dev server con opzioni multiple

echo -e "\033[0;36m🚀 Post-Man - Development Server\033[0m"
echo -e "\033[0;36m===================================\033[0m"
echo ""
echo -e "\033[0;32m📋 Menu Interattivo Expo:\033[0m"
echo -e "   \033[0;90m• Premi 'w' per aprire su Web\033[0m"
echo -e "   \033[0;90m• Premi 'a' per Android emulator\033[0m"
echo -e "   \033[0;90m• Premi 'i' per iOS simulator\033[0m"
echo -e "   \033[0;90m• Scansiona QR code per device fisico\033[0m"
echo ""
echo -e "\033[0;34m💡 Tips:\033[0m"
echo -e "   \033[0;90m• Premi 'r' per reload\033[0m"
echo -e "   \033[0;90m• Premi 'Shift+R' per reset cache\033[0m"
echo -e "   \033[0;90m• Premi 'c' per clear console\033[0m"
echo ""
echo -e "\033[0;33m📖 Vedi TESTING_WORKFLOW.md per dettagli completi\033[0m"
echo ""

# Esegui npm start (menu interattivo Expo)
npm start
