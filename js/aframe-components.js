/*
This file does not need any editing.
This registers the "handle-events" component 
It is used to track when the mouse enters the two interactable elements
*/
AFRAME.registerComponent("handle-events", {
  init: function () {
    var el = this.el; // get handle to entity node
    el.addEventListener("mouseenter", function (evt) {
      //console.log("INFO: mouse enter", el.id);
      raiseEvent(el.id,"raycastEvent","mouseEnter",Date.now()); 
    });
    el.addEventListener("mouseleave", function (evt) {
      //console.log("INFO: mouse leave", el.id);
      raiseEvent(el.id,"raycastEvent","mouseLeave",Date.now());
    });
    el.addEventListener("click", function (evt) {
      //console.log("INFO: mouse click", el.id);
      raiseEvent(el.id,"raycastEvent","mouseClick",Date.now());
    });
  },
});
