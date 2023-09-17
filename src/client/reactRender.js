import React, {useEffect, useLayoutEffect} from "react";
import ReactDOM from "react-dom/client";

import Log from "../common/Log";
import {defaultDescriptor} from "../common/utils";
import {withWapp, WappContext} from "../common/Wapp";

class Wapplr extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.setRef = this.setRef.bind(this);
        this.refElement = null;
        this.state = {
            Component: props.Component
        }
    }
    setRef(e) {
        this.refElement = e;
    }
    renderAgain(Component, callback) {
        const {res} = this.context;
        if (Component !== this.state.Component) {
            if (callback) {
                async function asyncFunction() {
                    await this.setState({
                        Component
                    });
                    callback()
                }
                asyncFunction()
            } else {
                this.setState({
                    Component
                })
            }
        } else {
            if (this.refElement && this.refElement.onLocationChange){
                const onLocationChange = this.refElement.onLocationChange
                if (callback) {
                    async function asyncFunction() {
                        await onLocationChange(res.wappResponse.store.getState("req.url"));
                        callback()
                    }
                    asyncFunction()
                } else {
                    onLocationChange(res.wappResponse.store.getState("req.url"))
                }
            }
        }
    }
    componentWillUnmount() {
        this.refElement = null;
    }
    render() {
        const Component = (this.state.Component) ? withWapp(this.state.Component) : null;
        if (Component) {
            const setRef = this.setRef;
            return <Component wappRef={setRef}/>
        }
        return null;
    }
}
Wapplr.contextType = WappContext;

export default function reactRender(p = {}) {

    const {wapp} = p;
    const middleware = wapp.client.middlewares.render;

    if (!middleware._initializedWapplrReact) {

        const config = wapp.client.config;
        if (!config.styles){
            config.styles = {};
        }
        if (typeof config.styles.disableClearStyles == "undefined"){
            config.styles.disableClearStyles = true;
        }

        wapp.contents.add({
            log: {
                render: Log,
                renderType: "react"
            }
        });

        let lastRenderType = null;
        let mutableContext = {
            wapp,
            req: null,
            res: null
        };

        wapp.styles.use = function (styles) {
            if ((mutableContext.res.wappResponse.content &&
                mutableContext.res.wappResponse.content.renderType === "react") ||
                (!mutableContext.res.wappResponse.content && lastRenderType === "react")
            ) {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useLayoutEffect(function () {
                    return wapp.styles.add(styles)
                }, [styles]);
                lastRenderType = "react"
            } else {
                lastRenderType = null;
                return wapp.styles.add(styles)
            }
        };

        middleware.addHandle({
            react: async function(req, res, next) {

                mutableContext.req = req;
                mutableContext.res = res;

                if (res.wappResponse.content && res.wappResponse.content.renderType === "react") {

                    if (typeof res._originalEndFunction === "undefined") {

                        Object.defineProperty(res, "_originalEndFunction", {
                            ...defaultDescriptor,
                            writable: false,
                            enumerable: false,
                            value: res.end
                        });

                    }

                    res.end = function (Component, callback) {
                        if (!res.wappResponse.sended) {
                            Object.defineProperty(res, "headersSent", {...defaultDescriptor, enumerable: false, writable: false, value: true});

                            const container = res.wappResponse.container;

                            if (!middleware.renderedRef){

                                if (res.wapplrReactEndType === "component"){

                                    function Render() {

                                        useEffect(()=>{
                                            if (callback) {
                                                callback();
                                            }
                                        }, []);

                                        return (
                                            <WappContext.Provider value={mutableContext}>
                                                <Wapplr ref={function (e){middleware.renderedRef = e;}} Component={Component}/>
                                            </WappContext.Provider>
                                        )
                                    }

                                    if (res._originalEndFunction){
                                        res._originalEndFunction({Render, wapp, req, res})
                                    }

                                    return;
                                }

                                if (container._reactRoot) {
                                    container._reactRoot.render(
                                        <WappContext.Provider value={mutableContext}>
                                            <Wapplr key={Date.now()} ref={function (e){middleware.renderedRef = e;}} Component={Component}/>
                                        </WappContext.Provider>
                                    );
                                } else {
                                    container._reactRoot = ReactDOM.hydrateRoot(
                                        container,
                                        <WappContext.Provider value={mutableContext}>
                                            <Wapplr key={Date.now()} ref={function (e){middleware.renderedRef = e;}} Component={Component}/>
                                        </WappContext.Provider>,
                                    );
                                }

                            } else {

                                if (res.wapplrReactEndType === "component"){

                                    if (res._originalEndFunction){
                                        res._originalEndFunction({update: () => middleware.renderedRef.renderAgain(Component, callback), wapp, req, res})
                                    }

                                    return;
                                }

                                middleware.renderedRef.renderAgain(Component, callback);

                            }

                        }
                    };

                    res.wappResponse.status(res.wappResponse.statusCode || 200);

                    await new Promise((resolve)=>{
                        res.wappResponse.send(res.wappResponse.content.render, resolve);
                    });

                    next();

                } else {
                    middleware.renderedRef = null;
                    res.end = (res._originalEndFunction) ? res._originalEndFunction : res.end;
                    next();
                }
            }
        });

        Object.defineProperty(middleware, "_initializedWapplrReact", {
            ...defaultDescriptor,
            writable: false,
            enumerable: false,
            value: true
        });

        Object.defineProperty(middleware, "wapp", {...defaultDescriptor, writable: false, enumerable: false, value: wapp});

    }

    return middleware;

}
