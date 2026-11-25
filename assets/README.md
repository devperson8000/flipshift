# FLIPSHIFT asset drop-in guide
Put PNG files at these exact paths. Missing files fall back to simple shapes, so art can be added piece by piece.
Tile size is 40px, canvas is 960x560 (supply 2x sizes for sharpness; they scale automatically).

| Path | Draw size | Notes |
|---|---|---|
| player/player.png | 40x40 | Faces right; flipped automatically for left and inverted gravity |
| tiles/tile_world1..4.png | 40x40 | Seamless solid block per world (floor, ceiling, platforms) |
| backgrounds/bg_world1..4.png | ~560px tall | Tiles horizontally with parallax |
| collectibles/coin.png | 24x24 | |
| collectibles/checkpoint_off.png, checkpoint_on.png | 40x48 | Stands on floor |
| collectibles/exit_gate.png | 60x80 | Stands on floor at level end |
| hazards/spike.png | 40x40 | Points UP; auto-flipped on ceiling |
| hazards/drone.png | 36x36 | Patrols; dash through it to destroy |

Paths live in `js/assets.js` (MANIFEST) if you want to rename anything.
