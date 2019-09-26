import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  Vector2,
  Vector3,
  Matrix4,
  Group,
  TextureLoader,
  BoxBufferGeometry,
  SphereGeometry,
  MeshLambertMaterial,
  MeshNormalMaterial,
  MeshBasicMaterial,
  Mesh,
  PCFSoftShadowMap
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Interaction } from 'three.interaction'
import { projectOnTrackball, rotateMatrix } from './js/handle-rotation'
import orbitRound from './js/handle-orbit-round'
import addLight from './js/add-light'
import getNavItemCameraFaced from './js/check-face'
import easing from './js/easing'

const android = window.android

const scene = new Scene()
const ratio = window.innerWidth / window.innerHeight
const camera = new PerspectiveCamera(75, ratio, 0.1, 1000)
// const camera = new OrthographicCamera(-5 * ratio, 5 * ratio, 5, -5, 5, 30)
camera.position.z = 7
const renderer = new WebGLRenderer()
renderer.shadowMap.type = PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.antialias = true
renderer.setPixelRatio(2)
document.body.appendChild(renderer.domElement)

new Interaction(renderer, scene, camera)

const rotationSpeed = 1
let cX, cY

let deltaX = 0
let deltaY = 0

// 鼠标或单指旋转
let curQuaternion
let rotationControlTimer
let rotationControl = false
let rotateStartPoint = new Vector3(0, 0, 1)
let rotateEndPoint = new Vector3(0, 0, 1)
let isMouseLeave = false
let controlReleased = false
let lastMoveTimestamp
const moveReleaseTimeDelta = 50

// 双指旋转
// 以水平线为 0 弧度
let startFingers
let currentFingers
let deltaAngle = 0

let earth = null
let ball1 = null
let ball2 = null
let ball3 = null
const navItems = []

let navItemStartAngle = 0
const startAngle = -15
let moon1StartAngle = startAngle + 60
let moon2StartAngle = startAngle + 142
const orbitRoundRadius = 3
const orbitAngle = 15
const orbitRoundSpeed = 0.8

const group = new Group()

const loader = new GLTFLoader()
const textureLoader = new TextureLoader()

scene.add(group)

loader.load('models/earth.gltf', function (gltf) {
  earth = gltf.scene
  const scale = earth.scale
  scale.x = 2
  scale.y = 2
  scale.z = 2
  group.add(earth)
})

function handle2FingerRotation (e) {
  currentFingers = e.touches
  const currentFingersLineAngle = getFingersRotationDirection(currentFingers)
  const startFingersLineAngle = getFingersRotationDirection(startFingers || currentFingers)
  const direction = currentFingersLineAngle - startFingersLineAngle
  if (direction < 0) {
    deltaAngle = direction > -0.2 ? direction : -0.2
  } else {
    deltaAngle = direction < 0.2 ? direction : 0.2
  }
  rotationByFinger(deltaAngle)
  startFingers = currentFingers
}

function rotationByFinger (angle) {
  group.rotateOnAxis(group.worldToLocal(camera.getWorldDirection()).normalize(), angle)
}

function getFingersRotationDirection (fingerPoints) {
  const [{ pageX: x1, pageY: y1 }, { pageX: x2, pageY: y2 }] = fingerPoints
  const x = x1 - x2
  const y = y1 - y2
  return y / x
}

function addDecorationBalls () {
  const geometry = new SphereGeometry(1, 36, 36)
  const material = new MeshNormalMaterial()
  const baseBall = new Mesh(geometry, material)

  ball1 = baseBall.clone()
  const scale = ball1.scale
  scale.x = 0.2
  scale.y = 0.2
  scale.z = 0.2
  orbitRound(ball1, orbitRoundRadius, moon1StartAngle, orbitAngle)
  group.add(ball1)

  ball2 = baseBall.clone()
  const scale2 = ball2.scale
  scale2.x = 0.1
  scale2.y = 0.1
  scale2.z = 0.1
  group.add(ball2)
  orbitRound(ball2, orbitRoundRadius, moon2StartAngle, orbitAngle + 75)

  ball3 = baseBall.clone()
  const scale3 = ball3.scale
  scale3.x = 0.15
  scale3.y = 0.15
  scale3.z = 0.15
  group.add(ball3)
  orbitRound(ball3, orbitRoundRadius - 0.5, startAngle, orbitAngle - 15)
}

