import React, {useContext, useEffect, useState} from "react";
import style from "wapplr/dist/common/log/log_css.js";

import getUtils from "../Wapp/getUtils";
import {WappContext} from "../Wapp";
import WapplrLogo from "../Logo";
import Template from "../Template";

function DefaultParent(props) {
    return React.Children.only(props.children);
}

export default function Log (props) {

    const context = useContext(WappContext);
    const {wapp, req, res} = context;
    const utils = getUtils(context);

    const {
        Logo = WapplrLogo,
        subscribe
    } = props;

    const Parent = (typeof props.Parent == "undefined") ? Template : (props.Parent === null) ? DefaultParent : props.Parent;

    const [stateUrl, setUrl] = useState(utils.getRequestUrl());

    function onLocationChange(newUrl){
        if (stateUrl !== newUrl){
            setUrl(newUrl);
        }
    }

    useEffect(function didMount(){
        const unsub = (subscribe) ? subscribe.locationChange(onLocationChange) : null
        return function willUnmount() {
            if (unsub) {
                unsub();
            }
        }
    }, [stateUrl])


    const {styles} = wapp;
    const {remoteAddress, httpVersion, method, url, timestamp} = req.wappRequest;
    const {statusCode = 200, statusMessage = "", errorMessage = ""} = res.wappResponse;

    const text = `[LOG] [${timestamp} - ${remoteAddress}] HTTP:${httpVersion} ${method} ${url || "/"} -> [${statusCode}] ${errorMessage || statusMessage}`

    styles.use(style);

    return (
        <Parent {...props} subscribe={null}>
            <div className={style.log}>
                <div className={style.logo}>
                    {(Logo) ? <Logo /> : null}
                </div>
                <div>{text}</div>
            </div>
        </Parent>
    )

}
