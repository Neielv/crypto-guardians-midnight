import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { useEffect, useRef } from 'react'
import { registerCompactLanguage } from './compact-language'

loader.config({ monaco })

const globalSelf = self as typeof self & {
  MonacoEnvironment: {
    getWorker: (_workerId: string, label: string) => Worker
  }
}

globalSelf.MonacoEnvironment = {
  getWorker: (_workerId, _label) => new editorWorker(),
}

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  modelKey: string
  minHeight?: number
}

export function CodeEditor({ value, onChange, modelKey, minHeight = 240 }: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const modelChangeListenerRef = useRef<monaco.IDisposable | null>(null)
  const isSynchronizingRef = useRef(false)
  const isMountedRef = useRef(false)
  const pendingValueRef = useRef(value)
  const onChangeRef = useRef(onChange)

  pendingValueRef.current = value
  onChangeRef.current = onChange

  const synchronizeModel = (nextValue: string) => {
    const model = editorRef.current?.getModel()
    if (!model || model.getValue() === nextValue) return

    isSynchronizingRef.current = true
    pendingValueRef.current = nextValue
    model.setValue(nextValue)
    isSynchronizingRef.current = false
  }

  useEffect(() => {
    pendingValueRef.current = value
    synchronizeModel(value)
  }, [value])

  useEffect(() => () => {
    modelChangeListenerRef.current?.dispose()
  }, [])

  return (
    <div className="code-lab-runner__editor">
      <div className="code-lab-runner__editor-toolbar">
        <div className="code-lab-runner__editor-label" id={`code-editor-label-${modelKey}`}>
          <span className="code-lab-runner__editor-kicker">Compact 0.23</span>
          <span className="code-lab-runner__editor-title">Code editor</span>
        </div>
        <span className="code-lab-runner__editor-status" aria-label="Editor status: ready">
          <span className="code-lab-runner__editor-status-dot" aria-hidden="true" />
          Ready
        </span>
      </div>
      <div className="code-lab-runner__monaco" style={{ minHeight }}>
           <Editor
            height={`clamp(${minHeight}px, 34vh, 380px)`}
           path={`code-lab/${modelKey}.compact`}
           language="compact"
           theme="compact-dark"
           value={value}
            onChange={(nextValue, event) => {
              const pendingValue = pendingValueRef.current

              // Monaco can report an undefined value while a model is being
              // attached. Never turn a restored draft into an empty draft.
              if (nextValue === undefined) {
                if (pendingValue !== '') synchronizeModel(pendingValue)
                return
              }

              // setValue and model attachment can emit a flush event before
              // React has delivered the restored value to the editor.
              if (
                !isSynchronizingRef.current &&
                nextValue === '' &&
                pendingValue !== '' &&
                (!isMountedRef.current || event.isFlush)
              ) {
                synchronizeModel(pendingValue)
                return
              }

              if (isSynchronizingRef.current) return
              pendingValueRef.current = nextValue
              onChangeRef.current(nextValue)
            }}
           onMount={(editor) => {
              editorRef.current = editor
              isMountedRef.current = true
              modelChangeListenerRef.current?.dispose()
              modelChangeListenerRef.current = editor.onDidChangeModel(() => {
                synchronizeModel(pendingValueRef.current)
              })
              synchronizeModel(pendingValueRef.current)
            }}
          loading={<div className="code-lab-runner__editor-loading">Loading editor…</div>}
          options={{
            ariaLabel: 'Compact code editor',
             automaticLayout: true,
             fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
             fontSize: 15,
             lineHeight: 24,
             minimap: { enabled: false },
             padding: { top: 16, bottom: 16 },
             renderLineHighlight: 'line',
             scrollBeyondLastLine: false,
             selectionHighlight: true,
             wordWrap: 'off',
          }}
           wrapperProps={{ 'aria-labelledby': `code-editor-label-${modelKey}` }}
           beforeMount={registerCompactLanguage}
        />
      </div>
    </div>
  )
}
