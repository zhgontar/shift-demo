/// <reference types="node"/>
import { loadMatrixFromXlsx } from '../src/excelMatrix'
import * as fs from 'fs'

const inPath = process.argv[2] || './data/shift_matrix.xlsx'
const outPath = process.argv[3] || '../frontend/public/shift_matrix.json'

const rows = loadMatrixFromXlsx(inPath)
fs.mkdirSync(require('path').dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, JSON.stringify(rows, null, 2), 'utf8')
console.log(`Saved ${rows.length} rows to ${outPath}`)
