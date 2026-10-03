# warp-one

Design system prototype for Warp: a desktop-style agent workspace with explorer, chat, diff pane and git panel.

## Run
Open `index.html` in a browser. No build step.

## Files
- `index.html` structure
- `styles.css` tokens and components
- `script.js` interactions (portal tooltips and dropdowns, resizable panes, chat simulation)

## Notes
Tooltips, the model dropdown and the context menu render inside `#portal` (position: fixed), so they are never clipped by `overflow: hidden` on parent containers.
