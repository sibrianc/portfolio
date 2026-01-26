from portfolio import create_app
from portfolio.models import db, Project
import datetime

def seed_projects():
    app = create_app()
    with app.app_context():
        # Check if projects exist
        if Project.query.count() > 0:
            print("Projects already exist. Skipping seed.")
            return

        print("Seeding database with bilingual sample projects...")

        projects = [
            Project(
                # English
                title="Neon Genesis Interface",
                slug="neon-genesis",
                summary="A futuristic dashboard with real-time data visualization.",
                description="""
<p>An experimental dashboard focusing on <strong>glassmorphism</strong> and real-time data streams.</p>
<p>Features include:</p>
<ul>
    <li>WebSockets for live updates</li>
    <li>Three.js background animations</li>
    <li>Custom neon UI components</li>
</ul>
                """.strip(),
                # Spanish
                title_es="Interfaz Génesis Neón",
                summary_es="Un tablero futurista con visualización de datos en tiempo real.",
                description_es="""
<p>Un tablero experimental centrado en <strong>glassmorfismo</strong> y flujos de datos en tiempo real.</p>
<p>Las características incluyen:</p>
<ul>
    <li>WebSockets para actualizaciones en vivo</li>
    <li>Animaciones de fondo con Three.js</li>
    <li>Componentes UI neón personalizados</li>
</ul>
                """.strip(),
                # Language-agnostic
                tech_stack="React, Three.js, WebSocket, Node.js",
                repo_url="https://github.com/sibrianc/neon-genesis",
                live_url="https://neon-genesis.demo.com",
                cover_image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
                is_featured=True
            ),
            Project(
                # English
                title="CyberSec Vault",
                slug="cybersec-vault",
                summary="Encrypted file storage solution with zero-knowledge architecture.",
                description="""
<p>Secure storage application built with privacy solely in mind.</p>
<p>Implements client-side encryption using <strong>AES-256</strong> before data ever leaves the browser.</p>
                """.strip(),
                # Spanish
                title_es="Bóveda CyberSec",
                summary_es="Solución de almacenamiento cifrado con arquitectura de conocimiento cero.",
                description_es="""
<p>Aplicación de almacenamiento seguro construida pensando únicamente en la privacidad.</p>
<p>Implementa cifrado del lado del cliente usando <strong>AES-256</strong> antes de que los datos salgan del navegador.</p>
                """.strip(),
                # Language-agnostic
                tech_stack="Python, Flask, Cryptography, SQLCipher",
                repo_url="https://github.com/sibrianc/cybersec-vault",
                live_url="",
                cover_image="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80",
                is_featured=True
            ),
            Project(
                # English
                title="Neural Net Visualizer",
                slug="neural-net-viz",
                summary="Interactive playground for understanding deep learning models.",
                description="""
<p>A web-based tool to visualize how neural networks learn.</p>
<p>Users can adjust hyperparameters and see the decision boundary evolve in real-time.</p>
                """.strip(),
                # Spanish
                title_es="Visualizador de Redes Neuronales",
                summary_es="Plataforma interactiva para entender modelos de aprendizaje profundo.",
                description_es="""
<p>Una herramienta web para visualizar cómo aprenden las redes neuronales.</p>
<p>Los usuarios pueden ajustar hiperparámetros y ver la frontera de decisión evolucionar en tiempo real.</p>
                """.strip(),
                # Language-agnostic
                tech_stack="TypeScript, D3.js, TensorFlow.js",
                repo_url="https://github.com/sibrianc/neural-viz",
                live_url="https://neural-viz.io",
                cover_image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
                is_featured=False
            ),
             Project(
                # English
                title="Ghost Shell CLI",
                slug="ghost-shell",
                summary="A terminal emulator for the web inspired by Ghost in the Shell.",
                description="""
<p>Fully functional terminal emulator that runs in the browser.</p>
<p>Supports custom commands, file system navigation emulation, and 'hacking' minigames.</p>
                """.strip(),
                # Spanish
                title_es="CLI Ghost Shell",
                summary_es="Un emulador de terminal web inspirado en Ghost in the Shell.",
                description_es="""
<p>Emulador de terminal completamente funcional que se ejecuta en el navegador.</p>
<p>Soporta comandos personalizados, emulación de navegación de archivos y minijuegos de 'hacking'.</p>
                """.strip(),
                # Language-agnostic
                tech_stack="Vue.js, XTerm.js, WebAssembly",
                repo_url="https://github.com/sibrianc/ghost-shell",
                live_url="https://ghost-shell.net",
                cover_image="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
                is_featured=True
            )
        ]

        db.session.add_all(projects)
        db.session.commit()
        print(f"Successfully added {len(projects)} bilingual projects.")

if __name__ == "__main__":
    seed_projects()
