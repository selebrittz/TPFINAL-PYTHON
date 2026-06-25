# 🪐 Cazador Automático de Exoplanetas - Kepler ML

Este proyecto es una herramienta científica interactiva de clasificación y predicción que determina si un Objeto de Interés de Kepler (KOI) es un **Exoplaneta Confirmado** o un **Falso Positivo** utilizando algoritmos supervisados de Machine Learning y una API web.

---

## 🌌 1. La Problemática: El Cuello de Botella en la Exploración Espacial

El problema central que resuelve este proyecto es la **incapacidad analítica para procesar el volumen masivo de datos** generados por los instrumentos de observación espacial modernos.

Específicamente, el telescopio espacial Kepler monitoreó más de 150,000 estrellas de forma ininterrumpida, buscando caídas temporales en el brillo estelar (método de tránsito). Esta recolección masiva de información generó tres obstáculos críticos:

* **El Abismo del Big Data**: Un equipo de astrónomos no puede revisar manualmente miles de tablas de mediciones diarias para confirmar si la sombra detectada pertenece a un exoplaneta. Es un proceso operacionalmente inviable, extremadamente lento y propenso al sesgo o error humano por fatiga.
* **El Costo de los Falsos Positivos**: El espacio profundo tiene niveles altísimos de ruido. Una gran porción de las anomalías detectadas por los sensores no son planetas. Frecuentemente son sistemas de estrellas binarias eclipsándose mutuamente, contaminación lumínica de estrellas de fondo, o inestabilidades del propio instrumento óptico. Asignar tiempo de telescopios secundarios millonarios para investigar un falso positivo representa una enorme pérdida de recursos científicos.
* **La Complejidad Multidimensional de la Física**: Determinar la autenticidad de un exoplaneta no depende de una sola variable. Requiere cruzar simultáneamente el comportamiento de la luz con propiedades físicas de escalas radicalmente distintas, como la gravedad superficial de la estrella anfitriona (`koi_slogg`) y su radio exacto (`koi_srad`). Analizar estas interacciones no lineales de forma estática es ineficiente.

---

## 🛠️ 2. La Solución: El Para Qué del Proyecto

Ante esta saturación de información, el **Cazador Automático de Exoplanetas** interviene como una capa de automatización inteligente.

El proyecto toma un problema de clasificación manual que tomaría meses y lo resuelve en **milisegundos**. Al delegar esta tarea a un modelo de ensamble como el **Random Forest**, el sistema es capaz de evaluar instantáneamente las métricas de la estrella, cruzar los datos físicos, aplicar las banderas de descarte para anular las irregularidades, y dictaminar con precisión si la muestra es un exoplaneta confirmado o simple ruido cósmico.

De esta manera, el proyecto no es solo un modelo predictivo por cumplir un requisito, sino una **solución de software completa** (Modelo + API + Dashboard interactivo) orientada a optimizar recursos críticos en un entorno de Big Data real.

---

## 🧠 3. Flujo Metodológico y Algoritmo

