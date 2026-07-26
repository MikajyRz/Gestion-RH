import { useEffect, useState } from 'react'
import { backendClient } from '../../services/backend/backendClient'

export default function HomePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    backendClient.get('/hello')
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Erreur lors de la connexion au backend')
        setLoading(false)
      })
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Gestion RH - Connexion Backend</h1>
        <p style={styles.subtitle}>Communication Frontend (React) ↔ Backend (Spring Boot)</p>

        <div style={styles.statusBox}>
          <h3 style={styles.boxTitle}>Réponse de l'API Backend :</h3>
          {loading && <p style={styles.loading}>Chargement en cours...</p>}
          {error && (
            <div style={styles.errorBox}>
              <p style={styles.error}>Erreur : {error}</p>
              <small style={{ color: '#6b7280' }}>
                Vérifiez que Spring Boot est lancé sur http://localhost:8081
              </small>
            </div>
          )}
          {data && (
            <div style={styles.successBox}>
              <p style={styles.successText}><strong>Message :</strong> {data.message}</p>
              <p style={styles.statusText}><strong>Statut :</strong> {data.status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '36px',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  statusBox: {
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  boxTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    marginTop: 0,
    marginBottom: '12px',
  },
  loading: {
    color: '#2563eb',
    fontWeight: '500',
    margin: 0,
  },
  errorBox: {
    color: '#dc2626',
  },
  error: {
    margin: '0 0 4px 0',
    fontWeight: '500',
  },
  successBox: {
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    padding: '12px 16px',
  },
  successText: {
    color: '#065f46',
    fontSize: '15px',
    margin: '0 0 6px 0',
  },
  statusText: {
    color: '#047857',
    fontSize: '13px',
    margin: 0,
  },
}
