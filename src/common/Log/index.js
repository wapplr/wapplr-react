import React from 'react';
import style from 'wapplr/dist/common/log/log_css.js';
import WapplrLogo from '../Logo';
import Template from "../Template";

export default function Log (props) {

    const {wapp, Parent = Template, Logo = WapplrLogo} = props;
    const {request, response, styles} = wapp;
    const {state} = response;
    const res = (state && state.res) ? state.res : response;
    const req = (state && state.req) ? state.req : request;
    const {remoteAddress, httpVersion, method, url, timestamp} = req;
    const {statusCode = 200, statusMessage = "", errorMessage = ""} = res;

    const text = `[LOG] [${timestamp} - ${remoteAddress}] HTTP:${httpVersion} ${method} ${url || "/"} -> [${statusCode}] ${errorMessage || statusMessage}`

    styles.use(style)

    const renderedLogo = Logo({wapp});

    const renderedLog =
        <div className={style.log}>
            <div className={style.logo}>
                {renderedLogo}
            </div>
            <div>{text}</div>
        </div>

    if (Parent) {
        return (
            <Parent {...props}>
                {renderedLog}
            </Parent>
        )
    }

    return renderedLog;

}
