import { invoke } from "@tauri-apps/api/tauri"
import { createEffect, createResource, onMount } from "solid-js"
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
  const [range, setRange] = createStore({ start: 0, end: 1000 })
  const [data] = createResource(getCSV)

  const hyperformulaInstance = HyperFormula.buildEmpty({
    licenseKey: "gpl-v3"
  })

  let handsontable: Handsontable

  async function getCSV() {
    const csvdata = await openCSV(range.start, range.end)
    return csvdata
  }

  async function getMoreRows() {
    const newRange = { start: range.end, end: range.end + 1000 }
    const newCSVData = await openCSV(newRange.start, newRange.end)
    setCSVStore("data", csvStore.data?.concat(newCSVData.data))
    setRange(newRange)
  }

  onMount(() => {
    getCSV().then((csvdata) => {
      const container = document.querySelector("#sheet")
      handsontable = new Handsontable(container!, {
        data: csvdata.data,
        colHeaders: csvdata.headers as string[],
        rowHeaders: true,
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
        height: "95vh",
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
      setCSVStore(csvdata)
    })
  })

  // createEffect(() => {
  //   const readData = data()
  //   if (readData) setCSVStore(readData)
  // })

  createEffect(() => {
    if (csvStore.data) {
      handsontable.updateData([...csvStore.data!])
      // handsontable.updateSettings({ colHeaders: csvStore.headers as string[] })
    }
  })

  return (
    <>
      <div id="sheet" style={{ height: "100vh" }}></div>
      <button onclick={getMoreRows}>Add more rows</button>
    </>
  )
}
