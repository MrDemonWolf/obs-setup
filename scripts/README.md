# OBS Backup Command

`obs-backup` is a small macOS command-line tool for saving OBS scenes and
profiles. It is not an OBS plugin. This folder holds the command's source; the
Homebrew formula that installs it lives in the separate
[`homebrew-den` tap](https://github.com/MrDemonWolf/homebrew-den/blob/main/Formula/obs-backup.rb).

## Install and use

Follow the [backup guide](../docs/backup-guide.md) for setup, backup, and
restore steps. The short version is:

```bash
brew tap mrdemonwolf/den
brew install obs-backup
git clone https://github.com/MrDemonWolf/obs-setup.git ~/Developer/mrdemonwolf/obs-setup
obs-backup setup
obs-backup
```

You can run `bash scripts/backup.sh setup` without Homebrew. From this repo,
`make backup` runs the same backup flow.

## What is installed

The formula installs `backup.sh` and `sanitize.py` into Homebrew's `libexec`
folder, then adds an `obs-backup` command to your `PATH`. Scene generation,
the previewer, and Remotion are separate tools and are not part of the formula.

| File | Role |
| --- | --- |
| [`backup.sh`](backup.sh) | Detects the Mac, snapshots OBS, writes the private archive, and calls the sanitizer. |
| [`sanitize.py`](sanitize.py) | Copies supported scene/profile files into `devices/` after removing secrets. |
| [`gen_scene_collection.py`](gen_scene_collection.py) | Generates the import-ready scene collections; run it with `make gen`. |
| [`validate_stinger.py`](validate_stinger.py) | Verifies the Stinger's WAV timing and rendered audio. |
| [`validate_release_packages.py`](validate_release_packages.py) | Checks that overlay and Stinger ZIP contents stay separate. |

## Where the files go

The command creates two outputs:

1. A full OBS settings ZIP in the configured private backup folder. It can
   contain stream keys and account tokens; keep it private.
2. A scrubbed copy of supported scene and profile files in `devices/` for Git
   review and recovery. The sanitizer's secret removal is a required safety
   boundary; do not bypass it or add raw backups to the repository.

Review `git status` and the staged diff after a backup. The command never
commits changes automatically.

## Homebrew updates

After an `obs-setup` release, the
[`update-homebrew.yml` workflow](../.github/workflows/update-homebrew.yml)
calculates the source archive checksum and opens a version update PR in
[`homebrew-den`](https://github.com/MrDemonWolf/homebrew-den). That tap PR
updates the formula and its catalog; merge it there to publish the new command
version.

## Checks

From the repository root:

```bash
python3 -m unittest discover -s tests -v
bash -n scripts/backup.sh
make gen
```

`make gen` rewrites the checked-in scene collections. Review those generated
files before committing them.
