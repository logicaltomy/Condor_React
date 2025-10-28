import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Contacto from '../pages/Contacto'

const renderContacto = () => {
  render(
    <MemoryRouter>
      <Contacto />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear?.()
  vi.restoreAllMocks()
})

describe('Contacto page', () => {
  // PRUEBA 1: Renderizado básico — verifica que los campos Nombre, Email, Mensaje y el botón Enviar estén presentes
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

  // PRUEBA 2: Flujo exitoso — llena los campos válidos, envía y verifica que alert sea llamado y los campos se limpien
  it('permite enviar un mensaje válido (happy path)', async () => {
    renderContacto()

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const nombre = screen.getByLabelText(/nombre/i) as HTMLInputElement
    const email = screen.getByLabelText(/email/i) as HTMLInputElement
    const mensaje = screen.getByLabelText(/mensaje/i) as HTMLTextAreaElement
    const submit = screen.getByRole('button', { name: /enviar/i }) as HTMLButtonElement

    fireEvent.change(nombre, { target: { value: 'Juan' } })
    fireEvent.change(email, { target: { value: 'juan@example.com' } })
    fireEvent.change(mensaje, { target: { value: 'Hola, este es un mensaje de prueba.' } })

    // esperar a que el botón quede habilitado (estado/validaciones asincrónicas)
    await waitFor(() => expect(submit.disabled).toBe(false))

    fireEvent.click(submit)
5
    await waitFor(() => expect(alertSpy).toHaveBeenCalled())
    // comprobar que los campos se limpiaron
    await waitFor(() => expect((screen.getByLabelText(/nombre/i) as HTMLInputElement).value).toBe(''))
    expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe('')
    expect((screen.getByLabelText(/mensaje/i) as HTMLTextAreaElement).value).toBe('')
  })

  // PRUEBA 3: Validaciones — email inválido, nombre vacío, mensaje corto; mostrar errores y botón deshabilitado
  it('muestra errores y deshabilita el envío cuando hay validaciones', async () => {
    renderContacto()

    const nombre = screen.getByLabelText(/nombre/i) as HTMLInputElement
    const email = screen.getByLabelText(/email/i) as HTMLInputElement
    const mensaje = screen.getByLabelText(/mensaje/i) as HTMLTextAreaElement
    const submit = screen.getByRole('button', { name: /enviar/i }) as HTMLButtonElement

    fireEvent.change(nombre, { target: { value: '' } })
    fireEvent.change(email, { target: { value: 'bademail' } })
    fireEvent.change(mensaje, { target: { value: 'short' } })

    // Esperar que aparezcan los errores al resolverse el estado
    await screen.findByText(/el nombre es obligatorio/i)
    await screen.findByText(/el email no es válido/i)
    await screen.findByText(/el mensaje debe tener al menos 10 caracteres/i)

    // botón deshabilitado
    await waitFor(() => expect(submit.disabled).toBe(true))
  })

  // PRUEBA 4: Límite de longitud — mensaje mayor a 300 caracteres debe producir mensaje de error
  it('muestra error si el mensaje excede 300 caracteres', async () => {
    renderContacto()

    const nombre = screen.getByLabelText(/nombre/i) as HTMLInputElement
    const email = screen.getByLabelText(/email/i) as HTMLInputElement
    const mensaje = screen.getByLabelText(/mensaje/i) as HTMLTextAreaElement

    const long = 'x'.repeat(301)
    fireEvent.change(nombre, { target: { value: 'Ana' } })
    fireEvent.change(email, { target: { value: 'ana@example.com' } })
    fireEvent.change(mensaje, { target: { value: long } })

    await screen.findByText(/el mensaje no puede exceder los 300 caracteres/i)
  })

})
