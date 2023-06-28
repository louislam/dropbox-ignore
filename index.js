#!/usr/bin/node

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

try {
    const cwd = process.cwd();

    let folder = "node_modules";

    if (process.argv.length > 3) {
        folder = process.argv[3];
    }

    let action = "ignore";

    if (process.argv.length > 2) {
        action = process.argv[2];
    }

    const modulesPath = path.join(cwd, folder);

    if (action === "status") {
        status(modulesPath);
    } else if (action === "ignore") {
        ignore(modulesPath);
    } else if (action === "reset") {
        reset(modulesPath);
    } else {
        // Print help
        console.log("Usage: di [status|ignore|reset] [folder]");
        console.log("Default folder: node_modules");
        console.log("Default action: ignore");
    }

} catch (error) {
    console.log(`Error: ${error.message}`);
}

function status(modulesPath) {
    checkExist(modulesPath);

    const platform = process.platform;
    let command;
    let args;

    if (platform === "win32") {
        command = "powershell";
        args = [
            "Get-Content",
            "-Path",
            `"${modulesPath}"`,
            "-Stream",
            "com.dropbox.ignored",
        ];

        // execute shell command
        let res = childProcess.spawnSync(command, args, {
            windowsVerbatimArguments: false,
        });

        let error = res.stderr.toString("utf-8");

        if (error) {
            if (error.includes("Could not open the alternate data stream 'com.dropbox.ignored'")) {
                console.log("Dropbox is not ignoring this folder.");
            } else {
                throw new Error(error);
            }
        } else {
            let output = res.stdout.toString("utf-8");

            if (output.trim() === "1") {
                console.log("Dropbox is already ignoring this folder.");
            } else {
                console.log("Dropbox is not ignoring this folder.");
            }
        }

    } else if (platform === "darwin") {
        // TODO: Not tested
        command = "xattr";
        args = [
            "-p",
            "com.dropbox.ignored",
            modulesPath.replace(" ", "\\ "),
        ];
    } else {
        // TODO: Not tested
        command = "attr";
        args = [
            "-g",
            "com.dropbox.ignored",
            modulesPath,
        ];
    }
}

function ignore(modulesPath) {
    checkExist(modulesPath);

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
        console.log(`Dropbox is now ignoring ${modulesPath}.`);
    }
}

function reset(modulesPath) {
    checkExist(modulesPath);

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
            0,
        ];
    } else if (platform === "darwin") {
        command = "xattr";
        args = [
            "-w",
            "com.dropbox.ignored",
            "0",
            modulesPath.replace(" ", "\\ "),
        ];
    } else {
        command = "attr";
        args = [
            "-s",
            "com.dropbox.ignored",
            "-V",
            "0",
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
        console.log(`Dropbox is no longer ignoring ${modulesPath}.`);
    }
}

function checkExist(modulesPath) {
    // check if node_modules exists
    const nodeModulesExist = fs.existsSync(modulesPath);
    if (!nodeModulesExist) {
        throw new Error(`The directory does not exist in this location - ${modulesPath}`);
    }
}
