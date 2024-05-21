import { Router, Route } from "@solidjs/router"
import Home from "./home"

export default function AppRouter() {
  return (
    <Router>
      <Route path="/" component={Home} />
    </Router>
  )
}
