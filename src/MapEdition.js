import React, { memo, useEffect } from 'react'
import { loadModules } from 'esri-loader'
import { layersURL } from './globals'

function MapEdition ({ map, view }) {
  useEffect(() => {
    loadModules([
      'esri/Graphic',
      'esri/layers/GraphicsLayer',
      'esri/tasks/QueryTask',
      'esri/tasks/support/Query',
      'esri/geometry/SpatialReference',
      'esri/geometry/projection'
    ])
      .then(
        ([
          Graphic,
          GraphicsLayer,
          QueryTask,
          Query,
          SpatialReference,
          projection
        ]) => {
          //Funcion para editar un gestor seleccionado
          document
            .getElementById('editGestor')
            .addEventListener('click', function (event) {
              console.log('Se hizo click en el Boton de editar arbol')

              let objectid_value = document.getElementById(
                'input_objectid_edit'
              ).value

              let latitud_value = document.getElementById(
                'input_latitud_update'
              ).value
              let longitud_value = document.getElementById(
                'input_longitud_update'
              ).value

              let idgestor_value = document.getElementById(
                'input_gestorid_edit'
              ).value

              let tipogestor_value = document.getElementById(
                'select_tipogestor'
              ).value
              let estado_value = document.getElementById('select_estado').value
              let obs_value = document.getElementById('input_obs_gestor').value

              //muevo el gestor de posicion y actualizo
              let attributes = {
                ObjectID: objectid_value,
                LAT: latitud_value,
                LON: longitud_value,
                ID_GESTOR: idgestor_value,
                TIPOGESTOR: tipogestor_value,
                ESTADO: estado_value,
                OBSERVACIONES: obs_value,
                FECHA_REG: Date.now()
              }

              //   layerGestores
              //     .applyEdits({
              //       updateFeatures: [
              //         {
              //           geometry: {
              //             x: longitud_value,
              //             y: latitud_value,
              //             type: 'point',
              //             spatialReference: {
              //               wkid: 4326
              //             }
              //           },
              //           attributes
              //         }
              //       ]
              //     })
              //     .then(function (response) {
              //       console.log(response)
              //       alert(
              //         'Actualizando el Gestor con ObjectID: ' +
              //           response.updateFeatureResults[0].objectId
              //       )
              //     })
            })

          //Funcion para agregar un nuevo Gestor
          document
            .getElementById('addNewGestor')
            .addEventListener('click', function (event) {
              console.log('Se hizo click en el Boton de agregar nuevo gestor')

              let latitud_value = document.getElementById('input_latitud').value
              let longitud_value = document.getElementById('input_longitud')
                .value
              let idgestor = document.getElementById('input_idgestor').value

              let attributes = {
                LAT: latitud_value,
                LON: longitud_value,
                ID_GESTOR: idgestor,
                ESTADO: 1,
                TIPOGESTOR: 1,
                FECHA_REG: Date.now()
              }

              //   layerGestores
              //     .applyEdits({
              //       addFeatures: [
              //         {
              //           geometry: {
              //             x: longitud_value,
              //             y: latitud_value,
              //             type: 'point',
              //             spatialReference: {
              //               wkid: 4326
              //             }
              //           },
              //           attributes: attributes
              //         }
              //       ]
              //     })
              //     .then(function (response) {
              //       console.log(response)
              //       alert(
              //         'Creado el ObjectID: ' +
              //           response.addFeatureResults[0].objectId
              //       )
              // })
            })

          //Obtener el Object id del Gestor seleccionado
          view.on('click', function (event) {
            view.hitTest(event).then(function (response) {
              let [selected] = response.results
              if (
                selected.graphic &&
                selected.graphic.layer.id === 'gestoresLayer'
              ) {
                console.log('OBJECTID Gestor Seleccionado:')
                console.log(selected.graphic.attributes)

                //para asignar objectid a la caja de texto y despues editarlo
                document.getElementById('input_objectid_edit').value =
                  selected.graphic.attributes.OBJECTID

                document.getElementById('input_gestorid_edit').value =
                  selected.graphic.attributes.ID_GESTOR

                //para asignar objectid a la caja de texto y despues eliminarlo
                document.getElementById('input_objectid').value =
                  selected.graphic.attributes.OBJECTID
              }
            })
          })

          //Funcion para borrar un  gestor seleccionado
          document
            .getElementById('deleteGestor')
            .addEventListener('click', function (event) {
              let objectid_value = document.getElementById('input_objectid')
                .value

              console.log(
                'Se hizo click en el Boton de borrar el arbol con OBJECTID: ' +
                  objectid_value
              )

              if (objectid_value > 0) {
                let confirmw = window.confirm(
                  'Esta seguro que desea borrar el gestor con ObjectID: ' +
                    objectid_value
                )
                if (confirmw) {
                  //   //Eliminar el arbol con el objectid seleccionado
                  //   layerGestores
                  //     .applyEdits({
                  //       deleteFeatures: [
                  //         {
                  //           objectId: objectid_value
                  //         }
                  //       ]
                  //     })
                  //     .then(function (response) {
                  //       console.log(response)
                  //       alert(
                  //         'Fue Eliminado el ObjectID: ' +
                  //           response.deleteFeatureResults[0].objectId +
                  //           ' con Exito !'
                  //       )
                  //     })
                } else {
                  alert('Todo bien, no se borro nada')
                }
              } else {
                alert('Seleccione un valor numerico valido !')
              }
            })

          let resultsLayer = new GraphicsLayer({
            title: 'Capa resultado consulta'
          })

          //query en capa de  proyectos
          document
            .getElementById('queryProyectos')
            .addEventListener('click', function (event) {
              console.log('query proyectos')

              let queryTask = new QueryTask({
                url: layersURL.proyectos
              })

              let query = new Query()
              query.returnGeometry = true
              query.outFields = ['*']

              let where_query = document.getElementById('where_query').value

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
            })

          //Capturo las coordenadas del mouse y las asigno a la caja de texto latitud y longitud
          view.on('double-click', function (event) {
            console.log('screen point', event.x, event.y)
            console.log('map point', event.mapPoint)

            document.getElementById('input_latitud').value =
              event.mapPoint.latitude
            document.getElementById('input_longitud').value =
              event.mapPoint.longitude

            document.getElementById('input_latitud_update').value =
              event.mapPoint.latitude
            document.getElementById('input_longitud_update').value =
              event.mapPoint.longitude

            alert('Agregue las coordenadas de donde se dio doble click')
          })

          //widget html para mostrar las coordenadas
          let coordsWidget = document.createElement('div')
          coordsWidget.id = 'coordsWidget'
          coordsWidget.className = 'esri-widget esri-component'
          coordsWidget.style.padding = '7px 15px 5px'
          view.ui.add(coordsWidget, 'bottom-right')

          let graphicsLayer = new GraphicsLayer()
          //map.add(graphicsLayer);
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

          const pointGraphic = new Graphic({
            geometry: point,
            symbol: simpleMarkerSymbol
          })
          graphicsLayer.add(pointGraphic)

          //Centrar el mapa a la posición de la coordenada
          view.center = point
          view.zoom = 16

          //listener de evento sobre el mapa, actualizar la posición del marcador de posicion
          view.on(['mouse-wheel', 'drag'], function () {
            let latCoordinate = view.center.latitude
            let lonCoordinate = view.center.longitude
            document.getElementById('lat_coordinate').value = latCoordinate
            document.getElementById('lon_coordinate').value = lonCoordinate

            coordsWidget.innerHTML = `Centro Mapa -> Lat: ${latCoordinate} ,  Lon: ${lonCoordinate} `

            let mapPoint = {
              //Create a point
              type: 'point',
              longitude: lonCoordinate,
              latitude: latCoordinate
            }

            let graphic = pointGraphic.clone()
            graphic.geometry = mapPoint
            view.graphics.removeAll()
            view.graphics.add(graphic)
          })

          document
            .getElementById('showCoordinates')
            .addEventListener('click', function (event) {
              console.log('Show center map coordinates')
              let latCoordinate = view.center.latitude
              let lonCoordinate = view.center.longitude

              document.getElementById('lat_coordinate').value = latCoordinate
              document.getElementById('lon_coordinate').value = lonCoordinate

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
              //TODO:  Project coordinates from 4326 to 3115

              projection.load().then(function () {
                let outSpatialReference = new SpatialReference({
                  wkid: 3115
                })
                let projectedPoints = projection.project(
                  mapPointtest,
                  outSpatialReference
                )
                console.log(projectedPoints)
              })
            })
        }
      )
      .catch(err => console.error(err))
    //eslint-disable-next-line
  }, [view, map])

  return (
    <div style={{ padding: 8 }}>
      <hr />
      <br /> <b>Haga doble click sobre el mapa para obtener las coordenadas:</b>
      <br /> Latitud:{' '}
      <input type='text' id='input_latitud' value='3.3748621110488584' />
      <br /> Longitud:{' '}
      <input type='text' id='input_longitud' value='-76.53335809707642' />
      <br /> ID Generador: <input type='text' id='input_idgestor' />
      <button id='addNewGestor'>Agregar Nuevo Gestor en coordenadas</button>
      <hr />
      <br /> <b>Haga doble click sobre Gestor que desea borrar:</b>
      <input type='text' id='input_objectid' value='ingresar objectid' />
      <button id='deleteGestor'>Borrar Gestor</button>
      <hr />
      <br />
      Probar con estos querys (Layer: <b>Proyectos</b>): <br /> ESTADO='1'{' '}
      <br /> ESTADO='0' <br /> ID_PROYECTO='88888'
      <br />
      <br />
      <input type='text' id='where_query' value="ESTADO='1'" />
      <button id='queryProyectos'>Realizar Query</button>
      <br />
      <br />
      <br />
      <hr /> ObjectID del Gestor: <input type='text' id='input_objectid_edit' />
      <br />
      <br /> <b>Haga doble click sobre el mapa para obtener las coordenadas:</b>
      <br /> ID Gestor: <input type='text' id='input_gestorid_edit' />
      <br />
      <br /> Latitud:{' '}
      <input type='text' id='input_latitud_update' value='3.3748621110488584' />
      <br /> Longitud:{' '}
      <input
        type='text'
        id='input_longitud_update'
        value='-76.53335809707642'
      />
      <br />
      Tipo de Gestor:
      <select name='select_tipogestor' id='select_tipogestor'>
        <option value='1'>Gestor</option>
        <option value='2'>Receptor</option>
        <option value='3'>Gestor-Receptor</option>
      </select>
      <br />
      ESTADO:
      <select name='select_estado' id='select_estado'>
        <option value='0'>Inactivo</option>
        <option value='1'>Activo</option>
      </select>
      <br /> Observaciones:{' '}
      <input
        type='text'
        id='input_obs_gestor'
        value='Observacion para un gestor'
      />
      <button id='editGestor'>Editar Gestor</button>
    </div>
  )
}

export default memo(MapEdition)
