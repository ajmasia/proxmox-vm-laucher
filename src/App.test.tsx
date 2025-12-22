import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Proxmox VM Launcher')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<App />)
    expect(screen.getByText(/Connect to your Proxmox virtual machines/i)).toBeInTheDocument()
  })

  it('renders the connection form', () => {
    render(<App />)
    expect(screen.getByLabelText(/connection name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/host/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /connect/i })).toBeInTheDocument()
  })
})
