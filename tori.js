const API_URL = 'https://api.tori.fi/api/v1.2/public/ads?'

export async function getNewToriItems(url, previousId, previousTimestamp) {
  const response = await fetch(API_URL + url.split('?')[1])
  const json = await response.json()

  // Sort by timestamp
  const sortedItems = json.list_ads.sort((a, b) => b.ad.list_time.value - a.ad.list_time.value)

  const results = []
  for (const item of sortedItems) {
    const timestamp = item.ad.list_time.value
    if (timestamp <= previousTimestamp) break

    const id = item.ad.list_id_code
    const url = item.ad.share_link
    const subject = item.ad.subject
    console.log(item.ad)
    const price = item.ad.list_price?.label

    results.push({
      id,
      url,
      timestamp,
      subject,
      price,
    })
  }
  return results
}

export function getToriItemName(url) {
  const args = new URLSearchParams(new URL(url).search)
  const search = args.get('q')
  if (search) {
    return search
  } else {
    return url
  }
}