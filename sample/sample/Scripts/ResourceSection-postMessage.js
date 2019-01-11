(function () {
    "use strict";

    // ---------------------------------------------------------------------------------------------
    // ------------------------------------- Helper Functions --------------------------------------
    // ---------------------------------------------------------------------------------------------

    // var frameSignature = ...;  Defined by .html page that loaded this script.

    // Capture the client session ID to use to correlate user actions and events within this
    // client session.
    var sessionId = location.hash.substr(1);
    debugger;

    var queryMap = (function () {
        var query = window.location.search.substring(1);
        var parameterList = query.split("&");
        var map = {};
        for (var i = 0; i < parameterList.length; i++) {
            var pair = parameterList[i].split("=");
            map[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return map;
    })();

    function getQueryParameter(name) {
        return queryMap[name] || "";
    }

    function postMessageToParent(kind) {
        window.parent.postMessage({
            signature: frameSignature,
            kind: kind
        }, trustedParentOrigin);
    }

    // ---------------------------------------------------------------------------------------------
    // --------------------------------------- Security Code ---------------------------------------
    // ---------------------------------------------------------------------------------------------

    // Get the below trusted origins from configuration to include the origin of the portal in
    // which the page needs to be iframe'd.
    var allowedParentFrameAuthorities = ["localhost:55555", "portal.azure.com"];

    // Capture the origin of the parent and validate that it is trusted. If it is not a trusted
    // origin, then DO NOT setup any listeners and IGNORE messages from the parent/owner window
    var trustedParentOrigin = getQueryParameter("trustedAuthority");
    var isTrustedOrigin = (function () {
        var trustedAuthority = (trustedParentOrigin.split("//")[1] || "").toLowerCase();

        return allowedParentFrameAuthorities.some(function (origin) {
            // Verify that the requested trusted authority is either an allowed origin or is a
            // subdomain of an allowed origin.
            return origin === trustedAuthority
                || (trustedAuthority.indexOf("." + origin) === trustedAuthority.length - origin.length - 1);
        });
    })();

    // TODO: Uncomment below code to prevent untrusted origins from accessing the site.
    // if (!isTrustedOrigin) {
    //     var errorMessage = "The origin '" + trustedParentOrigin + "' is not trusted.";
    //     console.error(sessionId, errorMessage);
    //     throw new Error(errorMessage);
    // }

    // ---------------------------------------------------------------------------------------------
    // -------------------------------- Handshake Code with Portal ---------------------------------
    // ---------------------------------------------------------------------------------------------

    window.addEventListener("message", function (evt) {
        // It is critical that we only allow trusted messages through. Any domain can send a
        // message event and manipulate the html.
    debugger;
    if (evt.origin.toLowerCase() !== trustedParentOrigin) {
            return;
        }

        var msg = evt.data;

        // Check that the signature of the message matches that of frame parts.
        if (!msg || msg.signature !== frameSignature) {
            return;
        }

        // Handle different message kinds.
        if (msg.kind === "frametitle") {
            makeViewPresentableToUser(msg);
        } else if (msg.kind === "framecontent") {
            document.getElementsByClassName("fxs-frame-content")[0].innerText = msg.data;
        } else if (msg.kind === "getAuthTokenResponse") {
            document.getElementsByClassName("fxs-frame-token")[0].innerText = "Token: " + msg.data;
            postMessageToParent("acknowledgeAuthToken");
            //document.getElementsByClassName("fxs-iframe")[0].setAttribute("src", "https://www.microsoft.com");
        } else {
            console.warn(sessionId, "Message not recognized.", msg);
        }
    }, false);

    // ---------------------------------------------------------------------------------------------
    // -------------------------------- Code to reveal view to user --------------------------------
    // ---------------------------------------------------------------------------------------------

    function makeViewPresentableToUser(msg) {
        document.getElementsByClassName("fxs-frame-header")[0].innerText = msg.data;
        document.head.getElementsByTagName("title")[0].innerText = msg.data;

        // Post message 'revealcontent' to the parent to indicate that the part is now in a state to
        // dismiss the opaque spinner and reveal content.
        postMessageToParent("revealcontent");

        completeInitialization();
    }

    // ---------------------------------------------------------------------------------------------
    // ------------------------------ Code to complete initialization ------------------------------
    // ---------------------------------------------------------------------------------------------

    function completeInitialization() {
        // Mimic an async operation that takes 2 seconds.
        Q.delay(2000).then(() => {
            // Post message the 'initializationcomplete' to the parent to indicate that the part is
            // now ready for user interaction.
            postMessageToParent("initializationcomplete");
        });
    }

    // Send a post message indicate that the frame is ready to start initialization.
    postMessageToParent("ready");

    // This is an example of posting the 'getAuthToken' event to Portal.
    postMessageToParent("getAuthToken");
})();
