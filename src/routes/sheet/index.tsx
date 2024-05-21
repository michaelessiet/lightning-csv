import { invoke } from "@tauri-apps/api/tauri"
import { createEffect, createResource } from "solid-js"
import { ReadCSVResponse } from "../../types/csv"
import { createStore } from "solid-js/store"
import Handsontable from "handsontable"
import { HyperFormula } from "hyperformula"

async function openCSV(start = 0, end = 1000) {
  const csvData = (await invoke("read_csv", {
    start: start,
    end: end
  })) as ReadCSVResponse
  return csvData
}

export default function Sheet() {
  const [csvStore, setCSVStore] = createStore<Partial<ReadCSVResponse>>()
  const [range, setRange] = createStore({ start: 0, end: 10 })
  const [data, { refetch }] = createResource(getCSV)

  async function getCSV() {
    return openCSV(range.start, range.end)
  }

  createEffect(() => {
    const readData = data()
    if (readData) setCSVStore(readData)
  })

  createEffect(
    (prevRange) => {
      if (prevRange !== range) refetch()
    },
    [range]
  )

  createEffect(() => {
    if ((csvStore.data, csvStore.headers)) {
      const container = document.querySelector("#sheet")
      const hyperformulaInstance = HyperFormula.buildEmpty({
        licenseKey: "gpl-v3"
      })

      new Handsontable(container!, {
        data: [...csvStore.data!],
        rowHeaders: true,
        colHeaders: csvStore.headers as string[],
        contextMenu: true,
        multiColumnSorting: true,
        filters: true,
        manualRowMove: true,
        autoWrapCol: true,
        autoWrapRow: true,
        dropdownMenu: true,
        manualColumnResize: true,
        formulas: {
          engine: hyperformulaInstance
        },
        height: "100vh",
        licenseKey: "non-commercial-and-evaluation",
        afterChange: (changes, source) => {
          if (source === "loadData") {
            return
          }
          changes?.forEach((change) => {
            const [row, column, oldValue, newValue] = change
            if (oldValue !== newValue) {
              setCSVStore("data", row, column as number, newValue)
            }
          })
        }
      })
    }
  })

  createEffect(() => console.log(csvStore.data))

  return <div id="sheet" style={{ height: "100vh" }}></div>
}
