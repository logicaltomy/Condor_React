import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RecoverPasswordModal from '../components/RecoverPasswordModal'

const { mockGetPreguntas, mockRecuperarContrasena } = vi.hoisted(() => ({
  mockGetPreguntas: vi.fn(),
  mockRecuperarContrasena: vi.fn(),
}))

vi.mock('../services/usuarioService', () => ({
  __esModule: true,
  getPreguntas: mockGetPreguntas,
  recuperarContrasena: mockRecuperarContrasena,
}))

describe('RecoverPasswordModal', () => {
  beforeEach(() => {
    mockGetPreguntas.mockReset()
    mockRecuperarContrasena.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('no se renderiza cuando show es false', () => {
    render(<RecoverPasswordModal show={false} onClose={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('solicita las preguntas de seguridad y avanza al siguiente paso', async () => {
    mockGetPreguntas.mockResolvedValueOnce({ data: { pregunta1: 'Color?', pregunta2: 'Mascota?' } })

    render(<RecoverPasswordModal show onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'user@condor.cl' } })
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }))

    await waitFor(() => expect(mockGetPreguntas).toHaveBeenCalledWith('user@condor.cl'))
    expect(await screen.findByText('Color?')).toBeInTheDocument()
    expect(screen.getByText('Mascota?')).toBeInTheDocument()
  })

  it('muestra un mensaje si el correo no existe', async () => {
    mockGetPreguntas.mockRejectedValueOnce({ response: { data: { message: 'No existe' } } })

    render(<RecoverPasswordModal show onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'unknown@condor.cl' } })
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }))

    await screen.findByText(/no existe/i)
  })

  it('envía las respuestas y reinicia el formulario tras un restablecimiento exitoso', async () => {
    mockGetPreguntas.mockResolvedValue({ data: { pregunta1: 'Color?', pregunta2: 'Mascota?' } })
    mockRecuperarContrasena.mockResolvedValue({})

    render(<RecoverPasswordModal show onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: 'user@condor.cl' } })
    fireEvent.click(screen.getByRole('button', { name: /siguiente/i }))
    await screen.findByText('Color?')

    const respuesta1Input = screen.getByLabelText('Color?') as HTMLInputElement
    const respuesta2Input = screen.getByLabelText('Mascota?') as HTMLInputElement
    fireEvent.change(respuesta1Input, { target: { value: 'Azul' } })
    fireEvent.change(respuesta2Input, { target: { value: 'Firulais' } })
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: 'Secreta1' } })

    fireEvent.click(screen.getByRole('button', { name: /restablecer/i }))

    await waitFor(() => {
      expect(mockRecuperarContrasena).toHaveBeenCalledWith({
        correo: 'user@condor.cl',
        respuestaSeguridad1: 'Azul',
        respuestaSeguridad2: 'Firulais',
        nuevaPassword: 'Secreta1',
      })
    })
    await screen.findByText(/contraseña actualizada correctamente/i)

  })
})
