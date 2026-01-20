import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast, ToastContainer } from './toast'

describe('Toast', () => {
  it('renders toast with title', () => {
    render(
      <Toast
        id="1"
        type="success"
        title="Success!"
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('Success!')).toBeInTheDocument()
  })

  it('renders toast with title and message', () => {
    render(
      <Toast
        id="1"
        type="error"
        title="Error"
        message="Something went wrong"
        onClose={vi.fn()}
      />
    )

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <Toast
        id="test-id"
        type="info"
        title="Info"
        onClose={onClose}
        duration={0}
      />
    )

    await user.click(screen.getByRole('button', { name: /close/i }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledWith('test-id')
    })
  })

  it('auto-closes after duration', async () => {
    const onClose = vi.fn()

    render(
      <Toast
        id="auto-close"
        type="warning"
        title="Warning"
        onClose={onClose}
        duration={100}
      />
    )

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalledWith('auto-close')
      },
      { timeout: 500 }
    )
  })

  it('does not auto-close when duration is 0', async () => {
    const onClose = vi.fn()

    render(
      <Toast
        id="no-auto-close"
        type="success"
        title="Persistent"
        onClose={onClose}
        duration={0}
      />
    )

    // Wait a bit to ensure it doesn't close
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    const toasts = [
      { id: '1', type: 'success' as const, title: 'Success' },
      { id: '2', type: 'error' as const, title: 'Error' },
      { id: '3', type: 'info' as const, title: 'Info' },
    ]

    render(<ToastContainer toasts={toasts} onClose={vi.fn()} />)

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('renders empty when no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onClose={vi.fn()} />)

    // Container should be present but empty of toasts
    expect(container.querySelector('.fixed')).toBeInTheDocument()
  })
})
