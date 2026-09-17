import { I18nProvider } from './app/providers/I18nProvider'
import { RouterProvider } from './app/router/RouterProvider'

function App() {
  return (
    <I18nProvider>
      <RouterProvider />
    </I18nProvider>
  )
}

export default App
