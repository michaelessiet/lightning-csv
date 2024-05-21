import { Router, Route } from "@solidjs/router"
import Home from "./home"
import Sheet from "./sheet"

export default function AppRouter() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/sheet" component={Sheet} />
    </Router>
  )
}
