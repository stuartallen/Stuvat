import React, { useEffect, useState } from "react";
import axios from "axios";
import type { LabelPoint, YoloFormat } from "../App";

function SendButton({
  labelPoints,
  yoloFormat,
}: {
  labelPoints: LabelPoint[];
  yoloFormat: YoloFormat;
}): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isErrored, setIsErrored] = useState(false);

  const yoloFormatExists =
    yoloFormat.xMid && yoloFormat.yMid && yoloFormat.width && yoloFormat.height;

  const handleClick = async () => {
    if (isLoading || !process.env.REACT_APP_WEB_ENDPOINT) return;
    setIsConfirmed(false);
    setIsErrored(false);

    setIsLoading(true);
    axios
      .post(process.env.REACT_APP_WEB_ENDPOINT, { labelPoints, yoloFormat })
      .then(() => {
        setIsConfirmed(true);
        setIsLoading(false);
      })
      .catch(() => {
        setIsErrored(true);
        setIsLoading(false);
      });
  };

  //	This could be optimized by moving to the parent component and passing state updater through props to event listener in ImageLabeler
  //	I've opted to leave it here for readability
  useEffect(() => {
    const handleClick = () => {
      setIsConfirmed(false);
      setIsErrored(false);
    };

    window.addEventListener("contextmenu", handleClick);
    return () => window.removeEventListener("contextmenu", handleClick);
  });

  return (
    <div className="w-full flex flex-row xl:flex-col justify-end items-center xl:justify-center px-2">
      {isConfirmed ? <span className="text-green-500">Confirmed!</span> : null}
      {isErrored ? <span className="text-red-500">Error!</span> : null}
      {isLoading ? <span className="text-yellow-500">Loading...</span> : null}
      {/**	Only warn the user their bounding box is invalid if they have not selected points */}
      {labelPoints.length === 2 && !yoloFormatExists ? (
        <span className="text-red-500">Bounding box not valid!</span>
      ) : null}
      <button
        className="w-full max-w-32 xl:max-w-none text-center bg-blue-500 hover:bg-blue-700 disabled:bg-blue-950 text-white font-bold py-2 px-4 my-2 ml-2 xl:ml-0 rounded"
        disabled={
          // Force user to make new bounding box if last was successfully submitted
          isConfirmed ||
          // Send exclusively valid bounding boxes
          labelPoints.length !== 2 ||
          !yoloFormatExists ||
          isLoading
        }
        onClick={handleClick}
      >
        Send
      </button>
    </div>
  );
}

export default SendButton;
