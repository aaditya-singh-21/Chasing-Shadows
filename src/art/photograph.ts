export function photographSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 310" aria-hidden="true">
    <defs><linearGradient id="photo-bg" x2="0" y2="1"><stop stop-color="#777b67"/><stop offset="1" stop-color="#434e43"/></linearGradient><filter id="grain"><feTurbulence baseFrequency=".6" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".14"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter></defs>
    <g filter="url(#grain)"><path fill="url(#photo-bg)" d="M0 0h600v310H0z"/><path fill="#3c4b42" d="M0 45h600v12H0zm35 0h14v265H35zm512 0h14v265h-14z"/>
    <path fill="#adb095" d="M139 18h322v36H139z"/><text x="300" y="42" text-anchor="middle" font-family="Georgia,serif" font-size="16" fill="#354b42">CITY TRANSIT AUTHORITY</text>
    <g stroke="#a6ad8a" stroke-width="2" fill="#31483f"><path d="M70 72h95v107H70zm394 0h65v107h-65z"/><path d="M117 72v107m-47-56h95m332-51v107m-33-56h65"/></g>
    <path fill="#8d977b" d="M0 260h600v50H0z"/>
    ${[110, 245, 370, 495].map((x, i) => `<g transform="translate(${x} 266)"><path fill="#263d34" d="m-22-19 5 66h15l4-61 4 61h16l5-66z"/><path fill="${i === 1 ? '#536460' : '#3a5141'}" stroke="#899376" d="m-21-129 40 0 14 111-64 0z"/><ellipse cx="0" cy="-152" rx="21" ry="29" fill="#a4ac8e"/><path d="m-22-151 1-23 16-11 18 3 11 17-5 15-7-15-12-5-13 12z" fill="#2a3d34"/><path d="m-18-122-20 62 5 30m50-92 17 62-5 30" fill="none" stroke="${i === 1 ? '#536460' : '#3a5141'}" stroke-width="14"/>${i === 1 ? '<path d="m-16-129 10 18 22-7 4-12z" fill="#bda071"/><path d="m-6-112 5 27 8-4-3-30z" fill="#bda071"/><path d="m-42-44 14 3" stroke="#c7bea0" stroke-width="4"/>' : '<path d="m-14-127 14 17 13-17" fill="none" stroke="#acb18e" stroke-width="2"/>'}</g>`).join('')}
    <path d="m22 12 560 283M25 285 570 27" stroke="#ccc6a4" stroke-opacity=".07"/><path d="M409 0q-13 51 3 104t-7 112l4 94" fill="none" stroke="#ddd4ae" stroke-opacity=".17"/>
    </g><g class="photo-hand" fill="#091720"><path d="M600 310H351l-5-42-17-44q-5-16 4-17 10-2 18 23l-1-92q0-15 8-15 9 0 9 15l6 53 6-71q1-12 8-11 8 1 7 15l-1 74 7-63q2-13 10-12 7 1 5 17l-3 66 8-45q3-11 9-8 7 2 5 15l-7 77-12 40 16 40z"/></g>
    </svg>`;
}
