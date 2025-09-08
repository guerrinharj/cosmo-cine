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

                {/* hint (desktop only) */}
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
            </Link>
        </div>
    )
}
