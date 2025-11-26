import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { getPreguntas, recuperarContrasena } from '../services/usuarioService';

const RecoverPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email'|'questions'>('email');
  const [correo, setCorreo] = useState('');
  const [pregunta1, setPregunta1] = useState('');
  const [pregunta2, setPregunta2] = useState('');
  const [respuesta1, setRespuesta1] = useState('');
  const [respuesta2, setRespuesta2] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{type: 'success'|'danger'|'info', message: string} | null>(null);

  const onRequestPreguntas = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await getPreguntas(correo);
      setPregunta1(res.data.pregunta1 || '');
      setPregunta2(res.data.pregunta2 || '');
      setStep('questions');
    } catch (err: any) {
      setNotif({ type: 'danger', message: err?.response?.data?.message || 'No se encontraron preguntas para ese correo.' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recuperarContrasena({ correo, respuestaSeguridad1: respuesta1, respuestaSeguridad2: respuesta2, nuevaPassword });
      // Guardar mensaje temporal y redirigir al login
      localStorage.setItem('recoveryMessage', 'Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.');
      navigate('/login');
    } catch (err: any) {
      setNotif({ type: 'danger', message: err?.response?.data?.message || 'Error al recuperar contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{backgroundImage: "url('../src/img/fondo_final.jpeg')", backgroundSize: 'cover', minHeight: '100vh', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <div style={{ width: 420, maxWidth: '92%' }}>
        <div style={{ background: '#fff', padding: 12, borderRadius: 10 }}>
          <h3 style={{ color: '#c82333', textAlign: 'center', marginTop: 0 }}>Recuperar contraseña</h3>
          {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}

          {step === 'email' && (
            <form onSubmit={onRequestPreguntas}>
              <div style={{ background: '#2e8b3a', padding: 14, borderRadius: 8, color: '#fff' }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  required
                  onInvalid={(e: any) => e.currentTarget.setCustomValidity('Por favor ingrese un correo válido.')}
                  onInput={(e: any) => e.currentTarget.setCustomValidity('')}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: 'none' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button type="button" onClick={() => navigate('/login')} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}>Cancelar</button>
                  <button type="submit" disabled={loading} style={{ background: '#007bff', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}>Siguiente</button>
                </div>
              </div>
            </form>
          )}

          {step === 'questions' && (
            <form onSubmit={onSubmitRecovery}>
              <div style={{ background: '#2e8b3a', padding: 14, borderRadius: 8, color: '#fff' }}>
                <label style={{ display: 'block', marginBottom: 6 }}>{pregunta1}</label>
                <input value={respuesta1} onChange={e => setRespuesta1(e.target.value)} required onInvalid={(e: any) => e.currentTarget.setCustomValidity('Por favor responda la pregunta.')} onInput={(e: any) => e.currentTarget.setCustomValidity('')} style={{ width: '100%', padding: 8, borderRadius: 4, border: 'none', marginBottom: 8 }} />

                <label style={{ display: 'block', marginBottom: 6 }}>{pregunta2}</label>
                <input value={respuesta2} onChange={e => setRespuesta2(e.target.value)} required onInvalid={(e: any) => e.currentTarget.setCustomValidity('Por favor responda la pregunta.')} onInput={(e: any) => e.currentTarget.setCustomValidity('')} style={{ width: '100%', padding: 8, borderRadius: 4, border: 'none', marginBottom: 8 }} />

                <label style={{ display: 'block', marginBottom: 6 }}>Nueva contraseña</label>
                <input type="password" value={nuevaPassword} onChange={e => setNuevaPassword(e.target.value)} required onInvalid={(e: any) => e.currentTarget.setCustomValidity('Por favor ingrese la nueva contraseña.')} onInput={(e: any) => e.currentTarget.setCustomValidity('')} style={{ width: '100%', padding: 8, borderRadius: 4, border: 'none', marginBottom: 8 }} />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={() => navigate('/login')} style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}>Cancelar</button>
                  <button type="submit" disabled={loading} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 4 }}>Restablecer</button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoverPassword;
