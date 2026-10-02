import type * as Monaco from 'monaco-editor'

export const COMPACT_LANGUAGE_ID = 'compact'
export const COMPACT_LANGUAGE_VERSION = '0.23'
export const COMPACT_PRAGMA = `pragma language_version ${COMPACT_LANGUAGE_VERSION};`

const keywords = [
  'export', 'from', 'import', 'module', 'prefix', 'as', 'assert', 'circuit', 'const',
  'constructor', 'contract', 'default', 'disclose', 'else', 'emit', 'enum', 'fold',
  'for', 'if', 'implements', 'include', 'ledger', 'map', 'new', 'of', 'pad', 'pragma',
  'pure', 'return', 'sealed', 'slice', 'struct', 'type', 'witness',
]

const primitiveTypes = ['Boolean', 'Field', 'Uint', 'Bytes', 'Opaque', 'Vector']
const standardTypes = ['Counter', 'Map', 'Set', 'Maybe', 'Either', 'MerkleTreePath', 'HistoricMerkleTree']
const standardFunctions = [
  'assert', 'disclose', 'pad', 'persistentHash', 'persistentCommit', 'transientHash',
  'transientCommit', 'merkleTreePathRoot', 'merkleTreePathRootNoLeafHash', 'some', 'none', 'left', 'right',
]
const memberOperations = ['member', 'insert', 'checkRoot', 'leaf', 'root']
const booleans = ['true', 'false']

const snippets = [
  { label: 'pragma', detail: 'Compact 0.23 language pragma', insertText: COMPACT_PRAGMA, kind: 'Keyword' },
  { label: 'stdlib', detail: 'Import the Compact standard library', insertText: 'import CompactStandardLibrary;', kind: 'Keyword' },
  { label: 'ledger', detail: 'Public ledger declaration', insertText: 'export ledger ${1:name}: ${2:Bytes<32>};', kind: 'Snippet' },
  { label: 'witness', detail: 'Private witness declaration', insertText: 'witness ${1:name}(): ${2:Bytes<32>};', kind: 'Snippet' },
  { label: 'circuit', detail: 'Exported circuit declaration', insertText: 'export circuit ${1:name}(): [] {\n  ${0}\n}', kind: 'Snippet' },
  { label: 'constructor', detail: 'Constructor declaration', insertText: 'constructor() {\n  ${0}\n}', kind: 'Snippet' },
  { label: 'struct', detail: 'Struct declaration', insertText: 'struct ${1:Name} {\n  ${2:field}: ${3:Bytes<32>}\n}', kind: 'Snippet' },
  { label: 'enum', detail: 'Enum declaration', insertText: 'enum ${1:Name} {\n  ${2:Variant}\n}', kind: 'Snippet' },
  { label: 'assert', detail: 'Assertion', insertText: 'assert(${1:condition});', kind: 'Snippet' },
  { label: 'if', detail: 'Conditional statement', insertText: 'if (${1:condition}) {\n  ${0}\n}', kind: 'Snippet' },
  {
    label: 'merkle-eligibility',
    detail: 'Verified local Merkle eligibility subset',
    insertText: 'const ${1:authPath} = ${2:findAuthPath}(${3:pk});\nassert(${1:authPath}.leaf == ${3:pk});\nassert(${4:authorizedCommitments}.checkRoot(disclose(merkleTreePathRoot<${5:10}, ${6:Bytes<32>}>(${1:authPath}))));',
    kind: 'Snippet',
  },
  {
    label: 'nullifier',
    detail: 'Verified local Set nullifier subset',
    insertText: 'const ${1:nul} = persistentHash<Vector<2, Bytes<32>>>([pad(32, "vote:nullifier"), ${2:secretKey()}]);\nassert(!${3:authorizedNullifiers}.member(disclose(${1:nul})));\n${3:authorizedNullifiers}.insert(disclose(${1:nul}));',
    kind: 'Snippet',
  },
]

const hoverDocs: Record<string, string> = {
  ledger: '**ledger** declares contract state stored in the public ledger. It is a declaration, not compiler validation.',
  witness: '**witness** declares a private off-chain input supplied by the application. The witness implementation is outside Compact.',
  circuit: '**circuit** defines executable contract logic that can be called by the application. This editor does not compile or validate it.',
  disclose: '**disclose** explicitly marks a value for disclosure at a public boundary.',
  persistentHash: '**persistentHash** derives a persistent hash from Compact values for use in stable contract data.',
  persistentCommit: '**persistentCommit** derives a persistent commitment from a value and its opening.',
  merkleTreePathRoot: '**merkleTreePathRoot** computes a Merkle root from a Merkle tree path.',
  member: '**Set.member** checks whether a value is present in a Set.',
  insert: '**Set.insert** adds a value to a Set.',
}

