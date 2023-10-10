var DAMPING = 0.03

function get_scrollbar() {

    // Scrollbar
    if (!(('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0))) {

        var myscrollbar = Scrollbar.init(
            document.getElementById('scroll'), { 'damping': DAMPING },
        );

        myscrollbar.addListener(function (status) {
            var offset = status.offset;

            fixed.style.top = offset.y + 'px';
            fixed.style.left = offset.x + 'px';
        });

        myscrollbar.track.xAxis.element.remove()
        myscrollbar.track.yAxis.element.remove()

    } else {
        document.querySelector("html").style.overflow = "hidden";
        document.querySelector("html").style.width = "100%";
        document.querySelector("article").style.height = "100%";
        document.querySelector("article").style.position = "fixed";
        document.querySelector("article").style.overflowY = "scroll";
        document.querySelector("article").style.WebkitOverflowScrolling = "touch";
    }

    document.getElementById('scroll').style.width = window.innerWidth + 'px'
    document.getElementById('scroll').style.height = window.innerHeight + 'px'

    document.getElementById('canvas-container').style.width = window.innerWidth + 'px'
    document.getElementById('canvas-container').style.height = window.innerHeight + 'px'

    document.getElementById('scroll').focus();

    return myscrollbar
}

export {
    get_scrollbar
}