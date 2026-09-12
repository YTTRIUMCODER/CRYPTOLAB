# CRYPTOLAB

A local, browser-based cryptography workbench.

## Included

- Converter: UTF-8, Bytes, Hex, Binary, Decimal, Base 2–64, Base64
- Bitwise: XOR, AND, OR, XNOR, NAND, NOR
- Hash: SHA-1, SHA-256, SHA-384, SHA-512
- Classical ciphers: Caesar, ROT13, Atbash, Vigenère, Affine, Rail Fence, Columnar Transposition
- XOR lab with repeating-key option
- Entropy and byte-frequency analysis
- CSPRNG random bytes, UUID, probable-prime demo
- Local file inspector and SHA-256
- Transformation pipeline
- HMAC
- JWT decoder
- Command palette with Ctrl/Cmd+K

## Run

Open `index.html` in a modern browser. No server or package installation is required.

## Notes

All normal operations are performed locally in the browser. Web Crypto is used for hashing/HMAC/randomness where appropriate.

The classical ciphers and number utilities are educational. Do not use homemade or educational cryptography to protect real secrets.