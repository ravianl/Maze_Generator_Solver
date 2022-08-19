console.clear()
var size = {
  s: 8,
  w: 75,
  h: 75
}
size.w *= size.s
size.h *= size.s

size.lw = size.w - size.s
size.lh = size.h - size.s

var canvas = document.getElementById('maze')

var ctx = canvas.getContext('2d')

var get = function (x, y) {
  return ctx.getImageData(x, y, 1, 1).data
}
var set = function (x, y, data) {
  ctx.fillStyle = data
  ctx.fillRect(x, y, size.s, size.s)
}
var copy = function (obj) {
  return Object.create(obj)
}
var random = function (start, end) {
  var range = (end - start) / size.s
  var random = Math.floor(Math.random() * range / 2) * 2
  return ((start / size.s) + random) * size.s
}

var generateMaze = function () {
  canvas.width = size.w
  canvas.height = size.h
  canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto; border:2px";

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, size.w, size.h)

  var start = {x: random(size.s, size.lw), y: 0}
  var end = {x: random(size.s, size.lw), y: size.lh}

  set(start.x, start.y, 'yellow')
  set(end.x, end.y, 'yellow')
  for (var x = 0; x < size.w; x += size.s) {
    if (x != start.x) set(x, 0, 'black')
    if (x != end.x) set(x, size.lh, 'black')
  }
  for (var y = size.s; y < size.lh; y += size.s) {
    set(0, y, 'black')
    set(size.lw, y, 'black')
  }
  var stack = [{
    x: size.s,
    y: size.s,
    w: size.w - (2 * size.s),
    h: size.h - (2 * size.s)
  }]
  var recursive = function () {
    var area = stack[0]
    if (area) {
      stack.splice(0, 1)

      var wallAxis = 'x', wallDimension = 'w',
        cutAxis = 'y', cutDimension = 'h'
      if (area.w <= area.h) {
        wallAxis = 'y'; wallDimension = 'h'
        cutAxis = 'x'; cutDimension = 'w'
      }

      var wallStart = area[wallAxis]
      var wallEnd = wallStart + area[wallDimension]
      var wall = random(wallStart + size.s, wallEnd - size.s)

      var cutStart = area[cutAxis]
      var cutEnd = cutStart + area[cutDimension]
      var cut = random(cutStart, cutEnd)

      var region1 = copy(area)
      var region2 = copy(area)

      region1[wallDimension] = Math.abs(wall - area[wallAxis])
      region2[wallAxis] = area[wallAxis] + region1[wallDimension] + size.s
      region2[wallDimension] = Math.abs(area[wallDimension] - region1[wallDimension] - size.s)

      if (region1.w > size.s && region1.h > size.s) {
        stack.push(region1)
      }
      if (region2.w > size.s && region2.h > size.s) {
        stack.push(region2)
      }

      for (var i = cutStart; i < cutEnd; i += size.s) {
        if (i != cut) {
          if (wallAxis == 'y') set(i, wall, 'black')
          if (wallAxis == 'x') set(wall, i, '#black')
        }
      }
      requestAnimationFrame(recursive)
    } else {
      pathFind(start, end)
    }
  }
  recursive()
}

var pathFind = function (start, end) {
  var path = [{
    x: start.x,
    y: start.y,
    node: true,
    dir: 'b',
    paths: [{x: start.x, y: start.y + size.s}]
  }]
  var loop = function () {
    var last = path[path.length - 1]
    ctx.fillStyle = 'red'
    ctx.fillRect(last.x, last.y, size.s, size.s)
    var chosen = last.paths[0]
    last.paths.splice(0, 1)
    var newPath = {
      x: chosen.x,
      y: chosen.y,
      node: false,
      dir: chosen.dir,
      paths: []
    }
    var bottom = get(chosen.x, chosen.y + size.s)
    if (bottom[0] === 255 && last.y <= chosen.y) {
      newPath.paths.push({
        x: chosen.x,
        y: chosen.y + size.s,
        dir: 'b'
      })
    }
    var left = get(chosen.x - size.s, chosen.y)
    if (left[0] === 255 && last.x >= chosen.x) {
      newPath.paths.push({
        x: chosen.x - size.s,
        y: chosen.y,
        dir: 'l'
      })
    }
    var right = get(chosen.x + size.s, chosen.y)
    if (right[0] === 255 && last.x <= chosen.x) {
      newPath.paths.push({
        x: chosen.x + size.s,
        y: chosen.y,
        dir: 'r'
      })
    }
    var top = get(chosen.x, chosen.y - size.s)
    if (top[0] === 255 && last.y >= chosen.y) {
      newPath.paths.push({
        x: chosen.x,
        y: chosen.y - size.s,
        dir: 't'
      })
    }
    if (newPath.paths.length >= 2) {
      newPath.node = true
      path.push(newPath)
    } else if (newPath.paths.length === 0) {
      // console.log("backtracking...");
      ctx.fillStyle = 'orange'
      ctx.fillRect(newPath.x, newPath.y, size.s, size.s)
      for (let i = path.length - 1; i > -1; i--) {
        if (path[i].node && path[i].paths.length !== 0) {
          break
        } else {
          ctx.fillStyle = 'blue'
          ctx.fillRect(path[i].x, path[i].y, size.s, size.s)
          path.splice(i, 1)
        }
      }
      // console.log("path after manipulation", path);
    } else {
      path.push(newPath)
    }
    if ((end.x === chosen.x && end.y === chosen.y)) {
      setTimeout(generateMaze, 1000)
    } else {
      requestAnimationFrame(loop)
    }
  }
  loop()
}
addEventListener('load', generateMaze)
addEventListener('click', function () {
  console.log(get(event.offsetX, event.offsetY))
})