function addNavItems () {
  const generateNavItem = function (size, color, index) {
    const geometry = new BoxBufferGeometry(size.w || 0.36, size.h || 0.36, size.d || 0.12)
    const texture = textureLoader.load('images/number-' + (index + 1) + '.png')
    const material = new MeshLambertMaterial({ color: color })
    // 多面贴图
    const mbs = [0, 1, 2, 3, 5, 6].map(function () {
      return material
    })
    mbs[4] = new MeshBasicMaterial({ color: color, map: texture })
    const navItem = new Mesh(geometry, mbs)
    group.add(navItem)
    return navItem
  }
  const items = [
    { size: {}, color: 0xb19548 },
    { size: {}, color: 0x48b1a2 },
    { size: {}, color: 0xab48b1 },
    { size: {}, color: 0xb19548 },
    { size: {}, color: 0x48b1a2 },
    { size: {}, color: 0xab48b1 }
  ]
  items.forEach(function (item, index) {
    item = generateNavItem(item.size, item.color, index)
    item.rotation.y = navItemStartAngle / 180 * Math.PI
    orbitRound(item, 2.5, navItemStartAngle, 0)
    navItemStartAngle += 60
    item.cursor = 'pointer'
    item.initColor = item.color
    navItems.push(item)
  })
}

function setCurrentPoint (e) {
  const eProxy = e.type === 'touchmove' ? e.touches[0] : e
  cX = eProxy.pageX
  cY = eProxy.pageY
}
function setCurrentDelta (e) {
  const eProxy = e.type === 'touchmove' ? e.touches[0] : e
  deltaX = eProxy.pageX - cX
  deltaY = eProxy.pageY - cY
}

function hightLightItem (item) {
  const mesh = item.object
  const itemScale = mesh.scale
  itemScale.x = easing(itemScale.x, 2, 1.08)
  itemScale.y = easing(itemScale.y, 2, 1.08)
  itemScale.z = easing(itemScale.z, 2, 1.08)
  mesh.isHightLight = true
  mesh.material.forEach(function (face) {
    if (face.emissive) {
      face.emissive.setHex(0xffffff)
    }
  })
}

function resetNavItemsStatus () {
  navItems.forEach(function (item) {
    if (!item.isHightLight) return
    const itemScale = item.scale
    itemScale.x = easing(itemScale.x, 1, 0.92)
    itemScale.y = easing(itemScale.y, 1, 0.92)
    itemScale.z = easing(itemScale.z, 1, 0.92)
    if (itemScale.x === 1) item.isHightLight = false
    item.material.forEach(function (face) {
      if (face.emissive) {
        face.emissive.setHex(item.initColor)
      }
    })
  })
}

function render () {
  if (group) {
    if (rotationControl) {
      deltaX = easing(deltaX, 0)
      deltaY = easing(deltaY, 0)
      if (deltaAngle) {
        deltaAngle = easing(deltaAngle, 0, 0.96, 0.001)
        rotationByFinger(deltaAngle)
      }
      if (deltaY === 0 && deltaX === 0 && deltaAngle === 0 && controlReleased) {
        controlReleased = false
        // 缓动停止后重启自动滚动
        rotationControlTimer = setTimeout(() => {
          rotationControl = false
          isMouseLeave = false
        }, 1000)
      }
    }
  }
  handleRotation()
  renderer.render(scene, camera)
}

