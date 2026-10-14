/** Ubah "0812-345-678", "+62 812…" atau "62812…" menjadi format internasional tanpa simbol; null bila tidak valid. */
export function toWhatsAppNumber(raw: string) {
  let n = raw.replace(/\D/g, '')
  if (n.startsWith('0')) n = '62' + n.slice(1)
  return n.length >= 9 && n.length <= 15 ? n : null
}
