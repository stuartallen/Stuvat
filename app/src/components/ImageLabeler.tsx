import React, { useCallback, useEffect, useRef, useState } from 'react'
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

const handleDraw = (ctx: CanvasRenderingContext2D, image: HTMLImageElement, panOffset: { x: number, y: number }, wrapperWidth: number, wrapperHeight: number) => {
    ctx.drawImage(image, panOffset.x + wrapperWidth / 2 - image.width / 2, panOffset.y + wrapperHeight / 2 - image.height / 2)
}

function ImageLabeler ({ imageUrl, labelPoints, onLabelPointClick }: ImageLabelerProps): JSX.Element {
    const [isImageLoaded, setIsImageLoaded] = useState(false)

    const [wrapperWidth, setWrapperWidth] = useState<number>(getWrapperWidth(window.innerWidth))
    const [wrapperHeight, setWrapperHeight] = useState<number>(getWrapperHeight(window.innerWidth, window.innerHeight))

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseDown = () => setIsMouseDown(true);
        const handleMouseUp = () => setIsMouseDown(false);
        

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    });

    //  Separate mouse events for performances
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (!isMouseDown) return;
            setPanOffset(current => ({ x: current.x + event.movementX, y: current.y + event.movementY }));
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isMouseDown]);

    //  Resize the canvas to fit the window by same style percentages from App
    const onResize = () => {
        setWrapperWidth(getWrapperWidth(window.innerWidth))
        setWrapperHeight(getWrapperHeight(window.innerWidth, window.innerHeight))
    }

    useEffect(() => {
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, wrapperWidth, wrapperHeight)
        const image = new Image()
        image.src = imageUrl
        if(!isImageLoaded) {
            image.onload = () => {
                handleDraw(ctx, image, panOffset, wrapperWidth, wrapperHeight)
            }
            setIsImageLoaded(true)
            return
        }
        handleDraw(ctx, image, panOffset, wrapperWidth, wrapperHeight)
    }, [imageUrl, wrapperWidth, wrapperHeight, panOffset])

    return <div  className='w-full h-full bg-slate-600' style={{width: '100%', height: '100%'}}>
        <canvas ref={canvasRef} width={wrapperWidth} height={wrapperHeight} />
    </div>
}

export default ImageLabeler