const express = require("express");
const socket = require("socket.io");
import { initSocket } from "./socket/socket";

const PORT = 8000;

const app = express();
const server = app.listen(PORT, () => {
  console.log(`Server is listening on port => ${PORT}`);
});

export const io = socket(server);

io.on("connection", initSocket);