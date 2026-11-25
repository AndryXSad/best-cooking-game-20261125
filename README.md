# Dapur Kilat — Game Masak

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/AndryXSad/best-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/AndryXSad/best-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Dapur Kilat** adalah game masak lengkap yang berjalan di desktop browser dari file statis, tanpa network request. Kamu adalah koki di dapur yang sibuk: terima pesanan dari papan pesanan, ambil bahan dari peti, potong di talenan, panggang daging di panggangan, goreng kentang, rakit hidangan di piring, lalu sajikan di Jendela Saji sebelum pelanggan pergi.

## Cara main

- **Gerak:** WASD / tombol panah (atau klik untuk berjalan)
- **Interaksi:** E / Spasi / klik di dekat stasiun — tahan E untuk memotong
- **P** jeda • **M** suara • **R** ulang shift

Alur satu pesanan: peti bahan → talenan / panggangan / penggorengan → rakit di piring (langsung di tangan atau di Meja Rakit) → sajikan di Jendela Saji. Sajikan cepat untuk tip, dan sajikan berturut-turut untuk kombo hingga 2x. Satu shift 2,5 menit dengan 5 resep (Burger Klasik, Burger Keju, Burger Dobel, Burger Spesial, Kentang Goreng); pesanan datang makin cepat, pelanggan makin tak sabar.

## Jalankan lokal

```sh
# dari folder repo ini — sajikan folder game/ dengan server statis apa pun:
python3 -m http.server --directory game 8080
# lalu buka http://localhost:8080
```

Tidak ada build step, tidak ada dependensi, semua gambar dan suara dibuat di dalam kode (canvas + WebAudio).

## Struktur kode

| File | Tugas |
| --- | --- |
| `game/index.html` | Halaman game + pemuatan skrip |
| `game/src/config.js` | Konstanta, resep, dan denah dapur |
| `game/src/audio.js` | Efek suara + musik (WebAudio, tanpa file) |
| `game/src/input.js` | Keyboard + mouse |
| `game/src/world.js` | Koki, stasiun, dan tabrakan |
| `game/src/game.js` | Aturan shift: pesanan, memasak, skor |
| `game/src/render.js` | Semua gambar di canvas |
| `game/src/demo.js` | Scene preset untuk screenshot |
| `game/src/main.js` | Boot, loop game, dan alur layar |
| `main.ts` | Entrypoint make.fun: menyalin game + screenshot dan menulis dossier |

Dibangun untuk kompetisi make.fun ["Make the best cooking game"](https://make.fun/bounty/best-cooking-game-20261125-0137) — hadiah $250 USDC, top 10.
