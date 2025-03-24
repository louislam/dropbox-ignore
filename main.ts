import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { sync as commandExistsSync } from "command-exists";

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

    const targetPath = path.join(cwd, folder);

    if (action === "status") {
        status(targetPath);
    } else if (action === "ignore") {
        ignore(targetPath);
    } else if (action === "reset") {
        reset(targetPath);
    } else {
        // Print help
        console.log("Usage: di [status|ignore|reset] [folder]");
        console.log("Default folder: node_modules");
        console.log("Default action: ignore");
    }
} catch (error) {
    if (error instanceof Error) {
        console.log(`Error: ${error.message}`);
    }
}

export function status(targetPath: string) {
    checkExist(targetPath);
    const { command, args } = constructPowerShellCommand([
        "Get-Content",
        "-Path",
        `"${targetPath}"`,
        "-Stream",
        "com.dropbox.ignored",
    ]);

    // execute shell command
    const res = childProcess.spawnSync(command, args, {
        windowsVerbatimArguments: false,
    });

    const error = res.stderr.toString("utf-8");

    if (error) {
        if (error.includes("Could not open the alternate data stream 'com.dropbox.ignored'")) {
            console.log("Dropbox is not ignoring this folder.");
        } else {
            throw new Error(error);
        }
    } else {
        const output = res.stdout.toString("utf-8");

        if (output.trim() === "1") {
            console.log("Dropbox is already ignoring this folder.");
        } else {
            console.log("Dropbox is not ignoring this folder.");
        }
    }
}

/**
 * Construct the Powershell command
 * Use Powershell 7 if available
 */
export function constructPowerShellCommand(args: string[]) {
    let command;
    if (commandExistsSync("pwsh")) {
        command = "pwsh";
        args = [
            "-Command",
            ...args,
        ];
    } else {
        command = "powershell";
    }
    return {
        command,
        args,
    };
}

export function ignore(targetPath: string) {
    checkExist(targetPath);

    const { command, args } = constructPowerShellCommand([
        "Set-Content",
        "-Path",
        `"${targetPath}"`,
        "-Stream",
        "com.dropbox.ignored",
        "-Value",
        "1",
    ]);

    const res = childProcess.spawnSync(command, args, {
        windowsVerbatimArguments: false,
    });

    const error = res.stderr.toString("utf-8");

    if (error) {
        throw new Error(error);
    } else {
        console.log(`Dropbox is now ignoring ${targetPath}.`);
    }
}

export function reset(targetPath: string) {
    checkExist(targetPath);

    const { command, args } = constructPowerShellCommand([
        "Set-Content",
        "-Path",
        `"${targetPath}"`,
        "-Stream",
        "com.dropbox.ignored",
        "-Value",
        "0",
    ]);

    const res = childProcess.spawnSync(command, args, {
        windowsVerbatimArguments: false,
    });

    const error = res.stderr.toString("utf-8");

    if (error) {
        throw new Error(error);
    } else {
        console.log(`Dropbox is no longer ignoring ${targetPath}.`);
    }
}

function checkExist(targetPath: string) {
    const exist = fs.existsSync(targetPath);
    if (!exist) {
        throw new Error(`The directory does not exist in this location - ${targetPath}`);
    }
}
