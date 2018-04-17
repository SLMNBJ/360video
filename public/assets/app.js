let iframe = null;
let lastRotateDeg = 0;
let rotateDeg = 180;
class DesktopConnection {
  constructor() {
    this.room = "room";
    this.iframe = null;
  }
  sendToRoom(message) {
    console.log("sendToRoom", message);
    this.socket.emit("sendToRoom", {
      room: this.room,
      message: message
    });
  }
  start() {
    console.log("Desktop Connection start...");
    this.socket = io(window.location.origin);
    this.socket.on("connect", () => {
      console.log("Desktop client connected to server");
      this.socket.emit("join", "desktop");
    });

    this.socket.on("roomAssignedToDesktop", room => {
      this.room = room;
      console.log("Your room code is ", room);
      document.querySelector(".code").innerHTML = room;
    });
    this.socket.on("mobileConnected", res => {
      console.log("Device Connected", res);
      pubsub.emit("hideIntro");
    });
    this.socket.on("desktopPanEvent", deltaX => {
      rotateDeg = lastRotateDeg + deltaX * 180 / window.innerWidth * 2;
      OmniVirt.api.sendMessage(
        "longitude",
        rotateDeg,
        document.getElementById("ado-9192")
      );
    });
    this.socket.on("panEnd", deltaX => {
      lastRotateDeg = rotateDeg;
    });

    this.socket.on("disconnect", () => {
      console.log("Desktop client disconnected");
    });
  }
}

new DesktopConnection().start();
pubsub.on("hideIntro", function() {
  TweenLite.to(document.querySelector(".intro"), 1, {
    opacity: 0,
    visibility: "hidden",
    onComplete: () => {
      console.log(
        OmniVirt.api.sendMessage(
          "play",
          true,
          document.getElementById("ado-9192")
        )
      );
    }
  });
});
OmniVirt.api.receiveMessage("loaded", function(type, data, iframe) {
  iframe = iframe;
  console.log("hello world");
  OmniVirt.api.sendMessage("cardboard", "off", iframe);
  OmniVirt.api.sendMessage("pause", true, iframe);
});
