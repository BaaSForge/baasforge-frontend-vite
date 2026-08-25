export function StepThreeArtwork() {
    return (
        <div className="bf-step-art bf-step-three-art" aria-hidden="true">
            <svg className="bf-step-three-svg" viewBox="0 0 1080 1080" fill="none">
                <g className="bf-step-three-destination">
                    <g filter="url(#step-three-noise-right)">
                        <rect width="140" height="140" transform="matrix(0.866025 0.5 0 1 538.244 426)" fill="#171717" />
                        <rect width="140" height="140" transform="matrix(0.866025 0.5 0 1 538.244 426)" fill="url(#step-three-right-light)" />
                        <rect width="140" height="140" transform="matrix(0.866025 0.5 0 1 538.244 426)" stroke="#D4D4D4" strokeWidth="2" />
                    </g>
                    <path d="M659.244 635V495L780.487 425V705L538 845V705L659.244 635Z" fill="#171717" stroke="#404040" strokeWidth="2" />
                    <g filter="url(#step-three-noise-left)">
                        <path d="M296 425L417.244 495V635L538.487 705V845L296 705V565V425Z" fill="#171717" />
                        <path d="M296 425L417.244 495V635L538.487 705V845L296 705V565V425Z" fill="url(#step-three-left-light)" />
                        <path d="M296 425L417.244 495V635L538.487 705V845L296 705V565V425Z" stroke="#404040" strokeWidth="2" />
                    </g>
                    <path d="M538.487 426L417.244 496L296 426L538.487 286L780.974 426L659.731 496L538.487 426Z" fill="#171717" stroke="#404040" strokeWidth="2" />
                    <rect width="140" height="140" transform="matrix(0.866025 0.5 -0.866025 0.5 538.244 565)" fill="#171717" stroke="#404040" strokeWidth="2" strokeLinejoin="bevel" />
                    <rect width="140" height="140" transform="matrix(0.866025 -0.5 0 1 417 496)" fill="#171717" stroke="#404040" strokeWidth="2" strokeLinejoin="bevel" />
                    <rect className="bf-step-three-target" width="140" height="140" transform="matrix(0.866025 0.5 -0.866025 0.5 538.244 565)" fill="url(#step-three-core-gradient)" />
                </g>

                <g className="bf-step-three-payload">
                    <g className="bf-step-three-core" filter="url(#step-three-core-blur)">
                        <path d="M612.85 414.97L538.244 458.044V458.131L538.168 458.087L538.094 458.131V458.044L463.487 414.97V328.648L538.168 371.766L612.85 328.648V414.97ZM613 328.032L538.244 371.192L463.487 328.032L538.244 284.871L613 328.032Z" fill="url(#step-three-core-gradient)" />
                    </g>

                    <g className="bf-step-three-glass">
                        <rect width="140" height="140" transform="matrix(0.866025 0.5 -0.866025 0.5 538.244 231)" fill="#171717" fillOpacity=".24" stroke="#D4D4D4" strokeLinejoin="bevel" />
                        <rect width="140" height="140" transform="matrix(0.866025 -0.5 0 1 538 372)" fill="#171717" fillOpacity=".24" stroke="#D4D4D4" strokeLinejoin="bevel" />
                        <rect width="140" height="140" transform="matrix(0.866025 0.5 0 1 417 302)" fill="#171717" fillOpacity=".24" stroke="#D4D4D4" />
                    </g>

                    <g className="bf-step-three-side-guides">
                        <line x1="417" y1="301" x2="417" y2="496" stroke="#D4D4D4" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M659.276 301V496" stroke="#D4D4D4" strokeWidth="2" strokeDasharray="4 4" />
                    </g>
                </g>
                <line className="bf-step-three-center-guide" x1="538.3" y1="371" x2="538.3" y2="708" stroke="#D4D4D4" strokeWidth="2" strokeDasharray="4 4" />

                <defs>
                    <filter id="step-three-core-blur" x="420" y="240" width="240" height="480" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feGaussianBlur stdDeviation="10" />
                    </filter>
                    <filter id="step-three-noise-right" x="537.377" y="424.5" width="122.976" height="213" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feTurbulence type="fractalNoise" baseFrequency="1.4285715" stitchTiles="stitch" numOctaves={3} result="noise" seed="5094" />
                        <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
                        <feComponentTransfer in="alphaNoise" result="clippedNoise"><feFuncA type="discrete" tableValues="1 1 1 1 1 0 0 0 0 0" /></feComponentTransfer>
                        <feComposite operator="in" in2="SourceGraphic" in="clippedNoise" result="noiseClipped" />
                        <feFlood floodColor="rgba(0, 0, 0, .25)" result="noiseColor" />
                        <feComposite operator="in" in2="noiseClipped" in="noiseColor" result="noiseFill" />
                        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="noiseFill" /></feMerge>
                    </filter>
                    <filter id="step-three-noise-left" x="295.134" y="423.5" width="244.219" height="423" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feTurbulence type="fractalNoise" baseFrequency="1.4285715" stitchTiles="stitch" numOctaves={3} result="noise" seed="5094" />
                        <feColorMatrix in="noise" type="luminanceToAlpha" result="alphaNoise" />
                        <feComponentTransfer in="alphaNoise" result="clippedNoise"><feFuncA type="discrete" tableValues="1 1 1 1 1 0 0 0 0 0" /></feComponentTransfer>
                        <feComposite operator="in" in2="SourceGraphic" in="clippedNoise" result="noiseClipped" />
                        <feFlood floodColor="rgba(0, 0, 0, .25)" result="noiseColor" />
                        <feComposite operator="in" in2="noiseClipped" in="noiseColor" result="noiseFill" />
                        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="noiseFill" /></feMerge>
                    </filter>
                    <linearGradient id="step-three-right-light" x1="0" y1="136" x2="148.677" y2="114.715" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#D4D4D4" /><stop offset=".948816" stopColor="#171717" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="step-three-left-light" x1="296" y1="697" x2="538" y2="669" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#D4D4D4" /><stop offset=".948816" stopColor="#171717" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="step-three-core-gradient" x1="469.374" y1="307.264" x2="616.557" y2="291.49" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#DF8E58" /><stop offset=".564153" stopColor="#9F44A1" /><stop offset="1" stopColor="#8026C7" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
