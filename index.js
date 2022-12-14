let cardData = [];
let deckId = "";
let isOn = false;
let cardValues = [];
let balance = 1000;
let betAmt = 0;
const betVolumes = [100, 200, 500, 1000];

const pointText = $(".point-text");
const bankerPointText = $("#banker-point-text");
const playerPointText = $("#player-point-text");
const startBtn = $("#start");
const restartBtn = $("#restart");
const bankerCard = $("#banker-card");
const playerCard = $("#player-card");
const result = $("#result");
const betAmtText = $("#bet-amount-text");
const balanceText = $("#balance-text");
const addBtnGroup = $("#add-btns .btn");
const subtractBtnGroup = $("#subtract-btns .btn");
const gameOverDiv = document.querySelector("#game-over");
const startOverBtn = $("#start-over");

function sendHttpReq(method, url, data) {
  return axios.get(url);
}

function fetchCardsProperties() {
  sendHttpReq(
    "GET",
    "https://www.deckofcardsapi.com/api/deck/new/draw/?count=2"
  )
    .then(({ data }) => {
      cardData = data.cards;
      deckId = data.deck_id;
    })
    .catch((err) => console.error(`Error Msg: ${err}`));
}

startBtn.click(() => {
  addBtnGroup.prop("disabled", true);
  subtractBtnGroup.prop("disabled", true);
  restartBtn.prop("disabled", true);
  startBtn.prop("disabled", true);
  bankerData();
  setTimeout(() => {
    playerData();
  }, 1000);
  setTimeout(() => {
    ranking(cardValues[0], cardValues[1]);
  }, 2000);
});

function newGameBtn() {
  if (isOn) {
    startBtn.css("display", "none");
    restartBtn.css("display", "block");
    pointText.css("display", "inline");
  }
  if (!isOn) {
    startBtn.css("display", "block");
    restartBtn.css("display", "none");
    pointText.css("display", "hidden");
  }
}

function getRndNum(min, max) {
  return Math.random() * (max - min) + min;
}

function bankerData() {
  cardNumberConverter(cardData[0].value);
  bankerCard.append(
    `<img id="banker-card-image" src="${cardData[0].image}" alt="">`
  );
  gsap.from("#banker-card-image", {
    x: getRndNum(0, 800),
    y: -500,
    duration: 0.5,
  });
  bankerPointText.text(cardData[0].value);
}

function playerData() {
  cardNumberConverter(cardData[1].value);
  playerCard.append(
    `<img id="player-card-image" src="${cardData[1].image}" alt="">`
  );
  gsap.from("#player-card-image", {
    x: getRndNum(0, -800),
    y: 500,
    duration: 0.5,
  });

  playerPointText.text(cardData[1].value);
}

function cardNumberConverter(card) {
  if (card === "ACE") {
    cardValues.push(14);
  } else if (card === "JACK") {
    cardValues.push(11);
  } else if (card === "QUEEN") {
    cardValues.push(12);
  } else if (card === "KING") {
    cardValues.push(13);
  } else {
    cardValues.push(parseInt(card));
  }
}

function ranking(banker, player) {
  if (banker === player) {
    balance += betAmt;
    betAmt = 0;
    betAmtText.text(`Your Bet: $${betAmt}`);
    balanceText.text(`Your Current Balance: $${balance}`);
    result.html("<h4>TIE!</h4>");
  } else if (banker > player) {
    betAmt = 0;
    betAmtText.text(`Your Bet: $${betAmt}`);
    balanceText.text(`Your Current Balance: $${balance}`);
    result.html("<h4>YOU LOSE!</h4>");
  } else if (banker < player) {
    balance += betAmt * 2;
    betAmtText.text(`Your Bet: $${betAmt}`);
    balanceText.text(`Your Current Balance: $${balance}`);
    result.html("<h4>YOU WIN!</h4>");
  }
  if (balance <= 0) {
    startBtn.css("display", "none");
    gameOverDiv.classList.replace("d-none", "d-block");
    gsap.fromTo(
      gameOverDiv,
      { y: -1000 },
      { duration: 2, ease: "bounce", y: 0 }
    );
  } else {
    restartBtn.prop("disabled", false);
    isOn = true;
    newGameBtn();
  }
}

restartBtn.click(() => {
  isOn = false;
  newGameBtn();
  playerCard.empty();
  bankerCard.empty();
  result.empty();
  bankerPointText.text("");
  playerPointText.text("");
  fetchCardsProperties();
  cardValues = [];
  betAmt = 0;
  betAmtText.text(`Your Bet: $${betAmt}`);
  balanceText.text(`Your Current Balance: $${balance}`);
  betAmtIs0();
  addBtnGroup.prop("disabled", false);
  subtractBtnGroup.prop("disabled", false);
});

for (let i = 0; i < addBtnGroup.length; i++) {
  addBtnGroup[i].addEventListener("click", () => {
    if (betVolumes[i] <= balance) {
      betAmt += betVolumes[i];
      balance -= betVolumes[i];
      betAmtText.text(`Your Bet: $${betAmt}`);
      balanceText.text(`Your Current Balance: $${balance}`);
    } else if (i === 4) {
      betAmt += balance;
      balance = 0;
      betAmtText.text(`Your Bet: $${betAmt}`);
      balanceText.text(`Your Current Balance: $${balance}`);
    }
    betAmtIs0();
  });
}

for (let i = 0; i < subtractBtnGroup.length; i++) {
  subtractBtnGroup[i].addEventListener("click", () => {
    if (betAmt - betVolumes[i] >= 0) {
      betAmt -= betVolumes[i];
      balance += betVolumes[i];
      betAmtText.text(`Your Bet: $${betAmt}`);
      balanceText.text(`Your Current Balance: $${balance}`);
    } else if (i === 4) {
      balance += betAmt;
      betAmt = 0;
      betAmtText.text(`Your Bet: $${betAmt}`);
      balanceText.text(`Your Current Balance: $${balance}`);
    }
    betAmtIs0();
  });
}

function betAmtIs0() {
  if (betAmt > 0) {
    startBtn.prop("disabled", false);
  } else if (betAmt <= 0) {
    startBtn.prop("disabled", true);
  }
}

startOverBtn.click(() => {
  gsap.fromTo(gameOverDiv, { y: 0 }, { duration: 2, ease: "expo", y: -1000 });
  setTimeout(() => {
    gameOverDiv.classList.replace("d-block", "d-none");
  }, 2000);
  balance = 1000;
  balanceText.text(`Your Current Balance: $${balance}`);
  restartBtn.prop("disabled", false);
  isOn = true;
  newGameBtn();
});

window.addEventListener("load", fetchCardsProperties);
