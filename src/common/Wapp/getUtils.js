export default function getUtils(context) {

    const {wapp} = context;

    return {
        getGlobalState: function () {
            return wapp.states.store.getState();
        },
        getRequestUrl: function () {
            const globalState = this.getGlobalState();
            return globalState.req.url;
        },
        getRequestUser: function () {
            const globalState = this.getGlobalState();
            return globalState.req.user?._id;
        },
        logout: async function (p = {}) {
            const {requestName = "userLogout", redirect = "/"} = p;
            await wapp.requests.send(requestName);
            wapp.client.history.push(redirect);
        }
    }
}
