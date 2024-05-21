/* @refresh reload */
import { render } from "solid-js/web"
import "handsontable/dist/handsontable.full.min.css"

import "./styles.css"
import AppRouter from "./routes"

render(() => <AppRouter />, document.getElementById("root") as HTMLElement)
