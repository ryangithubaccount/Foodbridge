(function() {
  "use strict";
  
  var new_deals;
  var current_deals;

  function addItem() {
    let item = qs("#idea");
    let list = qs("#list");
    let elem = gen("li");
    console.log(item);
    console.log(list);
    console.log(elem);
    elem.innerHTML = item.value;
    list.appendChild(elem);
  }

  async function fetchFlamingo() {
    await fetch("/getStoreDeals")
    .then(checkStatus)
    .then(response => response.json())
    .then(response => new_deals = response)
  }

  async function submitPackage() {
    let list = qs("#list");
    console.log(list)
    let store_name = qs("#store_name");
    let retail_price = qs("#retail_price");
    let offer_price = qs("#offer_price");
    console.log(store_name);
    console.log(retail_price);
    console.log(offer_price);

    let items = [];
    for (const child of list.children) {
      items.push(child.innerHTML);
    }

    if (!items) {
      return;
    }
    for (const input of [store_name, retail_price, offer_price]) {
      if (input.value == '') {
        return;
      }
    }

    await fetchFlamingo();
    new_deals[store_name.value] =
      {
        "contents": items,
        "retail_price": retail_price.value,
        "store_offer": offer_price.value
      }
    await fetch("/postStoreBid",
    { method : "POST", headers: {'Content-Type': 'application/json'}, body : JSON.stringify(new_deals)})
    .then(checkStatus)
    toggleView(store_name.value)
  }

  

  function toggleView(store_name) {
    let source1 = qs("#source1");
    let source2 = qs("#source2");
    source1.classList.toggle("hidden");
    source2.classList.toggle("hidden");
    populateSource2(store_name);
  }

  function clearDeals() {
    let elems = qsa("#source2 > section > section > section");
    for (const elem of elems) {
      elem.remove();
    }
  }

  async function fetchStoreOffers() {
    await fetch("/getDeals")
    .then(checkStatus)
    .then(response => response.json())
    .then(response => current_deals = response)
  }

  async function populateSource2(name) {
    await fetchStoreOffers();
    clearDeals();
    console.log(name);
    let cols = qsa("#source2 > section > section");
    let col1 = cols[0];
    let col2 = cols[1];
    let col3 = cols[2];
    var offer;
    for (const i in current_deals) {
      if (current_deals[i]["store_name"] == name) {
        offer = current_deals[i];
      }
    }
    console.log(offer);

    let store = gen("section");
    let bank = gen("section");
    let driver = gen("section");

    store.classList.add("flex-container", "column");
    bank.classList.add("flex-container", "column");
    driver.classList.add("flex-container", "column");

    store.style.height = "120px";
    bank.style.height = "120px";
    driver.style.height = "120px";
    
    let store_name = gen("h5");
    let store_bid = gen("p");
    let bank_name = gen("h5");
    let bank_bid = gen("p");
    let driver_name = gen("h5");
    let driver_bid = gen("p");
    let store_contents = gen("p");
    store_contents.innerHTML = offer["contents"].join(", ");

    console.log(store_name);

    store_name.innerHTML = offer["store_name"];
    store_bid.innerHTML = "$" + offer["store_offer"];
    bank_name.innerHTML = offer["bank_name"];
    bank_bid.innerHTML = "$" + offer["bank_offer"]
    driver_name.innerHTML = offer["driver_name"];
    driver_bid.innerHTML = "$" + offer["driver_offer"]
    
    store.appendChild(store_name);
    store.appendChild(store_contents);
    store.appendChild(store_bid);
    bank.appendChild(bank_name);
    bank.appendChild(bank_bid);
    driver.appendChild(driver_name);
    driver.appendChild(driver_bid);
    
    console.log(col1);

    let line1 = gen("div");
    let line2 = gen("div");
    let line3 = gen("div");

    line1.classList.add("line");
    line2.classList.add("line");
    line3.classList.add("line");

    col1.appendChild(line1);
    col2.appendChild(line2);
    col3.appendChild(line3);

    col1.appendChild(store);
    col2.appendChild(driver);
    col3.appendChild(bank);

    let line4 = gen("div");
    let line5 = gen("div");
    let line6 = gen("div");

    line4.classList.add("line");
    line5.classList.add("line");
    line6.classList.add("line");

    col1.appendChild(line4);
    col2.appendChild(line5);
    col3.appendChild(line6);
          
  } 

  async function init() {
    let add = qs("#add");
    add.addEventListener("click", addItem);
    let submit = qs("input[type='submit']");
    submit.addEventListener("click", submitPackage);
  }

  init();
})();