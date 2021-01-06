import React, {useEffect} from "react";
import ReactDOM from "react-dom"
import Log from "../common/Log";
import {defaultDescriptor} from "../common/utils";

export default function reactRender(p = {}) {

    const {wapp} = p;
    const middleware = wapp.client.middlewares.render;

    if (!middleware._initializedWapplrReact) {

        const settings = wapp.client.settings;
        if (!settings.styles){
            settings.styles = {};
        }
        if (typeof settings.styles.disableClearStyles == "undefined"){
            settings.styles.disableClearStyles = true;
        }

        wapp.contents.add({
            log: {
                render: function Render(props) {
                    return Log(props);
                },
                renderType: "react"
            }
        })

        wapp.styles.use = function (styles) {
            if (wapp.response.content.renderType === "react") {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useEffect(function () {
                    return wapp.styles.add(styles)
                })
            } else {
                return wapp.styles.add(styles)
            }
        }

        class Render extends React.Component {
            constructor(props) {
                super(props)
                this.state = {
                    ...wapp.response.route,
                    children: props.children
                }
            }
            changeRoute(p = {}) {
                const {children, route = {}} = p;
                const newState = {
                    ...this.state,
                    ...route,
                    children: children || this.state.children
                };
                const state = this.state;
                let changes = 0;
                Object.keys(newState).forEach(function (key) {
                    if (state[key] !== newState[key]){
                        changes = changes + 1;
                    }
                })
                if (changes > 0) {
                    this.setState(newState)
                }
            }
            render() {
                if (React.isValidElement(this.state.children)){
                    return this.state.children;
                } else if (typeof this.state.children == "function"){
                    const Children = this.state.children;
                    return <Children wapp={wapp} />
                }
                return null;
            }
        }

        class Content extends React.Component {
            render() {
                const {wapp} = this.props;
                const {content = {}} = wapp.response;
                const Render = content.render;

                if (!Render){
                    return null;
                }

                return <Render wapp={wapp} />
            }
        }

        let reactRendered = null;

        middleware.addHandle({
            react: function(req, res, next) {
                const {wapp} = res;

                if (wapp.response.content && wapp.response.content.renderType === "react") {

                    if (typeof res._originalEndFunction === "undefined") {

                        Object.defineProperty(res, "_originalEndFunction", {
                            ...defaultDescriptor,
                            writable: false,
                            enumerable: false,
                            value: res.end
                        });

                    }

                    res.end = function (children) {
                        if (React.isValidElement(children) ||
                            (children && children.name && children.name.slice(0,1).toLowerCase() !== children.name.slice(0,1)) ||
                            children === Content
                        ) {
                            if (!res.headersSent) {
                                Object.defineProperty(res, "headersSent", {...defaultDescriptor, enumerable: false, writable: false, value: true})
                                const container = wapp.response.container;
                                if (!reactRendered){
                                    ReactDOM.render(<Render ref={function (e){reactRendered = e;}}>{children}</Render>, container)
                                } else {
                                    reactRendered.changeRoute({route: {...wapp.response.route}, children})
                                }
                            } else {
                                //throw error;
                            }
                        } else {
                            reactRendered = null;
                            res._originalEndFunction(children);
                        }
                    }

                    res.status(wapp.response.statusCode || 200);
                    res.send(Content);

                    next();

                } else {
                    res.end = (res.originalEndFunction) ? res.originalEndFunction : res.end;
                    next();
                }
            }
        })

        Object.defineProperty(middleware, "_initializedWapplrReact", {
            ...defaultDescriptor,
            writable: false,
            enumerable: false,
            value: true
        });

    }

    return middleware;

}