function tokenProvider(monaco: typeof Monaco): Monaco.languages.IMonarchLanguage {
  return {
    defaultToken: '',
    tokenPostfix: '.compact',
    keywords,
    typeKeywords: [...primitiveTypes, ...standardTypes],
    standardFunctions,
    memberOperations,
    booleans,
    operators: ['=', '==', '!=', '<', '>', '<=', '>=', '!', '&&', '||', '+', '-', '*', '/', '%', '=>'],
    symbols: /[=><!~?:&|+\-*\/%]+/,
    tokenizer: {
      root: [
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        [/[{}()[\]]/, '@brackets'],
        [/[<>](?!@symbols)/, '@brackets'],
        [/[;,.]/, 'delimiter'],
        [/[a-zA-Z_][\w$]*/, { cases: { '@keywords': 'keyword', '@typeKeywords': 'type', '@booleans': 'constant.boolean', '@standardFunctions': 'predefined', '@memberOperations': 'method', '@default': 'identifier' } }],
        [/(0\.23|\d+\.\d+)/, 'number.version'],
        [/(0[xX][0-9a-fA-F]+|\d+(\.\d+)?([eE][+-]?\d+)?)/, 'number'],
        [/"([^"\\]|\\.)*$/, 'string.invalid'],
        [/"/, 'string', '@string'],
        [/'([^'\\]|\\.)*$/, 'string.invalid'],
        [/'/, 'string', '@singleQuoteString'],
        [/@symbols/, { cases: { '@operators': 'operator', '@default': 'delimiter' } }],
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\/\*/, 'comment', '@push'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment'],
      ],
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, 'string', '@pop'],
      ],
      singleQuoteString: [
        [/[^\\']+/, 'string'],
        [/\\./, 'string.escape'],
        [/'/, 'string', '@pop'],
      ],
    },
  }
}

export function registerCompactLanguage(monaco: typeof Monaco): void {
  const state = globalThis as typeof globalThis & { __compactMonacoRegistered?: WeakSet<object> }
  const registered = state.__compactMonacoRegistered ?? new WeakSet<object>()
  state.__compactMonacoRegistered = registered
  if (registered.has(monaco)) return

  monaco.languages.register({ id: COMPACT_LANGUAGE_ID, extensions: ['.compact'], aliases: ['Compact'] })
  monaco.languages.setMonarchTokensProvider(COMPACT_LANGUAGE_ID, tokenProvider(monaco))
  monaco.languages.setLanguageConfiguration(COMPACT_LANGUAGE_ID, {
    comments: { lineComment: '//', blockComment: ['/*', '*/'] },
    brackets: [['{', '}'], ['[', ']'], ['(', ')'], ['<', '>']],
    autoClosingPairs: [{ open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' }, { open: '"', close: '"' }, { open: "'", close: "'" }],
    surroundingPairs: [{ open: '{', close: '}' }, { open: '[', close: ']' }, { open: '(', close: ')' }, { open: '"', close: '"' }, { open: "'", close: "'" }],
    indentationRules: { increaseIndentPattern: /\{[^}]*$/, decreaseIndentPattern: /^\s*\}/ },
  })
  monaco.editor.defineTheme('compact-dark', {
    base: 'vs-dark', inherit: true, rules: [
      { token: 'keyword', foreground: 'C586C0' }, { token: 'type', foreground: '4EC9B0' },
      { token: 'identifier', foreground: 'D4D4D4' }, { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.version', foreground: 'CE9178' }, { token: 'string', foreground: 'CE9178' },
      { token: 'comment', foreground: '6A9955' }, { token: 'operator', foreground: 'D4D4D4' },
      { token: 'delimiter', foreground: 'D4D4D4' },
    ], colors: { 'editor.background': '#111111', 'editorLineNumber.foreground': '#666666' },
  })
  monaco.languages.registerCompletionItemProvider(COMPACT_LANGUAGE_ID, {
    triggerCharacters: ['.'],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position)
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn }
      return { suggestions: snippets.map((item) => ({ ...item, kind: monaco.languages.CompletionItemKind[item.kind === 'Snippet' ? 'Snippet' : 'Keyword'], insertTextRules: item.kind === 'Snippet' ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet : undefined, range })) }
    },
  })
  monaco.languages.registerHoverProvider(COMPACT_LANGUAGE_ID, {
    provideHover(model, position) {
      const word = model.getWordAtPosition(position)?.word
      const key = word && (hoverDocs[word] || (model.getLineContent(position.lineNumber).slice(0, position.column - 1).endsWith('.') ? hoverDocs[word] : undefined))
      return key ? { contents: [{ value: key }] } : null
    },
  })
  registered.add(monaco)
}
