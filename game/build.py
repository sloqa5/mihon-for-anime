#!/usr/bin/env python3
"""Generate game/standalone.html — a fully self-contained offline game file."""

import re, os, sys

BASE = os.path.dirname(os.path.abspath(__file__))

JS_ORDER = [
    'src/utils.js',
    'src/aircraft.js',
    'src/missions.js',
    'src/base.js',
    'src/crates.js',
    'src/state.js',
    'src/renderer.js',
    'src/ui.js',
    'src/main.js',
]

def strip_modules(code, filename):
    # Remove import statements including multi-line: import { a, b\n  c } from './x.js';
    code = re.sub(
        r"import\s+(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+['\"][^'\"]+['\"];?",
        '', code, flags=re.DOTALL
    )
    # Remove bare re-export lines: export { foo, bar };
    code = re.sub(r'^export\s+\{[^}]*\};?\s*$', '', code, flags=re.MULTILINE)
    # export async function → async function
    code = re.sub(r'^export\s+(async\s+function)', r'\1', code, flags=re.MULTILINE)
    # export function / export const / export let / export class
    code = re.sub(r'^export\s+(function|const|let|var|class)\b', r'\1', code, flags=re.MULTILINE)
    return code

def read_css():
    with open(os.path.join(BASE, 'styles.css')) as f:
        return f.read()

def read_js():
    parts = []
    for fname in JS_ORDER:
        path = os.path.join(BASE, fname)
        with open(path) as f:
            raw = f.read()
        stripped = strip_modules(raw, fname)
        parts.append(f'// ── {fname} ──\n{stripped}')
    return '\n\n'.join(parts)

CSS = read_css()
JS  = read_js()

HTML = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#0a140a">
  <title>AirCommand</title>
  <style>
{CSS}
  </style>
</head>
<body>
<div id="app">
  <nav id="tab-bar">
    <button data-tab="base" class="active">Base</button>
    <button data-tab="planes">Planes</button>
    <button data-tab="ops">Ops</button>
    <button data-tab="prestige">&#9733; Prestige</button>
  </nav>
  <div id="stats-bar">
    <div>
      <div class="stat-credits" id="stat-credits">0</div>
      <div class="stat-rate"    id="stat-rate">+0/s</div>
    </div>
    <button id="crate-badge">&#128230;</button>
  </div>
  <div id="boost-bar"></div>
  <div id="canvas-wrap">
    <canvas id="game-canvas"></canvas>
  </div>
  <div id="scroll-panel">
    <div id="panel-base"></div>
    <div id="panel-planes"   style="display:none"></div>
    <div id="panel-ops"      style="display:none"></div>
    <div id="panel-prestige" style="display:none"></div>
  </div>
</div>
<div id="crate-modal">
  <div class="crate-modal-inner"></div>
</div>
<script>
(function() {{
'use strict';
{JS}
}})();
</script>
</body>
</html>'''

out = os.path.join(BASE, 'standalone.html')
with open(out, 'w') as f:
    f.write(HTML)

size = os.path.getsize(out)
print(f'Built {out}  ({size:,} bytes)')
