export const canvasWidth = 1280;
export const canvasHeight = 720;
export const createStream: (
  emoji: string,
  backgroundColor: string,
  framerate: number
) => { stop: () => void; stream: MediaStream } = (emoji: string, backgroundColor: string, framerate: number) => {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = canvasWidth;
  canvasElement.height = canvasHeight;
  const ctx = canvasElement.getContext("2d");
  if (!ctx) throw "ctx is null";
  const fontSize = 150;

  let degree = 0;

  const drawEmojii = () => {
    if (degree > 360) {
      degree = 0;
    }
    const radian = (degree * Math.PI) / 180;
    const translateX = canvasWidth / 2;
    const translateY = canvasHeight / 2;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.font = `${fontSize}px Calibri`;
    ctx.translate(translateX, translateY);
    ctx.rotate(radian);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(emoji, -fontSize / 2, +fontSize / 2);
    // ctx.fillStyle = "#FF00FF";
    // ctx.fillRect(0, 0, 10, 10);
    ctx.rotate(-radian);
    ctx.translate(-translateX, -translateY);
    degree++;
  };

  console.log("Draw interval registered!");
  const intervalId = setInterval(() => {
    drawEmojii();
  }, 1000 / framerate);

  return {
    stream: canvasElement.captureStream(framerate),
    stop: () => clearInterval(intervalId),
  };
};