function startPlay () {
  requestAnimationFrame(startPlay)
  if (group && !rotationControl && !isMouseLeave) {
    // 自动旋转速度
    deltaX = 1
    deltaY = 0
  }
  if (ball1) {
    moon1StartAngle += orbitRoundSpeed * 3
    ball1.rotation.y += 0.006
    orbitRound(ball1, orbitRoundRadius, moon1StartAngle, orbitAngle)
  }
  if (ball2) {
    moon2StartAngle += orbitRoundSpeed
    ball2.rotation.y += 0.003
    orbitRound(ball2, orbitRoundRadius, moon2StartAngle, orbitAngle + 75)
  }
  if (ball3) {
    ball3.rotation.y += 0.003
    orbitRound(ball3, orbitRoundRadius - 0.5, startAngle, orbitAngle - 15)
  }
  navItems.forEach(function (item) {
    item.rotation.z -= 0.006
  })
  const currentItem = getNavItemCameraFaced(navItems, camera)
  if (currentItem) {
    hightLightItem(currentItem)
  } else {
    resetNavItemsStatus()
  }
  render()
}

function handleRotation () {
  rotateEndPoint = projectOnTrackball(deltaX, deltaY)
  const rotateQuaternion = rotateMatrix(rotateStartPoint, rotateEndPoint, rotationSpeed)
  curQuaternion = group.quaternion
  curQuaternion.multiplyQuaternions(rotateQuaternion, curQuaternion)
  curQuaternion.normalize()
  group.setRotationFromQuaternion(curQuaternion)
  rotateEndPoint = rotateStartPoint
}

function startRotation (e) {
  e.preventDefault()
  controlReleased = false
  rotationControlTimer && clearTimeout(rotationControlTimer)
  renderer.domElement.addEventListener('mousemove', execRotation)
  renderer.domElement.addEventListener('mouseup', endRotation)
  renderer.domElement.addEventListener('touchmove', execRotation)
  renderer.domElement.addEventListener('touchend', endRotation)
  rotationControl = true
  setCurrentPoint(e)
  rotateStartPoint = rotateEndPoint = projectOnTrackball(0, 0)
}
function execRotation (e) {
  e.preventDefault()
  handleRotation()
  if (!(e.type === 'touchmove' && e.touches.length > 1)) {
    setCurrentDelta(e)
    lastMoveTimestamp = new Date()
    setCurrentPoint(e)
  } else {
    handle2FingerRotation(e)
  }
}
function endRotation (e) {
  if (e.type === 'mouseleave') {
    isMouseLeave = true
  }
  startFingers = null
  controlReleased = true
  if (!rotationControl) return
  e.preventDefault()
  if (
    !isMouseLeave &&
    lastMoveTimestamp &&
    (new Date().getTime() - lastMoveTimestamp.getTime() > moveReleaseTimeDelta)
  ) {
    setCurrentDelta(e)
  }
  renderer.domElement.removeEventListener('mousemove', execRotation)
  renderer.domElement.removeEventListener('mouseup', endRotation)
  renderer.domElement.removeEventListener('touchmove', execRotation)
  renderer.domElement.removeEventListener('touchend', endRotation)
}

function onWindowResize () {
  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  camera.aspect = screenWidth / screenHeight
  camera.updateProjectionMatrix()

  renderer.setSize(screenWidth, screenHeight)
}

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

function handleNavItemClick (item, index, e) {
  setTimeout(function () {
    rotationControl = false
  })
  const itemScale = item.scale
  itemZoom(itemScale, 1.75, 1, 1.1).then(itemScale => {
    itemZoom(itemScale, 1, -1, 0.9)
  })
  setTimeout(function () {
    android && android.goTo && android.goTo(index + 1)
  }, 40)
}

function bindEvents () {
  renderer.domElement.addEventListener('mousedown', startRotation)
  renderer.domElement.addEventListener('mouseleave', endRotation)
  renderer.domElement.addEventListener('touchstart', startRotation)

  window.addEventListener('resize', onWindowResize, false)

  navItems.forEach(function (item, index) {
    item.on('click', function (ev) {
      handleNavItemClick(item, index, ev)
    })
    item.on('touchstart', function (ev) {
      handleNavItemClick(item, index, ev)
    })
  })
}

addLight(scene)
addDecorationBalls()
addNavItems()
startPlay()
bindEvents()
