import { Header } from '@/components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Conheça a Escola Seiva e nossa missão de formar através do conhecimento.',
};

export default function Sobre() {
  return (
    <>
      <Header />
      <main>
        <section style={{
          background: 'linear-gradient(135deg, var(--seiva-dark) 0%, var(--seiva-medium) 100%)',
          padding: '4rem 0 3.5rem', textAlign: 'center',
        }}>
          <div className="container">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.75rem)', fontWeight: 700, color: 'var(--seiva-cream)' }}>
              Sobre a Escola Seiva
            </h1>
            <p style={{ color: 'rgba(254,250,224,0.75)', fontSize: '1.0625rem', marginTop: '1rem', maxWidth: 560, margin: '1rem auto 0' }}>
              Conhecimento que cria raízes e gera fruto permanente.
            </p>
          </div>
        </section>

        <section style={{ padding: '4rem 0', background: 'white' }}>
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="card" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--seiva-dark)', marginBottom: '1.25rem' }}>
                Nossa missão
              </h2>
              <p style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>
                A Escola Seiva é a plataforma de formação da Igreja Seiva. Nascemos do desejo de conectar
                pessoas à fonte da vida — Jesus — por meio do ensino bíblico, da formação cristã e do
                desenvolvimento de lideranças.
              </p>
              <p style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '1.0625rem', marginBottom: '1.25rem' }}>
                Enraizados em João 15:5 — <em>"Eu sou a videira, vós as varas; quem está em mim, e eu
                nele, esse dá muito fruto"</em> — acreditamos que o aprendizado verdadeiro transforma
                corações, restaura relacionamentos e revela o Reino em cada gesto.
              </p>
              <p style={{ color: '#4b5563', lineHeight: 1.8, fontSize: '1.0625rem' }}>
                Nossa plataforma oferece cursos online com qualidade, organização e acesso facilitado
                para que cada aluno possa crescer no seu ritmo, de qualquer lugar.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
