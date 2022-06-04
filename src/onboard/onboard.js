import React from "react";
import { Redirect } from "react-router-dom";
import uuid from "uuid/v4";
import "./css.css";
import { ColorContext } from "../context/colorcontext";
const socket = require("../connection/socket").socket;

class CreateNewGame extends React.Component {
  state = {
    didGetUserName: false,
    inputText: "",
    gameId: "",
  };

  constructor(props) {
    super(props);
    this.textArea = React.createRef();
  }

  send = () => {
    const newGameRoomId = uuid();
    this.setState({
      gameId: newGameRoomId,
    });
    socket.emit("createNewGame", newGameRoomId);
  };

  typingUserName = () => {
    const typedText = this.textArea.current.value;
    this.setState({
      inputText: typedText,
    });
  };
  render() {
    return (
      <React.Fragment>
        {this.state.didGetUserName ? (
          <Redirect to={"/game/" + this.state.gameId}></Redirect>
        ) : (
          <div>
            <div style={{ textAlign: "center" }}>
              <img class="logo" src="./CHESS2.jpg" width="300" height="300"></img>
              <h1></h1>

              <button
                style={{ width: 110 + "px", textAlign: "center", marginRight: 80 + "px", marginTop: 40 + "px" }}
                type="button"
                class="btn btn-warning btn-lg"
                data-toggle="modal"
                data-target="#exampleModalCenter"
              >
                Mulai
              </button>

              <div
                class="modal fade"
                id="exampleModalCenter"
                tabindex="-1"
                role="dialog"
                aria-labelledby="exampleModalCenterTitle"
                aria-hidden="true"
              >
                <div class="modal-dialog modal-dialog-centered" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="exampleModalLongTitle">
                        Permainan Baru
                      </h5>
                      <button
                        type="button"
                        class="close"
                        data-dismiss="modal"
                        aria-label="Close"
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>
                    <div class="modal-body">
                      <h5
                        style={{
                          textAlign: "left",
                        }}
                      >
                        Nama{" "}
                        <input
                          placeholder="Masukkan nama disini"
                          style={{
                            marginTop:10+"px",
                            marginBottom:10+"px",
                            width: 100+"%",
                          }}
                          ref={this.textArea}
                          onInput={this.typingUserName}
                        ></input>
                      </h5>
                    </div>
 
                      <button
                        type="button"
                        class="btn btn-primary"
                        data-dismiss="modal"
                        disabled={!(this.state.inputText.length > 0)}
                        onClick={() => {
                          this.props.didRedirect();
                          this.props.setUserName(this.state.inputText);
                          this.setState({
                            didGetUserName: true,
                          });
                          this.send();
                        }}
                      >
                        Lanjut
                      </button>
                 
                  </div>
                </div>
              </div>

              <button
                type="button"
                style={{ width: 110 + "px", textAlign: "center",marginTop: 40 + "px",  }}
                class="btn btn-primary btn-lg"
                data-toggle="collapse"
                data-target="#demo"
              >
                Tentang
              </button>

              <div id="demo" class="collapse in">
                <div class="container">
                <h2 style={{marginTop: 30 + "px", }} class="title">Anggota Kelompok 9 :</h2>
                  <div style={{marginTop: 30 + "px", }} class="row">
                    <div class="col-md-3 col-sm-6">
                      <div class="our-team">
                        <div class="pic">
                          <img src="https://raw.githubusercontent.com/runner95up/last/master/src/chess/assets/pic/vi.jpg"></img>
                        </div>
                        <h3 class="title">Violia Ruana Nur’aini Sagita</h3>
                        <span class="post">21051204004</span>
                      </div>
                    </div>

                    <div class="col-md-3 col-sm-6">
                      <div class="our-team">
                        <div class="pic">
                          <img src="https://raw.githubusercontent.com/runner95up/last/master/src/chess/assets/pic/ar.jpg"></img>
                        </div>
                        <h3 class="title">Aryanti Nur Anisah</h3><br></br>
                        <span class="post">21051204010</span>
                      </div>
                    </div>

                    <div class="col-md-3 col-sm-6">
                      <div class="our-team">
                        <div class="pic">
                          <img src="https://raw.githubusercontent.com/runner95up/last/master/src/chess/assets/pic/ra.jpg"></img>
                        </div>
                        <h3 class="title">Rahmat Hidayatullah</h3>
                        <span class="post">21051204020</span>
                      </div>
                    </div>
                    <div class="col-md-3 col-sm-6">
                      <div class="our-team">
                        <div class="pic">
                          <img src="https://raw.githubusercontent.com/runner95up/last/master/src/chess/assets/pic/sy.jpg"></img>
                        </div>
                        <h3 class="title">Syahril Caesa Mahira</h3>
                        <span class="post">21051204058</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const Onboard = (props) => {
  const color = React.useContext(ColorContext);

  return (
    <CreateNewGame
      didRedirect={color.playerDidRedirect}
      setUserName={props.setUserName}
    />
  );
};

export default Onboard;
