// src/app/pong/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'

type GameMode = 'auto' | 'solo' | 'two'

export default function PongPage() {
    const [mode, setMode] = useState<GameMode>('auto')

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    const isSolo = mode === 'solo'
    const isTwo = mode === 'two'

    return (
        <div
            className="bg-black w-screen overflow-y-hidden relative"
            style={{ height: 'calc(100vh - 86px)' }}
        >
            <main className="h-full">
                <PongCanvas mode={mode} />
            </main>

            {/* Controles + opções de modo */}
            <div className="
                hidden md:flex flex-col items-center gap-3
                absolute bottom-4 left-1/2 -translate-x-1/2
                paralucent text-gray-200/60 text-sm md:text-base select-none
            ">
                {/* Controles */}
                <span className="text-gray-200/30">
                    W / S — ↑ / ↓
                </span>

                {/* Trigger 1 jogador / 2 jogadores */}
                <div className="flex items-center gap-2 text-xs md:text-sm">
                    <button
                        type="button"
                        onClick={() => setMode('solo')}
                        className={`px-3 py-1 rounded-full border transition-colors ${
                            mode === 'solo'
                                ? 'bg-gray-200 text-black border-gray-200'
                                : 'border-gray-600 text-gray-600 hover:border-gray-400 hover:text-gray-100'
                        }`}
                    >
                        1 player
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('two')}
                        className={`px-3 py-1 rounded-full border transition-colors ${
                            mode === 'two'
                                ? 'bg-gray-200 text-black border-gray-200'
                                : 'border-gray-600 text-gray-600 hover:border-gray-400 hover:text-gray-100'
                        }`}
                    >
                        2 players
                    </button>
                </div>
            </div>
        </div>
    )
}

