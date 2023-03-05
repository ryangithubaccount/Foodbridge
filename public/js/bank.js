(function() {
  "use strict";
  var current_deals;
  var new_deals;

  function clearDeals() {
    let elems1 = qsa("#current-deals > section > section > section");
    for (const elem of elems1) {
      elem.remove();
    }
    let elems2 = qsa("#new-deals > section > section > section");
    for (const elem of elems2) {
      elem.remove();
    }
    let lines = qsa(".line");
    for (const line of lines) {
      line.remove();
    }
  }

  function populateNewDeals() {
    clearDeals();
    let cols = qsa("#new-deals > section > section");
    console.log(cols);
    let col1 = cols[0];
    let col2 = cols[1];

    for (const i in new_deals) {
      let offer = new_deals[i];
      console.log(offer);

      let store = gen("section");
      let input_box = gen("section");

      store.classList.add("flex-container", "column");
      input_box.classList.add("flex-container", "column");

      store.style.height = "150px";
      input_box.style.height = "150px";
      
      let store_name = gen("h5");
      let store_bid = gen("p");
      let store_contents = gen("p");

      store_name.innerHTML = i;
      store_bid.innerHTML = "$" + offer["store_offer"];
      store_contents.innerHTML = offer["contents"].join(", ");

      let input = gen("input");
      input.type = "number";
      input.min = "bank_offer";
      input.id = i;
      let submit = gen("input");
      submit.type = "submit";

      let label1 = gen("Label");
      label1.setAttribute("for", i);
      label1.innerHTML = "Bid: ";

      let label2 = gen("Label");
      label2.setAttribute("for", i);
      let top_bid = 0;
      if ("bank_offer" in offer) {
        top_bid = offer["bank_offer"];
      }
      label2.innerHTML = "Current top bid: $" + top_bid;

      let box = gen("section");
      box.classList.add("flex-container");
      box.appendChild(input);
      box.appendChild(submit);
      
      store.appendChild(store_name);
      store.appendChild(store_contents);
      store.appendChild(store_bid);

      input_box.appendChild(label1);
      input_box.appendChild(box);
      input_box.appendChild(label2);
      
      col1.appendChild(store);
      col2.appendChild(input_box);

      let line1 = gen("div");
      let line2 = gen("div");
  
      line1.classList.add("line");
      line2.classList.add("line");

      col1.appendChild(line1);
      col2.appendChild(line2);
          
    }
  }

  function populateCurrentDeals() {
    clearDeals();
    let cols = qsa("#current-deals > section > section");
    let col1 = cols[0];
    let col2 = cols[1];
    let col3 = cols[2];

    for (const i in current_deals) {
      let offer = current_deals[i];

      let store = gen("section");
      let driver = gen("section");
      let input_box = gen("section");

      store.classList.add("flex-container", "column");
      driver.classList.add("flex-container", "column");
      input_box.classList.add("flex-container", "column");

      store.style.height = "150px";
      driver.style.height = "150px";
      input_box.style.height = "150px";
      
      let store_name = gen("h5");
      let store_bid = gen("p");
      let driver_name = gen("h5");
      let driver_bid = gen("p");

      store_name.innerHTML = offer["store_name"];
      store_bid.innerHTML = "$" + offer["store_offer"];
      driver_name.innerHTML = offer["driver_name"];
      driver_bid.innerHTML = "$" + offer["driver_offer"]
      
      let store_contents = gen("p");
      store_contents.innerHTML = offer["contents"].join(", ");

      let input = gen("input");
      input.type = "number";
      input.min = "bank_offer";
      input.id = i;
      let submit = gen("input");
      submit.type = "submit";
      submit.addEventListener("click", postBid);

      let label1 = gen("Label");
      label1.setAttribute("for", i);
      label1.innerHTML = "Bid: ";

      let label2 = gen("Label");
      label2.setAttribute("for", i);
      label2.innerHTML = "Previous bid: $" + offer["bank_offer"];

      let box = gen("section");
      box.classList.add("flex-container");
      box.appendChild(input);
      box.appendChild(submit);
      
      store.appendChild(store_name);
      store.appendChild(store_contents);
      store.appendChild(store_bid);
      driver.appendChild(driver_name);
      driver.appendChild(driver_bid);

      input_box.appendChild(label1);
      input_box.appendChild(box);
      // input_box.appendChild(submit);
      input_box.appendChild(label2);
      
      col1.appendChild(store);
      col2.appendChild(driver);
      col3.appendChild(input_box);

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

  async function fetchCurrentDeals() {
    await fetch("/getDeals")
    .then(checkStatus)
    .then(response => response.json())
    .then(response => current_deals = response)
  }

  async function fetchNewDeals() {
    await fetch("/getStoreDeals")
    .then(checkStatus)
    .then(response => response.json())
    .then(response => new_deals = response)
  }

  async function postBid(e) {
    await fetchCurrentDeals();
    let box = e.target.parentElement;
    let input = box.querySelector("input[type='number'");
    console.log('hi');
    let deal_id = input.id;
    if (current_deals[deal_id]["bank_offer"] >= Number(input.value)) {
      return;
    }
    if (current_deals[deal_id]["store_offer"] + current_deals[deal_id]["driver_offer"] <= Number(input.value)) {
      let transaction = current_deals[deal_id];
      delete current_deals[deal_id];
      displaySuccess(transaction, Number(input.value));
    }
    else {
      current_deals[deal_id]["bank_offer"] = Number(input.value);
    }
    
    let req = { method : "POST", body : current_deals };

    await fetch("/postDriverBid",
    { method : "POST", headers: {'Content-Type': 'application/json'}, body : JSON.stringify(current_deals)})
    .then(checkStatus)
    populateCurrentDeals();
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
    p2.innerHTML = transaction["store_name"] + " to " + transaction["bank_name"];
    let p4 = gen("p");
    p4.innerHTML = "Cost: $" + String(transaction["store_offer"] + transaction["driver_offer"]);

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

  async function switchViews() {
    let view1 = qs("#new-deals");
    let view2 = qs("#current-deals");
    view1.classList.toggle("hidden");
    view2.classList.toggle("hidden");
    if (view1.classList.contains("hidden")) {
      await fetchCurrentDeals();
      populateCurrentDeals();
    }
    else if (view2.classList.contains("hidden")) {
      await fetchNewDeals();
      populateNewDeals();
    }
  }

  async function init() {
    await fetchCurrentDeals();
    console.log(current_deals);
    populateCurrentDeals();
    let btns = qsa("input[type='button']");
    for (const btn of btns) {
      btn.addEventListener("click", switchViews);
    }
    
  }

  init();
})();