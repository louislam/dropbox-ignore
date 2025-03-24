import { assertEquals } from "@std/assert";
import fs from "node:fs";
import { ignore, reset, status } from "./main.ts";

// No assertion in this test, checking the result manually
Deno.test("test status", () => {
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

    try {
        status("test_temp_fail");
    } catch (error) {
        if (error instanceof Error) {
            assertEquals(error.message, "The directory does not exist in this location - test_temp_fail");
        } else {
            throw error;
        }
    }
});
