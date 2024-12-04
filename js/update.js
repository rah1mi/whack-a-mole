/*
Here are all the functions needing updates.
Read the coursework spec carefully and the in-line comments in the functions to understand what is needed here
*/
var x;
var y;
var scale;
var a=0;
var b=0;
var c=0;
var moveStart;
var moleEnter;
var moleClick;

const getMolePosition = function () {
  //function to generate a new location for the mole
  //function returns an object with fields x and y
  x=getRandVal();
  y=0.73*getRandVal();
  return { x, y};
};

const getMoleSize = function () {
  //function to generate a scale / size of the mole
  //function should return a single value between 1 and 2
  //mess to cap number of times each scale appears at 20
  if(a==20){
    if(b==20){
      scale=2.0
    }else if(c==20){
      scale=1.5
    }else scale=[1.5,2.0][Math.floor(Math.random()*2)]
  }else if(b==20){
    if(c==20){
      scale=1.25
    }else scale=[1.25,2.0][Math.floor(Math.random()*2)]
  }else if(c==20){
    scale=[1.25,1.5][Math.floor(Math.random()*2)]
  }else scale=[1.25, 1.5, 2.0][Math.floor(Math.random() * 3)]
  if(scale==1.25){a++;}
  if(scale==1.5){b++;}
  if(scale==2){c++;}

  return scale;
};

const getTimeout = function () {
 return (200*Math.log2((11.25*(Math.sqrt(x**2+y**2))/scale)+1)+600)*(90/(gameState.trialCnt+90));
  //remove second bracket for non-difficulty trial
};

const getCSVDataLine = function (obj, pid) {
  //covers cases where user doesn't complete action within time limit
  if(obj.userMoveStart==-1){moveStart=-1}else moveStart=obj.userMoveStart-obj.rndDelayEnd;
  if(obj.userEnterMole==-1){moleEnter=-1}else moleEnter=obj.userEnterMole-obj.rndDelayEnd;
  if(obj.userClickMole==-1){moleClick=-1}else moleClick=obj.userClickMole-obj.rndDelayEnd;
  //returns computed values (possibly will need to change obj.startTS to 0, instructions didn't seem specific on this)
  return [
    pid,
    obj.tid,
    obj.startTS,
    obj.rndDelayStart-obj.startTS,
    obj.rndDelay,
    obj.rndDelayEnd-obj.startTS,
    obj.moleStats,
    moveStart,
    moleEnter,
    moleClick,
    obj.hitSuccess,
  ].join(",");
};