#!/usr/bin/env node
import yargs from "yargs";
import * as fs from "fs";
import render from "./commands/render";
import scaffold from "./commands/scaffold";
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
        })
        .option("baseurl", {
          description: "baseurl to prepend to links",
          default: "",
        });
    },
    async (argv: any) => {
      render(argv);
    }
  )
  .command(
    "scaffold <folder>",
    "create a sample input folder",
    (yargs: yargs.Argv) => {
      yargs.positional("folder", {
        description: "destination folder",
        type: "string",
      });
    },
    async (argv: any) => {
      scaffold(argv);
    }
  )
  .demandCommand(1)
  .strict()
  .help().argv;
