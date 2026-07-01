# Backup Guide

Short version: **export from OBS into `~/Downloads/OBS`, then run `make backup`.**

---

## Back up (every time)

### 1. Export from OBS into one folder

Put everything into `~/Downloads/OBS` (create it if it isn't there):

- **Scenes:** OBS menu bar -> `Scene Collection` -> `Export` -> save into
  `~/Downloads/OBS`.
- **Profiles:** OBS menu bar -> `Profile` -> `Export` -> save into
  `~/Downloads/OBS`. Do this for each profile you care about
  (Streaming, Recording, Recording_Vertical).

You can export as many scene collections and profiles as you like. The
backup command sorts them out.

### 2. Run the backup

```bash
make backup
```

That does three things:

1. **Zips the full raw export** to
   `~/Downloads/OBS-backups/<Device>-<date>.zip`. This copy keeps your real
   widget URLs and stream key - **upload it to Google Drive.** It is never
   committed to git.
2. **Copies a scrubbed version into the repo** under `devices/<device>/`,
   with browser source URLs and stream keys wiped to empty strings.
3. **Updates `devices/<device>/index.json`** so the previewer picks up the
   new scenes.

### 3. Commit

```bash
git status
git add devices/<device> && git commit -m "backup(<device>): <date>"
```

---

## Which device am I?

The script reads your Mac's name (`scutil --get ComputerName`) and maps it:

| Computer Name              | Folder                 |
| -------------------------- | ---------------------- |
| contains `MacBook`         | `devices/macbook-pro/` |
| contains `Mini`            | `devices/mac-mini/`    |

If detection is ever wrong, force it:

```bash
DEVICE=mac-mini make backup      # or DEVICE=macbook-pro
```

Using a different export folder? Set `OBS_EXPORT_DIR`:

```bash
OBS_EXPORT_DIR=~/Desktop/obs-dump make backup
```

---

## Restore onto a Mac

1. **Scenes:** OBS -> `Scene Collection` -> `Import` ->
   `devices/<device>/scenes/<name>.json`.
2. **Profiles:** OBS -> `Profile` -> `Import` ->
   `devices/<device>/profiles/<name>/`.
3. **Re-select hardware** OBS can't guess: your camera device
   (`[src] Camera`) and your display (`[src] Screen Capture`).
4. **Paste the URLs that were wiped** into each browser source
   (`[src] Alerts`, `[src] Cowork Widgets`, `[src] Cowork Alerts`,
   `VTuber Avatar`). Grab them from your alert provider, or from the full zip
   on Google Drive.
5. **Re-enter your stream key** in `Settings -> Stream` (it was wiped too).

> Note: OBS exports do not include image or video **asset files**, only
> paths. Keep large assets in a synced folder (Google Drive / iCloud) or copy
> them over separately.

---

## What is and isn't kept in git

| Item                          | In git?               | Why                         |
| ----------------------------- | --------------------- | --------------------------- |
| Scene layout + colors         | Yes                   | The whole point             |
| Profile video/audio settings  | Yes                   | Encoder, resolution, etc.   |
| Browser source URLs           | No (wiped to `""`)    | Carry secret widget tokens  |
| Twitch stream key             | No (wiped to `""`)    | Secret                      |
| Full un-wiped export (`.zip`) | No (Downloads only)   | Contains the above secrets  |

See [obs-json-reference.md](obs-json-reference.md) for the exact fields.
