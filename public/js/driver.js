(function() {
  "use strict";
  var current_deals;

  function clearDeals() {
    let elems = qsa(".three-column > section > section");
    for (const elem of elems) {
      elem.remove();
    }
    let lines = qsa(".line");
    for (const line of lines) {
      line.remove();
    }
  }

  function populateDeals() {
    clearDeals();
    let cols = qsa(".three-column > section");
    let col1 = cols[0];
    let col2 = cols[1];
    let col3 = cols[2];

    for (const i in current_deals) {
      let offer = current_deals[i];

      let store = gen("section");
      let bank = gen("section");
      let input_box = gen("section");

      store.classList.add("flex-container", "column");
      bank.classList.add("flex-container", "column");
      input_box.classList.add("flex-container", "column");

      store.style.height = "150px";
      bank.style.height = "150px";
      input_box.style.height = "150px";
      
      let store_name = gen("h5");
      let store_bid = gen("p");
      let bank_name = gen("h5");
      let bank_bid = gen("p");

      store_name.innerHTML = offer["store_name"];
      store_bid.innerHTML = "$" + offer["store_offer"];
      bank_name.innerHTML = offer["bank_name"];
      bank_bid.innerHTML = "$" + offer["bank_offer"]

      let input = gen("input");
      input.type = "number";
      input.min = "0";
      input.max = offer["driver_offer"];
      input.id = i;
      let submit = gen("input");
      submit.type = "submit";
      submit.addEventListener("click", postBid);

      let label1 = gen("Label");
      label1.setAttribute("for", i);
      label1.innerHTML = "Bid (" + offer["distance"] + " miles): ";

      let label2 = gen("Label");
      label2.setAttribute("for", i);
      label2.innerHTML = "Current top bid: $" + offer["driver_offer"];

      let box = gen("section");
      box.classList.add("flex-container");
      box.appendChild(input);
      box.appendChild(submit);

      let store_contents = gen("p");
      store_contents.innerHTML = offer["contents"].join(", ");
      
      store.appendChild(store_name);
      store.appendChild(store_contents);
      store.appendChild(store_bid);
      bank.appendChild(bank_name);
      bank.appendChild(bank_bid);

      input_box.appendChild(label1);
      input_box.appendChild(box);
      input_box.appendChild(label2);
      
      col1.appendChild(store);
      col2.appendChild(input_box)
      col3.appendChild(bank);

      let line1 = gen("div");
      let line2 = gen("div");
      let line3 = gen("div");
  
      line1.classList.add("line");
      line2.classList.add("line");
      line3.classList.add("line");

      col1.appendChild(line1);
      col2.appendChild(line2);
      col3.appendChild(line3);
          
    }
  }

  async function fetchStoreOffers() {
    await fetch("/getDeals")
    .then(checkStatus)
    .then(response => response.json())
    .then(response => current_deals = response)
  }

  async function postBid(e) {
    console.log("hi");
    await fetchStoreOffers();
    let box = e.target.parentElement;
    let input = box.querySelector("input[type='number'");
    let deal_id = input.id;
    console.log("2")
    if (current_deals[deal_id]["driver_offer"] <= Number(input.value)) {
      console.log("a")
      return;
    }
    if (Number(input.value) + current_deals[deal_id]["store_offer"] <= current_deals[deal_id]["bank_offer"]) {
      console.log("b")
      let transaction = current_deals[deal_id];
      delete current_deals[deal_id];
      displaySuccess(transaction, Number(input.value));
    }
    else {
      console.log("c")
      current_deals[deal_id]["driver_offer"] = Number(input.value);
    }
    
    let req = { method : "POST", body : current_deals };

    await fetch("/postDriverBid",
    { method : "POST", headers: {'Content-Type': 'application/json'}, body : JSON.stringify(current_deals)})
    .then(checkStatus)
    populateDeals();
  }

  function displaySuccess(transaction, bid){
    console.log(transaction);
    console.log(bid);
    let message = gen("section");
    message.classList.add("flex-container", "column", "message")

    let success = gen("div");
    success.classList.add("success");
    let p1 = gen("h3");
    p1.innerHTML = "Great job!"
    let p2 = gen("p");
    p2.innerHTML = "You made the following transaction:"
    let p3 = gen("p");
    p3.innerHTML = transaction["store_name"] + " to " + transaction["bank_name"] + " (" + transaction["distance"] + " miles)";
    let p4 = gen("p");
    p4.innerHTML = "Profit: $" + String(transaction["bank_offer"] - transaction["store_offer"]);

    success.appendChild(p1);
    success.appendChild(p2);
    success.appendChild(p3);
    success.appendChild(p4);
    let bottom_half = gen("div");
    let close_btn = gen("input");
    close_btn.type = "button";
    close_btn.value = "Got it!"

    bottom_half.appendChild(close_btn);
    bottom_half.classList.add("bottom-half", "flex-container");
    close_btn.addEventListener("click", closeTransaction);

    message.appendChild(success);
    message.appendChild(bottom_half);

    let main = qs("main");
    main.appendChild(message);
  }

  function closeTransaction() {
    let transaction = qs(".message");
    transaction.remove();
  }

  async function init() {
    await fetchStoreOffers();
    console.log(current_deals);
    populateDeals();
  }

  init();
})();