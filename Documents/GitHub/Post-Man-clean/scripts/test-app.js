#!/usr/bin/env node

/**
 * Script di Testing Automatico - Post-Man App
 * Verifica le funzionalità principali dell'app
 */

const fs = require('fs');
const path = require('path');

// Configurazione test
const TEST_CONFIG = {
  appPath: path.join(__dirname, '../app-temp'),
  srcPath: path.join(__dirname, '../src'),
  expectedFiles: [
    'App.tsx',
    'package.json',
    'tsconfig.json'
  ],
  expectedSrcFiles: [
    'components/LocationPermissionHandler.js',
    'components/GPSStatusIndicator.js',
    'components/ImportRoutesModal.js',
    'screens/MapScreen/MapScreenWeb.js',
    'screens/MapScreen/MapScreenMobile.js',
    'services/DatabaseService/DatabaseService.js',
    'services/ImportService/ImportService.js',
    'hooks/useDatabase.js',
    'hooks/useDynamicNavigation.js'
  ],
  requiredDependencies: [
    'expo',
    'expo-location',
    'expo-sqlite',
    'expo-file-system',
    'expo-document-picker',
    'react-native-maps',
    'react',
    'react-native'
  ]
};

// Colori per output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const checkFile = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
};

const checkPackageJson = () => {
  const packagePath = path.join(TEST_CONFIG.appPath, 'package.json');
  
  if (!checkFile(packagePath)) {
    log('❌ package.json non trovato', 'red');
    return false;
  }

  try {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Verifica dipendenze richieste
    const missingDeps = TEST_CONFIG.requiredDependencies.filter(dep => 
      !packageContent.dependencies[dep]
    );

    if (missingDeps.length > 0) {
      log(`❌ Dipendenze mancanti: ${missingDeps.join(', ')}`, 'red');
      return false;
    }

    log('✅ package.json valido con tutte le dipendenze', 'green');
    return true;
  } catch (error) {
    log(`❌ Errore parsing package.json: ${error.message}`, 'red');
    return false;
  }
};

