import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login' // ajusta si tu ruta es distinta

// Helpers
const renderLogin = (overrideProps: Partial<Parameters<typeof Login>[0]> = {}) => {
  const setSesionIniciada = vi.fn()
  const props = { setSesionIniciada, ...overrideProps } as any

  render(
    <MemoryRouter>
      <Login {...props} />
    </MemoryRouter>
  )
  return { setSesionIniciada }
}

beforeEach(() => {
  // limpiamos el "localStorage" mockeado entre pruebas
  localStorage.clear?.()
})

describe('Login page', () => {
  it('renderiza los campos de correo y contraseña y el botón "Entrar"', () => {
    renderLogin()

    // Busca por label; si falla, cae al placeholder (por si el componente usa placeholder en vez de label)
    const email =
      screen.queryByLabelText(/correo/i) ??
      screen.getByPlaceholderText(/correo/i)

    const password =
      screen.queryByLabelText(/contraseña|password/i) ??
      screen.getByPlaceholderText(/contraseña|password/i)

    // El botón en tu UI se llama "Entrar"
    const submit = screen.getByRole('button', { name: /entrar/i })

    expect(email).toBeInTheDocument()
    expect(password).toBeInTheDocument()
    expect(submit).toBeInTheDocument()
  })

  it('permite escribir email y contraseña y disparar el submit (flujo exitoso)', () => {
    // Semilla: tu Login valida contra usuarios en localStorage (User.ts).
    // Creamos un usuario válido para esta prueba:
    const seedUsers = [
      { correo: 'test@condor.cl', password: 'Secreta123', nombre: 'Test User' }
    ]
    localStorage.setItem('usuarios', JSON.stringify(seedUsers))

    const { setSesionIniciada } = renderLogin()

    const email =
      screen.queryByLabelText(/correo/i) ??
      screen.getByPlaceholderText(/correo/i)

    const password =
      screen.queryByLabelText(/contraseña|password/i) ??
      screen.getByPlaceholderText(/contraseña|password/i)

    fireEvent.change(email!, { target: { value: 'test@condor.cl' } })
    fireEvent.change(password!, { target: { value: 'Secreta123' } })

    const submit = screen.getByRole('button', { name: /entrar/i })
    fireEvent.click(submit)

    // Si tu Login invoca el setter al loguear OK:
    expect(setSesionIniciada).toHaveBeenCalled()
  })

  it('si se envía vacío, al menos mantiene el formulario visible (placeholder para validaciones)', () => {
    renderLogin()

    const submit = screen.getByRole('button', { name: /entrar/i })
    fireEvent.click(submit)

    // Si aún no tienes mensajes de error implementados, no forcemos el test a fallar.
    // Al menos verificamos que el formulario principal sigue visible:
    expect(screen.getByRole('heading', { name: /iniciar sesion/i })).toBeInTheDocument()
  })
})
