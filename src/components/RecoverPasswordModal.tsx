import React, { useState } from 'react';
import Notification from './Notification';
import { getPreguntas, recuperarContrasena } from '../services/usuarioService';

interface Props {
  show: boolean;
  onClose: () => void;
}

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
};

const boxStyle: React.CSSProperties = {
  width: 480,
  maxWidth: '94%',
};

const RecoverPasswordModal: React.FC<Props> = ({ show, onClose }) => {
  const [step, setStep] = useState<'email' | 'questions'>('email');
  const [correo, setCorreo] = useState('');
  const [pregunta1, setPregunta1] = useState('');
  const [pregunta2, setPregunta2] = useState('');
  const [respuesta1, setRespuesta1] = useState('');
  const [respuesta2, setRespuesta2] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);

  if (!show) return null;

  const onRequestPreguntas = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await getPreguntas(correo);
      const data = res.data;
      setPregunta1(data.pregunta1 || '');
      setPregunta2(data.pregunta2 || '');
      setStep('questions');
    } catch (err: any) {
      // Mensaje general cuando el correo no es válido o no existe
      setNotif({ type: 'danger', message: err?.response?.data?.message || 'No has colocado un correo válido.' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmitRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recuperarContrasena({ correo, respuestaSeguridad1: respuesta1, respuestaSeguridad2: respuesta2, nuevaPassword });
      setNotif({ type: 'success', message: 'Contraseña actualizada correctamente.' });
      setTimeout(() => {
        // Limpiar el formulario y volver al paso de correo (mantener el modal abierto)
        setNotif(null);
        setStep('email');
        setCorreo('');
        setPregunta1('');
        setPregunta2('');
        setRespuesta1('');
        setRespuesta2('');
        setNuevaPassword('');
      }, 1300);
    } catch (err: any) {
      // El backend a veces devuelve un string; mostrarlo si existe, si no usar mensaje por defecto
      const backendMsg = err?.response?.data || err?.response?.data?.message;
      setNotif({ type: 'danger', message: backendMsg || 'Error al recuperar contraseña.' });
    } finally {
      setLoading(false);
    }
  };

  // estilo simplificado: caja blanca con panel verde interior (similar al perfil original)
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 6 };

  return (
    <div style={modalStyle} role="dialog" aria-modal="true">
      <div style={boxStyle} className="rp-modal-box">
        <div className="rp-modal-header">
          <h4>Recuperar contraseña</h4>
          <button className="btn-close" aria-label="Cerrar" onClick={onClose}></button>
        </div>
        <div className="rp-modal-body">
          {notif && <Notification type={notif.type} message={notif.message} onClose={() => setNotif(null)} />}

          {step === 'email' && (
            <div className="rp-inner">
              <form onSubmit={onRequestPreguntas} className="rp-form">
                <label style={labelStyle}>Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  required
                  onInvalid={(e: any) => e.currentTarget.setCustomValidity('Por favor ingrese un correo válido.')}
                  onInput={(e: any) => e.currentTarget.setCustomValidity('')}
                  className="form-control"
                />
                <div className="rp-actions">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                  <button type="submit" disabled={loading} className="btn btn-primary">Siguiente</button>
                </div>
              </form>
            </div>
          )}

          {step === 'questions' && (
            <div className="rp-inner">
              <form onSubmit={onSubmitRecovery} className="rp-form">
                <label style={labelStyle}>{pregunta1}</label>
                <input
                  value={respuesta1}
                  onChange={e => setRespuesta1(e.target.value)}
                  required
                  onInvalid={(e: any) => e.currentTarget.setCustomValidity('Por favor responda la pregunta.')}
                  onInput={(e: any) => e.currentTarget.setCustomValidity('')}
                  className="form-control"
                />

                <label style={labelStyle}>{pregunta2}</label>
                <input
                  value={respuesta2}
                  onChange={e => setRespuesta2(e.target.value)}
                  required
                  onInvalid={(e: any) => e.currentTarget.setCustomValidity('Por favor responda la pregunta.')}
                  onInput={(e: any) => e.currentTarget.setCustomValidity('')}
                  className="form-control"
                />

                <label style={labelStyle}>Nueva contraseña</label>
                <input
                  type="password"
                  lang="es"
                  value={nuevaPassword}
                  onChange={e => setNuevaPassword(e.target.value)}
                  required
                  onBlur={(e: any) => {
                    const val = e.currentTarget.value || '';
                    if (!val) {
                      e.currentTarget.setCustomValidity('Por favor ingrese la nueva contraseña.');
                    } else if (val.length < 6) {
                      e.currentTarget.setCustomValidity('La contraseña debe tener al menos 6 caracteres.');
                    } else {
                      e.currentTarget.setCustomValidity('');
                    }
                  }}
                  onInvalid={(e: any) => {
                    const val = e.currentTarget.value || '';
                    if (!val) {
                      e.currentTarget.setCustomValidity('Por favor ingrese la nueva contraseña.');
                    } else if (val.length < 6) {
                      e.currentTarget.setCustomValidity('La contraseña debe tener al menos 6 caracteres.');
                    } else {
                      e.currentTarget.setCustomValidity('');
                    }
                  }}
                  onInput={(e: any) => e.currentTarget.setCustomValidity('')}
                  className="form-control"
                />

                <div className="rp-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep('email')}>Volver</button>
                  <button type="submit" disabled={loading} className="btn btn-danger">Restablecer</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoverPasswordModal;
