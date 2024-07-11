import React, { useState } from 'react';
import ImageLabeler from './components/ImageLabeler';

export type LabelPoint = {
  x: number
  y: number
}

function App() {
  const [labelPointsQueue, setLabelPointsQueue] = useState<LabelPoint[]>([])

  const handleLabelPointClick = (point: LabelPoint) => {
    setLabelPointsQueue(prevQueue => {
      const updatedQueue = prevQueue.length >= 2 ? [...prevQueue.slice(1), point] : [...prevQueue, point];
      return updatedQueue;
    });
  }

  const orderedLabeledPoints = [...labelPointsQueue].sort((a, b) => a.x - b.x);

  return (
    <div className="absolute w-screen h-screen flex flex-col bg-black overflow-hidden">
      <h1 className='w-full h-16 text-3xl flex items-center pl-4 border-2 border-white'>Stuvat</h1>
      <div className='flex-grow w-full flex flex-col xl:flex-row'>
        <div className='w-full h-5/6 xl:w-5/6 xl:h-full'>
          <ImageLabeler imageUrl='./apples.jpg' labelPoints={labelPointsQueue} onLabelPointClick={handleLabelPointClick}/>
        </div>
        <div className='w-full h-1/6 xl:w-1/6 xl:h-full border-2 border-white bg-black'>
          <h2 className='p-2 text-xl underline'>Label Data:</h2>
          <div className='flex flex-col'>
            {orderedLabeledPoints.map((point, index) => (
              <div key={index} className='flex justify-between p-2'>
                <span>Point {index + 1}:</span>
                <span>({point.x}, {point.y})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
