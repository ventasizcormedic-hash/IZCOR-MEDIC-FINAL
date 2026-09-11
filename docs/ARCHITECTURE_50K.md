# ARQUITECTURA DEL SISTEMA: ESCALABILIDAD A 50.000+ Y 1.000.000+ PRODUCTOS MÉDICOS REALES

## 1. PRINCIPIOS INNEGOCIABLES Y VERACIDAD DE DATOS
1. **Veracidad Absoluta**: Solo se incorporan productos, fabricantes, modelos, especificaciones y fuentes reales verificables. Está terminantemente prohibido generar productos ficticios, marcas sintéticas o rellenar especificaciones artificialmente.
2. **Fuente Única de la Verdad (Canonical Product Master)**: Toda la plataforma (Catálogo Público, Búsqueda, Admin, QC, Deduplicación, Scraper) opera sobre la tabla canónica `products`.
3. **Idempotencia y Checkpoints**: Re-procesar el mismo lote o URL es idempotente y no genera duplicados. Si un worker se detiene, continúa desde el último checkpoint registrado en `import_records` o `scraping_jobs`.
4. **Preservación del Estado e Inmutabilidad**: Las modificaciones a productos consolidados generan snapshots en `product_versions` y bitácoras en `autonomous_audit_logs` para permitir rollback inmediato sin pérdida de datos.

---

## 2. MODELO DE DATOS Y PERSISTENCIA RESILIENTE
- **`products` (Product Master)**:
  - Identidad canónica: `id`, `name`, `model`, `catalog_number`, `manufacturer`, `brand_id`, `category_id`, `slug`.
  - Integridad: `status` ('ACTIVE', 'INACTIVE'), `publication_status` ('UNPUBLISHED', 'PUBLISHED'), `verification_status` ('DRAFT', 'REVIEW', 'AUTO_VERIFIED', 'VERIFIED', 'OUTDATED').
  - Calidad: `validation_score` (0-100), `validation_issues` (JSON), `confidence_level` ('LOW', 'MEDIUM', 'HIGH').
  - Procedencia: `source_url`, `import_job_id`, `audit_report` (JSON).
- **`sources` (Registro Oficial de Fuentes)**:
  - Registro de origen: `domain`, `url`, `products_url`, `sitemap_url`, `source_type` ('OFFICIAL_MANUFACTURER', 'DISTRIBUTOR', 'CATALOG', 'SITEMAP', 'API').
  - Prioridad: `priority` (1-3), `verification_status` ('VERIFIED', 'OFFICIAL_REPRESENTATIVE_VERIFIED').
- **`scraping_jobs` & `backgroundJobs` (Colas y Checkpoints)**:
  - Ejecución en lotes con `processed_items`, `total_items`, `progress` (0-100), `error_log` y pausas/reanudación.
- **`import_records`**:
  - Registro de transacciones individuales por job con estado `PENDING`, `IMPORTED`, `FAILED`, `DUPLICATE`.
- **`duplicate_cases` & `product_merge_history`**:
  - Comparación fonética y trigramas (Levenshtein, modelo y referencia) con scoring 0-100 y recomendación automática.
- **`autonomous_settings` & `autonomous_audit_logs`**:
  - Control de velocidad, modo operativo (`SAFE_MODE`, `AUTO`), umbral de anomalías y registro inmutable de decisiones.
- **`product_versions`**:
  - Versionado delta y snapshots completos de cada producto ante cada actualización o publicación.

---

## 3. CICLO DE VIDA DEL PRODUCTO
```text
DESCUBRIMIENTO (Catálogo Oficial PDF / Fuentes Oficiales / Sitemaps)
       ↓
EXTRACCIÓN PROFUNDA (Nombre, Modelo, Ref, Specs, Certificaciones DIGEMID/CE/FDA, Imágenes)
       ↓
NORMALIZACIÓN (Unidades médicas mmHg/Lpm/bpm/kW, espacios, HTML stripping, slugs canónicos)
       ↓
EVALUACIÓN DE IDENTIDAD (Comparación por fabricante, modelo, catálogo)
       ↓
DEDUPLICACIÓN (Algoritmo fonético & Trigramas Levenshtein)
       ↓
CONTROL DE CALIDAD (12 reglas clínicas & scoring 0-100)
       ↓
DECISIÓN ARQUITECTÓNICA
   ├── Score ≥ 90 & Confianza Alta → AUTO_VERIFIED / PUBLISHED
   ├── Duda / Modelo ambiguo → REVIEW_REQUIRED
   └── Conflicto grave o fuente no confiable → BLOCKED
       ↓
INDEXACIÓN & CACHÉ L1/L2
       ↓
MONITOREO CONTINUO & ACTUALIZACIONES INCREMENTALES
```

---