function PongCanvas({ mode }: { mode: GameMode }) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        setReady(true)
    }, [])

    useEffect(() => {
        if (!ready || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')!
        let rafId = 0

        const state = {
            vw: 0,
            vh: 0,
            dpr: 1,
            paddleW: 14,
            paddleH: 110,
            leftY: 0,
            rightY: 0,
            ballX: 0,
            ballY: 0,
            ballR: 18,
            vx: 0,
            vy: 0,
            leftScore: 0,
            rightScore: 0,
            keys: { w: false, s: false, up: false, down: false },
            logoImg: new Image(),
            logoLoaded: false,
            isMobile: false,
            twoPlayer: false,
        }

        function detectDevice() {
            const isTouch =
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                // @ts-ignore
                (navigator as any).msMaxTouchPoints > 0

            state.isMobile = isTouch || window.innerWidth < 768

            // Lógica do modo:
            // - 'solo'  => sempre 1P (IA na direita)
            // - 'two'   => 2P só em desktop; em mobile continua 1P
            // - 'auto'  => 2P em desktop, 1P em mobile (comportamento "antigo")
            if (mode === 'solo') {
                state.twoPlayer = false
            } else if (mode === 'two') {
                state.twoPlayer = !state.isMobile
            } else {
                // auto
                state.twoPlayer = !state.isMobile
            }
        }

        function sizeCanvas() {
            detectDevice()

            state.vw = window.innerWidth
            const navBarHeight = 64
            state.vh = window.innerHeight - navBarHeight

            state.dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1))
            canvas.style.width = `${state.vw}px`
            canvas.style.height = `${state.vh}px`
            canvas.width = Math.floor(state.vw * state.dpr)
            canvas.height = Math.floor(state.vh * state.dpr)
            ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)

            state.leftY = (state.vh - state.paddleH) / 2
            state.rightY = (state.vh - state.paddleH) / 2
            resetBall(true)
        }

        function randomServeSpeed() {
            return Math.max(5, Math.min(state.vw, state.vh) * 0.008)
        }

        function resetBall(initial = false) {
            state.ballX = state.vw / 2
            state.ballY = state.vh / 2
            const angles = [
                -0.35 * Math.PI,
                -0.25 * Math.PI,
                -0.15 * Math.PI,
                0.15 * Math.PI,
                0.25 * Math.PI,
                0.35 * Math.PI,
            ]
            const ang = angles[Math.floor(Math.random() * angles.length)]
            const dir = Math.random() < 0.5 ? -1 : 1
            const speed = randomServeSpeed()
            state.vx = Math.cos(ang) * speed * dir
            state.vy = Math.sin(ang) * speed
        }

        state.logoImg.onload = () => {
            state.logoLoaded = true
        }
        state.logoImg.src = encodeURI('/logos/OUTLINE/sem_letras.png')

        function step() {
            const paddleSpeed = Math.max(6, state.vh * 0.012)

            // Left paddle (sempre W/S ou touch)
            if (state.keys.w) state.leftY -= paddleSpeed
            if (state.keys.s) state.leftY += paddleSpeed
            state.leftY = Math.max(0, Math.min(state.vh - state.paddleH, state.leftY))

            // Right paddle:
            // - 2P (desktop): ↑ / ↓
            // - 1P: IA segue a bola
            if (state.twoPlayer) {
                if (state.keys.up) state.rightY -= paddleSpeed
                if (state.keys.down) state.rightY += paddleSpeed
            } else {
                const rightCenter = state.rightY + state.paddleH / 2
                state.rightY += (state.ballY - rightCenter) * 0.08
            }
            state.rightY = Math.max(0, Math.min(state.vh - state.paddleH, state.rightY))

            state.ballX += state.vx
            state.ballY += state.vy

            if (state.ballY - state.ballR < 0 && state.vy < 0) state.vy *= -1
            if (state.ballY + state.ballR > state.vh && state.vy > 0) state.vy *= -1

            const leftX = 40
            if (
                state.ballX - state.ballR < leftX + state.paddleW &&
                state.ballX > leftX &&
                state.ballY > state.leftY &&
                state.ballY < state.leftY + state.paddleH &&
                state.vx < 0
            ) {
                state.vx *= -1
            }

            const rightX = state.vw - 40 - state.paddleW
            if (
                state.ballX + state.ballR > rightX &&
                state.ballX < rightX + state.paddleW &&
                state.ballY > state.rightY &&
                state.ballY < state.rightY + state.paddleH &&
                state.vx > 0
            ) {
                state.vx *= -1
            }

            if (state.ballX < -state.ballR) {
                state.rightScore++
                resetBall()
            } else if (state.ballX > state.vw + state.ballR) {
                state.leftScore++
                resetBall()
            }

            draw()
            rafId = requestAnimationFrame(step)
        }

        function drawScoreOverlay() {
            ctx.save()
            ctx.fillStyle = 'rgba(200,200,200,0.1)'

            const fontSize = state.vw < 640 ? 36 : 64
            ctx.font = `bold ${fontSize}px system-ui`
            ctx.textBaseline = 'top'

            const offset = state.vw < 640 ? 80 : 200

            ctx.textAlign = 'left'
            ctx.fillText(String(state.leftScore), state.vw / 2 - offset, 30)

            ctx.textAlign = 'right'
            ctx.fillText(String(state.rightScore), state.vw / 2 + offset, 30)
            ctx.restore()
        }

        function capsule(
            ctx2d: CanvasRenderingContext2D,
            x: number,
            y: number,
            w: number,
            h: number
        ) {
            const r = Math.min(w, h) / 2
            ctx2d.beginPath()
            ctx2d.moveTo(x + r, y)
            ctx2d.lineTo(x + w - r, y)
            ctx2d.arc(x + w - r, y + r, r, -Math.PI / 2, 0)
            ctx2d.lineTo(x + w, y + h - r)
            ctx2d.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
            ctx2d.lineTo(x + r, y + h)
            ctx2d.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
            ctx2d.lineTo(x, y + r)
            ctx2d.arc(x + r, y + r, r, Math.PI, (3 * Math.PI) / 2)
            ctx2d.closePath()
            ctx2d.fill()
        }

        function draw() {
            ctx.fillStyle = '#000'
            ctx.fillRect(0, 0, state.vw, state.vh)

            ctx.fillStyle = '#fff'
            capsule(ctx, 40, state.leftY, state.paddleW, state.paddleH)
            capsule(ctx, state.vw - 40 - state.paddleW, state.rightY, state.paddleW, state.paddleH)

            if (state.logoLoaded) {
                const size = state.ballR * 2
                ctx.drawImage(
                    state.logoImg,
                    state.ballX - size / 2,
                    state.ballY - size / 2,
                    size,
                    size
                )
            } else {
                ctx.beginPath()
                ctx.arc(state.ballX, state.ballY, state.ballR, 0, Math.PI * 2)
                ctx.fill()
            }

            drawScoreOverlay()
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'w' || e.key === 'W') state.keys.w = true
            if (e.key === 's' || e.key === 'S') state.keys.s = true
            if (e.key === 'ArrowUp') {
                state.keys.up = true
                e.preventDefault()
            }
            if (e.key === 'ArrowDown') {
                state.keys.down = true
                e.preventDefault()
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'w' || e.key === 'W') state.keys.w = false
            if (e.key === 's' || e.key === 'S') state.keys.s = false
            if (e.key === 'ArrowUp') {
                state.keys.up = false
                e.preventDefault()
            }
            if (e.key === 'ArrowDown') {
                state.keys.down = false
                e.preventDefault()
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const y = e.touches[0].clientY
                state.leftY = Math.max(
                    0,
                    Math.min(state.vh - state.paddleH, y - state.paddleH / 2)
                )
            }
        }

        window.addEventListener('resize', sizeCanvas)
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)
        canvas.addEventListener('touchmove', onTouchMove, { passive: true })

        sizeCanvas()
        rafId = requestAnimationFrame(step)

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('resize', sizeCanvas)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            canvas.removeEventListener('touchmove', onTouchMove)
        }
    }, [ready, mode])

    return (
        <canvas
            ref={canvasRef}
            className="block w-screen touch-none paralucent"
            style={{ height: 'calc(100vh - 64px)' }}
        />
    )
}