Para resolver este problema, se diseñó e implementó un flujo de trabajo en Python en el archivo [main.ipynb](file:///home/diegote/Escritorio/Trabajos_Prog/Python/Trabajos_practicos/primer_cuatrimestre/trabajo_practico_evaluativo/main.ipynb):

1. **Preprocesamiento de Datos**:
   - Se filtró el set acumulativo oficial de Kepler ([cumulative.csv](file:///home/diegote/Escritorio/Trabajos_Prog/Python/Trabajos_practicos/primer_cuatrimestre/trabajo_practico_evaluativo/model/cumulative.csv)) para conservar únicamente registros confirmados (`CONFIRMED`) y falsos positivos conocidos (`FALSE POSITIVE`), convirtiéndolos a valores binarios (`1` y `0`).
   - Se removieron los registros con valores nulos para garantizar la estabilidad del entrenamiento.

2. **Selección de Características (Features)**:
   Se seleccionaron 8 columnas fundamentales que describen tanto la estrella hospedadora como las banderas de descarte predictivas:
   - **Banderas de Descarte (Flags)**:
     - `koi_fpflag_nt`: Indica si la curva de luz no es transitoria (ruido, variabilidad extrema).
     - `koi_fpflag_ss`: Indica si el eclipse es consistente con una estrella binaria eclipsante.
     - `koi_fpflag_co`: Indica si el centroide de luz se desplaza, señalando una fuente de fondo ajena.
   - **Características Físicas de la Estrella**:
     - `koi_slogg`: Gravedad superficial de la estrella.
     - `koi_srad`: Radio de la estrella (en radios solares).
     - `koi_kepmag`: Magnitud del brillo de la estrella.
   - **Coordenadas Celestes**:
     - `ra` (Ascensión Recta) y `dec` (Declinación).

3. **Escalamiento de Datos**:
   Se utilizó `StandardScaler` de Scikit-Learn para estandarizar las características numéricas, asegurando que diferencias en escalas de coordenadas o magnitudes no sesguen el clasificador.

4. **Algoritmo de Machine Learning**:
   Se seleccionó **Random Forest (Bosques Aleatorios)** debido a su robustez frente al sobreajuste (overfitting), capacidad para manejar relaciones no lineales y facilidad de inspección de importancia de variables. El modelo se instanció con 100 árboles de decisión (`n_estimators=100`) y se entrenó sobre un 80% de los datos estructurados, reservando el 20% restante para validación.

---

## 📊 4. Resultados Obtenidos

El modelo de Random Forest entrenado obtuvo los siguientes resultados en el conjunto de prueba:

* **Accuracy (Precisión Global)**: **96.08%**
* **Falso Positivo (Clase 0)**: Precision: **98%** | Recall: **96%** | F1-Score: **97%**
* **Confirmado (Clase 1)**: Precision: **93%** | Recall: **95%** | F1-Score: **94%**

### Matriz de Confusión
- **Verdaderos Falsos Positivos**: 905 de 945 muestras correctamente clasificadas.
- **Verdaderos Confirmados (Exoplanetas)**: 435 de 458 muestras correctamente clasificadas.

---

## 🏗️ 5. Arquitectura del Proyecto

El repositorio está organizado de la siguiente manera:

```text
├── model/
│   ├── cumulative.csv          # Base de datos acumulativa oficial de Kepler
│   ├── modelo_exoplanetas.pkl  # Modelo de Random Forest serializado con joblib
│   └── scaler_exoplanetas.pkl  # Escalador StandardScaler serializado
├── app.py                      # Backend API con FastAPI y endpoints de consulta
├── index.html                  # Dashboard interactivo web (Frontend)
├── ExoplanetHunter.jsx         # Componente modular equivalente en React
├── main.ipynb                  # Notebook de Python con el análisis, EDA y entrenamiento
├── requirements.txt            # Dependencias del entorno
└── README.md                   # Documentación del proyecto (este archivo)
```

---

## 🛠️ 6. Guía de Ejecución

Sigue estos pasos para poner en marcha el proyecto localmente:

### Paso 1: Configurar el Entorno Virtual (Python)
Crea y activa un entorno virtual en la carpeta raíz del proyecto para evitar conflictos de librerías:

```bash
# Crear entorno virtual venv
python3 -m venv venv

# Activar en Linux/macOS
source venv/bin/activate

# Activar en Windows (PowerShell)
.\venv\Scripts\Activate.ps1
```

### Paso 2: Instalar Dependencias
Instala todas las dependencias listadas en [requirements.txt](file:///home/diegote/Escritorio/Trabajos_Prog/Python/Trabajos_practicos/primer_cuatrimestre/trabajo_practico_evaluativo/requirements.txt):

```bash
pip install -r requirements.txt
```

### Paso 3: Ejecutar la API Backend (FastAPI)
Lanza el servidor de desarrollo local para el backend. La API se iniciará en `http://127.0.0.1:8000`:

```bash
uvicorn app:app --reload
```

> [!TIP]
> Si visitas **`http://127.0.0.1:8000`** en tu navegador, serás redirigido automáticamente a la documentación Swagger de la API (`http://127.0.0.1:8000/docs`) donde podrás interactuar con los endpoints directamente.

### Paso 4: Ejecutar la Interfaz de Usuario (Frontend)
Para abrir el Dashboard visual, se recomienda utilizar un servidor web simple en otra pestaña de tu terminal para evitar restricciones del navegador asociadas con el protocolo `file://`:

```bash
# Iniciar servidor web de archivos estáticos
python3 -m http.server 5000
```

Ahora abre en tu navegador:
👉 **`http://localhost:5000/index.html`**

---

## 🌌 7. Características del Dashboard Interactivo

El frontend ofrece una experiencia rica y científica:
* **Buscador de Candidatos**: Ingresa el ID de Kepler (ej. `K00752.01`) o el nombre público (ej. `Kepler-22 b`) en el buscador y presiona **Buscar ID** para importar sus datos del catálogo en tiempo real.
* **Muestras Aleatorias**: Haz clic en `🎲 Confirmado Aleatorio` o `🎲 Falso Positivo Aleatorio` para cargar parámetros de objetos al azar de forma instantánea.
* **Badge Comparativo**: Se muestra un indicador con el veredicto real del catálogo oficial para que lo contrastes con la predicción generada por tu clasificador de Machine Learning al pulsar **Ejecutar Análisis Estelar**.

