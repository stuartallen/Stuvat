import React, { useEffect, useRef, useState } from "react";
import type { LabelPoint } from "../App";

type ImageLabelerProps = {
  imageUrl: string;
  labelPoints: LabelPoint[];
  onLabelPointClick: (point: LabelPoint) => void;
};

const outerSquareSize = 10 as const;
const innerSquareSize = 6 as const;

const getWrapperWidth = (windowWidth: number) => {
  return windowWidth < 1280 ? windowWidth : windowWidth * (5 / 6);
};

const getWrapperHeight = (windowWidth: number, windowHeight: number) => {
  return windowWidth < 1280 ? (windowHeight - 64) * (5 / 6) : windowHeight - 64; // Subtract 4rem + 4px padding from the title
};

const handleDrawImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  panOffset: { x: number; y: number },
  wrapperWidth: number,
  wrapperHeight: number,
  scale: number
) => {
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;

  const dx = panOffset.x + wrapperWidth / 2 - scaledWidth / 2;
  const dy = panOffset.y + wrapperHeight / 2 - scaledHeight / 2;

  ctx.drawImage(image, dx, dy, scaledWidth, scaledHeight);
};

const handleDrawLabelPoints = (
  ctx: CanvasRenderingContext2D,
  labelPoints: LabelPoint[],
  panOffset: { x: number; y: number },
  wrapperWidth: number,
  wrapperHeight: number,
  scale: number,
  imageWidth: number,
  imageHeight: number
) => {
  labelPoints.forEach((point) => {
    const centerX =
      point.x * scale +
      (wrapperWidth / 2 - (imageWidth * scale) / 2) +
      panOffset.x;
    const centerY =
      point.y * scale +
      (wrapperHeight / 2 - (imageHeight * scale) / 2) +
      panOffset.y;

    const outerX = centerX - outerSquareSize / 2;
    const outerY = centerY - outerSquareSize / 2;

    ctx.fillStyle = "black";
    ctx.fillRect(outerX, outerY, outerSquareSize, outerSquareSize);

    const innerX = centerX - innerSquareSize / 2;
    const innerY = centerY - innerSquareSize / 2;

    ctx.fillStyle = "white";
    ctx.fillRect(innerX, innerY, innerSquareSize, innerSquareSize);
  });
};

const handleDrawBoundingBox = (
  ctx: CanvasRenderingContext2D,
  labelPoints: LabelPoint[],
  panOffset: { x: number; y: number },
  wrapperWidth: number,
  wrapperHeight: number,
  scale: number,
  imageWidth: number,
  imageHeight: number
) => {
  if (labelPoints.length !== 2) return;

  const minX = Math.min(labelPoints[0].x, labelPoints[1].x);
  const minY = Math.min(labelPoints[0].y, labelPoints[1].y);
  const maxX = Math.max(labelPoints[0].x, labelPoints[1].x);
  const maxY = Math.max(labelPoints[0].y, labelPoints[1].y);

  const width = maxX - minX;
  const height = maxY - minY;

  const x =
    minX * scale + (wrapperWidth / 2 - (imageWidth * scale) / 2) + panOffset.x;
  const y =
    minY * scale +
    (wrapperHeight / 2 - (imageHeight * scale) / 2) +
    panOffset.y;
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillRect(x, y, scaledWidth, scaledHeight);
};

const convertClickToImagePixel = (
  clickX: number,
  clickY: number,
  panOffset: { x: number; y: number },
  wrapperWidth: number,
  wrapperHeight: number,
  scale: number,
  imageWidth: number,
  imageHeight: number
): { pixelX: number; pixelY: number } => {
  const imageX =
    (clickX - (wrapperWidth / 2 - (imageWidth * scale) / 2) - panOffset.x) /
    scale;
  const imageY =
    (clickY - (wrapperHeight / 2 - (imageHeight * scale) / 2) - panOffset.y) /
    scale;

  const pixelX = Math.max(0, Math.min(imageWidth - 1, imageX));
  const pixelY = Math.max(0, Math.min(imageHeight - 1, imageY));

  return { pixelX, pixelY };
};

