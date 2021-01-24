import React, { PureComponent } from "react";
export const WappContext = React.createContext({wapp: null, req: null, res: null});

export function withWapp(ComposedComponent) {
    class WithWapp extends PureComponent {
        constructor(props, context) {

            super(props, context);
            const {res} = context;

            this.unsubscribe = null;
            this.handlers = {};

            this.setHandler = this.setHandler.bind(this);
            this.onLocationChange = this.onLocationChange.bind(this);

            this.state = {
                url: res.wappResponse.store.getState().req.url
            }

        }
        componentDidMount() {
            const {res} = this.context;
            const handlers = this.handlers;
            this.unsubscribe = res.wappResponse.store.subscribe(function (state, {type, payload}) {
                if (type === "INS_RES" && payload.name === "responses"){
                    if (handlers["requestResolved"]) {
                        handlers["requestResolved"]({...payload.value});
                    }
                }
                if (type === "SET_REQ" && payload.name === "user"){
                    if (handlers["changeUser"]) {
                        handlers["changeUser"]((payload.value?._id) ? {...payload.value} : null);
                    }
                }
            })
        }
        componentWillUnmount() {
            if (this.unsubscribe){
                this.unsubscribe();
            }
        }
        onLocationChange(url) {
            if (this.handlers["locationChange"]){
                this.handlers["locationChange"](url)
            }
        }
        setHandler(type, handler) {
            this.handlers[type] = handler;
        }
        render() {

            const props = {...this.props};

            const setHandler = this.setHandler;

            props.subscribe = {
                locationChange: function (fn) {
                    setHandler("locationChange", fn)
                    return function () {
                        setHandler("locationChange", null)
                    }
                },
                requestResolved: function (fn) {
                    setHandler("requestResolved", fn)
                    return function () {
                        setHandler("requestResolved", null)
                    }
                },
                changeUser: function (fn) {
                    setHandler("changeUser", fn)
                    return function () {
                        setHandler("changeUser", null)
                    }
                }
            }

            return (
                <ComposedComponent {...props} />
            )
        }
    }

    const displayName = ComposedComponent.displayName || ComposedComponent.name || "Component"

    WithWapp.displayName = `WithWapp(${displayName})`;
    WithWapp.contextType = WappContext;
    WithWapp.ComposedComponent = ComposedComponent;

    return WithWapp;

}
