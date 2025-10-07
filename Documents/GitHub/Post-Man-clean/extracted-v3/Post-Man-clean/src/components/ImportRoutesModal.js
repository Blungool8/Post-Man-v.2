import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import importService from '../services/ImportService/ImportService';

const ImportRoutesModal = ({ visible, onClose, onImportSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // Seleziona file
  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/json'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Valida il formato
        if (!importService.validateFileFormat(file.name)) {
          Alert.alert(
            'Formato Non Supportato',
            'Seleziona un file JSON o CSV valido.',
            [{ text: 'OK' }]
          );
          return;
        }

        setSelectedFile(file);
        await previewFile(file);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert(
        'Errore',
        'Errore nella selezione del file.',
        [{ text: 'OK' }]
      );
    }
  };

  // Anteprima del file
  const previewFile = async (file) => {
    try {
      setLoading(true);
      
      const extension = file.name.split('.').pop().toLowerCase();
      let data;

      if (extension === 'json') {
        data = await importService.importFromJSON(file.uri);
      } else if (extension === 'csv') {
        data = await importService.importFromCSV(file.uri);
      }

      setPreviewData(data);
    } catch (error) {
      console.error('Error previewing file:', error);
      Alert.alert(
        'Errore nell\'Anteprima',
        error.message,
        [{ text: 'OK' }]
      );
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  // Conferma importazione
  const confirmImport = async () => {
    if (!selectedFile || !previewData) return;

    try {
      setLoading(true);
      
      // Qui dovresti passare il database service
      // Per ora simuliamo il salvataggio
      console.log('Importing routes:', previewData);
      
      // Simula il salvataggio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Importazione Completata',
        `${previewData.length} percorso/i importato/i con successo!`,
        [
          {
            text: 'OK',
            onPress: () => {
              onImportSuccess?.(previewData);
              handleClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error importing routes:', error);
      Alert.alert(
        'Errore nell\'Importazione',
        error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Genera file di esempio
  const generateSampleFile = async (format) => {
    try {
      const fileName = `percorso_esempio.${format}`;
      const content = format === 'json' 
        ? JSON.stringify(importService.generateSampleJSON(), null, 2)
        : importService.generateSampleCSV();

      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, content);

      Alert.alert(
        'File di Esempio Creato',
        `File salvato in: ${fileName}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error generating sample file:', error);
      Alert.alert(
        'Errore',
        'Errore nella creazione del file di esempio.',
        [{ text: 'OK' }]
      );
    }
  };

  // Chiudi modal
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewData(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📁 Importa Percorsi</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Sezione selezione file */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Seleziona File</Text>
            <Text style={styles.sectionDescription}>
              Scegli un file JSON o CSV contenente i percorsi da importare.
            </Text>
            
            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={selectFile}
              disabled={loading}
            >
              <Text style={styles.selectButtonText}>
                {selectedFile ? '📄 Cambia File' : '📁 Seleziona File'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>📄 {selectedFile.name}</Text>
                <Text style={styles.fileSize}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </Text>
              </View>
            )}
          </View>

          {/* Sezione anteprima */}
          {previewData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Anteprima Dati</Text>
              <Text style={styles.sectionDescription}>
                Controlla i dati che verranno importati:
              </Text>
              
              {previewData.map((route, index) => (
                <View key={index} style={styles.routePreview}>
                  <Text style={styles.routeName}>🗺️ {route.name}</Text>
                  <Text style={styles.routeDescription}>{route.description}</Text>
                  <Text style={styles.routeStats}>
                    📍 {route.stops.length} fermate
                  </Text>
                  
                  <View style={styles.stopsPreview}>
                    {route.stops.slice(0, 3).map((stop, stopIndex) => (
                      <Text key={stopIndex} style={styles.stopPreview}>
                        • {stop.name} ({stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)})
                      </Text>
                    ))}
                    {route.stops.length > 3 && (
                      <Text style={styles.moreStops}>
                        ... e altre {route.stops.length - 3} fermate
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Sezione file di esempio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 File di Esempio</Text>
            <Text style={styles.sectionDescription}>
              Scarica un file di esempio per vedere il formato corretto:
            </Text>
            
            <View style={styles.sampleButtons}>
              <TouchableOpacity 
                style={styles.sampleButton} 
                onPress={() => generateSampleFile('json')}
              >
                <Text style={styles.sampleButtonText}>📄 JSON</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sampleButton} 
                onPress={() => generateSampleFile('csv')}
              >
                <Text style={styles.sampleButtonText}>📊 CSV</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer con pulsanti */}
        <View style={styles.footer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFD800" />
              <Text style={styles.loadingText}>Elaborazione...</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annulla</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.importButton, 
                (!previewData || loading) && styles.importButtonDisabled
              ]} 
              onPress={confirmImport}
              disabled={!previewData || loading}
            >
              <Text style={styles.importButtonText}>Importa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 15,
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: '#FFD800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  fileInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 14,
    color: '#666666',
  },
  routePreview: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  routeDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  routeStats: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stopsPreview: {
    paddingLeft: 10,
  },
  stopPreview: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 3,
  },
  moreStops: {
    fontSize: 13,
    color: '#999999',
    fontStyle: 'italic',
  },
  sampleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sampleButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sampleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666666',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  importButton: {
    flex: 1,
    backgroundColor: '#FFD800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default ImportRoutesModal;
