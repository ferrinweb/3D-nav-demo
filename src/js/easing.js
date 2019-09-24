function easing (start, end, rate = 0.95, minDiff = 0.05) {
  const isIncreasing = rate > 1
  if (isIncreasing) {
    if (end - start > minDiff || end - start < -minDiff) {
      return start * rate
    } else {
      return end
    }
  } else {
    if (start - end > minDiff || start - end < -minDiff) {
      return start * rate
    } else {
      return end
    }
  }
}

export default easing
