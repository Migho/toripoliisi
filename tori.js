import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts';

export default async function getNewToriItems(url, previousTopId, previousDate) {
  const res = await fetch(url)
  const html = await res.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const items = doc.querySelectorAll(':not(.polepos_row).item_row_flex')
  const results = []
  let i = 1
  let id = 0

  for (const item of items) {
    id = parseInt(item.attributes.id.replace(/\D/g,''))
    if (previousTopId !== null && id <= previousTopId) break // we are making an assumption here that smaller ID = older item

    const url = item.attributes.href
    const rawDate = item.querySelector('.date_image').childNodes[0].nodeValue

    const now = new Date();
    const hours = rawDate.split(':')[0].slice(-2)
    const minutes = rawDate.split(':')[1].substring(0,2)
    let published = null
    if (rawDate.includes('t�n��n')) {
      published = new Date(now.getFullYear(), now.getMonth(), now.getDay(), hours, minutes)
    } else if (rawDate.includes('eilen')) {
      published = new Date(now.getFullYear(), now.getMonth(), now.getDay()-1, hours, minutes)
    } else {
      break // it is simpler to just skip these, after all the user is probably not interested about items posted two days ago
    }
    if (previousDate !== null && published < previousDate) break // should not be necessary if the ID break works

    results.push({
      id: id,
      url: url,
      date: published,
    })
    i++
  }
  return results
}