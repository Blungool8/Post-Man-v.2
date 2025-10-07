## 2025-10-05 — Allineamento v3 (KML unico + GPS-driven UI)

**Agent**: GPT-5 Thinking  
**Task**: Aggiornare documentazione a nuovo flusso **KML unico** (es. `Zona9_SottozonaB.kml`); abilitare fermate **solo con GPS** entro raggio; **Lista Fermate**; **+Fermata**; **banner dopo selezione**.  
**Durata**: 1h

**Implementato**:
- Creato `PRD_V3_COMPLETO.md` con requisiti v3 (KML unico, flussi aggiornati).
- Creato `PLANNING_V3_DETTAGLIATO.md` con milestone e T09 “richiesta file KML”.
- Aggiornato `AGENT_INSTRUCTIONS.md` (rimozione JSON/merge runtime; regole GPS; banner post-selezione).
- Coerenza con storico v2 mantenuta.

**File Creati/Aggiornati**:
- `pk/PRD_V3_COMPLETO.md` — nuovo.
- `pk/PLANNING_V3_DETTAGLIATO.md` — nuovo.
- `pk/AGENT_INSTRUCTIONS.md` — aggiornato per v3.

**DoD Status**:
- Flusso KML unico documentato: ✅
- Regole GPS/visibilità fermate: ✅
- Lista fermate & +Fermata: ✅
- Banner dopo selezione: ✅

**Note**:
- Il KML deve essere preparato e ottimizzato a monte (dimensione target ≤ 5 MB).
- Semplificazione polyline (DP) lato client solo come safety per file molto densi.

**Next Steps**:
- Attendere da Lorsa il file **`Zona9_SottozonaB.kml`** (T09).
- Implementare M1 (Loader/Parser/Validator) → M2 (rendering + markers GPS).
