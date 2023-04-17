
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
        "state3": {
            gradients: [['#70aeed', '#000000']],
            transitionSpeed: 1000
        },
        "state4": {
            gradients: [['#27b8ff', '#ff9709']],
            transitionSpeed: 1000
        },
        "state5": {
            gradients: [['#3FCA4D', '#2FA7FF']],
            transitionSpeed: 1000
        },
        "state6": {
            gradients: [['#D98E04', '#ffffff']],
            transitionSpeed: 1000
        },
        "state7": {
            gradients: [['#94c9ff', '#10b0e6']],
            transitionSpeed: 1000
        },
        "state8": {
            gradients: [['#fff680', '#ec5c47']],
            transitionSpeed: 1000
        },
        "state9": {
            gradients: [['#ffffff', '#868686']],
            transitionSpeed: 1000
        },
        "state10": {
            gradients: [['#f2f75c', '#ee994b']],
            transitionSpeed: 1000
        },
        "state11": {
            gradients: [['#1fe8fe', '#336fff']],
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
        } else if (model.position.y > 100 && model.position.y < 165) {
            granimInstance.changeState('state3');
        } else if (model.position.y > 165 && model.position.y < 220) {
            granimInstance.changeState('state4');
        } else if (model.position.y > 220 && model.position.y < 280) {
            granimInstance.changeState('state5');
        } else if (model.position.y > 280 && model.position.y < 340) {
            granimInstance.changeState('state6');
        } else if (model.position.y > 340 && model.position.y < 400) {
            granimInstance.changeState('state7');
        } else if (model.position.y > 400 && model.position.y < 460) {
            granimInstance.changeState('state8');
        } else if (model.position.y > 460 && model.position.y < 520) {
            granimInstance.changeState('state9');
        } else if (model.position.y > 520 && model.position.y < 580) {
            granimInstance.changeState('state10');
        } else if (model.position.y > 580) {
            granimInstance.changeState('state11');
        }

        // Show portfolio link at the end
        if (model.position.y >= 604) {
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