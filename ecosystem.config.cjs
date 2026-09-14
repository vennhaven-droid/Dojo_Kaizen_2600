/** PM2 process already used on the VPS (`pm2 start npm --name dojokaizen -- start`). */
module.exports = {
  apps: [
    {
      name: "dojokaizen",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
