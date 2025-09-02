'use client';

import { useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import './HomePage.css';

export default function HomePage() {
    const [ready, setReady] = useState(false);
    const [pongActive, setPongActive] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        setReady(true);
    }, []);

    useEffect(() => {
        if (!pongActive || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!; // lifecycle-controlled

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

        // ----- game constants (WAY faster ball, quick accel) -----
        const isMobile = state.vw < 768;
        const bg = '#000';
        const paddleColor = '#fff';
        const paddleW = Math.max(10, Math.floor(state.vw * (isMobile ? 0.02 : 0.012)));
        const paddleH = Math.max(isMobile ? 120 : 90, Math.floor(state.vh * (isMobile ? 0.24 : 0.18)));
        const paddlePad = Math.max(12, Math.floor(state.vw * 0.02));
        const paddleSpeed = isMobile ? 700 : 520;

        const logoSize = Math.max(56, Math.min(96, Math.floor(Math.min(state.vw, state.vh) * 0.08)));
        let ballSpeed = Math.max(520, Math.floor(Math.min(state.vw, state.vh) * 0.55)); // 🚀 faster base
        const maxBallSpeed = ballSpeed * 2.5; // higher cap

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

        // keyboard controls
        const keys: Record<string, boolean> = { w: false, s: false, ArrowUp: false, ArrowDown: false };
        function onKeyDown(e: KeyboardEvent) { if (e.key in keys) keys[e.key] = true; }
        function onKeyUp(e: KeyboardEvent) { if (e.key in keys) keys[e.key] = false; }
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        // touch / pointer controls
        let leftActive = false;
        let rightActive = false;

        function clamp(v: number, a: number, b: number) {
            return Math.max(a, Math.min(b, v));
        }

        function setPaddleFromY(which: 'left' | 'right', clientY: number) {
            const targetY = clientY - canvas.getBoundingClientRect().top;
            const newY = clamp(targetY - paddleH / 2, 0, state.vh - paddleH);
            if (which === 'left') leftY = newY; else rightY = newY;
        }

        function onPointerDown(e: PointerEvent) {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            if (cx < state.vw / 2) { leftActive = true; setPaddleFromY('left', e.clientY); }
            else { rightActive = true; setPaddleFromY('right', e.clientY); }
        }
        function onPointerMove(e: PointerEvent) {
            if (!leftActive && !rightActive) return;
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            if (leftActive && cx < state.vw / 2) setPaddleFromY('left', e.clientY);
            else if (rightActive && cx >= state.vw / 2) setPaddleFromY('right', e.clientY);
        }
        function onPointerUp(e: PointerEvent) {
            e.preventDefault();
            leftActive = rightActive = false;
        }

        canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp, { passive: false });
        window.addEventListener('pointercancel', onPointerUp, { passive: false });

        const logo = new window.Image();
        logo.src = '/logos/COM ICONE/Cosmo_V_negativo_Icone.png';

        let rafId = 0;
        let last = performance.now();

        function resetBall(dir: 1 | -1) {
            x = state.vw / 2 - logoSize / 2;
            y = state.vh / 2 - logoSize / 2;
            // slight cooldown on score so it's playable
            ballSpeed = Math.max(ballSpeed * 0.9, 450);
            const a = (Math.random() * 0.6 - 0.3) + (dir === 1 ? 0 : Math.PI);
            dx = Math.cos(a) * ballSpeed * dir;
            dy = Math.sin(a) * ballSpeed;
        }

        function step(now: number) {
            const dt = (now - last) / 1000;
            last = now;

            // keyboard movement
            if (keys.w) leftY -= paddleSpeed * dt;
            if (keys.s) leftY += paddleSpeed * dt;
            if (keys.ArrowUp) rightY -= paddleSpeed * dt;
            if (keys.ArrowDown) rightY += paddleSpeed * dt;

            leftY = clamp(leftY, 0, state.vh - paddleH);
            rightY = clamp(rightY, 0, state.vh - paddleH);

            // move ball
            x += dx * dt;
            y += dy * dt;

            // wall bounce
            if (y <= 0) { y = 0; dy = Math.abs(dy); }
            else if (y + logoSize >= state.vh) { y = state.vh - logoSize; dy = -Math.abs(dy); }

            // paddle collisions + stronger speed-up on hit
            // left
            if (x <= leftX + paddleW && x + logoSize >= leftX && y + logoSize >= leftY && y <= leftY + paddleH) {
                x = leftX + paddleW;
                const centerDelta = (y + logoSize / 2) - (leftY + paddleH / 2);
                dy += centerDelta * 7;
                dx = Math.abs(dx);
                ballSpeed = Math.min(maxBallSpeed, ballSpeed * 1.12); // 💨 faster growth
                const v = Math.hypot(dx, dy), scale = ballSpeed / v; dx *= scale; dy *= scale;
            }
            // right
            if (x + logoSize >= rightX && x <= rightX + paddleW && y + logoSize >= rightY && y <= rightY + paddleH) {
                x = rightX - logoSize;
                const centerDelta = (y + logoSize / 2) - (rightY + paddleH / 2);
                dy += centerDelta * 7;
                dx = -Math.abs(dx);
                ballSpeed = Math.min(maxBallSpeed, ballSpeed * 1.12);
                const v = Math.hypot(dx, dy), scale = ballSpeed / v; dx *= scale; dy *= scale;
            }

            // score (off-screen)
            if (x + logoSize < 0) resetBall(1);
            else if (x > state.vw) resetBall(-1);

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
    }, [pongActive]);

    if (!ready) return null;

    return (
        <div
            className="fixed inset-0 bg-black flex items-center justify-center"
            style={{ height: '100vh', width: '100vw' }}
        >
            {!pongActive ? (
                <button
                    className="focus:outline-none fade-in"
                    onClick={() => setPongActive(true)}
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
                </button>
            ) : (
                <>
                    {/* Canvas */}
                    <canvas
                        ref={canvasRef}
                        className="block w-full h-full"
                        aria-label="Pong canvas"
                        style={{ touchAction: 'none' }}
                    />
                    {/* Desktop-only instructions overlay (replaces dotted line) */}
                    <div className="pointer-events-none absolute inset-0 hidden md:flex items-center justify-center">
                        <div className="paralucent text-center leading-relaxed text-gray-200/15 text-sm md:text-base lg:text-lg px-4">
                            W / S  &nbsp; 
                        </div>
                        <div className="paralucent text-center leading-relaxed text-gray-200/15 text-sm md:text-base lg:text-lg px-4">
                            ↑ / ↓  &nbsp;
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
