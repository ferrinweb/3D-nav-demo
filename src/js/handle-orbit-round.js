/**
 * 模型轨道旋转函数
 * @param {object} model 模型对象
 * @param {number} radius 轨道半径
 * @param {number} angle 时点旋转角度
 * @param {number} orbitAngle 轨道仰角
 */
function orbitRound (model, radius, angle, orbitAngle) {
  var radians = angle / 180 * Math.PI
  orbitAngle = orbitAngle / 180 * Math.PI
  var position = model.position
  var cosRadians = Math.cos(radians)
  position.z = radius * cosRadians * Math.cos(orbitAngle)
  position.y = radius * cosRadians * Math.sin(orbitAngle)
  position.x = radius * Math.sin(radians)
}

export default orbitRound
