const gameState = {//holds the game state as a global variable
  pid: -1,
  trialCnt: -1,
  trialState: "waitInit",
  timeOutTimerHnd: -1,
  log: [],
  maxTrials: 10, //<=======UPDATE THIS TO 60 WHEN RUNNING EXPERIMENTS WITH PARTICIPANTS
  gameStart: -1,
  center: "",
  mole: "",
};

window.addEventListener("load", function () {
  //when everything is loaded, this sets up the game
  console.log("Bello!");
  document.querySelector(".fa-links").style.display = "none";
  if(gameState.maxTrials==10){
    console.warn("REMINDER: Update gameState.maxTrials to correct value before running experiment with participants");
  }
  initGame();
});

const initGame = function () {
  //assign a random 6 digit number as a participant id
  gameState.pid = Math.floor(Math.random() * 900000) + 1000000;
  gameState.gameStart = Date.now();
  updateMoleParams(false, false, true); //not visible, not clickable, and transparent,
  document.querySelector("a-scene").camera.parent.position.y = 0; //reset the camera position
  document.querySelector(".center").classList.add("clickable"); //make start button clickable
  document.addEventListener("raycastEvent", handleInteraction); //enable the event model
  document.addEventListener("logEvent", handleLogEvents); //log data
  document
    .querySelector(".mole")
    .addEventListener("animationcomplete", moleHidden);
};

const readyToStartTrial = function () {
  gameState.trialState = "waitStartClick";
  gameState.trialCnt++;

  if (gameState.trialCnt < gameState.maxTrials) {
    console.info("FN: Trial:", gameState.trialCnt, "Ready to start trial");
    gameState.log.push({
      tid: -1,
      startTS: -1,
      rndDelayStart: -1,
      rndDelay: -1,
      rndDelayEnd: -1,
      moleStats: "",
      userMoveStart: -1,
      userEnterMole: -1,
      userClickMole: -1,
      hitSuccess: "-",
    });
    document.querySelector(".warn").classList.remove("blink");
    document.querySelector(".warn").style = "display:none";
    gameState.center = document.querySelector(".center");
    gameState.center.classList.add("clickable"); //make start button clickable
    gameState.center.setAttribute("color", "darkgreen"); //indicate trial is ready to start
    updateMoleParams(false, false, true); //not visible, not clickable, and transparent
    raiseEvent("readyStart", "logEvent", gameState.trialCnt);
  } else {
    //experiment ended
    console.info("FN: Experiment ended. Exporting data...");
    exportExperimentLog();
    displayEndAnim();
  }
};

const startTrial = function () {
  console.info("FN: Trial:", gameState.trialCnt, "Trial started, wait random delay");
  gameState.trialState = "waitRandomDelay";
  const randomWaitTime = Math.floor(Math.random() * 2000) + 1000; //between 1s-3s
  raiseEvent("randomDelayStart", "logEvent", randomWaitTime); //log the start of random wait
  setTimeout(randomWaitEnded, randomWaitTime);
  gameState.center.setAttribute("color", "silver");
};

const randomWaitEnded = function () {
  console.info("FN: Trial:", gameState.trialCnt, "Wait end, display mole");
  raiseEvent("randomDelayEnd", "logEvent", "");
  gameState.trialState = "waitTrialEnd"; //can end with success or timeout

  //displaying mole
  let molePos = positionMole(); //this function will position the mole, make it visible, return the x,y,scale values of mole
  let hitTimeout = getTimeout(); //how long does the mole stay visible

  //prepare for failed trial
  gameState.timeOutTimerHnd = setTimeout(userTooSlow, hitTimeout);

  //log the mole position
  raiseEvent("hitWait", "logEvent", molePos + "," + hitTimeout);
};

const userTooSlow = function () {
  console.info("FN: Trial:", gameState.trialCnt, "User too slow, trial failed");
  gameState.trialState = "trialEnded";
  raiseEvent("userTooSlow", "logEvent", "");

  //mole hidden for next trial
  hideMole(false);
};

const displayEndAnim = function () {
  gameState.center.classList.remove("clickable");
  positionMole();
  updateMoleParams(true, false, false);
  setInterval(positionMole, 750);
};

const userClickedMole = function () {
  //first cancel timeout
  clearTimeout(gameState.timeOutTimerHnd);
  console.info(
    "FN: Trial:",
    gameState.trialCnt,
    "User hit mole, trial success"
  );
  gameState.trialState = "trialEnded";
  raiseEvent("userClickedMole", "logEvent", "");
  hideMole(true);
};

