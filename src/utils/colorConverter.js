const canvas = document.createElement('canvas');
canvas.width = 1;
canvas.height = 1;
const ctx = canvas.getContext('2d', { willReadFrequently: true });

function convertColorToRgb(colorStr) {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#000'; // fallback
  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
}
