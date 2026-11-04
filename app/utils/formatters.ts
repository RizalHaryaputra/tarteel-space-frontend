// Helper parsing tanggal aman untuk string SQL (YYYY-MM-DD HH:MM:SS atau ISO) ke zona waktu WIB (Asia/Jakarta)
export const parseSqlDate = (dateStr: string): Date => {
  if (!dateStr) return new Date()
  const cleanStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T')
  return new Date(cleanStr)
}

export const formatDateWIB = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateStr) return '-'
  const d = parseSqlDate(dateStr)
  return d.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  })
}

export const formatDateTimeWIB = (dateStr: string): string => {
  if (!dateStr) return '-'
  const d = parseSqlDate(dateStr)
  return d.toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

