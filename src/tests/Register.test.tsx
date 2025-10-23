import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register'

const renderRegister = () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear?.()
  vi.restoreAllMocks()
})

describe('Register page', () => {
  // PRUEBA 1: Renderizado básico — verifica que los campos de correo, username, contraseña, confirmar y el botón estén presentes
  it('renderiza los campos y el botón Registrarse', () => {
    renderRegister()

  const correo = screen.getByLabelText(/correo/i)
  const username = screen.getByLabelText(/nombre de usuario/i)
  // Hay dos labels que contienen la palabra 'Contraseña'. Seleccionamos por el for/id
  const password = screen.getByLabelText('Contraseña') as HTMLInputElement
  const confirmar = screen.getByLabelText('Confirmar Contraseña') as HTMLInputElement
    const submit = screen.getByRole('button', { name: /registrarse/i })

    expect(correo).toBeInTheDocument()
    expect(username).toBeInTheDocument()
    expect(password).toBeInTheDocument()
    expect(confirmar).toBeInTheDocument()
    expect(submit).toBeInTheDocument()
  })

  // PRUEBA 2: Flujo exitoso — llena los campos correctamente, envía y verifica que alert sea llamado y que el usuario quede en localStorage
  it('permite registrar un usuario válido (happy path)', () => {
    renderRegister()

    // mock alert para evitar popup
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

  const correo = screen.getByLabelText(/correo/i)
  const username = screen.getByLabelText(/nombre de usuario/i)
  const password = screen.getByLabelText('Contraseña') as HTMLInputElement
  const confirmar = screen.getByLabelText('Confirmar Contraseña') as HTMLInputElement
    const submit = screen.getByRole('button', { name: /registrarse/i })

    fireEvent.change(correo, { target: { value: 'nuevo@a.com' } })
    fireEvent.change(username, { target: { value: 'Nuevo' } })
    fireEvent.change(password, { target: { value: 'abcdef' } })
    fireEvent.change(confirmar, { target: { value: 'abcdef' } })

    fireEvent.click(submit)

    // alert de éxito llamado
    expect(alertSpy).toHaveBeenCalled()

    // revisar que localStorage guardó el usuario
    const stored = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const found = stored.find((u: any) => u.email === 'nuevo@a.com')
    expect(found).toBeTruthy()
    expect(found.username).toBe('Nuevo')
  })

  // PRUEBA 3: Validaciones — email inválido, username vacío, contraseña corta y mismatch; verifica que aparezcan errores y no se guarde usuario
  it('muestra errores y no registra cuando hay validaciones (contraseña corta / mismatch)', () => {
    renderRegister()

  const correo = screen.getByLabelText(/correo/i)
  const username = screen.getByLabelText(/nombre de usuario/i)
  const password = screen.getByLabelText('Contraseña') as HTMLInputElement
  const confirmar = screen.getByLabelText('Confirmar Contraseña') as HTMLInputElement
    const submit = screen.getByRole('button', { name: /registrarse/i })

    fireEvent.change(correo, { target: { value: 'bademail' } })
    fireEvent.change(username, { target: { value: '' } })
    fireEvent.change(password, { target: { value: '123' } })
    fireEvent.change(confirmar, { target: { value: '1234' } })

    fireEvent.click(submit)

    // Deben aparecer mensajes de error en el formulario
    expect(screen.getByText(/el correo no es válido/i)).toBeInTheDocument()
    expect(screen.getByText(/el username es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument()
    expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()

    // localStorage no debe tener usuarios nuevos
    const stored = JSON.parse(localStorage.getItem('usuarios') || '[]')
    expect(stored.length).toBe(0)
  })

  // PRUEBA 4: Duplicado — si el correo ya existe en localStorage, muestra error y no crea un nuevo registro
  it('no permite registrar un correo ya existente', () => {
    // semilla con usuario existente
    const seed = [{ username: 'Exist', email: 'exist@a.com', password: 'password' }]
    localStorage.setItem('usuarios', JSON.stringify(seed))

    renderRegister()

    const correo = screen.getByLabelText(/correo/i)
    const username = screen.getByLabelText(/nombre de usuario/i)
  const password = screen.getByLabelText('Contraseña') as HTMLInputElement
  const confirmar = screen.getByLabelText('Confirmar Contraseña') as HTMLInputElement
    const submit = screen.getByRole('button', { name: /registrarse/i })

    fireEvent.change(correo, { target: { value: 'exist@a.com' } })
    fireEvent.change(username, { target: { value: 'NewName' } })
    fireEvent.change(password, { target: { value: 'abcdef' } })
    fireEvent.change(confirmar, { target: { value: 'abcdef' } })

    fireEvent.click(submit)

    // Debe mostrar el mensaje de correo ya registrado
    expect(screen.getByText(/el correo ya está registrado/i)).toBeInTheDocument()

    // No se debe haber añadido un nuevo usuario con ese email
    const stored = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const matches = stored.filter((u: any) => u.email === 'exist@a.com')
    expect(matches.length).toBe(1)
  })

})
