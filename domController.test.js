/**
 * @jest-environment jsdom
 */
const fs = require("fs");
const initialHtml = (document.body.innerHTML = fs.readFileSync("./index.html"));
const { getByText, screen } = require("@testing-library/dom");
const {
  updateItemList,
  handleAddItem,
  checkFormValues,
  handleUndo,
  handlePopstate,
} = require("./domController");


const { clearHistoryHook, detachPopstateHandlers } = require("./testUtils.js");

describe("updateItemList", () => {
  beforeEach(() => {
    document.body.innerHTML = initialHtml;
  });
  beforeEach(() => localStorage.clear());

  test("updates the DOM with the inventory items", () => {
    const inventory = {
      cheesecake: 5,
      "apple pie": 2,
      "carrot cake": 6,
    };
    updateItemList(inventory);
    const itemList = document.getElementById("item-list");
    expect(itemList.childNodes).toHaveLength(3);

    expect(getByText(itemList, "cheesecake - Quantity: 5")).toBeInTheDocument();
    expect(getByText(itemList, "apple pie - Quantity: 2")).toBeInTheDocument();
    expect(
      getByText(itemList, "carrot cake - Quantity: 6")
    ).toBeInTheDocument();
  });
  test("adding a paragraph indicating what was the update", () => {
    const inventory = { cheesecake: 5, "apple pie": 2 };
    updateItemList(inventory);
    expect(
      screen.getByText(
        `The inventory has been updated - ${JSON.stringify(inventory)}`
      )
    ).toBeInTheDocument();
  });
  test("highlighting in red elements whose quantity is below five", () => {
    const inventory = { cheesecake: 5, "apple pie": 2, "carrot cake": 6 };
    updateItemList(inventory);
    expect(screen.getByText("apple pie - Quantity: 2")).toHaveStyle({
      color: "red",
    });
  });
  test("updates the localStorage with the inventory", () => {
    const inventory = { cheesecake: 5, "apple pie": 2 };
    updateItemList(inventory);
    expect(localStorage.getItem("inventory")).toEqual(
      JSON.stringify(inventory)
    );
  });
});

describe("handleAddItem", () => {
  test("adding items to the page", () => {
    const event = {
      preventDefault: jest.fn(),
      target: {
        elements: {
          name: { value: "cheesecake" },
          quantity: { value: "6" },
        },
      },
    };
    handleAddItem(event);
    expect(event.preventDefault.mock.calls).toHaveLength(1);
    const itemList = document.getElementById("item-list");
    expect(getByText(itemList, "cheesecake - Quantity: 6")).toBeInTheDocument();
  });
});

describe("tests with history", () => {
  beforeEach(clearHistoryHook);

  beforeEach(() => jest.spyOn(window, "addEventListener"));

  afterEach(detachPopstateHandlers);
  describe("handleUndo", () => {
    test("going back from a non-initial state", (done) => {
      window.addEventListener("popstate", () => {
        expect(history.state).toEqual(null);
        done();
      });
      history.pushState({ inventory: { cheesecake: 5 } }, "title");
      handleUndo();
    });
    test("going back from an initial state", () => {
      jest.spyOn(history, "back");
      handleUndo();
      expect(history.back.mock.calls).toHaveLength(0);
    });
  });
  describe("handlePopstate", () => {
    test("updating the item list with the current state", () => {
      history.pushState(
        { inventory: { cheesecake: 5, "carrot cake": 2 } },
        "title"
      );
      handlePopstate();
      const itemList = document.getElementById("item-list");
      expect(itemList.childNodes).toHaveLength(2);
      expect(
        getByText(itemList, "cheesecake - Quantity: 5")
      ).toBeInTheDocument();
      expect(
        getByText(itemList, "carrot cake - Quantity: 2")
      ).toBeInTheDocument();
    });
  });
});
