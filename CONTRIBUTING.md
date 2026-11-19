# Adding your games

The catalog is a folder of small YAML files, one per game. Anyone can add a game with a pull request; a maintainer reviews it before it goes live.

```
games/
  your-name/
    developer.yaml        who you are (once per folder)
    my-first-game.yaml    one file per game
    another-game.yaml
    my-first-game.gif     optional cover (animated GIF of gameplay is best)
```

- **Folder name** = your developer or studio handle: lowercase letters, digits and dashes (`guguts`, `slop-studios`). It becomes your page at `/dev/<folder>`.
- **File name** = the game's slug (`my-first-game.yaml`). The game page is `/games/<folder>/<file>`.
- Adding a game made by someone else? That's welcome too: use their handle as the folder and link the original post in `source_url`.

## developer.yaml

```yaml
name: Guguts                      # required, how you want to be credited
url: https://guguts.itch.io/      # optional, your main page
links:                            # optional, up to 5 other profiles
  - https://www.reddit.com/user/guguts
```

## Game manifest

```yaml
title: My First Game                       # required
play_url: https://guguts.itch.io/my-first-game   # required, https. "Play" opens this; games are never embedded here
page_url: https://guguts.itch.io/my-first-game   # optional, info/store page if different from play_url
source_url: https://www.reddit.com/r/WebGames/comments/...  # optional, where it was announced
source_code: https://github.com/guguts/my-first-game        # optional, if the code is public
description: One or two sentences in English about what you do in the game.  # required, 10–300 chars
genre: puzzle                              # required, one of the list below
tags: [roguelike, pixel-art]               # optional, up to 8, lowercase-with-dashes
mobile: true                               # optional (default false). Only true if it really works on a phone/touch
multiplayer: none                          # optional: none (default), local, online
ai: [code, art]                            # optional: true, false, or which parts: code, art, audio, text. Omit = not stated
ads: false                                 # required: does the game itself show ads? true, false or unknown
purchases: false                           # required: in-game purchases or paid unlocks? true, false or unknown
needs: a Doom IWAD                         # optional: anything the player must bring (a file, an account...)
stage: beta                                # optional: prototype, alpha, beta, 1.0...
cover: my-first-game.gif                   # optional, image in the same folder, 16:9. An animated GIF of gameplay is best (under ~3 MB); PNG/JPG/WebP also work
added: 2026-11-19                          # required, YYYY-MM-DD (the day you open the PR)
```

**Genres:** `action`, `adventure`, `arcade`, `card`, `idle`, `platformer`, `puzzle`, `racing`, `rpg`, `sandbox`, `shooter`, `simulation`, `sports`, `strategy`, `survivors`, `tower-defense`, `exploration`, `other`.

## Rules

- The game must run in a web browser and be free to start playing.
- Be honest about `ads`, `purchases` and `ai`. These are filters people rely on.
- Only add a `cover` image you made or have permission to use. By adding it you confirm that.
- No adult content, malware, crypto/NFT schemes or games that need a download to play.
- The developer can ask for their game to be edited or removed at any time; that request wins.

## Check before opening the PR

```bash
npm install
npm run build
```

The build fails with a clear message if a manifest is wrong (missing field, typo in a field name, `http://` instead of `https://`, unknown genre, missing `developer.yaml`, or a game that is already listed). The same check runs automatically on every pull request.
