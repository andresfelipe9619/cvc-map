const HOST = 'https://geo.cvc.gov.co'

const PROJECT_URL = `${HOST}/arcgis/rest/services/AMBIENTE_PRUEBAS/`

const BASE_LAYER_URL = PROJECT_URL + 'RCD_Actores/FeatureServer/'

const layersURL = {
  proyectos: BASE_LAYER_URL + 1,
  generadores: BASE_LAYER_URL + 2,
  gestores: BASE_LAYER_URL + 3,
  municipios: PROJECT_URL + 'RCD_Base/MapServer/1'
}

export { HOST, PROJECT_URL, BASE_LAYER_URL, layersURL }
