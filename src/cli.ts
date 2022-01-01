#!/usr/bin/env node
import yargs from "yargs";
import * as fs from "fs";
import render from "./commands/render";
yargs
  .command(
    "build <folder>",
    "generate documentation",
    (yargs: yargs.Argv) => {
      yargs
        .positional("folder", {
          description: "input data folder",
          type: "string",
        })
        .option("dest", {
          alias: "d",
          description: "destination directory",
          default: "./docs",
        });
    },
    async (argv: any) => {
      render(argv);
    }
  )
  .demandCommand(1)
  .help().argv;
