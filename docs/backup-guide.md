# Backup guide (macOS)

OBS keeps live scenes and profiles in `~/Library/Application Support/obs-studio/basic`.
No export step is needed. The command takes a local snapshot, saves a full ZIP to
Google Drive, and copies a scrubbed version into this repo.

## One-time setup

Install the command from Homebrew Den:

```bash
brew tap mrdemonwolf/den
brew install obs-backup
git clone https://github.com/MrDemonWolf/obs-setup.git ~/Developer/mrdemonwolf/obs-setup
obs-backup setup
```

If you already cloned this repo, skip the `git clone` line. You can also run
`bash scripts/backup.sh setup` without installing through Homebrew.

Accept the suggested Google Drive and repo paths, or enter different folders.
Setup saves them in `~/.config/obs-backup/config`. The Homebrew install puts
the command on your `PATH`; on a Mac with the previous version, setup migrates
the saved macOS preferences into this file.

Without Homebrew, setup links the command at `~/.local/bin/obs-backup`. If your
shell cannot find it, add this to `~/.zshrc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Open a new terminal after changing `PATH`.

## Back up

```bash
obs-backup
```

`make backup` works from the repo too. The command detects MacBook Pro or Mac
Mini from the macOS Computer Name. It copies the live `basic` directory once,
then stores `<Device>-<timestamp>.zip` in the configured backup folder. That
ZIP includes OBS secrets and must stay private. The supported scene collections
and profile files go to `devices/<device>/` with URLs, keys, passwords, and
tokens removed. The command prints Git review and commit commands; it does not
commit automatically.

If OBS is open, close it first for the most consistent snapshot. This command
does not back up external media assets referenced by OBS paths.

## Overrides

```bash
DEVICE=mac-mini obs-backup
OBS_BACKUP_DIR="$HOME/Desktop/OBS Backups" obs-backup
OBS_EXPORT_DIR="$HOME/Desktop/OBS export" obs-backup
```

`OBS_REPO_DIR` overrides the configured repo location. `obs-backup setup`
changes the saved paths.

## Restore

1. For the complete live setup, quit OBS, unzip a private raw backup, and
   restore its contents into `~/Library/Application Support/obs-studio/basic`.
   Keep the current directory elsewhere until the restored setup works.
2. For a Git copy, import `devices/<device>/scenes/<name>.json` in OBS via
   **Scene Collection → Import**, and import profile folders via **Profile →
   Import**. Re-enter widget URLs, stream keys, and connected accounts.
3. Re-select cameras, displays, and media paths as needed.

The Git copy is for review and recovery of layout/settings. The private ZIP
is the full OBS settings backup.
