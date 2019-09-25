import { Raycaster, Vector2 } from 'three'

const raycaster = new Raycaster()
const mouse = new Vector2()

mouse.x = mouse.y = 0

function getNavItemCameraFaced (models, camera) {
  // 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(mouse, camera)
  // 计算物体和射线的焦点
  const intersects = raycaster.intersectObjects(models)
  return intersects[0] || null
}

export default getNavItemCameraFaced