function ImageLabeler({
  imageUrl,
  labelPoints,
  onLabelPointClick,
}: ImageLabelerProps): JSX.Element {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState(
    getWrapperWidth(window.innerWidth)
  );
  const [wrapperHeight, setWrapperHeight] = useState(
    getWrapperHeight(window.innerWidth, window.innerHeight)
  );
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const onResize = () => {
    setWrapperWidth(getWrapperWidth(window.innerWidth));
    setWrapperHeight(getWrapperHeight(window.innerWidth, window.innerHeight));
  };

  const handleWheel = (event: WheelEvent) => {
    const direction = event.deltaY < 0 ? 1 : -1;
    setScale((prevScale) => {
      const newScale = prevScale + direction * 0.1;
      return Math.min(Math.max(newScale, 0.1), 100);
    });
  };

  useEffect(() => {
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", onResize);
    };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageWidth || !imageHeight) return;

    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault();

      //  Get the x and y coordinates of the click relative to the canvas
      const rect = canvas.getBoundingClientRect();
      const element_x = event.clientX - rect.left;
      const element_y = event.clientY - rect.top;

      const { pixelX, pixelY } = convertClickToImagePixel(
        element_x,
        element_y,
        panOffset,
        wrapperWidth,
        wrapperHeight,
        scale,
        imageWidth,
        imageHeight
      );
      onLabelPointClick({ x: pixelX, y: pixelY });
    };

    canvas.addEventListener("contextmenu", handleRightClick);
    return () => canvas.removeEventListener("contextmenu", handleRightClick);
  }, [
    panOffset,
    wrapperWidth,
    wrapperHeight,
    scale,
    imageWidth,
    imageHeight,
    onLabelPointClick,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return;
      setPanOffset((current) => ({
        x: current.x + event.movementX,
        y: current.y + event.movementY,
      }));
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    return () => canvas.removeEventListener("mousemove", handleMouseMove);
  }, [isMouseDown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, wrapperWidth, wrapperHeight);

    const image = new Image();
    image.src = imageUrl;

    if (!isImageLoaded) {
      image.onload = () => {
        handleDrawImage(
          ctx,
          image,
          panOffset,
          canvas.width,
          canvas.height,
          scale
        );
        setImageWidth(image.width);
        setImageHeight(image.height);
        //  Handling this hear in case we'd want to store points in session storage
        handleDrawBoundingBox(
          ctx,
          labelPoints,
          panOffset,
          canvas.width,
          canvas.height,
          scale,
          image.width,
          image.height
        );
        handleDrawLabelPoints(
          ctx,
          labelPoints,
          panOffset,
          canvas.width,
          canvas.height,
          scale,
          image.width,
          image.height
        );
      };
      setIsImageLoaded(true);
      return;
    }
    handleDrawImage(ctx, image, panOffset, canvas.width, canvas.height, scale);
    handleDrawBoundingBox(
      ctx,
      labelPoints,
      panOffset,
      canvas.width,
      canvas.height,
      scale,
      imageWidth,
      imageHeight
    );
    handleDrawLabelPoints(
      ctx,
      labelPoints,
      panOffset,
      canvas.width,
      canvas.height,
      scale,
      imageWidth,
      imageHeight
    );
    // We do not want to trigger a rerender when isImageLoaded, imageWidth, or imageHeight changes
    // eslint-disable-next-line
  }, [imageUrl, wrapperWidth, wrapperHeight, panOffset, scale, labelPoints]);

  return (
    <div className="w-full h-full bg-slate-600">
      <canvas ref={canvasRef} width={wrapperWidth} height={wrapperHeight} />
    </div>
  );
}

export default ImageLabeler;
