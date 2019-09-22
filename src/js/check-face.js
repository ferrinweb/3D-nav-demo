import { Raycaster, Vector2 } from 'three'

const raycaster = new Raycaster()
// const raycaster1 = new Raycaster()
// const raycaster2 = new Raycaster()
// const raycaster3 = new Raycaster()
// const raycaster4 = new Raycaster()
const mouse = new Vector2()
// const mouse1 = new Vector2()
// const mouse2 = new Vector2()
// const mouse3 = new Vector2()
// const mouse4 = new Vector2()

// const nearDistance = 30
mouse.x = mouse.y = 0
// mouse1.x = mouse1.y = mouse3.y = mouse4.x = nearDistance
// mouse2.x = mouse2.y = mouse3.x = mouse4.y = -nearDistance

function getNavItemCameraFaced (models, camera) {
  // 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(mouse, camera)
  // raycaster1.setFromCamera(mouse1, camera)
  // raycaster2.setFromCamera(mouse2, camera)
  // raycaster3.setFromCamera(mouse3, camera)
  // raycaster4.setFromCamera(mouse4, camera)
  // 计算物体和射线的焦点
  const intersects = raycaster.intersectObjects(models)
  // const intersects1 = raycaster1.intersectObjects(models)
  // const intersects2 = raycaster2.intersectObjects(models)
  // const intersects3 = raycaster3.intersectObjects(models)
  // const intersects4 = raycaster4.intersectObjects(models)
  return intersects[0] || null
}

export default getNavItemCameraFaced
