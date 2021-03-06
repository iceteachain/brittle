const Git = require("nodegit");
const Steps = require("cli-step");
const chalk = require("chalk");
const emoji = require("node-emoji");
const { exec } = require("child_process");
const { ContractType } = require("../constant");

module.exports = async (githubUrl, name, type) => {
  if (githubUrl === "") {
    switch (type) {
      case ContractType.WASM:
        githubUrl = "https://github.com/brittle-box/rustea";
        break;
      case ContractType.JS:
        githubUrl = "https://github.com/brittle-box/brittle-template-js-bare";
        break;
      case ContractType.DJS:
        githubUrl = "https://github.com/brittle-box/brittle-template-js-bare";
        break;
      default:
        process.exit(1);
    }
  }

  if (!githubUrl.startsWith("https://github.com/")) {
    githubUrl = `https://github.com/brittle-box/${githubUrl}`;
  }

  if (!name) {
    name = githubUrl.split("/").pop();
  }
  const steps = new Steps(2);
  let oldStep = null;
  steps.startRecording();
  oldStep = steps
    .advance("Cloning", null, `git clone ${githubUrl} ${name}`)
    .start();
  try {
    await Git.Clone(githubUrl, `./${name}`);
  } catch (e) {
    oldStep.error(e);
    process.exit(1);
  }
  oldStep.success("Cloning", "white_check_mark");

  oldStep = steps
    .advance("Fetching packages", null, `npm install --prefix ${name}`)
    .start();
  exec(`npm install --prefix ${name}`, (error, stdout, stderr) => {
    if (error) {
      oldStep.error("Fetching packages failed");
      console.error(error.toString());
      return;
    }
    if (stdout) {
      oldStep.success("Fetching packages", "white_check_mark");
      const lines = [
        "",
        `${emoji.get("rocket")}   Successfully created project`,
        `${emoji.get("point_right")}   Get started with the following commands`,
        "",
        `${chalk.dim("$")} ${chalk.cyan(`cd ${name}`)}`,
        `${chalk.dim("$")} ${chalk.cyan("brittle build")}`,
        ""
      ];
      lines.forEach(line => console.log(line));
    }
  });
};
