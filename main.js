
var startPos = {};

// target elements with the "draggable" class
interact('.block').draggable({
  snap: {
    mode: 'anchor',
    anchors: [],
    range: Infinity,
    endOnly: true,
    relativePoints: [
      { x: 0, y: 0 }  // snap relative to the top left of the element
    ]
  },
  // enable inertial throwing
  inertia: true,
  // keep the element within the area of it's parent
  restrict: {
    restriction: '.dropzone',
    endOnly: true,
    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
  },

  // call this function to snap target back to original position
  onstart: function (event) {
    var id = event.target.id;

    if (!startPos[id]) {
      var rect = interact.getElementRect(event.target);

      // record top left point when starting the very first drag
      startPos[id] = {
        x: rect.left,
        y: rect.top
      }
    }

    // snap to the start position
    event.interactable.snap({ anchors: [startPos[id]] });
  },

  // call this function on every dragmove event
  onmove: function (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  },
  // call this function on every dragend event
  onend: function (event) {
    var textEl = event.target.querySelector('p');

    textEl && (textEl.textContent =
      'moved a distance of '
      + (Math.sqrt(event.dx * event.dx +
                   event.dy * event.dy)|0) + 'px');
  }
});

// enable draggables to be dropped into this
interact('.dropzone').dropzone({
  // only accept elements matching this CSS selector
  accept: '.block',
  // Require a 75% element overlap for a drop to be possible
  overlap: 'center',

  // ensure blocks do not overlap
  checker: function (dragEvent,         // related dragmove or dragend
                     event,             // Touch, Pointer or Mouse Event
                     dropped,           // bool default checker result
                     dropzone,          // dropzone Interactable
                     dropElement,       // dropzone element
                     draggable,         // draggable Interactable
                     draggableElement) {// draggable element

    // only allow drops into empty dropzone elements
    return dropped && !dropElement.classList.contains('occupied');
  },

  // listen for drop related events:

  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.classList.add('drop-active');
    
    var block = interact.getElementRect(event.target);
    var prevDrop = interact.getElementRect(event.relatedTarget);

    if ((block.left == prevDrop.left) && (block.top == prevDrop.top)) {
      event.target.classList.remove('occupied');
    }
  },
  ondragenter: function (event) {
    var dropRect = interact.getElementRect(event.target),
    dropCorner = {
      x: dropRect.left,
      y: dropRect.top
    };

    event.draggable.snap({
      anchors: [ dropCorner ]
    });

    var draggableElement = event.relatedTarget,
    dropzoneElement = event.target;

    // feedback the possibility of a drop
    dropzoneElement.classList.add('drop-target');
    draggableElement.classList.add('can-drop');
  },
  ondragleave: function (event) {
    event.draggable.snap(false);

    // when leaving a dropzone, snap to the start position
    event.draggable.snap({ anchors: [startPos[event.relatedTarget.id]] });

    // remove the drop feedback style
    event.target.classList.remove('drop-target');
    event.relatedTarget.classList.remove('can-drop');
  },
  ondrop: function (event) {
    event.relatedTarget.textContent = '';
    event.target.classList.add('occupied');
  },
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});