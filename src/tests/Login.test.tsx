import type { ComponentProps } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Login from '../pages/Login'

const { mockLoginUser, mockGetUserByCorreo } = vi.hoisted(() => ({
  mockLoginUser: vi.fn(),
  mockGetUserByCorreo: vi.fn(),
}))

vi.mock('../services/usuarioService', () => ({
  __esModule: true,
  default: {
    loginUser: mockLoginUser,
    getUserByCorreo: mockGetUserByCorreo,
  },
  loginUser: mockLoginUser,
  getUserByCorreo: mockGetUserByCorreo,
}))

type LoginProps = ComponentProps<typeof Login>

// Helpers
const renderLogin = (overrideProps: Partial<LoginProps> = {}) => {
  const setSesionIniciada = vi.fn()
  const props: LoginProps = { setSesionIniciada, ...overrideProps } as LoginProps

  render(
    <MemoryRouter>
      <Login {...props} />
    </MemoryRouter>
  )
  return { setSesionIniciada }
}

beforeEach(() => {
  localStorage.clear?.()
  mockLoginUser.mockReset()
  mockGetUserByCorreo.mockReset()
})

describe('Login page', () => {
  it('renderiza los campos de correo, contraseña y el botón Entrar', () => {
    renderLogin()

    const email = screen.getByLabelText(/correo/i)
    const password = screen.getByLabelText(/contrase/i)
    const submit = screen.getByRole('button', { name: /entrar/i })

    expect(email).toBeInTheDocument()
    expect(password).toBeInTheDocument()
    expect(submit).toBeInTheDocument()
  })

  it('ejecuta el flujo exitoso contra la API y marca la sesión iniciada', async () => {
    mockLoginUser.mockResolvedValueOnce({ data: {} })
    mockGetUserByCorreo.mockResolvedValueOnce({ data: { nombre: 'Tester', correo: 'test@condor.cl' } })

    const { setSesionIniciada } = renderLogin()

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'test@condor.cl' } })
    fireEvent.change(screen.getByLabelText(/contrase/i), { target: { value: 'Secreta123' } })

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({ correo: 'test@condor.cl', password: 'Secreta123' })
      expect(mockGetUserByCorreo).toHaveBeenCalledWith('test@condor.cl')
      expect(setSesionIniciada).toHaveBeenCalledWith(true)
    })
    expect(localStorage.getItem('usuarioActual')).toBe('test@condor.cl')
  })

  it('muestra un mensaje amigable cuando el backend rechaza las credenciales', async () => {
    mockLoginUser.mockRejectedValueOnce({ response: { status: 401 } })

    renderLogin()

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'bad@condor.cl' } })
    fireEvent.change(screen.getByLabelText(/contrase/i), { target: { value: 'wrong' } })

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await screen.findByText(/correo o contraseña incorrectos/i)
    expect(mockGetUserByCorreo).not.toHaveBeenCalled()
  })
})
