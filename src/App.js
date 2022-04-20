import { useEffect, useState } from 'react'
import { loadModules } from 'esri-loader'
import { Map } from '@esri/react-arcgis'
import './App.css'

const API_KEY =
  'AAPK37053845cd0740ea874876df578a5dc93vU9-4pGR2Np-ye64TcHb8uvjZQLO8FrxaK_ucTaJc1x2cSQ0-hxjmXaGECKGhS7'

const PROJECT_URL =
  'https://geo.cvc.gov.co/arcgis/rest/services/AMBIENTE_PRUEBAS/'

const BASE_LAYER_URL = PROJECT_URL + 'RCD_Actores/FeatureServer/'

const layersURL = {
  proyectos: BASE_LAYER_URL + 1,
  generadores: BASE_LAYER_URL + 2,
  gestores: BASE_LAYER_URL + 3,
  municipios: PROJECT_URL + 'RCD_Base/MapServer/1'
}

const popupGeneradores = {
  title: 'Datos Generadores ',
  content:
    '<b>ObjectID:</b> {OBJECTID}<br> <b>Longitud:</b> {LON}<br><b>Latitud:</b> {LAT}<br><b>Id Generador:</b> {ID_GENERADOR }<br><b>Estado:</b> {ESTADO}<br><b>Observaciones:</b> {OBSERVACIONES}<br><b>Fecha Registro:</b> {FECHA_REG}<br><b>Tipo Generador:</b> {TIPOGEN}<br><b>Observaciones:</b> {OBSERVACIONES}<br>'
}

function App () {
  useEffect(() => {
    loadModules(['esri/config'])
      .then(([esriConfig]) => {
        // Create a polygon geometry
        esriConfig.apiKey = API_KEY
        return esriConfig
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Map
        mapProperties={{ basemap: 'arcgis-imagery' }}
        viewProperties={{
          center: [-76.53335809707642, 3.3748621110488584],
          zoom: 16,
          constraints: {
            snapToZoom: false
          }
        }}
      >
        <Widgets />
      </Map>
    </div>
  )
}

function Widgets ({ map, view }) {
  const [toggle, setToggle] = useState(null)
  const [layerList, setLayerList] = useState()
  const [editor, setEditor] = useState()

  useEffect(() => {
    loadModules([
      'esri/widgets/BasemapToggle',
      'esri/widgets/LayerList',
      'esri/widgets/Editor',
      'esri/layers/FeatureLayer',
      'esri/geometry/projection'
    ])
      .then(([BasemapToggle, LayerList, Editor, FeatureLayer, projection]) => {
        const basemapToggle = new BasemapToggle({
          view,
          nextBasemap: 'arcgis-topographic'
        })
        setToggle(basemapToggle)
        view.ui.add(basemapToggle, 'bottom-right')

        view.when(function () {
          let list = new LayerList({
            view
          })

          // Add widget to the top right corner of the view
          setLayerList(list)
          view.ui.add(list, 'top-right')
        })
        projection.load()

        const layerMunicipios = new FeatureLayer({
          url: layersURL.municipios,
          opacity: 1,
          title: 'Municipios',
          id: 'municipiosLayer'
        })
        const layerProyectos = new FeatureLayer({
          url: layersURL.proyectos,
          opacity: 1,
          title: 'Proyectos',
          id: 'proyectosLayer'
        })
        const layerGeneradores = new FeatureLayer({
          url: layersURL.generadores,
          opacity: 1,
          title: 'Generadores',
          popupTemplate: popupGeneradores,
          id: 'proyectosLayer'
        })
        const layerGestores = new FeatureLayer({
          url: layersURL.gestores,
          opacity: 1,
          title: 'Gestores',
          id: 'gestoresLayer'
        })

        map.add(layerMunicipios)
        map.add(layerProyectos)
        map.add(layerGeneradores)
        map.add(layerGestores)

        const generadorInfos = {
          layer: layerGeneradores,
          fieldConfig: [
            {
              name: 'TIPOGEN ',
              label: 'Tipo generador'
            },
            {
              name: 'ESTADO',
              label: 'Estado'
            }
          ]
        }

        const mEditor = new Editor({
          view: view,
          allowedWorkflows: ['create', 'update'],
          layerInfos: [
            {
              layer: layerGeneradores,
              fieldConfig: [generadorInfos]
            }
          ]
        })
        setEditor(mEditor)
        view.ui.add(mEditor, 'top-right')
      })
      .catch(err => console.error(err))

    return function cleanup () {
      view.ui.remove(toggle)
      view.ui.remove(editor)
      view.ui.remove(layerList)
    }
    //eslint-disable-next-line
  }, [])

  return null
}

export default App
