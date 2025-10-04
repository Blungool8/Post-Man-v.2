#!/bin/bash
# Script Bash per sviluppo Android
# Avvia Expo su emulatore Android con funzionalità native

echo -e "\033[0;36m📱 Avvio Post-Man - Modalità Android\033[0m"
echo -e "\033[0;36m========================================\033[0m"
echo ""
echo -e "\033[0;32m✨ Vantaggi Android Emulator:\033[0m"
echo -e "   \033[0;90m• GPS simulato configurabile\033[0m"
echo -e "   \033[0;90m• react-native-maps nativa\033[0m"
echo -e "   \033[0;90m• Test permessi nativi\033[0m"
echo -e "   \033[0;90m• Hot-reload funzionante\033[0m"
echo ""
echo -e "\033[0;34m📍 Simulare GPS:\033[0m"
echo -e "   \033[0;90m1. Apri Extended Controls (⋮)\033[0m"
echo -e "   \033[0;90m2. Location → Set custom coordinates\033[0m"
echo -e "   \033[0;90m3. Piacenza: 45.0526, 9.6934\033[0m"
echo ""
echo -e "\033[0;33m⚠️  Requisiti:\033[0m"
echo -e "   \033[0;90m• Android Studio installato\033[0m"
echo -e "   \033[0;90m• Emulatore Android creato e avviato\033[0m"
echo ""

# Verifica emulatore
echo -e "\033[0;34m🔍 Verifica emulatori disponibili...\033[0m"
adb devices

echo ""
echo -e "\033[0;32m🚀 Avvio app su emulatore Android...\033[0m"
echo ""

# Esegui npm run android
npm run android
