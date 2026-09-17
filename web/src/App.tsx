import { useState } from 'react'
import { MyBigNumber } from '../../src/MyBigNumber'

const DIGITS = /^[0-9]+$/

export function App() {
  const [a, setA] = useState('1234')
  const [b, setB] = useState('897')
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [steps, setSteps] = useState<string[]>([])

  function onAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!DIGITS.test(a) || !DIGITS.test(b)) {
      setError('Moi so chi duoc chua cac ki so 0-9 (theo gia dinh Task 1).')
      setResult('')
      setSteps([])
      return
    }
    setError('')
    const logged: string[] = []
    const r = new MyBigNumber((m) => logged.push(m)).sum(a, b)
    setResult(r)
    setSteps(logged)
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h1 className="mb-3">Cong 2 so lon</h1>
      <p className="text-muted">
        Dung lai loi <code>MyBigNumber.sum()</code> (Task 1), cong theo tung cot
        nhu hoc sinh tieu hoc.
      </p>
      <form onSubmit={onAdd}>
        <div className="mb-3">
          <label className="form-label" htmlFor="stn1">So thu nhat</label>
          <input
            id="stn1"
            className="form-control font-monospace"
            value={a}
            onChange={(e) => setA(e.target.value.trim())}
            inputMode="numeric"
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="stn2">So thu hai</label>
          <input
            id="stn2"
            className="form-control font-monospace"
            value={b}
            onChange={(e) => setB(e.target.value.trim())}
            inputMode="numeric"
          />
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary">Cong</button>
      </form>

      {result && (
        <div className="alert alert-success mt-3 font-monospace">
          {a} + {b} = <strong>{result}</strong>
        </div>
      )}

      {steps.length > 0 && (
        <div className="mt-3">
          <h2 className="h5">Tien trinh thuc hien phep toan</h2>
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
