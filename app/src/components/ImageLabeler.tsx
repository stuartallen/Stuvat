import React, { useEffect, useRef, useState } from 'react'
import type { LabelPoint } from '../App'

type ImageLabelerProps = {
    imageUrl: string
    labelPoints: LabelPoint[]
    onLabelPointClick: (point: Omit<LabelPoint, 'oldest'>) => void
}

const getWrapperWidth = (windowWidth: number) => {
    return windowWidth < 1280 ? windowWidth : windowWidth * (5 / 6)
}

const getWrapperHeight = (windowWidth: number, windowHeight: number) => {
    return windowWidth < 1280 ? windowHeight * (5 / 6) : windowHeight
}

function ImageLabeler ({ imageUrl, labelPoints, onLabelPointClick }: ImageLabelerProps): JSX.Element {
    const [wrapperWidth, setWrapperWidth] = useState<number>(getWrapperWidth(window.innerWidth))
    const [wrapperHeight, setWrapperHeight] = useState<number>(getWrapperHeight(window.innerWidth, window.innerHeight))

    const canvasRef = useRef<HTMLCanvasElement>(null)

    //  Resize the canvas to fit the window by same style percentages from App
    const onResize = () => {
        setWrapperWidth(getWrapperWidth(window.innerWidth))
        setWrapperHeight(getWrapperHeight(window.innerWidth, window.innerHeight))
    }

    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [window.innerWidth, window.innerHeight])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const image = new Image()
        image.src = imageUrl
        image.onload = () => {
            ctx.drawImage(image, wrapperWidth / 2 - image.width / 2, wrapperHeight / 2 - image.height / 2)  
        }
    }, [imageUrl, wrapperWidth, wrapperHeight])

    return <div  className='w-full h-full bg-slate-600' style={{width: '100%', height: '100%'}}>
        <canvas draggable ref={canvasRef} width={wrapperWidth} height={wrapperHeight} />
    </div>
}

export default ImageLabeler