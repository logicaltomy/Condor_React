import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Ajustes from '../pages/Ajustes'

const renderAjustes = () => {
  render(
    <MemoryRouter>
      <Ajustes />
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear?.()
  vi.restoreAllMocks()
})

describe('Ajustes page', () => {
  it('renderiza la sección de eliminar usuario', () => {
    renderAjustes()
    expect(screen.getByText(/eliminar usuario/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/correo@ejemplo.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
  })

  it('muestra mensaje cuando se intenta eliminar un usuario inexistente', () => {
    renderAjustes()

    const input = screen.getByPlaceholderText(/correo@ejemplo.com/i)
    const boton = screen.getByRole('button', { name: /eliminar/i })
    // mockear confirm para que devuelva true (aceptar)
    vi.spyOn(window, 'confirm').mockImplementation(() => true)

    fireEvent.change(input, { target: { value: 'noexiste@a.com' } })
    fireEvent.click(boton)

    // Debe mostrarse mensaje informando que no se encontró el usuario
    expect(screen.getByText(/no se encontró un usuario/i)).toBeInTheDocument()
  })

  it('elimina un usuario existente y limpia la sesión si corresponde', () => {
    // Seed con un usuario y session activa
    const seed = [{ username: 'Elim', email: 'elim@a.com', password: 'pw' }]
    localStorage.setItem('usuarios', JSON.stringify(seed))
    // marcar sesión activa como si el usuario estuviera logueado
    localStorage.setItem('usuarioActual', 'elim@a.com')

    renderAjustes()

    // mock de confirm para aceptar la eliminación
    vi.spyOn(window, 'confirm').mockImplementation(() => true)

    const input = screen.getByPlaceholderText(/correo@ejemplo.com/i)
    const boton = screen.getByRole('button', { name: /eliminar/i })

    fireEvent.change(input, { target: { value: 'elim@a.com' } })
    fireEvent.click(boton)

    // Verificar que el usuario fue eliminado del localStorage
  const stored = JSON.parse(localStorage.getItem('usuarios') || '[]') as Array<Record<string, any>>
  const found = stored.find((u) => u.email === 'elim@a.com')
  expect(found).toBeUndefined()

    // Verificar que la sesión fue limpiada (usuarioActual removed or different)
    expect(localStorage.getItem('usuarioActual')).toBeNull()
  })
})
