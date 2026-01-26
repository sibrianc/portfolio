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

        print("Seeding database with sample projects...")

        projects = [
            Project(
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
                tech_stack="React, Three.js, WebSocket, Node.js",
                repo_url="https://github.com/sibrianc/neon-genesis",
                live_url="https://neon-genesis.demo.com",
                cover_image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
                is_featured=True
            ),
            Project(
                title="CyberSec Vault",
                slug="cybersec-vault",
                summary="Encrypted file storage solution with zero-knowledge architecture.",
                description="""
<p>Secure storage application built with privacy solely in mind.</p>
<p>Implements client-side encryption using <strong>AES-256</strong> before data ever leaves the browser.</p>
                """.strip(),
                tech_stack="Python, Flask, Cryptography, SQLCipher",
                repo_url="https://github.com/sibrianc/cybersec-vault",
                live_url="",
                cover_image="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80",
                is_featured=True
            ),
            Project(
                title="Neural Net Visualizer",
                slug="neural-net-viz",
                summary="Interactive playground for understanding deep learning models.",
                description="""
<p>A web-based tool to visualize how neural networks learn.</p>
<p>Users can adjust hyperparameters and see the decision boundary evolve in real-time.</p>
                """.strip(),
                tech_stack="TypeScript, D3.js, TensorFlow.js",
                repo_url="https://github.com/sibrianc/neural-viz",
                live_url="https://neural-viz.io",
                cover_image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
                is_featured=False
            ),
             Project(
                title="Ghost Shell CLI",
                slug="ghost-shell",
                summary="A terminal emulator for the web inspired by Ghost in the Shell.",
                description="""
<p>Fully functional terminal emulator that runs in the browser.</p>
<p>Supports custom commands, file system navigation emulation, and 'hacking' minigames.</p>
                """.strip(),
                tech_stack="Vue.js, XTerm.js, WebAssembly",
                repo_url="https://github.com/sibrianc/ghost-shell",
                live_url="https://ghost-shell.net",
                cover_image="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
                is_featured=True
            )
        ]

        db.session.add_all(projects)
        db.session.commit()
        print(f"Successfully added {len(projects)} projects.")

if __name__ == "__main__":
    seed_projects()
