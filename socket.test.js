/**
 * @jest-environment jsdom
 */
const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

 const fs = require("fs");
 const intialHtml = fs.readFileSync("./index.html");
 
 const { getByText } = require("@testing-library/dom");
 const { data } = require("./inventoryController");
 const { start, stop, sendMsg } = require("./testSocketServer");
 
 const { handleAddItemMsg, connect } = require("./socket");
 
 beforeEach(() => {
   document.body.innerHTML = intialHtml;
 });
 beforeEach(() => {
   data.inventory = {};
 });
 
 describe("handleAddItemMsg", () => {
   test("updating the inventory and the item list", () => {
     handleAddItemMsg({ itemName: "cheesecake", quantity: 6 });
     expect(data.inventory).toEqual({ cheesecake: 6 });
     const itemList = document.getElementById("item-list");
     expect(itemList.childNodes).toHaveLength(1);
     expect(getByText(itemList, "cheesecake - Quantity: 6")).toBeInTheDocument();
   });
 });
describe("web socket", () => {
  let io, serverSocket, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  beforeAll(async () => {
    await connect();
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test("should work", (done) => {
    clientSocket.on("hello", (arg) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  test("should work (with ack)", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg) => {
      expect(arg).toBe("hola");
      done();
    });
  });
  test('handling add_item messages', async () => { 
    serverSocket.emit("add_item", { itemName: "cheesecake", quantity: 6 });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(data.inventory).toEqual({ cheesecake: 6 });
    const itemList = document.getElementById("item-list");
    expect(itemList.childNodes).toHaveLength(1);
    expect(getByText(itemList, "cheesecake - Quantity: 6")).toBeInTheDocument();
   })
});