import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Ajustes from '../pages/Ajustes'

const { mockGetUserByCorreo, mockDeleteUsuario, mockUpdateNombre, mockUpdateCorreo, mockCerrarSesion } = vi.hoisted(() => ({
  mockGetUserByCorreo: vi.fn(),
  mockDeleteUsuario: vi.fn(),
  mockUpdateNombre: vi.fn(),
  mockUpdateCorreo: vi.fn(),
  mockCerrarSesion: vi.fn(),
}))

vi.mock('../services/usuarioService', () => ({
  __esModule: true,
  default: {
    getUserByCorreo: mockGetUserByCorreo,
    deleteUsuario: mockDeleteUsuario,
    updateNombre: mockUpdateNombre,
    updateCorreo: mockUpdateCorreo,
  },
  getUserByCorreo: mockGetUserByCorreo,
  deleteUsuario: mockDeleteUsuario,
  updateNombre: mockUpdateNombre,
  updateCorreo: mockUpdateCorreo,
}))

vi.mock('../Sesion', () => ({
  cerrarSesion: mockCerrarSesion,
}))

const renderAjustes = (overrideProps: Partial<Parameters<typeof Ajustes>[0]> = {}) => {
  const setSesionIniciada = vi.fn()
  render(
    <MemoryRouter>
      <Ajustes setSesionIniciada={setSesionIniciada} {...overrideProps} />
    </MemoryRouter>
  )
  return { setSesionIniciada }
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear?.()
  mockGetUserByCorreo.mockReset()
  mockDeleteUsuario.mockReset()
  mockUpdateNombre.mockReset()
  mockUpdateCorreo.mockReset()
  mockCerrarSesion.mockReset()
})

describe('Ajustes page', () => {
  it('renderiza las secciones principales y precarga los datos del usuario', async () => {
    localStorage.setItem('usuarioActual', 'user@condor.cl')
    mockGetUserByCorreo.mockResolvedValue({ data: { nombre: 'User', correo: 'user@condor.cl', id: 42 } })

    renderAjustes()

    expect(screen.getByText(/eliminar usuario/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByDisplayValue('User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('user@condor.cl')).toBeInTheDocument()
    })
  })

  it('muestra mensaje cuando el correo a eliminar no coincide con la sesión', () => {
    localStorage.setItem('usuarioActual', 'activo@condor.cl')
    renderAjustes()

    fireEvent.change(screen.getByPlaceholderText(/correo@ejemplo.com/i), { target: { value: 'otro@condor.cl' } })
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))

    expect(screen.getByText(/correos no coinciden/i)).toBeInTheDocument()
  })

  it('elimina al usuario actual cuando la API responde correctamente', async () => {
    localStorage.setItem('usuarioActual', 'elim@condor.cl')
    mockGetUserByCorreo.mockResolvedValue({ data: { id: 12, correo: 'elim@condor.cl', nombre: 'Elim' } })
    mockDeleteUsuario.mockResolvedValue({})
    vi.spyOn(window, 'confirm').mockImplementation(() => true)

    const { setSesionIniciada } = renderAjustes()

    fireEvent.change(screen.getByPlaceholderText(/correo@ejemplo.com/i), { target: { value: 'elim@condor.cl' } })
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))

    await waitFor(() => {
      expect(mockGetUserByCorreo).toHaveBeenCalledWith('elim@condor.cl')
      expect(mockDeleteUsuario).toHaveBeenCalledWith(12)
      expect(mockCerrarSesion).toHaveBeenCalled()
      expect(setSesionIniciada).toHaveBeenCalledWith(false)
    })
    await screen.findByText(/desactivado correctamente/i)
  })

  it('actualiza nombre y correo cuando son distintos en el formulario', async () => {
    localStorage.setItem('usuarioActual', 'user@condor.cl')
    mockGetUserByCorreo.mockResolvedValue({ data: { id: 7, nombre: 'User', correo: 'user@condor.cl' } })

    renderAjustes()

    const nombreInput = (await screen.findByLabelText(/nombre/i)) as HTMLInputElement
    const correoInput = (await screen.findByLabelText(/correo/i)) as HTMLInputElement

    fireEvent.change(nombreInput, { target: { value: 'Nuevo Nombre' } })
    fireEvent.change(correoInput, { target: { value: 'nuevo@condor.cl' } })

    fireEvent.click(screen.getByRole('button', { name: /actualizar perfil/i }))

    await waitFor(() => {
      expect(mockUpdateNombre).toHaveBeenCalledWith(7, 'Nuevo Nombre')
      expect(mockUpdateCorreo).toHaveBeenCalledWith(7, 'nuevo@condor.cl')
    })
    expect(localStorage.getItem('usuarioActual')).toBe('nuevo@condor.cl')
  })
})
