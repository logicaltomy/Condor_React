import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Contacto from '../pages/Contacto'

const { mockCrearContacto } = vi.hoisted(() => ({
  mockCrearContacto: vi.fn(),
}))

vi.mock('../services/contactoService', () => ({
  __esModule: true,
  default: { crearContacto: mockCrearContacto },
  crearContacto: mockCrearContacto,
}))

const renderContacto = () => {
  render(
    <MemoryRouter>
      <Contacto />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear?.()
  mockCrearContacto.mockReset()
})

describe('Contacto page', () => {
  it('renderiza los campos y el botón Enviar', () => {
    renderContacto()

    const nombre = screen.getByLabelText(/nombre/i)
    const email = screen.getByLabelText(/email/i)
    const mensaje = screen.getByLabelText(/mensaje/i)
    const submit = screen.getByRole('button', { name: /enviar/i })

    expect(nombre).toBeInTheDocument()
    expect(email).toBeInTheDocument()
    expect(mensaje).toBeInTheDocument()
    expect(submit).toBeInTheDocument()
  })

  it('envía un mensaje válido y limpia el formulario', async () => {
    mockCrearContacto.mockResolvedValueOnce({})
    renderContacto()

    const nombre = screen.getByLabelText(/nombre/i) as HTMLInputElement
    const email = screen.getByLabelText(/email/i) as HTMLInputElement
    const mensaje = screen.getByLabelText(/mensaje/i) as HTMLTextAreaElement
    const submit = screen.getByRole('button', { name: /enviar/i }) as HTMLButtonElement

    fireEvent.change(nombre, { target: { value: 'Juan' } })
    fireEvent.change(email, { target: { value: 'juan@example.com' } })
    fireEvent.change(mensaje, { target: { value: 'Hola, este es un mensaje de prueba.' } })

    await waitFor(() => expect(submit.disabled).toBe(false))

    fireEvent.click(submit)

    await waitFor(() => expect(mockCrearContacto).toHaveBeenCalledWith({
      nombre: 'Juan',
      correo: 'juan@example.com',
      mensaje: 'Hola, este es un mensaje de prueba.'
    }))

    await screen.findByText(/mensaje enviado correctamente/i)
    expect(nombre.value).toBe('')
    expect(email.value).toBe('')
    expect(mensaje.value).toBe('')
  })

  it('muestra errores y mantiene el botón deshabilitado cuando hay validaciones', async () => {
    renderContacto()

    const nombre = screen.getByLabelText(/nombre/i) as HTMLInputElement
    const email = screen.getByLabelText(/email/i) as HTMLInputElement
    const mensaje = screen.getByLabelText(/mensaje/i) as HTMLTextAreaElement
    const submit = screen.getByRole('button', { name: /enviar/i }) as HTMLButtonElement

    fireEvent.change(nombre, { target: { value: '' } })
    fireEvent.change(email, { target: { value: 'bademail' } })
    fireEvent.change(mensaje, { target: { value: 'short' } })

    await screen.findByText(/el nombre es obligatorio/i)
    await screen.findByText(/el email no es válido/i)
    await screen.findByText(/al menos 10 caracteres/i)
    await waitFor(() => expect(submit.disabled).toBe(true))
  })

  it('propaga un error legible cuando la API falla', async () => {
    mockCrearContacto.mockRejectedValueOnce({ response: { data: { message: 'Servicio no disponible' } } })
    renderContacto()

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText(/mensaje/i), { target: { value: 'Mensaje suficiente para probar.' } })

    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await screen.findByText(/servicio no disponible/i)
  })

  it('muestra error si el mensaje excede 300 caracteres', async () => {
    renderContacto()

    const long = 'x'.repeat(301)
    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ana@example.com' } })
    fireEvent.change(screen.getByLabelText(/mensaje/i), { target: { value: long } })

    await screen.findByText(/no puede exceder los 300 caracteres/i)
  })
})
