import { useEffect, useState } from 'react'
import { loadModules } from 'esri-loader'
import { Map } from '@esri/react-arcgis'
import Layers from './Layers'
import './App.css'
import Widgets from './Widgets'
import MapEdition from './MapEdition'

const API_KEY =
  'AAPK37053845cd0740ea874876df578a5dc93vU9-4pGR2Np-ye64TcHb8uvjZQLO8FrxaK_ucTaJc1x2cSQ0-hxjmXaGECKGhS7'

const viewProperties = {
  center: [-76.53335809707642, 3.3748621110488584],
  zoom: 16,
  constraints: {
    snapToZoom: false
  }
}

const mapProperties = { basemap: 'arcgis-imagery' }

function App () {
  const [state, setState] = useState(null)
  const [editor, setEditor] = useState(null)
  const [municipios, setMunicipios] = useState(null)
  const [proyectos, setProyectos] = useState(null)
  const [generadores, setGeneradores] = useState(null)
  const [gestores, setGestores] = useState(null)

  const handleLoad = (map, view) => {
    setState({ map, view })
  }

  useEffect(() => {
    loadModules(['esri/config'])
      .then(([esriConfig]) => {
        // Create a polygon geometry
        esriConfig.apiKey = API_KEY
        return esriConfig
      })
      .catch(err => console.error('esri/config: ' + err))
  }, [])

  const layersProps = {
    editor,
    municipios,
    proyectos,
    generadores,
    gestores,
    setEditor,
    setMunicipios,
    setProyectos,
    setGeneradores,
    setGestores
  }

  console.log('state', state)
  return (
    <div style={{ width: '99vw', height: '80vh' }}>
      <Map
        mapProperties={mapProperties}
        viewProperties={viewProperties}
        onLoad={handleLoad}
      />
      <Widgets {...state} />
      <Layers {...state} {...layersProps} />
      <MapEdition {...state} layerGestores={gestores} />
    </div>
  )
}

export default App
