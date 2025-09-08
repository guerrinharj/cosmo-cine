'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import './HomePage.css'

export default function HomePage() {
    return (
        <div
            className="fixed inset-0 bg-black flex items-center justify-center"
            style={{ height: '100vh', width: '100vw' }}
        >
            <Link
                href="/pong"
                className="group relative focus:outline-none fade-in"
                aria-label="Ir para /pong"
                title="Jogar Pong"
            >
                <NextImage
                    src="/logos/OUTLINE/com_letras.png"
                    alt="Cosmo Cine Logo"
                    width={200}
                    height={200}
                    className="w-44 h-auto md:w-46 rubber-hover"
                    priority
                />
            </Link>
        </div>
    )
}
