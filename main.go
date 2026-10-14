package main

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"runtime"
	"strings"
)

// Dropbox marks a file or folder as ignored on Windows with the NTFS alternate
// data stream "com.dropbox.ignored" holding "1", and stops ignoring it by
// clearing that stream.
// https://help.dropbox.com/en-us/sync/ignored-files
const ignoredStream = "com.dropbox.ignored"

func main() {
	if runtime.GOOS != "windows" {
		fmt.Println("Error: this tool only supports Windows.")
		os.Exit(1)
	}

	if err := run(os.Args[1:]); err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}
}

// run executes the CLI: di [status|ignore|reset] [folder]
func run(argv []string) error {
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}

	folder := "node_modules"
	action := "ignore"

	if len(argv) > 0 {
		action = argv[0]
	}

	if len(argv) > 1 {
		folder = argv[1]
	}

	targetPath := filepath.Join(cwd, folder)

	switch action {
	case "status":
		return status(targetPath)
	case "ignore":
		return ignore(targetPath)
	case "reset":
		return reset(targetPath)
	}

	fmt.Println("Usage: di [status|ignore|reset] [folder]")
	fmt.Println("Default folder: node_modules")
	fmt.Println("Default action: ignore")

	return nil
}

// streamPath returns the path of the ignore marker on targetPath.
func streamPath(targetPath string) string {
	return targetPath + ":" + ignoredStream
}

// isIgnored reports whether Dropbox currently ignores targetPath.
func isIgnored(targetPath string) (bool, error) {
	content, err := os.ReadFile(streamPath(targetPath))

	if errors.Is(err, fs.ErrNotExist) {
		// No marker at all, so it can't be ignored.
		return false, nil
	}

	if err != nil {
		return false, err
	}

	return strings.TrimSpace(string(content)) == "1", nil
}

// status prints whether Dropbox ignores the target folder.
func status(targetPath string) error {
	if err := checkExist(targetPath); err != nil {
		return err
	}

	ignored, err := isIgnored(targetPath)
	if err != nil {
		return err
	}

	if ignored {
		fmt.Println("Dropbox is already ignoring this folder.")
	} else {
		fmt.Println("Dropbox is not ignoring this folder.")
	}

	return nil
}

// ignore marks the target folder as ignored by Dropbox.
func ignore(targetPath string) error {
	if err := checkExist(targetPath); err != nil {
		return err
	}

	if err := os.WriteFile(streamPath(targetPath), []byte("1"), 0o644); err != nil {
		return err
	}

	fmt.Printf("Dropbox is now ignoring %s.\n", targetPath)

	return nil
}

// reset stops Dropbox from ignoring the target folder by clearing the marker,
// which is what Dropbox's Clear-Content instruction does.
func reset(targetPath string) error {
	if err := checkExist(targetPath); err != nil {
		return err
	}

	if err := os.WriteFile(streamPath(targetPath), nil, 0o644); err != nil {
		return err
	}

	fmt.Printf("Dropbox is no longer ignoring %s.\n", targetPath)

	return nil
}

// checkExist fails when the target folder does not exist.
func checkExist(targetPath string) error {
	if _, err := os.Stat(targetPath); err != nil {
		return fmt.Errorf("The directory does not exist in this location - %s", targetPath)
	}

	return nil
}
