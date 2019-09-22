import { DirectionalLight, RectAreaLight, AmbientLight } from 'three'

function addDirectionalLight (color, intensity, position) {
  const light = new DirectionalLight(color, intensity)
  light.position.x = position.x || 0
  light.position.y = position.y || 0
  light.position.z = position.z || 0
  return light
}

function addRectLight (color, intensity, width, height, position) {
  const light = new RectAreaLight(color, intensity || 1, width, height)
  light.position.x = position.x || 0
  light.position.y = position.y || 0
  light.position.z = position.z || 0
  return light
}

export default function addLight (scene) {
  scene.add(addDirectionalLight(0xffffff, 0.15, { y: 4, z: 10 }))
  // scene.add(addDirectionalLight(0xffffff, 0.5, { y: -2, z: -10 }))
  // scene.add(addDirectionalLight(0xffffff, 0.5, { y: 2, z: -10 }))
  // scene.add(addDirectionalLight(0xffffff, 0.5, { x: 2, z: -10 }))
  // scene.add(addDirectionalLight(0xffffff, 0.5, { x: 2, z: -10 }))

  const rectLight1 = addRectLight(0xffffff, 1, 7, 7, { x: 15, y: 15, z: -5 })
  rectLight1.lookAt(0, 0, 0)
  scene.add(rectLight1)
  const rectLight2 = addRectLight(0xffffff, 1, 1, 1, { x: 15, y: 0, z: 0 })
  rectLight1.lookAt(0, 0, 2)
  scene.add(rectLight2)
  const rectLight3 = addRectLight(0xffffff, 1, 1, 1, { x: -15, y: 0, z: 0 })
  rectLight1.lookAt(0, 0, 2)
  scene.add(rectLight3)

  const light = new AmbientLight(0x151515, 1)
  scene.add(light)
}
