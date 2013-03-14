var Messager = function() {

    // the key to store our messages
    var messageKey = '$messaging';

    // Function to call when a new state is recieved
    var receiver; // function(state)

    // Allocate a unique-ish window ID to this window
    var thisWindowId = (new Date()).getTime();

    // Last window and serial heard
    var lastWindowId, lastSerial = 0;

    // Test localStorage & JSON are available
    var featuresAvailable;
    try {
        if(('localStorage' in window) && (window.localStorage) !== null && ('JSON' in window)) {
            featuresAvailable = true;
        }
    } catch(e) { }

    if(!featuresAvailable) {
        alert("Your browser doesn't support everything needed for this demo.");
    }
    
    var _subscribe = function(callback) {
        receiver = callback;
    };

    // Broadcast a new state to all other windows
    var _publish = function(state) {
        if(typeof state === "string") {
            state = JSON.parse(state);
        }
        var msg = {
            window: (lastWindowId = thisWindowId),
            serial: (++lastSerial),
            state: state
        };
        // Use JSON stringify because the spec says only strings are supported, even if it will take anything
        window.localStorage.setItem(messageKey, JSON.stringify(msg));
    };

    // Get the current state from the localStorage
    var _getState = function() {
        var state;
        var lastMsg = window.localStorage.getItem(messageKey);
        if(lastMsg) {
            var msg = JSON.parse(lastMsg);
            lastWindowId = msg.window;
            lastSerial = msg.serial;
            state = msg.state;
        }
        return state;
    };

    window.addEventListener("storage", function(e) {
        // Check it's the right key and there is a value
        if(e.key !== messageKey || !(e.newValue)) { return; }
        var msg = JSON.parse(e.newValue);
        console.log(msg);
        // Don't repeat messages, or do anything with our own broadcasts
        if((msg.window !== lastWindowId) || (msg.serial !== lastSerial)) {
            lastWindowId = msg.window;
            lastSerial = msg.serial;
            if(receiver) {
                console.log('in storage', msg.state);
                receiver(msg.state);
            }
        }
    }, false);

    return {
        subscribe: _subscribe,
        publish: _publish,
        getState: _getState
    };
}();