const checkAppStructure = () => {
  log('\n📁 Verifica struttura app...', 'blue');
  
  let allFilesExist = true;
  
  // Verifica file principali
  TEST_CONFIG.expectedFiles.forEach(file => {
    const filePath = path.join(TEST_CONFIG.appPath, file);
    if (checkFile(filePath)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} mancante`, 'red');
      allFilesExist = false;
    }
  });

  // Verifica file src
  TEST_CONFIG.expectedSrcFiles.forEach(file => {
    const filePath = path.join(TEST_CONFIG.srcPath, file);
    if (checkFile(filePath)) {
      log(`✅ src/${file}`, 'green');
    } else {
      log(`❌ src/${file} mancante`, 'red');
      allFilesExist = false;
    }
  });

  return allFilesExist;
};

const checkAppTsx = () => {
  const appPath = path.join(TEST_CONFIG.appPath, 'App.tsx');
  
  if (!checkFile(appPath)) {
    log('❌ App.tsx non trovato', 'red');
    return false;
  }

  try {
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    // Verifica import principali
    const requiredImports = [
      'MapScreenWeb',
      'MapScreenMobile',
      'LocationPermissionHandler',
      'GPSStatusIndicator',
      'ImportRoutesModal',
      'useDynamicNavigation',
      'useDatabase'
    ];

    const missingImports = requiredImports.filter(importName => 
      !appContent.includes(importName)
    );

    if (missingImports.length > 0) {
      log(`❌ Import mancanti in App.tsx: ${missingImports.join(', ')}`, 'red');
      return false;
    }

    // Verifica componenti utilizzati
    const requiredComponents = [
      'LocationPermissionHandler',
      'GPSStatusIndicator',
      'MapScreenWeb',
      'MapScreenMobile',
      'ImportRoutesModal'
    ];

    const missingComponents = requiredComponents.filter(component => 
      !appContent.includes(`<${component}`)
    );

    if (missingComponents.length > 0) {
      log(`❌ Componenti non utilizzati in App.tsx: ${missingComponents.join(', ')}`, 'red');
      return false;
    }

    log('✅ App.tsx configurato correttamente', 'green');
    return true;
  } catch (error) {
    log(`❌ Errore lettura App.tsx: ${error.message}`, 'red');
    return false;
  }
};

const checkDatabaseService = () => {
  const dbPath = path.join(TEST_CONFIG.srcPath, 'services/DatabaseService/DatabaseService.js');
  
  if (!checkFile(dbPath)) {
    log('❌ DatabaseService.js non trovato', 'red');
    return false;
  }

  try {
    const dbContent = fs.readFileSync(dbPath, 'utf8');
    
    // Verifica metodi principali
    const requiredMethods = [
      'initialize',
      'createTables',
      'createRoute',
      'getRoutes',
      'createStop',
      'getStopsByRouteId',
      'updateStop',
      'saveUserLocation'
    ];

    const missingMethods = requiredMethods.filter(method => 
      !dbContent.includes(`${method}(`)
    );

    if (missingMethods.length > 0) {
      log(`❌ Metodi mancanti in DatabaseService: ${missingMethods.join(', ')}`, 'red');
      return false;
    }

    log('✅ DatabaseService implementato correttamente', 'green');
    return true;
  } catch (error) {
    log(`❌ Errore lettura DatabaseService: ${error.message}`, 'red');
    return false;
  }
};

const checkImportService = () => {
  const importPath = path.join(TEST_CONFIG.srcPath, 'services/ImportService/ImportService.js');
  
  if (!checkFile(importPath)) {
    log('❌ ImportService.js non trovato', 'red');
    return false;
  }

  try {
    const importContent = fs.readFileSync(importPath, 'utf8');
    
    // Verifica metodi principali
    const requiredMethods = [
      'importFromJSON',
      'importFromCSV',
      'validateJSONStructure',
      'validateFileFormat',
      'generateSampleJSON',
      'generateSampleCSV'
    ];

    const missingMethods = requiredMethods.filter(method => 
      !importContent.includes(`${method}(`)
    );

    if (missingMethods.length > 0) {
      log(`❌ Metodi mancanti in ImportService: ${missingMethods.join(', ')}`, 'red');
      return false;
    }

    log('✅ ImportService implementato correttamente', 'green');
    return true;
  } catch (error) {
    log(`❌ Errore lettura ImportService: ${error.message}`, 'red');
    return false;
  }
};

const checkMobileMap = () => {
  const mobileMapPath = path.join(TEST_CONFIG.srcPath, 'screens/MapScreen/MapScreenMobile.js');
  
  if (!checkFile(mobileMapPath)) {
    log('❌ MapScreenMobile.js non trovato', 'red');
    return false;
  }

  try {
    const mobileMapContent = fs.readFileSync(mobileMapPath, 'utf8');
    
    // Verifica componenti react-native-maps
    const requiredComponents = [
      'MapView',
      'Marker',
      'PROVIDER_GOOGLE'
    ];

    const missingComponents = requiredComponents.filter(component => 
      !mobileMapContent.includes(component)
    );

    if (missingComponents.length > 0) {
      log(`❌ Componenti react-native-maps mancanti: ${missingComponents.join(', ')}`, 'red');
      return false;
    }

    log('✅ MapScreenMobile implementato correttamente', 'green');
    return true;
  } catch (error) {
    log(`❌ Errore lettura MapScreenMobile: ${error.message}`, 'red');
    return false;
  }
};

const runAllTests = () => {
  log('🧪 Avvio Test Automatico - Post-Man App', 'bold');
  log('==========================================', 'bold');
  
  const tests = [
    { name: 'Package.json', fn: checkPackageJson },
    { name: 'Struttura App', fn: checkAppStructure },
    { name: 'App.tsx', fn: checkAppTsx },
    { name: 'Database Service', fn: checkDatabaseService },
    { name: 'Import Service', fn: checkImportService },
    { name: 'Mobile Map', fn: checkMobileMap }
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  tests.forEach(test => {
    log(`\n🔍 Test: ${test.name}`, 'blue');
    if (test.fn()) {
      passedTests++;
    }
  });

  // Risultati finali
  log('\n📊 Risultati Test', 'bold');
  log('==================', 'bold');
  log(`Test Superati: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'yellow');
  
  if (passedTests === totalTests) {
    log('🎉 Tutti i test sono superati! App pronta per il testing mobile.', 'green');
    log('\n📱 Prossimi step:', 'blue');
    log('1. Installa Expo Go su dispositivo mobile');
    log('2. Esegui: cd app-temp && npx expo start');
    log('3. Scansiona QR code con Expo Go');
    log('4. Segui la guida in MOBILE_TESTING_GUIDE.md');
  } else {
    log('⚠️  Alcuni test sono falliti. Controlla gli errori sopra.', 'yellow');
  }

  return passedTests === totalTests;
};

// Esegui test se script chiamato direttamente
if (require.main === module) {
  const success = runAllTests();
  process.exit(success ? 0 : 1);
}

module.exports = {
  runAllTests,
  checkPackageJson,
  checkAppStructure,
  checkAppTsx,
  checkDatabaseService,
  checkImportService,
  checkMobileMap
};
