/*All functions associated with the mole*/

//position the mole based on values received from calls to getMolePosition and getMoleSize
const positionMole = function () {
  const normalizedPos = getMolePosition();
  const scale = getMoleSize();
  displayMole(normalizedPos, scale);
  updateMoleParams(true, true, false);
  
  //return a string for logging purposes
  return [normalizedPos.x.toFixed(3), normalizedPos.y.toFixed(3), scale].join(",");
  
};

const updateMoleParams = function (visible,clickable,transparent,tinge = "white") {
  const mole = document.querySelector(".mole");
  mole.object3D.visible = visible;
  if (tinge == "white") {//setting color on a-image isn't trivial apparently
    mole.components.material.material.color.r = 1;
    mole.components.material.material.color.g = 1;
    mole.components.material.material.color.b = 1;
  } else {//assumed red
    mole.components.material.material.color.r = 1;
    mole.components.material.material.color.g = 0;
    mole.components.material.material.color.b = 0;
  }
  mole.components.material.material.opacity = transparent ? 0 : 1; //transparent means opacity=0
  if (!clickable) mole.classList.remove("clickable");
  //make mole non-clickable for now
  else mole.classList.add("clickable");
};

const displayMole = function (normalizedPos, scale) {
  //in the format {x:<val -1 to 1>,y:<val -1 to 1>}
  const mole = document.querySelector(".mole");
  mole.object3D.scale.set(scale, scale, 1); //should only be 2,1.5,1
  const scenePos = getPosInSceneCoords(normalizedPos);
  mole.object3D.parent.position.set(scenePos.x, scenePos.y, -10);
  mole.object3D.visible = true;
  mole.classList.add("clickable"); //allowing ray-caster to catch mouse events on mole.
};


const hideMole = function (isWhacked) {
  const mole = document.querySelector(".mole");
  if (isWhacked) {
    mole.emit("die");
  } else {
    mole.emit("snicker");
  }

  mole.emit("hide");
};

const moleHidden = function (evt) {
  if (evt.detail.name == "animation__dn") {
    //if hiding animation is complete
    updateMoleParams(false, false, true);
    readyToStartTrial();
   }
};

const getPosInSceneCoords = function (normalizedPos) {
  //normalized position as x:-1 (scene left) to 1 (scene right), y:-0.75 (scene bottom) to 0.75 (scene top)
  //effective at scale 2x, max is x : [10,-10], y: [-7.3,7.3]
  const absNorm = {
    x: Math.abs(normalizedPos.x),
    y: Math.abs(normalizedPos.y),
  };
  if (absNorm.x > 1.0 || absNorm.y > 0.75) {
    console.error(
      "ERROR: coordinates are not normalized",
      normalizedPos.x,
      normalizedPos.y
    );
    return { x: 0, y: 0 };
  }
  return { x: normalizedPos.x * 10, y: normalizedPos.y * 10 };
};

const getRandVal = function () {
  return 0.1 * Math.floor(Math.random() * 20 - 10); //returns a m.n decimal number
};