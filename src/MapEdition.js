import React, { memo, useEffect, useState } from 'react'
import { loadModules } from 'esri-loader'
import { layersURL } from './globals'

const Univalle = { lat: 3.3748621110488584, lon: -76.53335809707642 }

const DefaultState = {
  input_latitud: Univalle.lat,
  input_longitud: Univalle.lon,
  input_idgestor: '',
  input_objectid: '',
  where_query: `ESTADO='1'`,
  input_obs_gestor: '',
  input_objectid_edit: '',
  input_gestorid_edit: '',
  input_latitud_update: Univalle.lat,
  input_longitud_update: Univalle.lon,
  select_tipogestor: '',
  select_estado: '',
  lat_coordinate: '',
  lon_coordinate: ''
}

function MapEdition ({ map, view, layerGestores }) {
  const [resultsLayer, setResultsLayer] = useState(null)
  const [modules, setModules] = useState([])
  const [inputs, setInputs] = useState(DefaultState)

  const {
    input_latitud,
    input_longitud,
    input_idgestor,
    input_objectid,
    where_query,
    input_obs_gestor,
    input_objectid_edit,
    input_gestorid_edit,
    input_latitud_update,
    input_longitud_update,
    select_tipogestor,
    select_estado,
    lat_coordinate,
    lon_coordinate
  } = inputs

  const geometry = {
    x: input_longitud,
    y: input_latitud,
    type: 'point',
    spatialReference: {
      wkid: 4326
    }
  }

  function handleChange (event) {
    const { name, value } = event.target
    setInputs(prev => ({
      ...prev,
      [name]: value
    }))
  }

  //Funcion para editar un gestor seleccionado
  function handleEdit () {
    console.log('Se hizo click en el Boton de editar arbol')

    //muevo el gestor de posicion y actualizo
    const attributes = {
      ObjectID: input_objectid_edit,
      LAT: input_latitud_update,
      LON: input_longitud_update,
      ID_GESTOR: input_gestorid_edit,
      TIPOGESTOR: select_tipogestor,
      ESTADO: select_estado,
      OBSERVACIONES: input_obs_gestor,
      FECHA_REG: Date.now()
    }

    layerGestores
      .applyEdits({
        updateFeatures: [
          {
            geometry,
            attributes
          }
        ]
      })
      .then(function (response) {
        console.log(response)
        alert(
          'Actualizando el Gestor con ObjectID: ' +
            response.updateFeatureResults[0].objectId
        )
      })
  }

  //Funcion para agregar un nuevo Gestor
  function handleCreate () {
    console.log('Se hizo click en el Boton de agregar nuevo gestor')

    const attributes = {
      LAT: input_latitud,
      LON: input_longitud,
      ID_GESTOR: input_idgestor,
      ESTADO: 1,
      TIPOGESTOR: 1,
      FECHA_REG: Date.now()
    }

    layerGestores
      .applyEdits({
        addFeatures: [
          {
            geometry,
            attributes
          }
        ]
      })
      .then(function (response) {
        console.log(response)
        alert('Creado el ObjectID: ' + response.addFeatureResults[0].objectId)
      })
  }

  //Funcion para borrar un  gestor seleccionado
  function handleDelete () {
    console.log(
      'Se hizo click en el Boton de borrar el arbol con OBJECTID: ' +
        input_objectid
    )

    if (input_objectid > 0) {
      let confirmw = window.confirm(
        'Esta seguro que desea borrar el gestor con ObjectID: ' + input_objectid
      )
      if (confirmw) {
        // Eliminar el arbol con el objectid seleccionado
        layerGestores
          .applyEdits({
            deleteFeatures: [
              {
                objectId: input_objectid
              }
            ]
          })
          .then(function (response) {
            console.log(response)
            alert(
              'Fue Eliminado el ObjectID: ' +
                response.deleteFeatureResults[0].objectId +
                ' con Exito !'
            )
          })
      } else {
        alert('Todo bien, no se borro nada')
      }
    } else {
      alert('Seleccione un valor numerico valido !')
    }
  }

  // Query en capa de  proyectos
  function handleQuery () {
    console.log('query proyectos')
    const [QueryTask, Query] = modules
    let queryTask = new QueryTask({
      url: layersURL.proyectos
    })

    let query = new Query()
    query.returnGeometry = true
    query.outFields = ['*']

    query.where = where_query

    let marker = {
      type: 'simple-marker',
      outline: {
        color: [248, 35, 35, 1],
        width: 2
      },
      angle: 360,
      color: [12, 35, 35, 0.1],
      size: 30
    }

    map.remove(resultsLayer)
    resultsLayer.removeAll()

    // When resolved, returns features and graphics that satisfy the query.
    queryTask.execute(query).then(function (results) {
      resultsLayer.addMany(results.features)

      for (let i = 0; i < results.features.length; i++) {
        results.features[i].symbol = marker
      }

      map.add(resultsLayer)
    })

    // When resolved, returns a count of the features that satisfy the query.
    queryTask.executeForCount(query).then(function (results) {
      console.log(results)
      if (!results) {
        alert('La consulta no retorno nada !')
      }
    })
  }

  function handleShowCoordinates () {
    console.log('Show center map coordinates')
    let latCoordinate = view.center.latitude
    let lonCoordinate = view.center.longitude

    setInputs(prev => ({
      ...prev,
      lat_coordinate: latCoordinate,
      lon_coordinate: lonCoordinate
    }))

    let strCoords = `Lat: ${latCoordinate} ,  Lon: ${lonCoordinate} `
    console.log(strCoords)
    alert(strCoords)

    let mapPointtest = {
      //Create a point
      type: 'point',
      longitude: lonCoordinate,
      latitude: latCoordinate,
      spatialReference: {
        wkid: 4326
      }
    }

    console.log(mapPointtest)
  }

  //widget html para mostrar las coordenadas
  function createCoordsWidget () {
    let coordsWidget = document.createElement('div')
    coordsWidget.id = 'coordsWidget'
    coordsWidget.className = 'esri-widget esri-component'
    coordsWidget.style.padding = '7px 15px 5px'
    return coordsWidget
  }

  function createPoint () {
    // TODO: Se podria usar la coordena actual obtenida desde el GPS del dispositivo
    const point = {
      //Create a point at univalle
      type: 'point',
      longitude: -76.5355613,
      latitude: 3.3758083
    }
    const simpleMarkerSymbol = {
      type: 'simple-marker',
      style: 'cross',
      color: [255, 0, 0], // Red
      size: '20px', // pixels
      outline: {
        color: [255, 0, 0], // White
        width: 2
      }
    }
    return { point, simpleMarkerSymbol }
  }

  useEffect(() => {
    if (!view || !map) return
    loadModules([
      'esri/Graphic',
      'esri/layers/GraphicsLayer',
      'esri/tasks/QueryTask',
      'esri/tasks/support/Query'
    ])
      .then(esriModules => {
        const [Graphic, GraphicsLayer, QueryTask, Query] = esriModules
        setModules([QueryTask, Query])
        const results_layer = new GraphicsLayer({
          title: 'Capa resultado consulta'
        })
        setResultsLayer(results_layer)

        const coordsWidget = createCoordsWidget()
        view.ui.add(coordsWidget, 'bottom-left')

        const graphicsLayer = new GraphicsLayer()
        //map.add(graphicsLayer);

        const { point, simpleMarkerSymbol } = createPoint()
        const pointGraphic = new Graphic({
          geometry: point,
          symbol: simpleMarkerSymbol
        })
        graphicsLayer.add(pointGraphic)

        // Centrar el mapa a la posición de la coordenada
        view.center = point
        view.zoom = 16

        // Obtener el Object id del Gestor seleccionado
        view.on('click', function (event) {
          view.hitTest(event).then(function (response) {
            const [selected] = response?.results || []
            const { layer, attributes } = selected?.graphic || {}
            if (layer?.id === 'gestoresLayer') {
              console.log('OBJECTID Gestor Seleccionado:')
              console.log(attributes)

              //para asignar objectid a la caja de texto y despues editarlo
              setInputs(prev => ({
                ...prev,
                input_objectid_edit: attributes?.OBJECTID,
                input_gestorid_edit: attributes?.ID_GESTOR,
                input_objectid: attributes?.OBJECTID
              }))
            }
          })
        })

        // Capturo las coordenadas del mouse y las asigno a la caja de texto latitud y longitud
        view.on('double-click', function (event) {
          const { x, y, mapPoint } = event
          console.log('screen point', x, y)
          console.log('map point', mapPoint)

          setInputs(prev => ({
            ...prev,
            input_latitud: mapPoint?.latitude,
            input_longitud: mapPoint?.longitude,
            input_latitud_update: mapPoint?.latitude,
            input_longitud_update: mapPoint?.longitude
          }))

          alert('Agregue las coordenadas de donde se dio doble click')
        })

        // Listener de evento sobre el mapa, actualizar la posición del marcador de posicion
        view.on(['mouse-wheel', 'drag'], function () {
          let latCoordinate = view.center.latitude
          let lonCoordinate = view.center.longitude

          setInputs(prev => ({
            ...prev,
            lat_coordinate: latCoordinate,
            lon_coordinate: lonCoordinate
          }))

          coordsWidget.innerHTML = `Centro Mapa -> Lat: ${latCoordinate} ,  Lon: ${lonCoordinate} `

          //Create a point
          let mapPoint = {
            type: 'point',
            longitude: lonCoordinate,
            latitude: latCoordinate
          }

          let graphic = pointGraphic.clone()
          graphic.geometry = mapPoint
          view.graphics.removeAll()
          view.graphics.add(graphic)
        })
      })
      .catch(err => console.error(err))

    return function cleanup () {
      setResultsLayer(null)
      setModules([])
    }
    //eslint-disable-next-line
  }, [view, map])

  return (
    <div style={{ padding: 8 }}>
      <hr />
      <button id='showCoordinates' onClick={handleShowCoordinates}>
        Obtener Coordenadas centro del mapa
      </button>
      <br />
      <br /> Latitud:{' '}
      <input
        type='text'
        name='lat_coordinate'
        value={lat_coordinate}
        onChange={handleChange}
      />
      <br /> Longitud:{' '}
      <input
        type='text'
        name='lon_coordinate'
        value={lon_coordinate}
        onChange={handleChange}
      />
      <hr />
      <br /> <b>Haga doble click sobre el mapa para obtener las coordenadas:</b>
      <br /> Latitud:{' '}
      <input
        type='text'
        onChange={handleChange}
        value={input_latitud}
        name='input_latitud'
      />
      <br /> Longitud:{' '}
      <input
        type='text'
        onChange={handleChange}
        name='input_longitud'
        value={input_longitud}
      />
      <br /> ID Generador:{' '}
      <input
        type='text'
        name='input_idgestor'
        onChange={handleChange}
        value={input_idgestor}
      />
      <button id='addNewGestor' onClick={handleCreate}>
        Agregar Nuevo Gestor en coordenadas
      </button>
      <hr />
      <br /> <b>Haga doble click sobre Gestor que desea borrar:</b>
      <input
        type='text'
        name='input_objectid'
        value={input_objectid}
        onChange={handleChange}
        placeholder='ingresar objectid'
      />
      <button id='deleteGestor' onClick={handleDelete}>
        Borrar Gestor
      </button>
      <hr />
      <br />
      Probar con estos querys (Layer: <b>Proyectos</b>): <br /> ESTADO='1'{' '}
      <br /> ESTADO='0' <br /> ID_PROYECTO='88888'
      <br />
      <br />
      <input
        type='text'
        name='where_query'
        value={where_query}
        onChange={handleChange}
      />
      <button id='queryProyectos' onClick={handleQuery}>
        Realizar Query
      </button>
      <br />
      <br />
      <br />
      <hr /> ObjectID del Gestor:{' '}
      <input onChange={handleChange} type='text' name='input_objectid_edit' />
      <br />
      <br /> <b>Haga doble click sobre el mapa para obtener las coordenadas:</b>
      <br /> ID Gestor:{' '}
      <input onChange={handleChange} type='text' name='input_gestorid_edit' />
      <br />
      <br /> Latitud:{' '}
      <input
        onChange={handleChange}
        type='text'
        name='input_latitud_update'
        value={input_latitud_update}
      />
      <br /> Longitud:{' '}
      <input
        onChange={handleChange}
        type='text'
        name='input_longitud_update'
        value={input_longitud_update}
      />
      <br />
      Tipo de Gestor:
      <select
        name='select_tipogestor'
        id='select_tipogestor'
        value={select_tipogestor}
        onChange={handleChange}
      >
        <option value='1'>Gestor</option>
        <option value='2'>Receptor</option>
        <option value='3'>Gestor-Receptor</option>
      </select>
      <br />
      ESTADO:
      <select
        id='select_estado'
        name='select_estado'
        onChange={handleChange}
        value={select_estado}
      >
        <option value='0'>Inactivo</option>
        <option value='1'>Activo</option>
      </select>
      <br /> Observaciones:{' '}
      <input
        type='text'
        name='input_obs_gestor'
        value={input_obs_gestor}
        onChange={handleChange}
        placeholder='Observacion para un gestor'
      />
      <button id='editGestor' onClick={handleEdit}>
        Editar Gestor
      </button>
    </div>
  )
}

export default memo(MapEdition)
