
var SCROLL_OFFSET_POSITION = 26;
var SCROLL_OFFSET_ROTATE = 500;

var portfolio_link = document.getElementById("portfolio-link")
var loader_screen = document.getElementById("loader")

var granimInstance = new Granim({
    element: '#gradient',
    direction: 'diagonal',
    isPausedWhenNotInView: false,
    stateTransitionSpeed: 1000,
    states: {
        "default-state": {
            gradients: [
                ['#0b9ed9', '#07c7f2'],
            ],
            transitionSpeed: 1000
        },
        "state2": {
            gradients: [['#fff680', '#ec5c47']],
            transitionSpeed: 1000
        },
    }
});

granimInstance.changeState('default-state');

function update_controls(model, myscrollbar) {
    if (model) {
        if (typeof myscrollbar != "undefined") {
            model.position.y = myscrollbar.offset.y / SCROLL_OFFSET_POSITION;
            model.rotation.y = myscrollbar.offset.y / SCROLL_OFFSET_ROTATE;
        } else {
            model.position.y = document.getElementById('content').scrollTop / SCROLL_OFFSET_POSITION;
            model.rotation.y = document.getElementById('content').scrollTop / SCROLL_OFFSET_ROTATE;
        }
        if (model.position.y > 10 && model.position.y < 52) {
            granimInstance.changeState('default-state');
        } else if (model.position.y > 52 && model.position.y < 100) {
            granimInstance.changeState('state2');
        }
        // Show portfolio link at the end
        if (model.position.y >= 50) {
            portfolio_link.style.visibility = 'visible';
            portfolio_link.style.pointerEvents = 'auto';
        } else {
            portfolio_link.style.visibility = 'hidden';
            portfolio_link.style.pointerEvents = 'none';
        }
        loader_screen.style.visibility = 'hidden';
    } else {
        loader_screen.style.visibility = 'visible';
    }

}

export {
    update_controls
}