#!/usr/bin/env node

/**
 * KML Merge Script - Post-Man Project
 *
 * Merge multiple KML files into one, keeping only LineString (routes)
 * Removes Point markers (stops will be added manually in app)
 *
 * Usage:
 *   node scripts/merge-kml.js input1.kml input2.kml input3.kml -o output.kml
 *   node scripts/merge-kml.js path/to/*.kml -o CTD_Name_Z##_X.kml
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node merge-kml.js <input1.kml> [input2.kml ...] -o <output.kml>');
    console.error('Example: node merge-kml.js 9B_*.kml -o CTD_CastelSanGiovanni_Z09_B.kml');
    process.exit(1);
  }

  const outputIndex = args.indexOf('-o');
  if (outputIndex === -1 || outputIndex === args.length - 1) {
    console.error('Error: -o flag required with output filename');
    process.exit(1);
  }

  const inputFiles = args.slice(0, outputIndex);
  const outputFile = args[outputIndex + 1];

  return { inputFiles, outputFile };
}

// Simple KML parser (extract LineStrings only)
function parseKML(kmlContent) {
  const lineStrings = [];

  // Regex to find LineString blocks
  const lineStringRegex = /<LineString>([\s\S]*?)<\/LineString>/g;
  let match;

  while ((match = lineStringRegex.exec(kmlContent)) !== null) {
    const lineStringBlock = match[0];

    // Extract coordinates
    const coordsMatch = lineStringBlock.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
    if (coordsMatch) {
      const coords = coordsMatch[1].trim();
      lineStrings.push(coords);
    }
  }

  return lineStrings;
}

// Count total points in coordinates string
function countPoints(coordsString) {
  return coordsString.split('\n').filter(line => line.trim()).length;
}

// Generate merged KML
function generateMergedKML(allLineStrings, metadata) {
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${metadata.name}</name>
    <description>${metadata.description}</description>

    <!-- Style for route polylines -->
    <Style id="route-style-normal">
      <LineStyle>
        <color>ff2196F3</color>
        <width>4</width>
      </LineStyle>
    </Style>
    <Style id="route-style-highlight">
      <LineStyle>
        <color>ff2196F3</color>
        <width>6</width>
      </LineStyle>
    </Style>
    <StyleMap id="route-style">
      <Pair>
        <key>normal</key>
        <styleUrl>#route-style-normal</styleUrl>
      </Pair>
      <Pair>
        <key>highlight</key>
        <styleUrl>#route-style-highlight</styleUrl>
      </Pair>
    </StyleMap>

    <Folder>
      <name>Percorsi ${metadata.zone}</name>
      ${allLineStrings.map((coords, index) => `
      <Placemark>
        <name>Percorso ${index + 1}</name>
        <styleUrl>#route-style</styleUrl>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>
            ${coords}
          </coordinates>
        </LineString>
      </Placemark>`).join('\n')}
    </Folder>
  </Document>
</kml>`;

  return kml;
}

// Extract zone info from filename
function extractMetadata(outputFilename) {
  // Expected format: CTD_Name_Z##_X.kml
  const match = outputFilename.match(/CTD_([^_]+)_Z(\d+)_([AB])/);

  if (match) {
    return {
      ctd: match[1],
      zone: `Z${match[2]}`,
      plan: match[3],
      name: `${match[1]} - Zona ${match[2]} Piano ${match[3]}`,
      description: `Percorsi postali per CTD ${match[1]}, Zona ${match[2]}, Piano ${match[3]}`
    };
  }

  // Fallback
  return {
    ctd: 'Unknown',
    zone: 'Unknown',
    plan: 'Unknown',
    name: path.basename(outputFilename, '.kml'),
    description: 'Percorsi postali merged'
  };
}

// Main merge function
function mergeKMLFiles(inputFiles, outputFile) {
  console.log('🔄 Merging KML files...\n');

  const allLineStrings = [];
  let totalPoints = 0;

  // Read and parse each input file
  for (const inputFile of inputFiles) {
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ File not found: ${inputFile}`);
      continue;
    }

    console.log(`📄 Processing: ${path.basename(inputFile)}`);
    const content = fs.readFileSync(inputFile, 'utf8');
    const lineStrings = parseKML(content);

    console.log(`   ✅ Found ${lineStrings.length} routes`);

    // Count points
    lineStrings.forEach(coords => {
      const points = countPoints(coords);
      totalPoints += points;
      console.log(`      - Route with ${points} points`);
    });

    allLineStrings.push(...lineStrings);
    console.log('');
  }

  if (allLineStrings.length === 0) {
    console.error('❌ No LineStrings found in input files!');
    process.exit(1);
  }

  console.log(`📊 Summary:`);
  console.log(`   - Input files: ${inputFiles.length}`);
  console.log(`   - Total routes: ${allLineStrings.length}`);
  console.log(`   - Total points: ${totalPoints}`);
  console.log('');

  // Extract metadata from output filename
  const metadata = extractMetadata(path.basename(outputFile));

  // Generate merged KML
  const mergedKML = generateMergedKML(allLineStrings, metadata);

  // Write output file
  fs.writeFileSync(outputFile, mergedKML, 'utf8');

  const fileSize = (fs.statSync(outputFile).size / 1024).toFixed(2);

  console.log('✅ Merge completed!');
  console.log(`   📁 Output: ${outputFile}`);
  console.log(`   📏 Size: ${fileSize} KB`);
  console.log('');
  console.log('ℹ️  Note: Point markers (stops) have been removed.');
  console.log('   Add stops manually in the app interface.');
  console.log('');
  console.log(`🎯 Ready to use! Copy to: assets/kml/${path.basename(outputFile)}`);
}

// Run
if (require.main === module) {
  const { inputFiles, outputFile } = parseArgs();

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('   KML Merge Tool - Post-Man Project');
  console.log('═══════════════════════════════════════');
  console.log('');

  mergeKMLFiles(inputFiles, outputFile);
}

module.exports = { mergeKMLFiles, parseKML, generateMergedKML };
