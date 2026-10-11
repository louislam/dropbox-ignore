import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { ignore, reset, status } from "./main.ts";

test("test status", () => {
    if (!fs.existsSync("test_temp")) {
        fs.mkdirSync("test_temp");
    }

    console.log("Test: initial status");

    status("test_temp");

    console.log("Test: try to ignore");

    ignore("test_temp");

    status("test_temp");

    console.log("Test: try to reset");

    reset("test_temp");

    status("test_temp");

    fs.rmdirSync("test_temp");

    assert.throws(
        () => status("test_temp_fail"),
        { message: "The directory does not exist in this location - test_temp_fail" },
    );
});
