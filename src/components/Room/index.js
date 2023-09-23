/* eslint-disable */
import { Button, Grid, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {Videocam, VideocamOff, Mic, MicOff, ScreenShare, StopScreenShare, Call, CallEnd } from "@mui/icons-material";
import useAuth from 'src/hooks/useAuth';

const socket = io.connect(process.env.REACT_APP_VIDEO_SERVER);

const UserVideo = ({ stream, peerId, handleOnClick, name }) => {
  const userVideo = useRef();

  useEffect(() => {
    userVideo.current.srcObject = stream;
  }, [stream]);

  return (
    <Grid item md={12} xs={4} style={{ textAlign: "center" }}>
      <h2>{name}</h2>
      <video
        playsInline
        ref={userVideo}
        autoPlay
        style={{ maxWidth: "90%", borderRadius: "10px", display: "block", margin: "auto" }}
      />
      <Button variant="contained" onClick={() => handleOnClick(peerId)} style={{margin: "10px"}}>Dame click</Button>
    </Grid>
  );
};

const MainVideo = ({ stream }) => {
  const video = useRef();

  useEffect(() => {
    video.current.srcObject = stream;
  }, [stream]);

  const handleOnClick = () => {
    var el = document.getElementById("full-screenVideo");
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };

  return (
    <video
      playsInline
      muted
      ref={video}
      autoPlay
      style={{
        maxWidth: "90%",
        borderRadius: "10px",
        display: "block",
        margin: "auto"
      }}
      id="full-screenVideo"
      onClick={handleOnClick}
    />
  );
};

const Room = () => {
  const { roomId } = useParams();
  const [message, setMessage] = useState();
  const [me, setMe] = useState("");
  const [users, setUsers] = useState([]);
  const [stream, setStream] = useState();
  const [devices, setDevices] = useState({ video: true, audio: true });
  const [sharing, setSharing] = useState(false);
  const [screenStream, setScreenStream] = useState();
  const [peers, setPeers] = useState([]);
  const peersRef = useRef([]);
  const myVideo = useRef();
  const [joinedMeeting, setJoinedMeeting] = useState(false);
  const [userStream, setUserStream] = useState([]);
  const [userShareScreen, setUserShareScreen] = useState();
  const [mainStream, setMainStream] = useState();
  const peerIdMainStream = useRef();
  const { user } = useAuth();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia(devices).then((stream) => {
      setStream(stream);
      setMainStream(stream);
      myVideo.current.srcObject = stream;
    });

    socket.on("me", (id) => {
      setMe(id);
    });

    return () => {
      socket.off("me");
      socket.off("getParticipants");
      socket.off("newUser");
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("responseToShareScreen");
      socket.off("userShareScreen");
      socket.off("userEndShareScreen");
      setStream();
    };
  }, []);

  useEffect(() => {
    socket.on("userShareScreen", (data) => {
      let { user } = data;
      let userStreamObj = userStream.find(({ peerId }) => peerId == user);
      if (userStreamObj != undefined) {
        setUserShareScreen(user);
      }
    });

    return () => {
      socket.off("userShareScreen");
    };
  }, [userStream]);

  const handleOnClickJoinMeeting = () => {
    socket.off("getParticipants");
    socket.off("newUser");
    socket.off("callUser");
    socket.off("callAccepted");
    socket.off("callEnd");
    socket.off("responseToShareScreen");
    socket.off("userShareScreen");
    socket.off("userEndShareScreen");

    socket.on("getParticipants", (data) => {
      let { participants, message } = data;
      const peers = [];
      participants.forEach(async (participant) => {
        callUser(participant);
      });

      setMessage(message);
      setUsers([...participants]);
    });

    socket.on("newUser", (data) => {
      setUsers((users) => [...users, data.id]);
    });

    socket.on("callUser", (data) => {
      answerCall(data.from, data.signal, data.name);
    });

    socket.on("callAccepted", (data) => {
      let { signal, from, name } = data;
      try {
        let item = peersRef.current.find((p) => p.peerId === from);
        item.name = name;
        item.peer.signal(signal);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("callEnd", (data) => {
      setUserStream((userStream) =>
        userStream.filter(({ peerId }) => data.from !== peerId)
      );
      peersRef.current = peersRef.current.filter(
        ({ peerId }) => data.from !== peerId
      );

      if(data.from == peerIdMainStream.current){
        setMainStream(stream);
        peerIdMainStream.current = undefined;
      }
    });

    socket.on("userEndShareScreen", (data) => {
      setUserShareScreen(undefined);
    });

    socket.emit("joinRoom", { from: socket.id, roomId: roomId });
    setJoinedMeeting(true);
  };

  const handleOnClickExitMeeting = () => {
    socket.emit("callEnd", { from: socket.id });
    for (const obj of peersRef.current) {
      try {
        obj.peer.destroy();
      } catch (error) {
        console.log(error);
      }
    }
    // Clear
    peersRef.current = [];
    setUserStream([]);
    setPeers([]);
    setJoinedMeeting(false);
    setMainStream(stream);
    peerIdMainStream.current = undefined;
  };

  const handleOnClickCamera = async () => {
    let stateCamera = !devices.video;
    stream.getVideoTracks().forEach(async (track) => {
      track.enabled = devices.video ? false : true;
    });
    setStream(stream);
    setDevices((devices) => {
      return { ...devices, video: stateCamera };
    });
  };

  const handleOnClickMic = async () => {
    let stateMic = !devices.audio;
    stream.getAudioTracks().forEach(async (track) => {
      track.enabled = devices.audio ? false : true;
    });
    setStream(stream);
    setDevices((devices) => {
      return { ...devices, audio: stateMic };
    });
  };

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      },
    });

    // 4. SE EMITE LA SEÑAL
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: socket.id,
        name: user.person.fullName,
      });
    });

    peer.on("stream", (stream) => {
      let item = peersRef.current.find((peerObj) => peerObj.peerId == id);
      let name = item != undefined? item.name : ""; 
      setUserStream((userStream) => [...userStream, { peerId: id, stream, name }]);
    });

    peersRef.current.push({ peerId: id, peer });
    setPeers((peers) => [...peers, peer]);

    // return peer;
  };

  const answerCall = (id, signal, name) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      },
    });

    // 7. EMITIR EVENTO
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: id, from: socket.id, name: user.person.fullName });
    });

    peer.on("stream", (stream) => {
      setUserStream((userStream) => [...userStream, { peerId: id, stream, name: name }]);
    });

    // 7. EMITIR EVENTO
    peer.signal(signal);

    peersRef.current.push({ peerId: id, peer, name: name });
    setPeers((peers) => [...peers, peer]);
  };

  const switchStream = (screenShareStream) => {
    setSharing(true);
    peersRef.current.forEach(({ peer }) => {
      peer.replaceTrack(
        stream.getVideoTracks()[0],
        screenShareStream.getVideoTracks()[0],
        stream
      );
    });
  };

  const shareScreen = () => {
    if (!sharing) {
      socket.off("responseToShareScreen");

      socket.on("responseToShareScreen", (data) => {
        let { from, message } = data;
        if (message === "OK") {
          // alert(`Message from server: ${message}`);
          navigator.mediaDevices
            .getDisplayMedia({ video: true, audio: true })
            .then((screenShareStream) => {
              screenShareStream.oninactive = () => {
                // Emitir evento "endShareScreen"
                socket.emit("endShareScreen", { from: socket.id });
                peersRef.current.forEach(({ peer }) => {
                  peer.replaceTrack(
                    stream.getVideoTracks()[0],
                    myVideo.current.srcObject.getVideoTracks()[0],
                    stream
                  );
                });
                setSharing(false);
                setScreenStream(null);
              };
              setScreenStream(screenShareStream);
              switchStream(screenShareStream);
            });
        }
      });

      // Emit 'requestToShareScreen' event
      socket.emit("requestToShareScreen", { from: socket.id });

      /* navigator.mediaDevices
        .getDisplayMedia({ video: true, audio: true }).then((screenShareStream) => {
          screenShareStream.oninactive = () => {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(stream.getVideoTracks()[0], myVideo.current.srcObject.getVideoTracks()[0], stream);
            });
            setSharing(false);
            setScreenStream(null);
          }
          setScreenStream(screenShareStream);
          switchStream(screenShareStream);
        }); */
    } else {
      // Emitir evento "endShareScreen"
      socket.emit("endShareScreen", { from: socket.id });
      screenStream.getTracks().forEach(async(track) => track.stop());
      peersRef.current.forEach(({ peer }) => {
        peer.replaceTrack(
          stream.getVideoTracks()[0],
          myVideo.current.srcObject.getVideoTracks()[0],
          stream
        );
      });
      setSharing(false);
      setScreenStream(null);
    }
  };

  const switchMainVideo = (peerId) => {
    if (peerId == undefined) {
      setMainStream(stream);
      peerIdMainStream.current = undefined;
    } else {
      let peerObj = userStream.find((obj) => obj.peerId === peerId);
      if (peerObj != undefined) {
        setMainStream(peerObj.stream);
        peerIdMainStream.current = peerObj.peerId;
      }
    }
  };

  return (
    <div
      style={{
        paddingLeft: "15px",
        paddingTop: "15px",
        maxHeight: "100vh",
        overflow: "auto",
      }}
    >
      <Grid container>
        <Grid item xs={9}>
          {/* {userShareScreen && (
            <Grid container>
              <UserShareScreen stream={userStreamShareScreen} />
            </Grid>
          )} */}
          <Grid container>
            <Grid
              item
              md={8}
              xs={12}
              style={{
                textAlign: "center",
                background: "#282828",
                color: "white",
              }}
            >
              <h2>Transmitiendo {stream ? " prendido" : " apagado"}</h2>

              <MainVideo stream={mainStream} />
              {/* {!devices.video && (
                <div style={{ width: "50%", height: "40vh" }}>
                  <img
                    src={require("../assets/user.png")}
                    style={{
                      height: "100%",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                </div>
              )} */}
              <Grid container style={{margin: "0.5rem"}}>
                <Grid item md={4} sm={2}></Grid>
                <Grid item md={4} sm={8} style={{backgroundColor: "rgba(254,114,1)", borderRadius: "30px", boxShadow: "2px 4px rgb(60, 60, 60)"  }}>
                  <Grid container spacing={2}>
                    <Grid item xs={3} style={{ textAlign: "center" }}>
                      <IconButton onClick={handleOnClickCamera}>
                        {devices.video ? <Videocam /> : <VideocamOff />}
                      </IconButton>
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: "center" }}>
                      <IconButton onClick={handleOnClickMic}>
                        {devices.audio ? <Mic /> : <MicOff />}
                      </IconButton>
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: "center" }}>
                      <IconButton
                        onClick={shareScreen}
                        disabled={!joinedMeeting || userShareScreen != undefined}
                      >
                        {!sharing ? <ScreenShare /> : <StopScreenShare />}
                      </IconButton>
                    </Grid>
                    <Grid item xs={3} style={{ textAlign: "center" }}>
                      {!joinedMeeting ? (
                        <IconButton onClick={handleOnClickJoinMeeting}>
                          <Call />
                        </IconButton>
                      ) : (
                        <IconButton onClick={handleOnClickExitMeeting}>
                          <CallEnd />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item md={4} sm={2}></Grid>
              </Grid>
            </Grid>
            <Grid
              container
              md={4}
              xs={12}
              style={{
                textAlign: "center",
                background: "#282828",
                color: "white",
                overflow: "scroll",
                maxHeight: "100vh"
              }}
            >
              {/* Me */}
              <Grid item md={12} xs={4} style={{ textAlign: "center" }}>
                <h2>{user.person.fullName} (yo)</h2>
                <video
                  playsInline
                  ref={myVideo}
                  autoPlay
                  muted
                  style={{ maxWidth: "90%", borderRadius: "10px", display: "block", margin: "auto" }}
                />
                <Button variant="contained" onClick={() => switchMainVideo()} style={{margin: "10px"}}>Dame click</Button>
              </Grid>

              {userStream.map(({ peerId, stream, name }) => (
                <UserVideo
                  stream={stream}
                  key={`user-video-stream-${peerId}`}
                  handleOnClick={switchMainVideo}
                  peerId={peerId}
                  name={name}
                />
              ))}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={3}></Grid>
      </Grid>
      {/* <Grid
        container
        style={{
          position: "fixed",
          bottom: "20px",
          width: "100%",
        }}
      >
        <Grid container xs={8}>
          <Grid item md={2} sm={2}></Grid>
          <Grid item md={4} sm={8}>
            <div
              style={{
                borderRadius: "30px",
                backgroundColor: "rgba(254,114,1)",
                boxShadow: "2px 4px rgb(60, 60, 60) ",
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={3} style={{ textAlign: "center" }}>
                  <IconButton onClick={handleOnClickCamera}>
                    {devices.video ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                </Grid>
                <Grid item xs={3} style={{ textAlign: "center" }}>
                  <IconButton onClick={handleOnClickMic}>
                    {devices.audio ? <Mic /> : <MicOff />}
                  </IconButton>
                </Grid>
                <Grid item xs={3} style={{ textAlign: "center" }}>
                  <IconButton
                    onClick={shareScreen}
                    disabled={!joinedMeeting || userShareScreen != undefined}
                  >
                    {!sharing ? <ScreenShare /> : <StopScreenShare />}
                  </IconButton>
                </Grid>
                <Grid item xs={3} style={{ textAlign: "center" }}>
                  {!joinedMeeting ? (
                    <IconButton onClick={handleOnClickJoinMeeting}>
                      <Call />
                    </IconButton>
                  ) : (
                    <IconButton onClick={handleOnClickExitMeeting}>
                      <CallEnd />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Grid item md={4} sm={2}></Grid>
        </Grid>
      </Grid> */}
    </div>
  );
};


// const Room = () => {
//   return <h1>Hello world</h1>
// }

export default Room;

/* eslint-enable */