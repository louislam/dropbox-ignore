#!/usr/bin/env node
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

try {
    const cwd = process.cwd();
    const modulesPath = path.join(cwd, "node_modules");

    // check if node_modules exists
    const nodeModulesExist = fs.existsSync(modulesPath);
    if (!nodeModulesExist) {
        throw new Error(`A node_modules directory does not exist in this location - ${cwd}`);
    }

    // shell command
    const platform = process.platform;
    let command;
    let args;

    if (platform === "win32") {
        command = "powershell";
        args = [
            "Set-Content",
            "-Path",
            `"${modulesPath}"`,
            "-Stream",
            "com.dropbox.ignored",
            "-Value",
            1,
        ];
    } else if (platform === "darwin") {
        command = "xattr";
        args = [
            "-w",
            "com.dropbox.ignored",
            "1",
            modulesPath.replace(" ", "\\ "),
        ];
    } else {
        command = "attr";
        args = [
            "-s",
            "com.dropbox.ignored",
            "-V",
            "1",
            modulesPath,
        ];
    }

    // execute shell command
    let res = childProcess.spawnSync(command, args, {
        windowsVerbatimArguments: false,
    });

    let error = res.stderr.toString("utf-8");

    if (error) {
        throw new Error(error);
    } else {
        console.log("Dropbox is now ignoring node_modules.");
    }

} catch (error) {
    console.log(`Error: ${error.message}`);
}
