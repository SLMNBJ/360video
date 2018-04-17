class MobileConnection {
  constructor() {
    this.room = "room";
    this.pubsub = pubsub;
  }
  sendToRoom(message) {
    console.log("sendToRoom", message);
    this.socket.emit("sendToRoom", {
      room: this.room,
      message: message
    });
  }
  start() {
    console.log("Mobile Connection start...");
    this.socket = io(window.location.origin);
    this.socket.on("connect", () => {
      console.log("Desktop client connected to server");
      this.socket.emit("join", { type: "mobile" });
    });

    document.querySelector("form").addEventListener("submit", e => {
      e.preventDefault();
      this.room = document.querySelector("input").value.toUpperCase();
      this.socket.emit("mobileSendCode", this.room);
      document.querySelector("input").value = "";
    });
    this.socket.on("mobileConnected", res => {
      console.log("Device Connected", res);
      this.pubsub.emit("intro:hideCta");
    });

    this.socket.on("disconnect", () => {
      console.log("Desktop client disconnected");
    });
    this.initListeners();
  }
  initListeners() {
    this.pubsub.on("intro:hideCta", () => {
      TweenLite.to(document.querySelector(".intro"), 1, {
        opacity: 0,
        visibility: "hidden",
        onComplete: () => {
          TweenMax.to(document.querySelector(".video-control__icon"), 1, {
            x: "20%"
          });
          TweenMax.to(document.querySelector(".video-control__icon"), 1, {
            x: "-120%",
            delay: 0.8
          });
          TweenMax.to(document.querySelector(".video-control__icon"), 1, {
            x: "-50%",
            delay: 1.8,
            onComplete: () => this.pubsub.emit("trackPan")
          });
        }
      });
    });
    this.pubsub.on("trackPan", () => {
      let panEl = document.querySelector(".video-control");
      let mc = new Hammer(panEl);
      mc.get("pan").set({ direction: Hammer.DIRECTION_ALL });
      mc.on("panleft panright panend", e => {
        console.log(e.type);
        if (e.type !== "panend") {
          this.socket.emit("mobilePanEvent", {
            room: this.room,
            deltaX: e.deltaX
          });
        } else {
          this.socket.emit("panEnd", {
            room: this.room
          });
        }
      });
    });
  }
}
new MobileConnection().start();
