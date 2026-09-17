import { useState } from 'react'
import { MyBigNumber } from '../../src/MyBigNumber'
import './app.css'

const DIGITS = /^[0-9]+$/

interface NumberInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

function NumberInput({ id, label, value, onChange }: NumberInputProps) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="form-control font-monospace"
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        inputMode="numeric"
      />
    </div>
  )
}

export function App() {
  const [firstNumber, setFirstNumber] = useState('1234')
  const [secondNumber, setSecondNumber] = useState('897')
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [steps, setSteps] = useState<string[]>([])

  function onAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!DIGITS.test(firstNumber) || !DIGITS.test(secondNumber)) {
      setError('Mỗi số chỉ được chứa các kí số 0-9 (theo giả định Task 1).')
      setResult('')
      setSteps([])
      return
    }
    setError('')
    const logged: string[] = []
    const sumResult = new MyBigNumber((message) => logged.push(message)).sum(firstNumber, secondNumber)
    setResult(sumResult)
    setSteps(logged)
  }

  return (
    <div className="container py-4 app-shell">
      <h1 className="mb-3">Cộng 2 số lớn</h1>
      <p className="text-muted">
        Dùng lại lõi <code>MyBigNumber.sum()</code> (Task 1), cộng theo từng cột
        như học sinh tiểu học.
      </p>
      <form onSubmit={onAdd}>
        <NumberInput id="stn1" label="Số thứ nhất" value={firstNumber} onChange={setFirstNumber} />
        <NumberInput id="stn2" label="Số thứ hai" value={secondNumber} onChange={setSecondNumber} />
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">Cộng</button>
      </form>

      {result && (
        <div className="alert alert-success mt-3 font-monospace">
          {firstNumber} + {secondNumber} = <strong>{result}</strong>
        </div>
      )}

      {steps.length > 0 && (
        <div className="mt-3">
          <h2 className="h5">Tiến trình thực hiện phép toán</h2>
          <ol className="list-group list-group-numbered">
            {steps.map((s, i) => (
              <li key={i} className="list-group-item font-monospace">{s}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
