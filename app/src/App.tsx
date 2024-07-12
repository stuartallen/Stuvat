import React, { useEffect, useState } from "react";
import ImageLabeler from "./components/ImageLabeler";
import SendButton from "./components/SendButton";
import LoginPage from "./components/LoginPage";

export type LabelPoint = {
  x: number;
  y: number;
};

export type YoloFormat =
  | {
      xMid: number;
      yMid: number;
      width: number;
      height: number;
    }
  | Record<string, never>;

export const STATIC_IMG_PATH = "./apples.jpg";

function App() {
  const [labelPointsQueue, setLabelPointsQueue] = useState<LabelPoint[]>([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = STATIC_IMG_PATH;
    img.onload = () => {
      //  Avoids off by 1 error at 100% for yolo percentages
      setImageSize({ width: img.width - 1, height: img.height - 1 });
    };
  }, []);

  const handleLabelPointClick = (point: LabelPoint) => {
    setLabelPointsQueue((prevQueue) => {
      const updatedQueue =
        prevQueue.length >= 2
          ? [...prevQueue.slice(1), point]
          : [...prevQueue, point];
      return updatedQueue;
    });
  };

  const orderedLabeledPoints = [...labelPointsQueue].sort((a, b) => a.x - b.x);
  const yoloFormat: YoloFormat =
    orderedLabeledPoints.length === 2
      ? // x midpoint, y midpoint, width, height as percentage
        {
          xMid:
            (orderedLabeledPoints[1].x + orderedLabeledPoints[0].x) /
            2 /
            imageSize.width,
          yMid:
            (orderedLabeledPoints[1].y + orderedLabeledPoints[0].y) /
            2 /
            imageSize.height,
          width:
            Math.abs(orderedLabeledPoints[1].x - orderedLabeledPoints[0].x) /
            imageSize.width,
          height:
            Math.abs(orderedLabeledPoints[1].y - orderedLabeledPoints[0].y) /
            imageSize.height,
        }
      : {};

  return isLoggedIn ? (
    <div className="absolute w-screen h-screen flex flex-col bg-black overflow-hidden">
      <h1 className="w-full h-16 text-3xl flex items-center pl-4 border-2 border-white">
        Stuvat
      </h1>
      <div className="flex-grow w-full flex flex-col xl:flex-row">
        <div className="w-full h-5/6 xl:w-5/6 xl:h-full">
          <ImageLabeler
            imageUrl={STATIC_IMG_PATH}
            labelPoints={labelPointsQueue}
            onLabelPointClick={handleLabelPointClick}
          />
        </div>
        <div className="w-full h-1/6 xl:w-1/6 xl:h-full border-2 border-white bg-black">
          <div className="h-full flex flex-col justify-between">
            <div className="w-full">
              {orderedLabeledPoints.map((point, index) => (
                <div key={index} className="flex flex-row xl:flex-col p-2">
                  <span>Point {index + 1}:</span>
                  <span>
                    ({point.x.toFixed(3)}, {point.y.toFixed(3)})
                  </span>
                </div>
              ))}
              {/** Checking existence verifies divide by 0 errors */}
              {yoloFormat.xMid &&
              yoloFormat.yMid &&
              yoloFormat.width &&
              yoloFormat.height ? (
                <div className="flex flex-col p-2">
                  <span>Yolo Format:</span>
                  <span>
                    {`${yoloFormat.xMid.toFixed(3)}, ${yoloFormat.yMid.toFixed(
                      3
                    )}, ${yoloFormat.width.toFixed(
                      3
                    )}, ${yoloFormat.height.toFixed(3)}`}
                  </span>
                </div>
              ) : null}
            </div>
            <SendButton
              labelPoints={orderedLabeledPoints}
              yoloFormat={yoloFormat}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <LoginPage setIsLoggedIn={setIsLoggedIn} />
  );
}

export default App;
