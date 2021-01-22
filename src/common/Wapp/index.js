import React, { PureComponent } from "react";
export const WappContext = React.createContext({wapp: null});

export function withWapp(ComposedComponent) {
    class WithWapp extends PureComponent {
        constructor(props, context) {

            super(props, context);
            const {wapp} = context;

            this.unsubscribe = null;
            this.handlers = {};
            this.componentRef = React.createRef();

            this.setHandler = this.setHandler.bind(this);
            this.setRef = this.setRef.bind(this);
            this.onLocationChange = this.onLocationChange.bind(this);

            this.state = {
                url: wapp.states.store.getState().req.url
            }

        }
        componentDidMount() {
            const {wapp} = this.context;
            const componentRef = this.componentRef;
            const handlers = this.handlers;
            this.unsubscribe = wapp.states.store.subscribe(function (state, {type, payload}) {
                if (type === "INS_RES" && payload.name === "responses"){
                    if (componentRef.current && componentRef.current.onRequestResolved) {
                        componentRef.current.onRequestResolved({...payload.value});
                    }
                    if (handlers["requestResolved"]) {
                        handlers["requestResolved"]({...payload.value});
                    }
                }
                if (type === "SET_REQ" && payload.name === "user"){
                    if (componentRef.current && componentRef.current.onChangeUser) {
                        componentRef.current.onChangeUser((payload.value?._id) ? {...payload.value} : null);
                    }
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
            if (this.componentRef.current && this.componentRef.current.onLocationChange) {
                this.componentRef.current.onLocationChange(url)
            }
            if (this.handlers["locationChange"]){
                this.handlers["locationChange"](url)
            }
        }
        setRef(e) {
            const {forwardedRef} = this.props;

            if (forwardedRef){
                forwardedRef(e)
            }

            this.componentRef.current = e;

        }
        setHandler(type, handler) {
            this.handlers[type] = handler;
        }
        render() {

            const {forwardedRef, ...rest} = this.props;
            const props = {...rest};

            if (ComposedComponent.__proto__.name === "Component") {
                props.ref = this.setRef
            } else {

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

            }

            return (
                <ComposedComponent {...props} />
            )
        }
    }

    const displayName = ComposedComponent.displayName || ComposedComponent.name || "Component"

    if (ComposedComponent.__proto__.name === "Component") {
        ComposedComponent.contextType = WappContext;
    }

    WithWapp.displayName = `WithWapp(${displayName})`;
    WithWapp.contextType = WappContext;
    WithWapp.ComposedComponent = ComposedComponent;

    return WithWapp;

}
