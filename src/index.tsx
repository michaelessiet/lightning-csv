/* @refresh reload */
import { render } from "solid-js/web"
import "@univerjs/design/lib/index.css"
import "@univerjs/ui/lib/index.css"
import "@univerjs/docs-ui/lib/index.css"
import "@univerjs/sheets-ui/lib/index.css"
import "@univerjs/sheets-formula/lib/index.css"

import "./styles.css"
import AppRouter from "./routes"

render(() => <AppRouter />, document.getElementById("root") as HTMLElement)
