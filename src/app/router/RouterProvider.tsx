import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

export function RouterProvider() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppRoutes />
    </BrowserRouter>
  )
}
