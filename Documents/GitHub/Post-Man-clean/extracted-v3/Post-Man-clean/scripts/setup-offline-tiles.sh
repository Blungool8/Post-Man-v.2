#!/bin/bash
# Script per generare tiles offline per App Percorsi Postali
# Utilizza osmium-tool e TileServer GL per creare tiles ottimizzate

set -e  # Exit on any error

echo "🚀 Setting up offline maps for Post-Man App..."

# Configurazione area di test (Roma centro)
AREA_NAME="roma_centro"
BOUNDS="12.45,41.85,12.55,41.95"  # west,south,east,north
OUTPUT_DIR="assets/maps"

# Crea directory di output
mkdir -p $OUTPUT_DIR

echo "📥 Downloading OSM data for Lazio region..."
# Download area OSM (esempio: Lazio)
if [ ! -f "lazio-latest.osm.pbf" ]; then
    wget -O lazio-latest.osm.pbf https://download.geofabrik.de/europe/italy/lazio-latest.osm.pbf
    echo "✅ Downloaded Lazio OSM data"
else
    echo "✅ Lazio OSM data already exists"
fi

echo "✂️ Extracting specific area (Roma centro)..."
# Estrai area specifica usando osmium-tool
osmium extract -b $BOUNDS lazio-latest.osm.pbf -o ${AREA_NAME}.osm.pbf
echo "✅ Extracted area: $AREA_NAME.osm.pbf"

echo "🔍 Filtering data for postal routes..."
# Filtra solo dati rilevanti per percorsi postali
osmium tags-filter ${AREA_NAME}.osm.pbf \
    w/highway \
    w/building \
    w/amenity=post_office \
    w/office=post_office \
    w/postal_code \
    -o ${AREA_NAME}_filtered.osm.pbf
echo "✅ Filtered data for postal routes"

echo "🗺️ Generating MBTiles..."
# Genera MBTiles usando tilemaker
if command -v tilemaker &> /dev/null; then
    tilemaker \
        --input ${AREA_NAME}_filtered.osm.pbf \
        --output $OUTPUT_DIR/${AREA_NAME}.mbtiles \
        --config config.json \
        --process process.lua
    echo "✅ Generated MBTiles: $OUTPUT_DIR/${AREA_NAME}.mbtiles"
else
    echo "⚠️ tilemaker not found. Installing..."
    # Installazione tilemaker (richiede build da sorgente)
    echo "Please install tilemaker manually: https://github.com/systemed/tilemaker"
    echo "Alternative: Use TileServer GL for tile generation"
fi

echo "📊 Generating tile statistics..."
# Calcola statistiche file
if [ -f "${AREA_NAME}_filtered.osm.pbf" ]; then
    FILE_SIZE=$(du -h ${AREA_NAME}_filtered.osm.pbf | cut -f1)
    echo "📁 Filtered OSM file size: $FILE_SIZE"
fi

if [ -f "$OUTPUT_DIR/${AREA_NAME}.mbtiles" ]; then
    TILE_SIZE=$(du -h $OUTPUT_DIR/${AREA_NAME}.mbtiles | cut -f1)
    echo "🗺️ MBTiles file size: $TILE_SIZE"
fi

echo "🧹 Cleaning up temporary files..."
# Rimuovi file temporanei
rm -f ${AREA_NAME}.osm.pbf
rm -f ${AREA_NAME}_filtered.osm.pbf

echo "✅ Offline tiles setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy $OUTPUT_DIR/${AREA_NAME}.mbtiles to your app assets"
echo "2. Update MapConfig.js with correct tile URL"
echo "3. Test offline functionality in the app"
echo ""
echo "🎯 Target achieved: < 50MB offline map for testing"

# Verifica dimensioni finali
if [ -f "$OUTPUT_DIR/${AREA_NAME}.mbtiles" ]; then
    FINAL_SIZE_MB=$(du -m $OUTPUT_DIR/${AREA_NAME}.mbtiles | cut -f1)
    if [ $FINAL_SIZE_MB -lt 50 ]; then
        echo "✅ SUCCESS: Final map size ($FINAL_SIZE_MB MB) is under 50MB limit"
    else
        echo "⚠️ WARNING: Final map size ($FINAL_SIZE_MB MB) exceeds 50MB limit"
        echo "Consider reducing the area or applying more aggressive filtering"
    fi
fi
