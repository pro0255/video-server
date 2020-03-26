import { getAll, createUser, deleteUser, getUser, User } from "../users/users";
import { io } from "../index";
import { SignalData } from "simple-peer";
interface SignalingData {
  data: SignalData | null;
  user: string;
  receiver: string;
}
let counter: number = 0;

export const initSocket = (socket: any) => {
  let id: string;
  socket
    .on("Login", async (user_id: string) => {
      id = user_id;
      try {
        const user: User = await createUser(socket, id);
        console.log(`User with ID: ${id} and Socket: ${user.socket.id}`);
      } catch (e) {
        console.log(e);
      }
    })
    .on("disconnect", () => {
      deleteUser(id);
      console.log(`Disconnecting user with id ${socket.id} from server!`);
    })
    .on("EndCall", (data: SignalingData) => {
      console.log(`Sending end call!`);
      const peer: User = getUser(data.user);
      const endSender: User = getUser(data.receiver);
      if (endSender) {
        endSender.isCall = false;
      }
      if (peer) {
        peer.isCall = false;
        peer.socket.emit("EndCall");
        let message: string = `! EndCall from ${data.receiver} !`;
        peer.socket.emit("ServerMessage", message);
      }
    })
    .on("SignalingOffer", (offer: SignalingData) => {
      console.log(`Sending offer`);
      const caller = getUser(offer.user);
      if (caller) {
        caller.isCall = true;
      }
      const receiver: User = getUser(offer.receiver);
      if (receiver && !receiver.isCall) {
        //Receiver existuje a jeste neni v hovoru
        console.log(`Signaling offer from ${offer.user} to ${offer.receiver}`);
        receiver.socket.emit("SignalingOffer", offer);
        receiver.isCall = true;
      } else if (!receiver) {
        //Neexistuje receiver kterej by mohl prijmout hovor
        let message: string = `We did not find receiver with id: ${offer.receiver}`;
        caller.isCall = false;
        caller.socket.emit("EndCall");
        caller.socket.emit("ServerMessage", message);
      } else if (receiver && receiver.isCall) {
        //Receiver exituje ale uz je v hovoru
        /*
                let message: string = `This is a offer from server! ${offer.receiver}`;
                receiver.socket.emit('AnotherOffer', offer);
                socket.emit('EndCall');
                socket.emit('ServerMessage', message);
                 */
        receiver.socket.emit("SignalingOffer", offer);
        receiver.isCall = true;
        console.log(`Offer when receiver already calling! ${offer.receiver}`);
      }
    })
    .on("SignalingAnswer", (answer: SignalingData) => {
      console.log(`Sending answer!`);
      const receiver: User = getUser(answer.receiver);
      if (receiver) {
        console.log(
          `Signaling answer from ${answer.user} to ${answer.receiver}`
        );
        receiver.socket.emit("SignalingAnswer", answer);
      } else {
        receiver.socket.emit("EndCall");
      }
    })
    .on("SendMessage", data => {
      const message_data = JSON.parse(data);
      const receiver: User = getUser(message_data.reciever);
      receiver.socket.emit("Message", data);
    });
};
