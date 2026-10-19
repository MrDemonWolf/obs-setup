# Current OBS setup status

Checked October 15, 2026 on Nathanial's MacBook Pro with OBS 32.2.2.

## Applied

- Imported the separate `MBP Streaming` scene collection through OBS.
- Kept the existing `Streaming` collection in OBS as the rollback option.
- Linked all five overlay videos. OBS reported `Found 5 of 5` before applying them.
- Opened the `Starting Soon` scene and confirmed its video and chat frame render in the preview.
- Confirmed OBS is idle. Streaming and recording were not started.
- Created a private pre-import OBS backup and checked the archive integrity. The backup may contain account secrets and must stay private.

## Prepared for Drive

`~/Downloads/MrDemonWolf-OBS-MBP-Setup.zip` contains the MBP collection, its five overlay videos, a short setup guide, and a file-hash manifest. The package has no non-empty URL, key, token, password, or cookie fields in the collection export.

To make the media available to both computers, copy the package's `Twitch/Overlays/` files to `My Drive/MultiMedia Projects/Social Media/Twitch/Overlays/`. The current OBS collection uses the extracted files under `~/Downloads/MrDemonWolf-OBS-MBP-Setup/`; moving or removing that folder will break those five media links until they are relinked.

## Still needed before streaming

- Add the private browser-widget URLs inside OBS. They are intentionally blank in the export.
- Select and check local capture devices, then review audio routing and every scene on this MacBook Pro.
- After the Google Drive copy is in place, point OBS at that synced folder so the links survive cleanup and can be reused on the Mac Mini.
- Do not treat a visible preview as a live-stream verification. No stream or recording was started.

## Files

- Package: `~/Downloads/MrDemonWolf-OBS-MBP-Setup.zip`
- Source collection: `devices/macbook-pro/scenes/MBP-Streaming.json`
- Official media release: `OBS-assets-v0.1.4`
- General import and backup steps: [backup-guide.md](backup-guide.md)
