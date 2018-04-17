const path = require("path");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const randomstring = require("randomstring");
const MobileDetect = require("mobile-detect");
const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "../public/assets");
let md = null;

app.use(express.static(publicPath));

app.get("/", (req, res) => {
  console.log("request index");
  md = new MobileDetect(req.headers["user-agent"]);
  if (md.mobile() || md.tablet()) {
    res.redirect("/mobile");
  } else {
    console.log("request index");
    res.sendFile("desktop.html", { root: path.join(__dirname, "../public") });
  }
});

app.get("/mobile", (req, res) => {
  console.log("request mobile");
  res.sendFile("mobile.html", { root: path.join(__dirname, "../public") });
});

app.get("*", (req, res) => {
  console.log("request generic");
  md = new MobileDetect(req.headers["user-agent"]);
  if (md.mobile() || md.tablet()) {
    res.redirect("/mobile");
  } else {
    res.redirect("/");
  }
});

io.on("connection", socket => {
  const code = randomstring.generate(5).toUpperCase();
  socket.on("join", type => {
    if (type === "desktop") {
      socket.join(code);
      socket.emit("roomAssignedToDesktop", code);
    }
  });
  socket.on("mobileSendCode", code => {
    if (io.sockets.adapter.rooms[code] !== undefined) {
        if(io.sockets.adapter.rooms[code].length === 1) {
            socket.join(code);
            io.to(code).emit("mobileConnected", true);
        } else {
        console.log(io.sockets.adapter.rooms[code].length);
        }
    }
  });
  socket.on("mobilePanEvent", opt => {
    socket.broadcast.to(opt.room).emit("desktopPanEvent", opt.deltaX);
  });
  socket.on("panEnd", opt => {
    socket.broadcast.to(opt.room).emit("panEnd");
  });
  socket.on("disconnect", reason => {
    console.log("disconnected");
  });
});
server.listen(PORT, () => console.log("Server is running..."));
