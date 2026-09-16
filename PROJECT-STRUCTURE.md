# Dragon Fury — Estrutura do Projeto

```text
dragon-fury/
├── index.html
├── PROJECT-STRUCTURE.md
├── OPTIMIZATION-NOTES.md
│
├── css/
│   └── style.css
│
├── assets/
│   └── bosses/
│       └── ancient-dragon-boss.webp
│
├── ui/
│   ├── ui.js
│   ├── menu-system.js
│   ├── hud-system.js
│   ├── phase-select.js
│   └── touch-controls.js
│
├── phases/
│   ├── phase-system.js
│   ├── phase-manager.js
│   ├── phase-loading.js
│   ├── phase-effects.js
│   ├── phase-transitions.js
│   └── phase1...phase5
│
└── js/
    ├── core/
    ├── systems/
    └── effects/
```

`index.html` permanece na raiz para GitHub Pages. As pastas `ui/` e `phases/` também ficam diretamente na raiz, enquanto o código geral permanece organizado em `js/`.


## Core additions
- `js/core/debug.js`: logs de desenvolvimento sob `?debug=1`.
- `js/core/save-system.js`: camada segura e central para persistência.
