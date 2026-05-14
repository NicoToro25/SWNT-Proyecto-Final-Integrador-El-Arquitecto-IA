import { useState } from 'react'

export function usePagination(initialPage = 1) {
  const [page, setPage] = useState(initialPage)

  const nextPage = () => setPage((currentPage) => currentPage + 1)
  const previousPage = () => setPage((currentPage) => Math.max(1, currentPage - 1))

  return { page, setPage, nextPage, previousPage }
}