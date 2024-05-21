import { For, createSignal } from "solid-js"
import { invoke } from "@tauri-apps/api/tauri"
import { createStore } from "solid-js/store"
import { A } from "@solidjs/router"

function Home() {
  const [greetMsg, setGreetMsg] = createSignal("")
  const [name, setName] = createSignal("")
  const [csv, setCSV] = createStore({})

  async function greet() {
    setGreetMsg(await invoke("greet", { name: name() }))
    console.log("hello")
  }

  // async function printCSV() {
  //   const csvData = await invoke("read_csv", { start: 0, end: 1000 })
  //   setCSV(csvData)
  // }

  return (
    <div class="container">
      <button onClick={greet}>greet</button>
      {/* <button onClick={printCSV}>Print CSV</button> */}
      <A href="/sheet">Open CSV</A>
      {/* <p>{JSON.stringify(csv(), null, 2)}</p> */}
      {/* <table>
        <thead>
          <tr>
            <For each={csv.headers}>{(header) => <th>{header}</th>}</For>
          </tr>
        </thead>
        <tbody>
          <For each={csv.data}>
            {(row) => (
              <tr>
                <For each={row}>{(cell) => <td>{cell}</td>}</For>
              </tr>
            )}
          </For>
        </tbody>
      </table> */}
    </div>
  )
}

export default Home
