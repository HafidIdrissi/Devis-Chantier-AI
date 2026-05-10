const { spawn } = require("child_process");

const isWin = process.platform === "win32";

const server = spawn(process.execPath, ["server.js"], {
  stdio: "inherit",
  shell: false,
});

const react = spawn(isWin ? "npm.cmd" : "npm", ["start"], {
  stdio: "inherit",
  shell: false,
  env: { ...process.env, BROWSER: "none" },
});

function stop() {
  server.kill();
  react.kill();
}

process.on("SIGINT", () => {
  stop();
  process.exit(0);
});

server.on("exit", code => {
  if (code) react.kill();
});

react.on("exit", code => {
  server.kill();
  process.exit(code || 0);
});
