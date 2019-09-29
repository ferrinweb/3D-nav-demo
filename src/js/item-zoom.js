import easing from './easing'
function itemZoom (itemScale, target, direction, rate) {
  const zoom = (done) => {
    itemScale.x = easing(itemScale.x, target, rate)
    itemScale.y = easing(itemScale.y, target, rate)
    itemScale.z = easing(itemScale.z, target, rate)
    if ((direction === 1 && itemScale.x < target) || (direction === -1 && itemScale.x > target)) {
      requestAnimationFrame(() => {
        zoom(done)
      })
    } else {
      done(itemScale)
    }
  }
  return new Promise(resolve => {
    zoom(resolve)
  })
}

export default itemZoom
