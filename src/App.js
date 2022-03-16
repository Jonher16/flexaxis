import "./App.scss";
import Button from "react-bootstrap/Button";
import io from "socket.io-client";
import { useEffect, useState, useMemo, useRef } from "react";
import HeaderNav from "./components/HeaderNav";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Form } from "react-bootstrap";
import JSMpeg from "@cycjimmy/jsmpeg-player";
import GobeJoystickController from "./components/GobeJoystickController";
import $ from "jquery";
import DraggableVideo from "./components/DraggableVideo";
import ControlButtons from "./components/ControlButtons";
import Credentials from "./components/Credentials"

const ffmpegIP = "localhost";
const ENDPOINT = `https://${ffmpegIP}:4001`;
const socket = io(ENDPOINT);

function App() {

  const handleButton = (e, command) => {
    e.preventDefault();
    socket.emit("command", command);
    console.log(`Command ${command} emitted`);
  };

  useEffect(() => {
    socket.on("welcome", (msg) => console.log("From server => ", msg));
    socket.on("streamstatus", (status) => checkStreamStatus(status));
  }, []);

  function checkStreamStatus(status) {
    console.log(status);
    if (status === true) {
      setFlagCredentials(false);
    } else if (status === false) {
      setFlagCredentials(true);
    }
  }

  const handleSubmit = (e, tempcamera) => {
    e.preventDefault();
    setCamera(tempcamera);
    socket.emit("camera", tempcamera);
    alert("Axis camera credentials changed successfuly");
    setFlagCredentials(false);
  };

  const [camera, setCamera] = useState({
    ip: "",
    username: "",
    password: "",
  });

  const [flagCredentials, setFlagCredentials] = useState(true);

  useEffect(() => {
    if (flagCredentials === false) {
      var videoUrl = `wss://${ffmpegIP}:6789/stream`;
      var player = new JSMpeg.VideoElement("#video-canvas", videoUrl, {
        autoplay: true,
      });
      console.log(player);
    }
  }, [flagCredentials]);

  //KEYBOARD LISTENERS

  var flagW = false;
  var flagA = false;
  var flagS = false;
  var flagD = false;
  var flagQ = false;
  var flagE = false;
  var flagSL = false;
  var flagSpace = false;

  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.code === "KeyW" && flagW === false) {
        console.log("W");
        socket.emit("command", "upspeed");
        flagW = true;
      } else if (e.code === "KeyS" && flagS === false) {
        console.log("S");
        socket.emit("command", "downspeed");
        flagS = true;
      } else if (e.code === "KeyA" && flagA === false) {
        console.log("A");
        flagA = true;
        socket.emit("command", "leftspeed");
      } else if (e.code === "KeyD" && flagD === false) {
        console.log("D");
        flagD = true;
        socket.emit("command", "rightspeed");
      } else if (e.code === "KeyQ" && flagQ === false) {
        console.log("Q");
        flagQ = true;
        socket.emit("command", "zoominspeed");
      } else if (e.code === "KeyE" && flagE === false) {
        console.log("E");
        flagE = true;
        socket.emit("command", "zoomoutspeed");
      } else if (e.code === "Space" && flagSpace === false) {
        console.log("Space");
        flagE = true;
      } else if (e.code === "ShiftLeft" && flagSL === false) {
        console.log("ShiftLeft");
        flagE = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.code === "KeyW") {
        // console.log("No W");
        flagW = false;
        socket.emit("command", "stopspeed");
      } else if (e.code === "KeyS") {
        // console.log("No S");
        flagS = false;
        socket.emit("command", "stopspeed");
      } else if (e.code === "KeyA") {
        // console.log("No A");
        flagA = false;
        socket.emit("command", "stopspeed");
      } else if (e.code === "KeyD") {
        console.log("No D");
        flagD = false;
        socket.emit("command", "stopspeed");
      } else if (e.code === "KeyQ") {
        //console.log("No Q");
        flagQ = false;
        socket.emit("command", "stopzoomspeed");
      } else if (e.code === "KeyE") {
        // console.log("No E");
        flagE = false;
        socket.emit("command", "stopzoomspeed");
      } else if (e.code === "Space") {
        console.log("No Space");
        flagSpace = false;
      } else if (e.code === "ShiftLeft") {
        // console.log("No ShiftLeft");
        flagSL = false;
      }
    });
  }, []);

  function editCredentials() {
    setFlagCredentials(true);
    socket.emit("deletestream");
  }

  const restartStream = (e) => {
    e.preventDefault();
    socket.emit("restartstream");
    console.log("Restart stream emitted");
  };

  //JOYSTICK CONTROLS

  let flag_moving = false;
  let lastDirection = "";
  const handleMove = (e) => {
    console.log(e.direction);
    if (flag_moving === false) {
      flag_moving = true;
      switch (e.direction) {
        case "LEFT":
          socket.emit("command", "leftspeed");
          break;
        case "RIGHT":
          socket.emit("command", "rightspeed");
          break;
        case "FORWARD":
          socket.emit("command", "upspeed");
          break;
        case "BACKWARD":
          socket.emit("command", "downspeed");
          break;
      }
    } else if (flag_moving === true && e.direction !== lastDirection) {
      socket.emit("command", "stopspeed");
      switch (e.direction) {
        case "LEFT":
          socket.emit("command", "leftspeed");
          break;
        case "RIGHT":
          socket.emit("command", "rightspeed");
          break;
        case "FORWARD":
          socket.emit("command", "upspeed");
          break;
        case "BACKWARD":
          socket.emit("command", "downspeed");
          break;
      }
    }
    console.log(e);
    lastDirection = e.direction;
  };
  const handleStop = (e) => {
    console.log(e);
    socket.emit("command", "stopspeed");
    flag_moving = false;
  };
  const handleStart = (e) => {
    console.log(e);
  };

  return (
    <>
      <div className="App">
        <HeaderNav />
        {flagCredentials ? (
          <Credentials onClick={handleSubmit} />
        ) : (
          <>
            <DraggableVideo endpoint={ENDPOINT} socket={socket} />
          
            <div className="d-flex justify-content-around mt-2 w-100">
              <Button
                style={{ width: "155px" }}
                onClick={(e) => restartStream(e)}
              >
                Restart Streaming
              </Button>
            </div>
            <div className="d-flex justify-content-around mt-2 w-100">
              <Button
                style={{ width: "155px" }}
                onClick={(e) => editCredentials(e)}
              >
                Edit Camera
              </Button>
            </div>
            {/* <GobeJoystickController
              opacity={0.75}
              move={handleMove}
              stop={handleStop}
              start={handleStart}
            /> */}
          </>
        )}
        <>{/* <ControlButtons onClick={handleButton} /> */}</>
      </div>
    </>
  );
}

export default App;
