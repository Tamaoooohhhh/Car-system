import { Link } from 'react-router-dom'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { apiUrl } from '../lib/api.js'

export default function AssessorLogin() {
  const params = new URLSearchParams(window.location.search)
  const error = params.get('error') === 'configuracion'
    ? 'El acceso de asesores no está configurado todavía.'
    : params.has('error')
      ? 'Usuario o clave incorrectos.'
      : ''

  return (
    <main className="min-h-screen bg-paper px-4 py-12">
      <div className="mx-auto max-w-md">
        <Link to="/" className="link inline-flex items-center gap-2"><ArrowLeft size={16} aria-hidden="true" /> Volver al sitio</Link>
        <section className="mt-8 rounded-xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <img src="/logo.png" alt="CarSystem" className="mb-6 h-12 w-auto" />
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-teal-tint text-navy"><LockKeyhole size={20} aria-hidden="true" /></span>
            <div>
              <h1 className="text-2xl">Acceso de asesores</h1>
              <p className="mt-1 text-sm text-muted">Ingresa con las credenciales del equipo.</p>
            </div>
          </div>
          <form className="grid gap-4" action={apiUrl('/api/asesores/login')} method="post">
            <div>
              <label htmlFor="assessor-username" className="mb-1 block text-sm font-semibold">Usuario</label>
              <input id="assessor-username" name="usuario" className="input" autoComplete="username" required maxLength={100} />
            </div>
            <div>
              <label htmlFor="assessor-password" className="mb-1 block text-sm font-semibold">Clave</label>
              <input id="assessor-password" name="clave" type="password" className="input" autoComplete="current-password" required maxLength={200} />
            </div>
            {error && <p className="text-sm text-bad" role="alert">{error}</p>}
            <button type="submit" className="btn btn-dark mt-2 w-full">
              Ingresar
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
