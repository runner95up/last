import io from 'socket.io-client'

const URL = 'https://powerful-headland-92368.herokuapp.com/'

const socket = io(URL)

var mySocketId

socket.on("createNewGame", statusUpdate => {
    console.log("Permainan baru : " + statusUpdate.userName + ", User Id : " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
    mySocketId = statusUpdate.mySocketId
})

export {
    socket,
    mySocketId
}
