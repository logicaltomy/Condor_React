import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Register from '../pages/Register'

const { mockRegisterUser } = vi.hoisted(() => ({
  mockRegisterUser: vi.fn(),
}))

vi.mock('../services/usuarioService', () => ({
  __esModule: true,
  default: {
    registerUser: mockRegisterUser,
  },
  registerUser: mockRegisterUser,
}))

const renderRegister = () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear?.()
  mockRegisterUser.mockReset()
})

describe('Register page', () => {
  it('renderiza los campos principales y el botón Registrarse', () => {
    renderRegister()

    const correo = screen.getByLabelText(/correo/i)
    const username = screen.getByLabelText(/nombre de usuario/i)
    const password = screen.getByLabelText('Contraseña') as HTMLInputElement
    const confirmar = screen.getByLabelText('Confirmar Contraseña') as HTMLInputElement
    const submit = screen.getByRole('button', { name: /registrarse/i })

    expect(correo).toBeInTheDocument()
    expect(username).toBeInTheDocument()
    expect(password).toBeInTheDocument()
    expect(confirmar).toBeInTheDocument()
    expect(submit).toBeInTheDocument()
  })

  it('envía los datos al backend cuando el formulario es válido', async () => {
    mockRegisterUser.mockResolvedValueOnce({ data: {} })
    renderRegister()

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'nuevo@a.com' } })
    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), { target: { value: 'Nuevo' } })
    fireEvent.change(screen.getByPlaceholderText(/respuesta 1/i), { target: { value: 'Azul' } })
    fireEvent.change(screen.getByPlaceholderText(/respuesta 2/i), { target: { value: 'Firulais' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'abcdef' } })
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'abcdef' } })

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }))

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalled()
    })

    expect(mockRegisterUser.mock.calls[0][0]).toMatchObject({
      nombre: 'Nuevo',
      correo: 'nuevo@a.com',
      contrasena: 'abcdef',
      preguntaSeguridad1: expect.any(String),
      respuestaSeguridad1: 'Azul',
      respuestaSeguridad2: 'Firulais',
    })
    await screen.findByText(/te has registrado con exito/i)
  })

  it('muestra errores y evita el submit cuando las validaciones fallan', () => {
    renderRegister()

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'bademail' } })
    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: '1234' } })

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }))

    expect(screen.getByText(/el correo no es válido/i)).toBeInTheDocument()
    expect(screen.getByText(/el username es obligatorio/i)).toBeInTheDocument()
    expect(screen.getByText(/al menos 6 caracteres/i)).toBeInTheDocument()
    expect(screen.getByText(/no coinciden/i)).toBeInTheDocument()
    expect(mockRegisterUser).not.toHaveBeenCalled()
  })

  it('bloquea correos duplicados usando la validación local', () => {
    const seed = [{ username: 'Exist', email: 'exist@a.com', password: 'password' }]
    localStorage.setItem('usuarios', JSON.stringify(seed))

    renderRegister()

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'exist@a.com' } })
    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), { target: { value: 'NewName' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'abcdef' } })
    fireEvent.change(screen.getByLabelText('Confirmar Contraseña'), { target: { value: 'abcdef' } })

    fireEvent.click(screen.getByRole('button', { name: /registrarse/i }))

    expect(screen.getByText(/el correo ya está registrado/i)).toBeInTheDocument()
    expect(mockRegisterUser).not.toHaveBeenCalled()
  })
})
