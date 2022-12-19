// drag.js sets up draggable elements in our wrapper.

const wrapper = document.getElementById('wrapper');

// setupDraggableElement will ensure the wrapper is set up to allow drops,
// and add a listener to the given element to detect a drag being started.
export default function setupDraggableElement(element) {
  const dropSetupAttr = 'dropSetupDone';
  if (!wrapper.getAttribute(dropSetupAttr)) {
    wrapper.addEventListener('drop', drop);
    wrapper.addEventListener('dragover', allowDrop);
    wrapper.setAttribute(dropSetupAttr, true);
  }
  element.addEventListener('dragstart', drag);
}

// drop handles an element being dropped in another position on the wrapper
function drop(ev) {
  ev.preventDefault();
  const dt = ev.dataTransfer;
  const data = dt.getData('targetID');
  const relativeMouseX = parseInt(dt.getData('relativeMouseX'), 10);
  const relativeMouseY = parseInt(dt.getData('relativeMouseY'), 10);

  // Offset the new position based on the relative position of the mouse
  // which we saved on drag start.
  const newTop = ev.clientY - relativeMouseY;
  const newLeft = ev.clientX - relativeMouseX;

  const ele = document.getElementById(data);
  ele.style.top = `${newTop}px`;
  ele.style.left = `${newLeft}px`;
  ele.style.position = 'absolute';
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  const { target } = ev;
  ev.dataTransfer.setData('targetID', target.id);

  // Save the relative position of the mouse in relation to the element, to make sure
  // we drop it with the right offset at the end.
  const rect = target.getBoundingClientRect();
  ev.dataTransfer.setData('relativeMouseX', ev.clientX - rect.left);
  ev.dataTransfer.setData('relativeMouseY', ev.clientY - rect.top);
}
