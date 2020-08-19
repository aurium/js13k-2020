var playerX = 0, playerY = 9999
var pSpeedX = 0, pSpeedY = 0

function gameStart() {
  gameStarted = true
}

function zoomIn() {
  zoom += gameStarted ? (1-zoom*zoom)/40 + 0.001 : 0.0003
  if (zoom < 1) setTimeout(zoomIn, 40)
  else zoom = 1
}
