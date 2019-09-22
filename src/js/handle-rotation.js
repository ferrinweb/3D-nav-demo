import { Vector3, Quaternion } from 'three'
let screenHalfX = window.innerWidth / 2
let screenHalfY = window.innerHeight / 2

function clamp (value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function projectOnTrackball (x, y) {
  const mouseOnBall = new Vector3()
  mouseOnBall.set(clamp(x / screenHalfX, -1, 1), clamp(-y / screenHalfY, -1, 1), 0.0)
  const length = mouseOnBall.length()
  if (length > 1.0) {
    mouseOnBall.normalize()
  } else {
    mouseOnBall.z = Math.sqrt(1.0 - length * length)
  }
  return mouseOnBall
}

export function rotateMatrix (start, end, rotationSpeed) {
  const axis = new Vector3()
  const quaternion = new Quaternion()
  let angle = Math.acos(start.dot(end) / start.length() / end.length())

  if (angle) {
    axis.crossVectors(start, end).normalize()
    angle *= rotationSpeed
    quaternion.setFromAxisAngle(axis, angle)
  }
  return quaternion
}

window.addEventListener('resize', function () {
  screenHalfX = window.innerWidth / 2
  screenHalfY = window.innerHeight / 2
}, false)
