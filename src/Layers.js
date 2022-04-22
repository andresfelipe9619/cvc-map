import { memo, useEffect, useState } from 'react'
import { loadModules } from 'esri-loader'
import { layersURL } from './globals'

const popupGeneradores = {
  title: 'Datos Generadores ',
  content:
    '<b>ObjectID:</b> {OBJECTID}<br> <b>Longitud:</b> {LON}<br><b>Latitud:</b> {LAT}<br><b>Id Generador:</b> {ID_GENERADOR }<br><b>Estado:</b> {ESTADO}<br><b>Observaciones:</b> {OBSERVACIONES}<br><b>Fecha Registro:</b> {FECHA_REG}<br><b>Tipo Generador:</b> {TIPOGEN}<br><b>Observaciones:</b> {OBSERVACIONES}<br>'
}

function Layers ({ map, view }) {
  const [editor, setEditor] = useState(null)
  const [municipios, setMunicipios] = useState(null)
  const [proyectos, setProyectos] = useState(null)
  const [generadores, setGeneradores] = useState(null)
  const [gestores, setGestores] = useState(null)

  useEffect(() => {
    console.log('useEffect layers')
    if (!view || !map) return
    loadModules(['esri/widgets/Editor', 'esri/layers/FeatureLayer'])
      .then(([Editor, FeatureLayer]) => {
        console.log('loading modules layers')
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

        !municipios && map.add(layerMunicipios)
        !proyectos && map.add(layerProyectos)
        !generadores && map.add(layerGeneradores)
        !gestores && map.add(layerGestores)

        !municipios && setMunicipios(layerMunicipios)
        !proyectos && setProyectos(layerProyectos)
        !generadores && setGeneradores(layerGeneradores)
        !gestores && setGestores(layerGestores)

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
        !editor && view.ui.add(mEditor, 'top-right')
        !editor && setEditor(mEditor)
      })
      .catch(err => console.error('LAYERS' + err))

    return function cleanup () {
      editor && view.ui.remove(editor)
      municipios && map.remove(municipios)
      proyectos && map.remove(proyectos)
      generadores && map.remove(generadores)
      gestores && map.remove(gestores)
    }
    //eslint-disable-next-line
  }, [map, view])

  return null
}
export default memo(Layers)
