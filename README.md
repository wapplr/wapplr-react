# Wapplr-react

This package is the [React](https://github.com/facebook/react) extension for [Wapplr](https://github.com/wapplr/wapplr).

```js
//server.js
const wapplrReact = require("wapplr-react");
const wapplrServer = require("wapplr");
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
const wapplrReact = require("wapplr-react");
const wapplrClient = require("wapplr");
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
const App = require("./App");
module.exports = function setContents(p = {}) {

    const {wapp} = p;

    wapp.contents.add({
        home: {
            render: App,
            description: "My react app",
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
const React = require("react");
const style = require("./app.css");

export default function App(props) {

    const {wapp} = props;
    wapp.styles.use(style)
    
    return (
        <div className={style.app}>{"HOME"}</div>
    );
}
```

```css
/*app.css*/
.app{
    color: black;
}
```

## License

MIT
