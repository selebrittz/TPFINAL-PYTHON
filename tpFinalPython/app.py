from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

# Instanciar la aplicación
app = FastAPI(
    title="API de Exoplanetas",
    description="API analítica para la clasificación y consulta de candidatos de la misión Kepler mediante Machine Learning."
)

@app.get("/", include_in_schema=False)
def root_redirect():
    """Redirige automáticamente la raíz a la documentación interactiva Swagger."""
    return RedirectResponse(url="/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite que cualquier página web consulte tu API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar el modelo y el escalador previamente entrenados
modelo = joblib.load("model/modelo_exoplanetas.pkl")
scaler = joblib.load("model/scaler_exoplanetas.pkl")

# Cargar el catálogo acumulativo Kepler para búsquedas y consultas interactivas
try:
    df_cumulative = pd.read_csv("model/cumulative.csv")
    cols = ['kepoi_name', 'kepler_name', 'koi_disposition', 
            'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co', 
            'koi_slogg', 'koi_srad', 'ra', 'dec', 'koi_kepmag']
    # Eliminar filas donde los parámetros clave tengan nulos
    df_clean = df_cumulative[cols].dropna(subset=[
        'koi_fpflag_nt', 'koi_fpflag_ss', 'koi_fpflag_co', 
        'koi_slogg', 'koi_srad', 'ra', 'dec', 'koi_kepmag'
    ])
except Exception as e:
    df_clean = pd.DataFrame()
    print(f"Error cargando catálogo Kepler: {e}")

# Definir la estructura de los datos que vamos a recibir con validaciones
class DatosEstrella(BaseModel):
    koi_fpflag_nt: int = Field(..., ge=0, le=1, description="Flag de Falso Positivo: No-Transitorio (0 o 1)")
    koi_fpflag_ss: int = Field(..., ge=0, le=1, description="Flag de Falso Positivo: Co-Tránsito Estelar (0 o 1)")
    koi_fpflag_co: int = Field(..., ge=0, le=1, description="Flag de Falso Positivo: Centroide Desplazado (0 o 1)")
    koi_slogg: float = Field(..., gt=0.0, description="Gravedad superficial estelar log(g) (debe ser mayor a 0)")
    koi_srad: float = Field(..., gt=0.0, description="Radio estelar R☉ (debe ser mayor a 0)")
    ra: float = Field(..., description="Ascensión recta estelar en grados")
    dec: float = Field(..., description="Declinación estelar en grados")
    koi_kepmag: float = Field(..., gt=0.0, description="Brillo aparente Kepler en magnitud (debe ser mayor a 0)")

@app.post("/predecir")
def predecir_exoplaneta(datos: DatosEstrella):
    # Convertir los datos recibidos a un DataFrame
    df_entrada = pd.DataFrame([{
        "koi_fpflag_nt": datos.koi_fpflag_nt,
        "koi_fpflag_ss": datos.koi_fpflag_ss,
        "koi_fpflag_co": datos.koi_fpflag_co,
        "koi_slogg": datos.koi_slogg,
        "koi_srad": datos.koi_srad,
        "ra": datos.ra,
        "dec": datos.dec,
        "koi_kepmag": datos.koi_kepmag
    }])
    
    # Escalar los datos igual que en el entrenamiento
    datos_escalados = scaler.transform(df_entrada)
    
    # Hacer la predicción
    prediccion = modelo.predict(datos_escalados)
    
    # Interpretar el resultado
    resultado = "CONFIRMADO: Es un Exoplaneta" if prediccion[0] == 1 else "FALSO POSITIVO: No es un planeta"
    
    return {"prediccion": resultado}

@app.get("/candidatos")
def listar_candidatos(limit: int = 150):
    """Retorna los primeros candidatos del catálogo para autocompletar búsquedas."""
    if df_clean.empty:
        return []
    # Tomamos candidatos limpios y con datos válidos
    df_subset = df_clean[['kepoi_name', 'kepler_name', 'koi_disposition']].fillna("")
    return df_subset.head(limit).to_dict(orient="records")

@app.get("/candidato/aleatorio")
def obtener_candidato_aleatorio(disposition: str = None):
    """Devuelve un candidato aleatorio. Puede filtrarse por CONFIRMED o FALSE POSITIVE."""
    if df_clean.empty:
        raise HTTPException(status_code=404, detail="El catálogo acumulativo no está disponible")
    
    df_filtered = df_clean
    if disposition:
        # Convertir a formato del dataset (ej: CONFIRMED o FALSE POSITIVE)
        norm_disp = "CONFIRMED" if disposition.upper().startswith("CONF") else "FALSE POSITIVE"
        df_filtered = df_clean[df_clean['koi_disposition'].str.upper() == norm_disp]
        if df_filtered.empty:
            df_filtered = df_clean
            
    row = df_filtered.sample(1).iloc[0]
    return {
        "kepoi_name": row["kepoi_name"],
        "kepler_name": row["kepler_name"] if pd.notnull(row["kepler_name"]) else None,
        "koi_disposition": row["koi_disposition"],
        "features": {
            "koi_fpflag_nt": int(row["koi_fpflag_nt"]),
            "koi_fpflag_ss": int(row["koi_fpflag_ss"]),
            "koi_fpflag_co": int(row["koi_fpflag_co"]),
            "koi_slogg": float(row["koi_slogg"]),
            "koi_srad": float(row["koi_srad"]),
            "ra": float(row["ra"]),
            "dec": float(row["dec"]),
            "koi_kepmag": float(row["koi_kepmag"])
        }
    }

@app.get("/candidato/{name}")
def obtener_candidato_por_nombre(name: str):
    """Busca un candidato por su ID de Kepler (ej. K00752.01) o nombre público (ej. Kepler-22 b)."""
    if df_clean.empty:
        raise HTTPException(status_code=404, detail="El catálogo acumulativo no está disponible")
    
    # Búsqueda exacta insensible a mayúsculas
    match = df_clean[
        (df_clean['kepoi_name'].str.upper() == name.upper()) | 
        (df_clean['kepler_name'].str.upper() == name.upper())
    ]
    
    if match.empty:
        # Búsqueda por subcadena
        match = df_clean[
            df_clean['kepoi_name'].str.contains(name, case=False, na=False) | 
            df_clean['kepler_name'].str.contains(name, case=False, na=False)
        ]
        
    if match.empty:
        raise HTTPException(status_code=404, detail=f"No se encontró ningún candidato Kepler con el nombre '{name}'")
        
    row = match.iloc[0]
    return {
        "kepoi_name": row["kepoi_name"],
        "kepler_name": row["kepler_name"] if pd.notnull(row["kepler_name"]) else None,
        "koi_disposition": row["koi_disposition"],
        "features": {
            "koi_fpflag_nt": int(row["koi_fpflag_nt"]),
            "koi_fpflag_ss": int(row["koi_fpflag_ss"]),
            "koi_fpflag_co": int(row["koi_fpflag_co"]),
            "koi_slogg": float(row["koi_slogg"]),
            "koi_srad": float(row["koi_srad"]),
            "ra": float(row["ra"]),
            "dec": float(row["dec"]),
            "koi_kepmag": float(row["koi_kepmag"])
        }
    }