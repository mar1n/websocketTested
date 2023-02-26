const data = { inventory: {} };

const API_ADDR = "http://localhost:3000";
const axios = require("axios");

const addItem = (itemName, quantity) => {
  const { client } = require("./socket");
  const currentQuantity = data.inventory[itemName] || 0;
  data.inventory[itemName] = currentQuantity + quantity;
  console.log("Front client id", client.id);
  // const getResponse = async () => {
  //   try {
  //     const response = await axios({
  //       method: "POST",
  //       url: `${API_ADDR}/inventory`,
  //       data: {
  //         quantity,
  //         "x-socket-client-id": client.id
  //       },
  //     });
  
  //     //console.log("data", response.data);
  //     return response.data;
  //   } catch (error) {
  //     //console.log("error", error);
  //   }

  // }
  //getResponse();
  // fetch(`${API_ADDR}/inventory/${itemName}`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "x-socket-client-id": client.id
  //   },
  //   body: JSON.stringify({ quantity })
  // });

  return data.inventory;
};

module.exports = { API_ADDR, data, addItem };
