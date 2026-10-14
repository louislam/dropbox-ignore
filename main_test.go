package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestIgnoreStatusReset(t *testing.T) {
	target := filepath.Join(t.TempDir(), "test_temp")

	if err := os.Mkdir(target, 0o755); err != nil {
		t.Fatal(err)
	}

	ignored, err := isIgnored(target)
	if err != nil {
		t.Fatal(err)
	}
	if ignored {
		t.Fatal("expected the folder to not be ignored initially")
	}

	if err := status(target); err != nil {
		t.Fatal(err)
	}

	if err := ignore(target); err != nil {
		t.Fatal(err)
	}

	if ignored, err = isIgnored(target); err != nil {
		t.Fatal(err)
	} else if !ignored {
		t.Fatal("expected the folder to be ignored after ignore")
	}

	if err := status(target); err != nil {
		t.Fatal(err)
	}

	if err := reset(target); err != nil {
		t.Fatal(err)
	}

	if ignored, err = isIgnored(target); err != nil {
		t.Fatal(err)
	} else if ignored {
		t.Fatal("expected the folder to not be ignored after reset")
	}

	content, err := os.ReadFile(streamPath(target))
	if err != nil {
		t.Fatal(err)
	}
	if len(content) != 0 {
		t.Fatalf("expected reset to clear the marker, got %q", content)
	}

	if err := status(target); err != nil {
		t.Fatal(err)
	}
}

func TestMissingDirectory(t *testing.T) {
	target := filepath.Join(t.TempDir(), "test_temp_fail")

	for name, fn := range map[string]func(string) error{
		"status": status,
		"ignore": ignore,
		"reset":  reset,
	} {
		err := fn(target)
		if err == nil {
			t.Fatalf("%s: expected an error for a missing directory", name)
		}

		want := "The directory does not exist in this location - " + target
		if err.Error() != want {
			t.Fatalf("%s: got %q, want %q", name, err.Error(), want)
		}
	}
}
