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
            this.getHandlers = this.getHandlers.bind(this);
            this.onLocationChange = this.onLocationChange.bind(this);

            this.state = {
                url: res.wappResponse.store.getState().req.url
            }

        }
        getHandlers() {
            return this.handlers;
        }
        componentDidMount() {
            const {res} = this.context;
            const getHandlers = this.getHandlers;
            this.unsubscribe = res.wappResponse.store.subscribe(function (state, {type, payload}) {
                const handlers = getHandlers();
                if (type === "INS_RES" && payload.name === "responses"){
                    if (handlers["requestResolved"]) {
                        handlers["requestResolved"]({...payload.value});
                    }
                }
                if (type === "SET_REQ" && payload.name === "user"){
                    if (handlers["userChange"]) {
                        handlers["userChange"]((payload.value?._id) ? {...payload.value} : null);
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
                userChange: function (fn) {
                    setHandler("userChange", fn)
                    return function () {
                        setHandler("userChange", null)
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
