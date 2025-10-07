const fs = require('fs');
const path = require('path');

/**
 * Script per convertire file .KML in JSON estraendo solo i percorsi (LineString)
 * Unisce tutti i percorsi da più file .KML in un unico file JSON
 */

// Funzione per parsare le coordinate da una stringa
function parseCoordinates(coordinateString) {
    if (!coordinateString || typeof coordinateString !== 'string') {
        return [];
    }
    
    return coordinateString
        .trim()
        .split(/\s+/)
        .map(coord => {
            const [lng, lat, alt] = coord.split(',').map(Number);
            return {
                longitude: lng || 0,
                latitude: lat || 0,
                altitude: alt || 0
            };
        })
        .filter(coord => !isNaN(coord.longitude) && !isNaN(coord.latitude));
}

// Funzione per parsare un file .KML e estrarre i percorsi
function parseKMLFile(filePath) {
    try {
        const kmlContent = fs.readFileSync(filePath, 'utf8');
        const routes = [];
        
        // Regex più semplice per trovare tutti i LineString
        const lineStringRegex = /<LineString>[\s\S]*?<coordinates>(.*?)<\/coordinates>[\s\S]*?<\/LineString>/g;
        
        // Regex per trovare il nome del Placemark che contiene il LineString
        const placemarkRegex = /<Placemark>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<LineString>/g;
        
        let match;
        let placemarkMatch;
        let placemarkIndex = 0;
        
        // Prima trova tutti i Placemark con LineString
        const placemarks = [];
        while ((placemarkMatch = placemarkRegex.exec(kmlContent)) !== null) {
            placemarks.push(placemarkMatch[1].trim());
        }
        
        // Poi trova tutti i LineString
        while ((match = lineStringRegex.exec(kmlContent)) !== null) {
            const coordinates = match[1].trim();
            
            // Parsa le coordinate
            const parsedCoordinates = parseCoordinates(coordinates);
            
            if (parsedCoordinates.length > 0) {
                const name = placemarks[placemarkIndex] || `Percorso ${placemarkIndex + 1}`;
                
                routes.push({
                    name: name,
                    coordinates: parsedCoordinates,
                    pointCount: parsedCoordinates.length,
                    sourceFile: path.basename(filePath)
                });
                
                placemarkIndex++;
            }
        }
        
        return routes;
    } catch (error) {
        console.error(`Errore nel leggere il file ${filePath}:`, error.message);
        return [];
    }
}

// Funzione principale
function convertKMLToJSON() {
    const inputFiles = [
        'C:\\Users\\PC Simo\\Downloads\\9B_1.kml',
        'C:\\Users\\PC Simo\\Downloads\\9B_2.kml',
        'C:\\Users\\PC Simo\\Downloads\\9B_3.kml'
    ];
    
    const outputFile = 'C:\\Users\\PC Simo\\Downloads\\percorsi_uniti.json';
    
    console.log('🚀 Inizio conversione file .KML in JSON...');
    console.log('📁 File di input:');
    inputFiles.forEach(file => console.log(`   - ${file}`));
    
    const allRoutes = [];
    let totalRoutes = 0;
    let totalPoints = 0;
    
    // Processa ogni file .KML
    inputFiles.forEach((filePath, index) => {
        console.log(`\n📄 Elaborazione file ${index + 1}/3: ${path.basename(filePath)}`);
        
        const routes = parseKMLFile(filePath);
        allRoutes.push(...routes);
        
        console.log(`   ✅ Trovati ${routes.length} percorsi`);
        routes.forEach(route => {
            console.log(`      - ${route.name} (${route.pointCount} punti)`);
            totalPoints += route.pointCount;
        });
        
        totalRoutes += routes.length;
    });
    
    // Crea l'oggetto JSON finale
    const result = {
        metadata: {
            description: "Percorsi estratti da file .KML e uniti in formato JSON",
            totalRoutes: totalRoutes,
            totalPoints: totalPoints,
            sourceFiles: inputFiles.map(f => path.basename(f)),
            generatedAt: new Date().toISOString(),
            generatedBy: "KML to JSON Converter Script"
        },
        routes: allRoutes
    };
    
    // Salva il file JSON
    try {
        fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf8');
        
        console.log(`\n✅ Conversione completata!`);
        console.log(`📊 Statistiche:`);
        console.log(`   - Totale percorsi: ${totalRoutes}`);
        console.log(`   - Totale punti: ${totalPoints}`);
        console.log(`   - File di output: ${outputFile}`);
        console.log(`   - Dimensione file: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
        
    } catch (error) {
        console.error(`❌ Errore nel salvare il file:`, error.message);
    }
}

// Esegui la conversione
if (require.main === module) {
    convertKMLToJSON();
}

module.exports = { convertKMLToJSON, parseKMLFile, parseCoordinates };
