# Wapplr-react

This package is the [React](https://github.com/facebook/react) extension for [Wapplr](https://github.com/wapplr/wapplr).

```js
//server.js
import wapplrReact from "wapplr-react";
import wapplrServer from "wapplr";

const wapp = wapplrServer({config: {
        globals: {
            WAPP: "yourBuildHash",
            ROOT: __dirname
        }
    }
});

wapplrReact({wapp});

wapp.server.listen();
```

```js
//client.js
import wapplrReact from "wapplr-react";
import wapplrClient from "wapplr";

const wapp = wapplrClient({config: {
        globals: {
            WAPP: "yourBuildHash"
        }
    }
});

wapplrReact({wapp});

wapp.client.listen();
```

```js
//app.js
import App from "./App";
export default function setContents(p = {}) {

    const {wapp} = p;

    wapp.contents.add({
        home: {
            render: App,
            description: "My React app",
            renderType: "react"
        }
    })

    wapp.router.replace([
        {path: "/", contentName: "home"}
    ])

    wapp.router.add([
        {path: "/about", contentName: "home"},
        {path: "/contact", contentName: "home"},
    ])

}
```

```js
//App.js
import React, {useContext, useState, useEffect} from "react";
import getUtils from "wapplr-react/dist/common/Wapp/getUtils";
import {WappContext} from "wapplr-react/dist/common/Wapp";

import style from "./app.css";

export default function App(props) {

    const context = useContext(WappContext);
    const {wapp} = context;
    const utils = getUtils(context);
    const {subscribe} = props;

    wapp.styles.use(style);

    const [url, setUrl] = useState(utils.getRequestUrl());

    function onLocationChange(newUrl){
        if (url !== newUrl){
            setUrl(newUrl);
        }
    }

    useEffect(function (){
        const unsub = subscribe.locationChange(onLocationChange);
        return function useUnsubscribe(){
            unsub();
        }
    }, [url])

    return (
        <div className={style.app}>
            {url}
        </div>
    );
}
```

```css
/*app.css*/
.app {
    color: black;
}
```

## License

MIT
