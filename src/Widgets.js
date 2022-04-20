import { memo, useEffect, useState } from 'react'
import { loadModules } from 'esri-loader'

function Widgets ({ view, map }) {
  const [toggle, setToggle] = useState(null)
  const [layerList, setLayerList] = useState(null)
  useEffect(() => {
    if (!view || !map) return
    loadModules([
      'esri/widgets/BasemapToggle',
      'esri/widgets/LayerList',
      'esri/geometry/projection'
    ])
      .then(([BasemapToggle, LayerList, projection]) => {
        const basemapToggle = new BasemapToggle({
          view,
          nextBasemap: 'arcgis-topographic'
        })
        !toggle && view.ui.add(basemapToggle, 'bottom-right')
        !toggle && setToggle(basemapToggle)

        view.when(function () {
          let list = new LayerList({
            view
          })

          // Add widget to the top right corner of the view
          !layerList && view.ui.add(list, 'top-right')
          !layerList && setLayerList(list)
        })

        projection.load()
      })
      .catch(err => console.error('WIDGETS:' + err))

    return function cleanup () {
      toggle && view.ui.remove(toggle)
      layerList && view.ui.remove(layerList)
    }
    //eslint-disable-next-line
  }, [map, view])

  return null
}

export default memo(Widgets)
