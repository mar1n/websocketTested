const { addItem, data } = require("./inventoryController");

describe("addItem", () => {
  test("adding new items to the inventory", async () => {
    data.inventory = {};
    await addItem("cheesecake", 5);
    expect(data.inventory.cheesecake).toBe(5);
  });
});