const handleInteraction = function (evt) {
  //all raycastEvents come here
  const el = evt.detail.el;
  const ts = evt.detail.timeStamp;
  const action = evt.detail.action;

  switch (gameState.trialState) {
    case "waitInit": //mole invisible, we are waiting for user to position mouse pointer inside center button
      if (Math.abs(ts - gameState.gameStart) < 500) return; //ignore the first mouseEnter event
      if (action == "mouseEnter") {
        //first enter event
        //user has positioned mouse inside the center button
        readyToStartTrial();
        return;
      }
      break;
    case "waitStartClick": //mole invisible, awaiting user to click. User can drift off but we don't need to log this
      if (action == "mouseClick") {
        //user has clicked the center button
        startTrial();
        return;
      }
      break;
    case "waitRandomDelay": //during this time we should not receive any interaction events
      document.querySelector(".warn").style = "display:unset;";
      document.querySelector(".warn").classList.add("blink");
      console.info("INFO: Trial", gameState.trialCnt,"User started movement prematurely", el, action);
      break;
    case "waitTrialEnd": //mole visible, center visible, log all events
      if (el == "mole") {
        //interaction events with the mole
        switch (action) {
          case "mouseEnter": //log when the user entered the mole hitbox
            raiseEvent("userEnterMole", "logEvent");
            break;
          case "mouseClick": //user clicks mole before timeout
            userClickedMole(); //this will also raise event that user clicked mole
            break;
          case "mouseLeave":
            //do nothing hear, maybe user overshot target and log will tell us when they re-entered
            break;
        }
      } else {
        //this is interaction with el="center"
        if (action == "mouseLeave") {
          //we log when they left the center area
          raiseEvent("userMoveStart", "logEvent", ""); // if user jitters around the area, we log the last time they left
        }
      }
      break;
    case "trialEnded": //mouse click too late possibly or leave event as mole disappears
      //log this for anything but mole-mouseLeave
      if (!(action == "mouseLeave" && el == "mole")) {
        console.info("INFO: Trial", gameState.trialCnt, "Interactions after trial end", el,action);
      }
      break;
    default:
      console.log("TBD:", evt.type, gameState.trialState, el, action, ts);
  }
};

const handleLogEvents = function (evt) {
  const sequenceStep = evt.detail.el;
  const data = evt.detail.action;
  const ts = evt.detail.timeStamp;
  //PID,TrialID,StartTS,RandomWaitStart,RandomDelay,RandomWaitEnd,MoleXnn,MoleYnn,MoleScale,HitTimeout,UserMoveStart,UserEnterMole,UserClickMole,HitSuccess
  if (gameState.log.length < 1) {
    gameState.log.push({
      tid: -1,
      startTS: -1,
      rndDelayStart: -1,
      rndDelay: -1,
      rndDelayEnd: -1,
      moleStats: "",
      userMoveStart: -1,
      userEnterMole: -1,
      userClickMole: -1,
      hitSuccess: "-",
    });
  }

  const lastEntry = gameState.log[gameState.log.length - 1];
  switch (sequenceStep) {
    case "readyStart":
      lastEntry.tid = gameState.trialCnt;
      lastEntry.startTS = ts;
      break;
    case "randomDelayStart":
      lastEntry.rndDelayStart = ts;
      lastEntry.rndDelay = data;
      break;
    case "randomDelayEnd":
      lastEntry.rndDelayEnd = ts;
      break;
    case "hitWait":
      lastEntry.moleStats = data;
      break;
    case "userTooSlow":
      lastEntry.hitSuccess = "N";
      break;
    case "userClickedMole":
      lastEntry.hitSuccess = "Y";
      lastEntry.userClickMole = ts;
      break;
    case "userMoveStart":
      lastEntry.userMoveStart = ts;
      break;
    case "userEnterMole":
      lastEntry.userEnterMole = ts;
      break;
    default:
      console.log(
        "TBD-------------LOG------------> Missed log sequence step",
        sequenceStep,
        evt.detail,
        gameState
      );
  }
};

// Event-generator for the event-based model
const raiseEvent = function (elId, eventName, action, ts = "") {
  document.dispatchEvent(
    new CustomEvent(eventName, {
      detail: {
        el: elId,
        action: action,
        timeStamp: ts == "" ? Date.now() : ts, //if ts is not passed, assume current TS
      },
    })
  );
};




