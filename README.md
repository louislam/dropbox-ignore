# Dropbox Ignore

For Windows only.

Tells Dropbox to ignore a folder (default: `node_modules`) by setting the NTFS alternate data stream `com.dropbox.ignored` on it, which is Dropbox's own
[ignored files](https://help.dropbox.com/en-us/sync/ignored-files) mechanism.

## Build

Requires Go.

```bash
go build -o di.exe .
```

Put `di.exe` somewhere in your `PATH`.

## Usage

```
Usage: di [status|ignore|reset] [folder]
Default folder: node_modules
Default action: ignore
```

- `ignore` - Dropbox ignores the folder
- `reset` - Dropbox no longer ignores the folder
- `status` - prints whether Dropbox ignores the folder

Example

```bash
cd /path/to/folder

# Ignore "abc" folder
di ignore abc
```

# Notes

- No dependencies, no PowerShell: the marker is read and written directly.
- Name the binary `di.exe` (or `dropignore.exe`) to match the usage above.
- This project is inspired by https://github.com/tmackness/dropbox-ignore-node_modules
- [Dropbox Documentation](https://help.dropbox.com/en-us/files-folders/restore-delete/ignored-files)
