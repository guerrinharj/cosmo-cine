'use client';

import { useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import './HomePage.css';

export default function HomePage() {
    const [ready, setReady] = useState(false);
    const [pongActive, setPongActive] = useState(false);
    const [leftScore, setLeftScore] = useState(0);
    const [rightScore, setRightScore] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        setReady(true);
    }, []);

    useEffect(() => {
        if (!pongActive || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!; // lifecycle controlled

        // ----- sizing (HiDPI + resize) -----
        const state = { vw: 0, vh: 0, dpr: 1 };
        function sizeCanvas() {
            state.vw = window.innerWidth;
            state.vh = window.innerHeight;
            state.dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));

            canvas.style.width = `${state.vw}px`;
            canvas.style.height = `${state.vh}px`;
            canvas.width = Math.floor(state.vw * state.dpr);
            canvas.height = Math.floor(state.vh * state.dpr);

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(state.dpr, state.dpr);
        }
        sizeCanvas();
        window.addEventListener('resize', sizeCanvas);

        // ----- game constants -----
        const isMobile = state.vw < 768;
        const bg = '#000';
        const paddleColor = '#fff';

        const paddleW = Math.max(10, Math.floor(state.vw * (isMobile ? 0.02 : 0.012)));
        const paddleH = Math.max(isMobile ? 120 : 90, Math.floor(state.vh * (isMobile ? 0.24 : 0.18)));
        const paddlePad = Math.max(12, Math.floor(state.vw * 0.02));
        const paddleSpeed = isMobile ? 700 : 520;

        const logoSize = Math.max(56, Math.min(96, Math.floor(Math.min(state.vw, state.vh) * 0.08)));

        // Ball speed profile 
        let ballSpeed = isMobile
            ? Math.max(280, Math.floor(Math.min(state.vw, state.vh) * 0.18)) 
            : Math.max(430, Math.floor(Math.min(state.vw, state.vh) * 0.55));
        const accelFactor = isMobile ? 1.03 : 1.12; 
        const maxBallSpeed = isMobile ? ballSpeed * 1.6 : ballSpeed * 2.5;

        // paddles
        let leftY = state.vh / 2 - paddleH / 2;
        let rightY = state.vh / 2 - paddleH / 2;
        const leftX = paddlePad;
        const rightX = state.vw - paddlePad - paddleW;

        // ball (logo)
        let x = state.vw / 2 - logoSize / 2;
        let y = state.vh / 2 - logoSize / 2;

        // random initial direction
        const angle = Math.random() * Math.PI * 2;
        let dx = Math.cos(angle) * ballSpeed;
        let dy = Math.sin(angle) * ballSpeed;

        // keyboard controls (desktop only)
        const keys: Record<string, boolean> = { w: false, s: false, ArrowUp: false, ArrowDown: false };
        function onKeyDown(e: KeyboardEvent) { if (!isMobile && e.key in keys) keys[e.key] = true; }
        function onKeyUp(e: KeyboardEvent) { if (!isMobile && e.key in keys) keys[e.key] = false; }
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // touch / pointer controls (mobile: right paddle only)
        let rightActive = false;
        function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

        function setRightPaddleFromY(clientY: number) {
            const targetY = clientY - canvas.getBoundingClientRect().top;
            rightY = clamp(targetY - paddleH / 2, 0, state.vh - paddleH);
        }

        function onPointerDown(e: PointerEvent) {
            if (!isMobile) return;
            const rect = canvas.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            if (cx >= state.vw / 2) { // only right half controls
                e.preventDefault();
                rightActive = true;
                setRightPaddleFromY(e.clientY);
            }
        }
        function onPointerMove(e: PointerEvent) {
            if (!isMobile || !rightActive) return;
            e.preventDefault();
            setRightPaddleFromY(e.clientY);
        }
        function onPointerUp(e: PointerEvent) {
            if (!isMobile) return;
            e.preventDefault();
            rightActive = false;
        }

        canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: false });
        window.addEventListener('pointercancel', onPointerUp, { passive: false });

        const logo = new window.Image();
        logo.src = '/logos/COM ICONE/Cosmo_V_negativo_Icone.png';

        let rafId = 0;
        let last = performance.now();

        // simple AI for left paddle (mobile only)
        const aiMaxSpeed = Math.max(420, state.vh * 0.6); // px/s
        const aiLag = 0.18; // smoothing factor

        // local counters (avoid re-running effect on each point)
        let leftPoints = leftScore;
        let rightPoints = rightScore;

        function resetBall(dir: 1 | -1) {
            x = state.vw / 2 - logoSize / 2;
            y = state.vh / 2 - logoSize / 2;
            // slight cooldown on score so it's playable
            ballSpeed = Math.max(isMobile ? 150 : 450, ballSpeed * 0.9);
            const a = (Math.random() * 0.6 - 0.3) + (dir === 1 ? 0 : Math.PI);
            dx = Math.cos(a) * ballSpeed * dir;
            dy = Math.sin(a) * ballSpeed;
        }

        function drawRoundedRect(
            c: CanvasRenderingContext2D,
            xr: number, yr: number, wr: number, hr: number, r: number
        ) {
            const rr = Math.min(r, wr / 2, hr / 2);
            c.beginPath();
            c.moveTo(xr + rr, yr);
            c.arcTo(xr + wr, yr, xr + wr, yr + hr, rr);
            c.arcTo(xr + wr, yr + hr, xr, yr + hr, rr);
            c.arcTo(xr, yr + hr, xr, yr, rr);
            c.arcTo(xr, yr, xr + wr, yr, rr);
            c.closePath();
            c.fill();
        }

        function step(now: number) {
            const dt = (now - last) / 1000;
            last = now;

            // paddles: desktop keyboard
            if (!isMobile) {
                if (keys.w) leftY -= paddleSpeed * dt;
                if (keys.s) leftY += paddleSpeed * dt;
                if (keys.ArrowUp) rightY -= paddleSpeed * dt;
                if (keys.ArrowDown) rightY += paddleSpeed * dt;
            } else {
                // mobile: left paddle AI follows ball center with lag and speed cap
                const target = (y + logoSize / 2) - (paddleH / 2);
                const diff = target - leftY;
                const desired = diff * aiLag / Math.max(0.016, dt); // normalize
                const maxStep = aiMaxSpeed * dt;
                const stepY = clamp(desired, -maxStep, maxStep);
                leftY = clamp(leftY + stepY, 0, state.vh - paddleH);
            }

            // clamp both paddles
            leftY = clamp(leftY, 0, state.vh - paddleH);
            rightY = clamp(rightY, 0, state.vh - paddleH);

            // move ball
            x += dx * dt;
            y += dy * dt;

            // wall bounce
            if (y <= 0) { y = 0; dy = Math.abs(dy); }
            else if (y + logoSize >= state.vh) { y = state.vh - logoSize; dy = -Math.abs(dy); }

            // paddle collisions + speed-up on hit (gentler on mobile)
            const hitBoost = accelFactor;

            // left
            if (x <= leftX + paddleW && x + logoSize >= leftX && y + logoSize >= leftY && y <= leftY + paddleH) {
                x = leftX + paddleW;
                const centerDelta = (y + logoSize / 2) - (leftY + paddleH / 2);
                dy += centerDelta * (isMobile ? 4 : 7);
                dx = Math.abs(dx);
                ballSpeed = Math.min(maxBallSpeed, ballSpeed * hitBoost);
                const v = Math.hypot(dx, dy), scale = ballSpeed / v; dx *= scale; dy *= scale;
            }
            // right
            if (x + logoSize >= rightX && x <= rightX + paddleW && y + logoSize >= rightY && y <= rightY + paddleH) {
                x = rightX - logoSize;
                const centerDelta = (y + logoSize / 2) - (rightY + paddleH / 2);
                dy += centerDelta * (isMobile ? 4 : 7);
                dx = -Math.abs(dx);
                ballSpeed = Math.min(maxBallSpeed, ballSpeed * hitBoost);
                const v = Math.hypot(dx, dy), scale = ballSpeed / v; dx *= scale; dy *= scale;
            }

            // score (off-screen)
            if (x + logoSize < 0) {
                // right player scores
                rightPoints += 1;
                setRightScore(rightPoints);
                resetBall(1); // serve to right
            } else if (x > state.vw) {
                // left player scores
                leftPoints += 1;
                setLeftScore(leftPoints);
                resetBall(-1); // serve to left
            }

            // draw
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, state.vw, state.vh);

            // paddles
            ctx.fillStyle = paddleColor;
            drawRoundedRect(ctx, leftX, leftY, paddleW, paddleH, 6);
            drawRoundedRect(ctx, rightX, rightY, paddleW, paddleH, 6);

            // ball (logo)
            ctx.drawImage(logo, x, y, logoSize, logoSize);

            rafId = requestAnimationFrame(step);
        }

        const start = () => { last = performance.now(); rafId = requestAnimationFrame(step); };
        if (logo.complete) start(); else logo.onload = start;

        // cleanup
        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', sizeCanvas);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            canvas.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pongActive]); // ← don't depend on scores to avoid restarting animation

    if (!ready) return null;

    return (
        <div
            className="fixed inset-0 bg-black flex items-center justify-center"
            style={{ height: '100vh', width: '100vw' }}
        >
            {!pongActive ? (
                <button
                    className="group relative focus:outline-none fade-in"
                    onClick={() => { setLeftScore(0); setRightScore(0); setPongActive(true); }}
                    aria-label="Start Pong"
                    title="Click to start"
                >
                    <NextImage
                        src="/logos/COM ICONE/Cosmo_V_negativo_Icone.png"
                        alt="Cosmo Cine Logo"
                        width={200}
                        height={200}
                        className="w-48 h-auto md:w-64 rubber-hover"
                        priority
                    />
                    {/* hover hint: desktop only */}
                    <span
                        className="
                            pointer-events-none
                            hidden md:block
                            paralucent
                            absolute left-1/2 -translate-x-1/2
                            top-[calc(100%+8px)]
                            text-[10px] md:text-xs
                            text-gray-200/25
                            opacity-0 group-hover:opacity-100
                            transition-opacity duration-300
                        "
                    >
                        pong?
                    </span>
                </button>
            ) : (
                <>
                    <canvas
                        ref={canvasRef}
                        className="block w-full h-full"
                        aria-label="Pong canvas"
                        style={{ touchAction: 'none' }} // prevent scroll on mobile
                    />

                    {/* SCORE OVERLAY (both mobile + desktop) */}
                    <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2
                                    w-[72%] md:w-[52%] lg:w-[40%]
                                    flex items-center justify-between">
                        <div className="paralucent text-gray-200/12 select-none text-6xl md:text-7xl lg:text-8xl">
                            {leftScore}
                        </div>
                        <div className="paralucent text-gray-200/12 select-none text-6xl md:text-7xl lg:text-8xl">
                            {rightScore}
                        </div>
                    </div>

                    {/* Desktop-only minimal controls (kept subtle) */}
                    <div className="pointer-events-none absolute inset-0 hidden md:flex items-end justify-center pb-6">
                        <div className="paralucent text-center leading-relaxed text-gray-200/15 text-xs md:text-sm lg:text-base px-4">
                            W / S
                        </div>
                        <div className="paralucent text-center leading-relaxed text-gray-200/15 text-xs md:text-sm lg:text-base px-4">
                            ↑ / ↓
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
