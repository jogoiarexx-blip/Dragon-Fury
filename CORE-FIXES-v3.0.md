# Dragon Fury v3.0 Core Fixes

- Corrigida a Fase 5: variável, título e descrição agora são consistentemente `Invasão Cósmica`.
- Removida a configuração morta da Fase 6 do `phase-system.js`; `maxPhases` permanece 5.
- Adicionado `js/core/debug.js`: logs de desenvolvimento só aparecem com `?debug=1`.
- Adicionado `js/core/save-system.js` como camada segura para persistência futura, sem mudar as chaves existentes.
- Otimizado o update de partículas: compactação in-place em uma passada em vez de `splice()` repetido.
- Mantidos os limites adaptativos de partículas e os modos de qualidade da versão Performance.
- Preservada a estrutura com `ui/` e `phases/` na raiz.
