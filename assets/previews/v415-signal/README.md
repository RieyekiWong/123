# Signal / apparition preview — not connected to the game

A seven-second H.264/AAC MP4 compares two interference envelopes: one without a face at 1.1 seconds, one with an apparition at 4.25 seconds. The apparition is mixed through the distorted signal for about 0.29 seconds. Both envelopes carry the same short filtered-noise hiss. The player has native controls, does not autoplay, and plays sound when the viewer presses Play. The deliberately short comparison does not represent the intended in-game frequency; the requested live design uses roughly half face-bearing interferences, with longer irregular gaps.

`terminal.png` is a capture of the existing game's actual 480×360 canvas, including its perspective keyboard. `apparition.png` is an original fictional image made with the OpenAI image generation tool on 2026-11-04. No real person is identified. `effect.js` draws the actual preview frames and synthesizes the quiet electrical sound; `record.html` is its local recording harness. The original intermediate WebM is retained outside the public release workspace.

This preview does not import the game runtime, touch localStorage, request the chat API or advance any puzzle. The main entry points remain unchanged. The requested shorter final puzzle and its live scare settings will be connected after review of this visual preview.
