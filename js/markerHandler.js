var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    if (tableNumber === null) {
      this.asktablenumber();
    }

    //get the dishes collection from firestore database
    var dishes = await this.getDishes();

    //markerFound event
    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(dishes, markerId);
      }
    });

    //markerLost event
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  handleMarkerFound: function (dishes, markerId) {
    alert("marker found");
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    // Changing button div visibility
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    var dish = dishes.filter((dish) => dish.id === markerId[0]);
    if (!dish.unavailable_days.includes(days[todaysDay])) {
      swal({
        title: dish.dish_name.toUpperCase(),
        icon: "warning",
        text: "this dish is not available today",
        timer: 2500,
        button: false,
      });
    } else {
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);
      model.setAttribute("visible", true);

      var mainPlane = document.querySelector(`#main-plane-${dish.id}`);
      var pricePlane = document.querySelector(`#price-plane-${dish.id}`);

      mainPlane.setAttribute("visible", true);
      pricePlane.setAttribute("visible", true);

      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");
      var ordersummaryButton = document.getElementById("order-summary-button");

      // Handling Click Events
      ratingButton.addEventListener("click", function () {
        swal({
          icon: "warning",
          title: "Rate Dish",
          text: "Work In Progress",
        });
      });

      orderButtton.addEventListener("click", () => {
        var tNumber;

        tableNumber == 0 ? (tNumber = `To${tableNumber}`) : `T${tableNumber}`;
        this.handleOrder(tNumber, dish);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "Your order will serve soon on your table!",
        });
      });

      ordersummaryButton.addEventListener("click", () => {
        this.handleOrderSummary();
      });

      // Changing Model scale to initial scale
    }
  },

  handleMarkerLost: function () {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
    alert("marker lost");
  },
  //get the dishes collection from firestore database
  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then((snap) => {
        return snap.docs.map((doc) => doc.data());
      });
  },

  asktablenumber: function () {
    swal({
      title: "welcome to hunger burger!",
      icon: "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png",
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your table number",
          type: "number",
          min: 1,
        },
      },
      closeOnclickOutside: false,
    }).then((inputvalue) => {
      tableNamber = inputvalue;
    });
  },
  handleOrder: function (tNumber, dish) {
    firebase
      .firestore()
      .collection("tabels")
      .doc(tNumber)
      .get()
      .then((doc) => {
        var details = doc.data();

        if (details["current_orders"][dish.id]) {
          details["current_orders"][dish.id]["quantity"] += 1;

          var currentQuantity = details["current_orders"][dish.id]["quantity"];
          details["current_orders"][dish.id]["subtotal"] =
            currentQuantity * dish.price;
        } else
          [
            (details["current_orders"][dish.id] = {
              item: dish.dish_name,
              price: dish.price,
              quantity: 1,
              subtotal: dish.price * 1,
            }),
          ];
        details.total_bills += dish.price;
        firebase.firestore().collection("tabels").doc(doc.id).update(details);
      });
  },

  getOrderSummary: async function (tNumber) {
    return await firebase
      .firestore()

      .collection("tabels")
      .doc(tNumber)
      .get()
      .then((doc) => doc.data());
  },
  handleOrderSummary:function(){

  },
});
