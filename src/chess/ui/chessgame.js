import React from "react";
import Game from "../model/chess";
import Square from "../model/square";
import { Stage, Layer } from "react-konva";
import Board from "../assets/chessBoard.png";
import useSound from "use-sound";
import chessMove from "../assets/moveSoundEffect.mp3";
import Piece from "./piece";
import piecemap from "./piecemap";
import { useParams } from "react-router-dom";
import { ColorContext } from "../../context/colorcontext";
import VideoChatApp from "../../connection/videochat";
import "./tamp.css";
import { Row, Column } from 'react-foundation';
const socket = require("../../connection/socket").socket;

class ChessGame extends React.Component {
  state = {
    gameState: new Game(this.props.color),
    draggedPieceTargetId: "",
    playerTurnToMoveIsWhite: true,
    whiteKingInCheck: false,
    blackKingInCheck: false,
  };

  componentDidMount() {
    console.log(this.props.myUserName);
    console.log(this.props.opponentUserName);
    socket.on("opponent move", (move) => {
      if (move.playerColorThatJustMovedIsWhite !== this.props.color) {
        this.movePiece(
          move.selectedId,
          move.finalPosition,
          this.state.gameState,
          false
        );
        this.setState({
          playerTurnToMoveIsWhite: !move.playerColorThatJustMovedIsWhite,
        });
      }
    });
  }

  startDragging = (e) => {
    this.setState({
      draggedPieceTargetId: e.target.attrs.id,
    });
  };

  movePiece = (selectedId, finalPosition, currentGame, isMyMove) => {
    var whiteKingInCheck = false;
    var blackKingInCheck = false;
    var blackCheckmated = false;
    var whiteCheckmated = false;
    const update = currentGame.movePiece(selectedId, finalPosition, isMyMove);

    if (update === "moved in the same position.") {
      this.revertToPreviousState(selectedId);
      return;
    } else if (update === "user tried to capture their own piece") {
      this.revertToPreviousState(selectedId);
      return;
    } else if (update === "b is in check" || update === "w is in check") {
      if (update[0] === "b") {
        blackKingInCheck = true;
      } else {
        whiteKingInCheck = true;
      }
    } else if (
      update === "b has been checkmated" ||
      update === "w has been checkmated"
    ) {
      if (update[0] === "b") {
        blackCheckmated = true;
      } else {
        whiteCheckmated = true;
      }
    } else if (update === "invalid move") {
      this.revertToPreviousState(selectedId);
      return;
    }

    if (isMyMove) {
      socket.emit("new move", {
        nextPlayerColorToMove: !this.state.gameState.thisPlayersColorIsWhite,
        playerColorThatJustMovedIsWhite:
          this.state.gameState.thisPlayersColorIsWhite,
        selectedId: selectedId,
        finalPosition: finalPosition,
        gameId: this.props.gameId,
      });
    }

    this.props.playAudio();

    this.setState({
      draggedPieceTargetId: "",
      gameState: currentGame,
      playerTurnToMoveIsWhite: !this.props.color,
      whiteKingInCheck: whiteKingInCheck,
      blackKingInCheck: blackKingInCheck,
    });

    if (blackCheckmated) {
      alert("Putih Menang!");
    } else if (whiteCheckmated) {
      alert("Hitam Menang!");
    }
  };

  endDragging = (e) => {
    const currentGame = this.state.gameState;
    const currentBoard = currentGame.getBoard();
    const finalPosition = this.inferCoord(
      e.target.x() + 90,
      e.target.y() + 90,
      currentBoard
    );
    const selectedId = this.state.draggedPieceTargetId;
    this.movePiece(selectedId, finalPosition, currentGame, true);
  };

  revertToPreviousState = (selectedId) => {
    const oldGS = this.state.gameState;
    const oldBoard = oldGS.getBoard();
    const tmpGS = new Game(true);
    const tmpBoard = [];

    for (var i = 0; i < 8; i++) {
      tmpBoard.push([]);
      for (var j = 0; j < 8; j++) {
        if (oldBoard[i][j].getPieceIdOnThisSquare() === selectedId) {
          tmpBoard[i].push(new Square(j, i, null, oldBoard[i][j].canvasCoord));
        } else {
          tmpBoard[i].push(oldBoard[i][j]);
        }
      }
    }

    tmpGS.setBoard(tmpBoard);

    this.setState({
      gameState: tmpGS,
      draggedPieceTargetId: "",
    });

    this.setState({
      gameState: oldGS,
    });
  };

  inferCoord = (x, y, chessBoard) => {
    var hashmap = {};
    var shortestDistance = Infinity;
    for (var i = 0; i < 8; i++) {
      for (var j = 0; j < 8; j++) {
        const canvasCoord = chessBoard[i][j].getCanvasCoord();
        const delta_x = canvasCoord[0] - x;
        const delta_y = canvasCoord[1] - y;
        const newDistance = Math.sqrt(delta_x ** 2 + delta_y ** 2);
        hashmap[newDistance] = canvasCoord;
        if (newDistance < shortestDistance) {
          shortestDistance = newDistance;
        }
      }
    }

    return hashmap[shortestDistance];
  };

