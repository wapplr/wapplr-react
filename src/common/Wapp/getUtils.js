export default function getUtils(context) {

    const {wapp, req, res} = context;

    function historyPush({redirect, response, requestName, timeOut}) {
        if (response[requestName]?.record?._id && redirect){
            const parsedUrl = {
                ...(typeof redirect == "object") ? redirect : {},
                pathname: (typeof redirect == "string") ? redirect : redirect.pathname,
            }

            if (parsedUrl.pathname) {
                parsedUrl.pathname = parsedUrl.pathname.replace(":_id", response[requestName].record._id);
            }

            if (timeOut){
                setTimeout(function () {
                    wapp.client.history.push(parsedUrl);
                }, timeOut)
            } else {
                wapp.client.history.push(parsedUrl);
            }
        }
    }

    return {
        getGlobalState: function () {
            return res.wappResponse.store.getState();
        },
        getRequestUrl: function () {
            const globalState = this.getGlobalState();
            return globalState.req.url;
        },
        getRequestUser: function () {
            const globalState = this.getGlobalState();
            return (globalState.req.user?._id) ? globalState.req.user : null;
        },
        logout: async function (p = {}) {
            const {requestName = "userLogout", redirect = "/", timeOut} = p;
            const response = await wapp.requests.send({requestName, req, res});
            historyPush({redirect, response, requestName, timeOut});
            return response[requestName] || response;
        },
        login: async function (p = {}) {
            const {requestName = "userLogin", args, redirect = "/user/:_id", timeOut} = p;
            const response = await wapp.requests.send({requestName, args, req, res});
            historyPush({redirect, response, requestName, timeOut});
            return response[requestName] || response;
        },
        signup: async function (p = {}) {
            const {requestName = "userSignup", args, redirect = "/user/:_id", timeOut} = p;
            const response = await wapp.requests.send({requestName, args, req, res});
            historyPush({redirect, response, requestName, timeOut});
            return response[requestName] || response;
        },
        sendRequest: async function (p = {}) {
            const {requestName = "userForgotPassword", args, redirect, timeOut} = p;
            const response = await wapp.requests.send({requestName, args, req, res});
            historyPush({redirect, response, requestName, timeOut});
            return response[requestName] || response;
        },
    }
}
