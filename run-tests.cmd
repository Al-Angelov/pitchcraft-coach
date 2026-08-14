@echo off
set ELECTRON_RUN_AS_NODE=1
set NODE_ENV=test
set FORCE_COLOR=0
"C:\Users\alexm\AppData\Local\Programs\Kiro\Kiro.exe" "c:\Users\alexm\OneDrive\kiro\pitchcraft-coach\workspace\node_modules\vitest\vitest.mjs" run --reporter=verbose %* > "c:\Users\alexm\OneDrive\kiro\pitchcraft-coach\workspace\test-result.txt" 2>&1