  render() {
    return (
      <React.Fragment>
        <div>
          <div
            style={{
              textAlign: "center",
              backgroundImage: `url(${Board})`,
              width: "720px",
              height: "720px",
            }}
          >
            <Stage width={720} height={720}>
              <Layer>
                {this.state.gameState.getBoard().map((row) => {
                  return (
                    <React.Fragment>
                      {row.map((square) => {
                        if (square.isOccupied()) {
                          return (
                            <Piece
                              x={square.getCanvasCoord()[0]}
                              y={square.getCanvasCoord()[1]}
                              imgurls={piecemap[square.getPiece().name]}
                              isWhite={square.getPiece().color === "white"}
                              draggedPieceTargetId={
                                this.state.draggedPieceTargetId
                              }
                              onDragStart={this.startDragging}
                              onDragEnd={this.endDragging}
                              id={square.getPieceIdOnThisSquare()}
                              thisPlayersColorIsWhite={this.props.color}
                              playerTurnToMoveIsWhite={
                                this.state.playerTurnToMoveIsWhite
                              }
                              whiteKingInCheck={this.state.whiteKingInCheck}
                              blackKingInCheck={this.state.blackKingInCheck}
                            />
                          );
                        }
                        return;
                      })}
                    </React.Fragment>
                  );
                })}
              </Layer>
            </Stage>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const ChessGameWrapper = (props) => {
  const domainName = "http://tensai-mono.me";
  const color = React.useContext(ColorContext);
  const { gameid } = useParams();
  const [play] = useSound(chessMove);
  const [opponentSocketId, setOpponentSocketId] = React.useState("");
  const [opponentDidJoinTheGame, didJoinGame] = React.useState(false);
  const [opponentUserName, setUserName] = React.useState("");
  const [gameSessionDoesNotExist, doesntExist] = React.useState(false);

  React.useEffect(() => {
    socket.on("playerJoinedRoom", (statusUpdate) => {
      console.log(
        "Permainan baru : " +
          statusUpdate.userName +
          ", Game id: " +
          statusUpdate.gameId +
          " Socket id: " +
          statusUpdate.mySocketId
      );
      if (socket.id !== statusUpdate.mySocketId) {
        setOpponentSocketId(statusUpdate.mySocketId);
      }
    });

    socket.on("status", (statusUpdate) => {
      console.log(statusUpdate);
      alert(statusUpdate);
      if (
        statusUpdate === "This game session does not exist." ||
        statusUpdate === "There are already 2 people playing in this room."
      ) {
        doesntExist(true);
      }
    });

    socket.on("start game", (opponentUserName) => {
      console.log("START!");
      if (opponentUserName !== props.myUserName) {
        setUserName(opponentUserName);
        didJoinGame(true);
      } else {
        socket.emit("request username", gameid);
      }
    });

    socket.on("give userName", (socketId) => {
      if (socket.id !== socketId) {
        console.log("give userName stage: " + props.myUserName);
        socket.emit("recieved userName", {
          userName: props.myUserName,
          gameId: gameid,
        });
      }
    });

    socket.on("get Opponent UserName", (data) => {
      if (socket.id !== data.socketId) {
        setUserName(data.userName);
        console.log("data.socketId: data.socketId");
        setOpponentSocketId(data.socketId);
        didJoinGame(true);
      }
    });
  }, []);

  return (
    <React.Fragment>
      {opponentDidJoinTheGame ? (
        <div style={{ alignContent: "center", display: "center" }}>
          <nav class="navbar navbar-light bg-light">
            <a class="navbar-brand mx-auto" href="#">
              <img
                class="d-inline-block align-top"
                width="30"
                height="30"
                src={require("./CHESS2.jpg")}
              />
              King Chess
            </a>
          </nav>
<div style={{ display: 'flex',  justifyContent:'center', alignContent: "center", alignItems: "center", marginLeft: "auto", marginRight: "auto"}} >

          <Row>
            <Column>
              <h4> Saya : {props.myUserName} </h4>
              <VideoChatApp
                mySocketId={socket.id}
                opponentSocketId={opponentSocketId}
                myUserName={props.myUserName}
                opponentUserName={opponentUserName}
              />
            </Column>
            <Column>
              <ChessGame
                playAudio={play}
                gameId={gameid}
                color={color.didRedirect}
              />
            </Column>
            <Column>
              <h4> Teman : {opponentUserName} </h4>
              <VideoChatApp
                mySocketId={socket.id}
                opponentSocketId={opponentSocketId}
                myUserName={props.myUserName}
                opponentUserName={opponentUserName}
              />
            </Column>
          </Row>

</div>
        </div>
      ) : gameSessionDoesNotExist ? (
        <div>
          <h1 style={{ textAlign: "center", marginTop: "200px" }}> :( </h1>
        </div>
      ) : (
        <div>
          <div style={{ textAlign: "center" }}>
            <img
              style={{ marginBottom: 50 + "px" }}
              class="logo"
              width="300"
              height="300"
              src={require("./CHESS2.jpg")}
            />
          </div>
          <div class="container">
            <div class="share-options">
              <h3
                style={{
                  textAlign: "center",
                  marginTop: 15 + "px",
                  color: "black",
                }}
              >
                Selamat Datang
              </h3>
              <h1
                style={{
                  textAlign: "center",
                  marginBottom: 15 + "px",
                  color: "black",
                }}
              >
                <strong>{props.myUserName}</strong>
              </h1>

              <div class="link-container">
                <p class="link">{domainName + "/game/" + gameid}</p>
                <button
                  class="copy-btn"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      domainName + "/game/" + gameid
                    )
                  }
                >
                  copy
                </button>
              </div>
              <h4
                style={{
                  textAlign: "center",
                  marginBottom: 5 + "px",
                  marginTop: 15 + "px",
                  color: "black",
                }}
              >
                Bagikan link kepada teman anda diatas untuk bermain.
              </h4>
            </div>
          </div>

          <br></br>

          <h4 style={{ textAlign: "center", marginTop: "10px" }}>
            {" "}
            Menunggu teman anda bergabung...{" "}
          </h4>
        </div>
      )}
    </React.Fragment>
  );
};

export default ChessGameWrapper;
