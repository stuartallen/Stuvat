import React, { useState } from 'react';

type LabelPoint = {
  x: number
  y: number
}

function App() {
  const [labelPoints, setLabelPoints] = useState<LabelPoint[]>([])

  return (
    <div className="absolute w-screen h-screen flex flex-col bg-black">
      <h1 className='w-full h-16 text-3xl flex items-center pl-4 border-2 border-white'>Stuvat</h1>
      <div className='flex-grow w-full flex flex-col xl:flex-row'>
        <div className='w-full h-5/6 xl:w-6/6 xl:h-full bg-green-600'></div>
        <div className='w-full h-1/6 xl:w-1/6 xl:h-full border-2 border-white bg-black'>
          <h2 className='p-2 text-xl underline'>Label Data:</h2>
          <div className='flex flex-col'>
            {labelPoints.map((point, index) => (
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