## 4. ESTRATEGIA DE CRECIMIENTO ESCALONADO (ROADMAP EJECUTIVO)

### FASE 1: Catálogo Físico Oficial IZCOR MEDIC (Completada - 105 Equipos Reales)
- **Alcance**: 105 equipos médicos extraídos de las 24 páginas del catálogo oficial (`CATALOGO DE PRODUCTOS/CATALOGO.pdf`).
- **Imágenes**: 105 fotografías biomédicas extraídas a 150-300 DPI mediante Poppler `pdfimages` y convertidas a WebP en `public/assets/catalogo/productos/producto-001/` a `producto-105/`.
- **Enriquecimiento**: Especificaciones clínicas completas (sensores, rangos de medición, frecuencias de ultrasonido, modos ventilatorios VCV/PCV, volúmenes de cadena de frío y certificaciones DIGEMID / CE / ISO 13485).
- **Categorías maestras**: 9 especialidades (Monitoreo, Soporte Vital, Diagnóstico, Diagnóstico por Imágenes, Emergencia, Laboratorio, Mobiliario Clínico, Material e Instrumental, Cadena de Frío).

### FASE 2: Expansión de Fabricantes Aliados Oficiales (1.000 Productos)
- Conectores directos a catálogos abiertos de fabricantes representados:
  - **Mindray Medical**: Ecografía serie Resona/Consona, ventilación serie SV, monitores ePM/BeneVision.
  - **Edan Instruments**: Diagnóstico por ultrasonido Acclarix, telemetría e ECG serie SE.
  - **General Electric Healthcare**: Anestesia Carestation, rayos X fijos y móviles Optima.
  - **Riester Germany**: Diagnóstico clínico, otoscopía, tensiómetros aneroides y fonendoscopios.
  - **Saikang / Medik**: Camas UCI eléctricas, camillas de transporte hidráulicas y mesas quirúrgicas.
- **Workers asíncronos**: Ingesta con rate limiting respetuoso (1 request / 2 segundos) y registro en `scraping_jobs`.

### FASE 3: Deduplicación Automática y Control de Identidad (5.000 Productos)
- Activación de índices PostgreSQL trigram (`pg_trgm`) en `model` y `catalog_number`.
- Fusión inteligente: Si dos fuentes reportan el mismo equipo con variaciones mínimas de nombre (ej. "Mindray uMEC-10" vs "Monitor Multiparámetro Mindray UMEC 10"), el motor consolida el registro en el producto canónico enriqueciendo las especificaciones sin crear duplicados.

### FASE 4: Catálogo de Consumibles y Farmacovigilancia (10.000 Productos)
- Incorporación de insumos médicos estériles, material de sutura, jeringas Luer Lock, tubos Vacutainer y reactivos de laboratorio.
- Vinculación cruzada con alertas de tecnovigilancia y farmacovigilancia DIGEMID en tiempo real.

### FASE 5: Alta Concurrencia y Workers Distribuidos (25.000 Productos)
- Desacoplamiento de workers de ingesta con colas en segundo plano.
- Generación automatizada de PDFs técnicos individuales bajo demanda con marcas de agua de IZCOR MEDIC.

### FASE 6: Catálogo Continental Continuo (50.000+ a 1.000.000+ Productos)
- Búsqueda federada con latencia garantizada < 35ms mediante caché L1 in-memory y paginación por cursor.
- Monitoreo autónomo de fuentes: Detección periódica de nuevos modelos, cambios de firmware o discontinuaciones de fábrica.

---

## 5. PROTECCIÓN CONTRA CORRUPCIÓN Y ANOMALY HALT (FRENO DE EMERGENCIA)
Si durante cualquier proceso de ingesta masiva se detecta:
- Caída del Quality Score promedio mayor al 25%.
- Tasa de duplicados superior al 15%.
- Desaparición repentina de campos críticos en más del 10% del lote.
El worker activa el freno de emergencia (`emergency_stop`), congela la fuente afectada y genera una alerta crítica en el Centro de Control sin alterar el catálogo maestro publicado.

---

## 6. ESCALABILIDAD TÉCNICA E INFRAESTRUCTURA
- **Buscador**: Paginación mediante `limit`/`offset` y búsqueda por trigramas sobre índices `idx_products_model`, `idx_products_catalog_number`, `idx_products_slug` con latencia menor a 25ms.
- **Caché**: In-memory L1 cache (`cacheEngine.ts`) con invalidación quirúrgica por etiquetas (`products`, `catalog`, `brands`) ante cualquier escritura.
- **Almacenamiento Multimedia**: Carga diferida (`loading="lazy"`), imágenes WebP optimizadas con política `no-referrer` y enlace directo al PDF oficial en `/assets/catalogo/CATALOGO.pdf`.
